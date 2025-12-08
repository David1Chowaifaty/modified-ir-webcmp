import { Booking, ExtraService, ExtraServiceSchema } from '@/models/booking.dto';
import { BookingService } from '@/services/booking-service/booking.service';
import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Prop, State, Watch, h } from '@stencil/core';
import { ZodError } from 'zod';

@Component({
  tag: 'ir-extra-service-config-form',
  styleUrl: 'ir-extra-service-config-form.css',
  scoped: true,
})
export class IrExtraServiceConfigForm {
  @Prop() booking: Pick<Booking, 'from_date' | 'to_date' | 'currency' | 'booking_nbr'>;
  @Prop() service: ExtraService;

  @State() s_service: ExtraService;
  @State() error: boolean;
  @State() fromDateClicked: boolean;
  @State() toDateClicked: boolean;
  @State() autoValidate: boolean;

  @Event() closeModal: EventEmitter<null>;
  @Event({ bubbles: true, composed: true }) resetBookingEvt: EventEmitter<null>;

  private bookingService = new BookingService();

  componentWillLoad() {
    if (this.service) {
      this.s_service = { ...this.service };
    }
  }

  @Watch('service')
  handleServiceChange() {
    if (this.service) {
      this.s_service = { ...this.service };
    }
  }

  private async saveAmenity() {
    try {
      this.autoValidate = true;
      ExtraServiceSchema.parse(this.s_service ?? {});
      await this.bookingService.doBookingExtraService({
        service: this.s_service,
        booking_nbr: this.booking.booking_nbr,
        is_remove: false,
      });
      this.resetBookingEvt.emit(null);
      this.closeDialog();
    } catch (error) {
      if (error instanceof ZodError) {
        this.error = true;
      }
      console.error(error);
    }
  }
  private closeDialog() {
    this.closeModal.emit();
  }
  private updateService(params: Partial<ExtraService>) {
    let prevService: ExtraService = this.s_service;
    if (!prevService) {
      prevService = {
        cost: null,
        description: null,
        end_date: null,
        start_date: null,
        price: null,
        currency_id: this.booking.currency.id,
      };
    }
    this.s_service = { ...prevService, ...params };
  }

  render() {
    return (
      <form
        id="extra-service-config-form"
        onSubmit={async e => {
          e.preventDefault();
          this.saveAmenity();
        }}
        class={'extra-service-config__container'}
      >
        <ir-validator id="amenity description-validator" schema={ExtraServiceSchema.shape.description}>
          <wa-textarea
            size="small"
            defaultValue={this.s_service?.description}
            value={this.s_service?.description}
            onchange={e => this.updateService({ description: (e.target as any).value })}
            id="amenity-description"
            aria-label="Amenity description"
            maxlength={250}
            label={locales.entries.Lcz_Description}
          ></wa-textarea>
        </ir-validator>
        <ir-custom-date-picker
          placeholder="Select date"
          withClear
          label="Dates on"
          emitEmptyDate
          date={this.s_service?.start_date}
          minDate={this.booking.from_date}
          maxDate={this.booking.to_date}
          onDateChanged={e => this.updateService({ start_date: e.detail.start?.format('YYYY-MM-DD') })}
        ></ir-custom-date-picker>
        <ir-custom-date-picker
          withClear
          emitEmptyDate
          placeholder="Select date"
          date={this.s_service?.end_date}
          minDate={this.s_service?.start_date ?? this.booking.from_date}
          maxDate={this.booking.to_date}
          onDateChanged={e => {
            e.stopImmediatePropagation();
            e.stopPropagation();
            this.updateService({ end_date: e.detail.start?.format('YYYY-MM-DD') });
          }}
          label="Till and including"
        ></ir-custom-date-picker>
        {/* Prices and cost */}
        <ir-validator value={this.s_service?.price ?? null} schema={ExtraServiceSchema.shape.price}>
          <ir-custom-input
            onText-change={e => {
              this.updateService({ price: Number(e.detail) });
            }}
            defaultValue={this.s_service?.price?.toString()}
            value={this.s_service?.price?.toString()}
            mask={'price'}
            type="text"
            label={locales.entries.Lcz_Price}
          >
            <span slot="start">{this.booking.currency.symbol}</span>
          </ir-custom-input>
        </ir-validator>
        <ir-validator value={this.s_service?.cost ?? null} schema={ExtraServiceSchema.shape.cost}>
          <ir-custom-input
            defaultValue={this.s_service?.cost?.toString()}
            onText-change={e => this.updateService({ cost: Number(e.detail) })}
            value={this.s_service?.cost?.toString()}
            mask={'price'}
            label={locales.entries.Lcz_Cost}
          >
            <span slot="start">{this.booking.currency.symbol}</span>
          </ir-custom-input>
        </ir-validator>
      </form>
    );
  }
}

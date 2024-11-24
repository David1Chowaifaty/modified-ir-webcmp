import { Booking, ExtraService, ExtraServiceSchema } from '@/models/booking.dto';
import { BookingService } from '@/services/booking.service';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';
import { ZodError } from 'zod';

@Component({
  tag: 'ir-extra-service-config',
  styleUrl: 'ir-extra-service-config.css',
  scoped: true,
})
export class IrExtraServiceConfig {
  @Prop() booking: Pick<Booking, 'from_date' | 'to_date' | 'currency' | 'booking_nbr'>;
  @Prop() service: ExtraService;

  @State() s_service: ExtraService;
  @State() error: boolean;
  @State() fromDateClicked: boolean;
  @State() toDateClicked: boolean;

  @Event() closeModal: EventEmitter<null>;
  @Event() resetBookingData: EventEmitter<null>;

  private bookingService = new BookingService();

  componentWillLoad() {
    if (this.service) {
      this.s_service = { ...this.service };
    }
  }

  private async saveAmenity() {
    try {
      ExtraServiceSchema.parse(this.s_service);
      await this.bookingService.doBookingExtraService({
        service: this.s_service,
        booking_nbr: this.booking.booking_nbr,
        is_remove: false,
      });
      this.resetBookingData.emit(null);
      this.closeModal.emit(null);
    } catch (error) {
      if (error instanceof ZodError) {
        this.error = true;
      }
      console.error(error);
    }
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
      <Host class={'p-0'}>
        <ir-title class="px-1" onCloseSideBar={() => this.closeModal.emit(null)} label={'Extra Services'} displayContext="sidebar"></ir-title>
        <section class={'px-1'}>
          {/* Description */}
          <div class="input-group mb-1 mt-3">
            <div class="input-group-prepend">
              <span class="input-group-text">Description</span>
            </div>
            <textarea
              value={this.s_service?.description}
              class={`form-control ${this.error && !this.s_service?.description ? 'is-invalid' : ''}`}
              style={{ height: '7rem' }}
              maxLength={250}
              onChange={e => this.updateService({ description: (e.target as HTMLTextAreaElement).value })}
              aria-label="Amenity description"
            ></textarea>
          </div>
          {/* Dates */}
          <div class={'row-group mb-1'}>
            <div class="input-group mb-1 mb-sm-0">
              <div class="input-group-prepend">
                <span class="input-group-text" id="basic-addon1">
                  Dates on
                </span>
              </div>
              <div class="form-control p-0 m-0 d-flex align-items-center justify-content-center date-from">
                <ir-date-picker
                  date={this.s_service?.start_date ? new Date(this.s_service?.start_date) : new Date(this.booking.from_date)}
                  class="hidden-date-picker"
                  autoApply
                  singleDatePicker
                  minDate={this.booking.from_date}
                  maxDate={this.booking.to_date}
                  onDateChanged={e => this.updateService({ start_date: e.detail.start.format('YYYY-MM-DD') })}
                ></ir-date-picker>
              </div>
            </div>
            <div class="input-group mb-1 mb-sm-0 ">
              <div class="input-group-prepend ">
                <span class="input-group-text until-prepend" id="basic-addon1">
                  and until
                </span>
              </div>
              <div class="form-control p-0 m-0 d-flex align-items-center justify-content-center">
                <ir-date-picker
                  date={this.s_service?.end_date ? new Date(this.s_service?.end_date) : new Date(this.booking.to_date)}
                  class="hidden-date-picker"
                  autoApply
                  singleDatePicker
                  minDate={this.booking.from_date}
                  maxDate={this.booking.to_date}
                  onDateChanged={e => {
                    this.updateService({ end_date: e.detail.start.format('YYYY-MM-DD') });
                  }}
                ></ir-date-picker>
              </div>
            </div>
          </div>
          {/* Prices and cost */}
          <div class={'row-group'}>
            <div class="input-group price-input-group  mb-1 mb-sm-0">
              <div class="input-group-prepend">
                <span class="input-group-text">Price</span>
              </div>
              <span class="currency-ph">{this.booking.currency.symbol}</span>
              <input
                class="form-control price-input"
                onInput={e => this.updateService({ price: Number((e.target as HTMLInputElement).value) })}
                type="number"
                aria-label="Price"
                aria-describedby="amenity price"
                value={this.s_service?.price}
              />
            </div>
            <div class="input-group cost-input-group  mb-1 mb-sm-0">
              <div class="input-group-prepend ">
                <span class="input-group-text cost-input-placeholder">Cost</span>
              </div>
              <span class="currency-ph">{this.booking.currency.symbol}</span>
              <input
                type="number"
                onInput={e => this.updateService({ cost: Number((e.target as HTMLInputElement).value) })}
                class="form-control cost-input"
                aria-label="Cost"
                aria-describedby="amenity cost"
                value={this.s_service?.cost}
              />
            </div>
          </div>
          <div class={'d-flex flex-column flex-sm-row mt-3'}>
            <ir-button
              onClick={() => this.closeModal.emit(null)}
              btn_styles="justify-content-center"
              class={`mb-1 mb-sm-0 flex-fill mr-sm-1`}
              icon=""
              text={locales.entries.Lcz_Cancel}
              btn_color="secondary"
            ></ir-button>

            <ir-button
              btn_styles="justify-content-center align-items-center"
              class={'m-0 flex-fill text-center'}
              icon=""
              isLoading={isRequestPending('/Do_Booking_Extra_Service')}
              text={locales.entries.Lcz_Save}
              btn_color="primary"
              onClick={this.saveAmenity.bind(this)}
            ></ir-button>
          </div>
        </section>
      </Host>
    );
  }
}

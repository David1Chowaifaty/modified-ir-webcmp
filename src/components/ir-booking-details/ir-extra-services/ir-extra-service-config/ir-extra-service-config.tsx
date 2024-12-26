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
  private validatePrice(): boolean {
    if (this.s_service?.price === undefined || this.s_service?.price?.toString() === '') {
      return false;
    }
    const priceSchema = ExtraServiceSchema.pick({ price: true });
    const result = priceSchema.safeParse({ price: this.s_service?.price });
    return result.success;
  }
  render() {
    return (
      <Host class={'p-0'}>
        <ir-title class="px-1" onCloseSideBar={() => this.closeModal.emit(null)} label={locales.entries.Lcz_ExtraServices} displayContext="sidebar"></ir-title>
        <section class={'px-1'}>
          {/* Description */}
          <fieldset class="input-group mb-1 mt-3 service-description">
            <div class="input-group-prepend">
              <span class="input-group-text">{locales.entries.Lcz_Description}</span>
            </div>
            <textarea
              value={this.s_service?.description}
              class={`form-control service-description-input ${this.error && !this.s_service?.description ? 'is-invalid' : ''}`}
              style={{ height: '7rem' }}
              maxLength={250}
              onChange={e => this.updateService({ description: (e.target as HTMLTextAreaElement).value })}
              aria-label="Amenity description"
            ></textarea>
          </fieldset>
          {/* Dates */}
          <div class={'row-group mb-1'}>
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text" id="basic-addon1">
                  {locales.entries.Lcz_DatesOn}
                </span>
              </div>
              <div class="form-control p-0 m-0 d-flex align-items-center justify-content-center date-from">
                <div class="service-date-container">
                  <ir-date-picker
                    date={this.s_service?.start_date ? new Date(this.s_service?.start_date) : new Date(this.booking.from_date)}
                    class="hidden-date-picker"
                    autoApply
                    singleDatePicker
                    minDate={this.booking.from_date}
                    maxDate={this.booking.to_date}
                    onDateChanged={e => this.updateService({ start_date: e.detail.start.format('YYYY-MM-DD') })}
                  ></ir-date-picker>
                  {this.s_service?.start_date && (
                    <div class="btn-container">
                      <ir-button
                        title="clear"
                        id="close"
                        variant="icon"
                        style={{ '--icon-size': '0.875rem' }}
                        icon_name="xmark-fill"
                        class="ml-2"
                        onClickHandler={() => this.updateService({ start_date: null })}
                      ></ir-button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div class="input-group">
              <div class="input-group-prepend ">
                <span class="input-group-text until-prepend" id="basic-addon1">
                  {locales.entries.Lcz_TillAndIncluding}
                </span>
              </div>
              <div class="form-control p-0 m-0 d-flex align-items-center justify-content-center">
                <div class="service-date-container">
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

                  {this.s_service?.end_date && (
                    <div class="btn-container">
                      <ir-button
                        title="clear"
                        id="close"
                        variant="icon"
                        style={{ '--icon-size': '0.875rem' }}
                        icon_name="xmark-fill"
                        class="ml-2"
                        onClickHandler={() => this.updateService({ end_date: null })}
                      ></ir-button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Prices and cost */}
          <div class={'row-group'}>
            <ir-price-input
              label="Price"
              currency={this.booking.currency.symbol}
              class="ir-br-input-none"
              value={this.s_service?.price?.toString()}
              zod={ExtraServiceSchema.pick({ price: true })}
              aria-label={locales.entries.Lcz_Price}
              wrapKey="price"
              aria-describedby="service price"
              autoValidate={false}
              data-state={this.error && !this.validatePrice() ? 'error' : ''}
              onTextChange={e => this.updateService({ price: parseFloat(e.detail) })}
            ></ir-price-input>
            <ir-price-input
              autoValidate={false}
              label={locales.entries.Lcz_Cost}
              labelStyle="cost-label"
              currency={this.booking.currency.symbol}
              // class="ir-bl-lbl-none ir-bl-none"
              value={this.s_service?.cost?.toString()}
              zod={ExtraServiceSchema.pick({ cost: true })}
              onTextChange={e => this.updateService({ cost: parseFloat(e.detail) })}
              wrapKey="cost"
              aria-label="Cost"
              aria-describedby="service cost"
            ></ir-price-input>
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

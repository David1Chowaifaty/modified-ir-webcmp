import { Booking, ExtraService, ExtraServiceSchema } from '@/models/booking.dto';
import { BookingService } from '@/services/booking.service';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Prop, State, h } from '@stencil/core';
import { ZodError } from 'zod';
import { _formatDate } from '../../functions';

@Component({
  tag: 'ir-extra-service-config',
  styleUrls: ['ir-extra-service-config.css', '../../../../common/sheet.css'],
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
  @Event() resetBookingEvt: EventEmitter<null>;

  private bookingService = new BookingService();
  // private d1: HTMLDivElement;
  // private d1_0: HTMLDivElement;
  // private d2_0: HTMLDivElement;
  // private d2: HTMLInputElement;

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
      this.resetBookingEvt.emit(null);
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
      <form
        class={'sheet-container'}
        onSubmit={async e => {
          e.preventDefault();
          await this.saveAmenity();
        }}
      >
        <ir-title class="px-1 sheet-header" onCloseSideBar={() => this.closeModal.emit(null)} label={locales.entries.Lcz_ExtraServices} displayContext="sidebar"></ir-title>
        <section class={'px-1 sheet-body'}>
          {/* Description */}
          <fieldset class="input-group mb-1 service-description">
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
              <div
                // ref={el => (this.d1_0 = el)}
                class="form-control p-0 m-0 d-flex align-items-center justify-content-center date-from"
              >
                <div class="service-date-container">
                  <ir-date-picker
                    // onDatePickerFocus={() => {
                    //   this.d1?.classList.add('date-focused');
                    //   this.d1_0?.classList.add('date-focused');
                    // }}
                    // onDatePickerBlur={() => {
                    //   this.d1?.classList.remove('date-focused');
                    //   this.d1_0?.classList.remove('date-focused');
                    // }}
                    // customPicker
                    emitEmptyDate
                    date={this.s_service?.start_date}
                    minDate={this.booking.from_date}
                    maxDate={this.booking.to_date}
                    onDateChanged={e => this.updateService({ start_date: e.detail.start?.format('YYYY-MM-DD') })}
                  >
                    <input
                      // ref={el => (this.d1 = el)}
                      type="text"
                      slot="trigger"
                      value={this.s_service?.start_date ? _formatDate(this.s_service.start_date) : null}
                      style={{ borderLeftWidth: '0', borderRightWidth: '0', width: '100%', borderRadius: '0' }}
                      class="text-center w-100 form-control input-sm"
                    ></input>
                  </ir-date-picker>
                  {this.s_service?.start_date && (
                    <div class="btn-container">
                      <ir-button
                        title="clear"
                        id="close"
                        variant="icon"
                        style={{ '--icon-size': '0.875rem' }}
                        icon_name="xmark-fill"
                        class="ml-2"
                        onClickHandler={e => {
                          e.stopImmediatePropagation();
                          e.stopPropagation();
                          this.updateService({ start_date: null });
                        }}
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
              <div
                // ref={el => (this.d2_0 = el)}
                class="form-control p-0 m-0 d-flex align-items-center justify-content-center"
              >
                <div class="service-date-container">
                  <ir-date-picker
                    // onDatePickerFocus={() => {
                    //   this.d2?.classList.add('date-focused');
                    //   this.d2_0?.classList.add('date-focused');
                    // }}
                    // onDatePickerBlur={() => {
                    //   this.d2?.classList.remove('date-focused');
                    //   this.d2_0?.classList.remove('date-focused');
                    // }}
                    emitEmptyDate
                    date={this.s_service?.end_date}
                    minDate={this.s_service?.start_date ?? this.booking.from_date}
                    maxDate={this.booking.to_date}
                    onDateChanged={e => {
                      e.stopImmediatePropagation();
                      e.stopPropagation();
                      this.updateService({ end_date: e.detail.start?.format('YYYY-MM-DD') });
                    }}
                  >
                    <input
                      // ref={el => (this.d2 = el)}
                      slot="trigger"
                      value={this.s_service?.end_date ? _formatDate(this.s_service.end_date) : null}
                      style={{ borderLeftWidth: '0', borderRightWidth: '0', width: '100%' }}
                      class="text-center form-control input-sm"
                    ></input>
                  </ir-date-picker>

                  {this.s_service?.end_date && (
                    <div class="btn-container">
                      <ir-button
                        title="clear"
                        id="close"
                        variant="icon"
                        style={{ '--icon-size': '0.875rem' }}
                        icon_name="xmark-fill"
                        class="ml-2"
                        onClickHandler={e => {
                          e.stopImmediatePropagation();
                          e.stopPropagation();
                          this.updateService({ end_date: null });
                        }}
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
        </section>
        <div class={'sheet-footer'}>
          <ir-button
            onClick={() => this.closeModal.emit(null)}
            btn_styles="justify-content-center"
            class={`flex-fill`}
            icon=""
            text={locales.entries.Lcz_Cancel}
            btn_color="secondary"
          ></ir-button>

          <ir-button
            btn_styles="justify-content-center align-items-center"
            class={'flex-fill'}
            icon=""
            btn_type="submit"
            isLoading={isRequestPending('/Do_Booking_Extra_Service')}
            text={locales.entries.Lcz_Save}
            btn_color="primary"
          ></ir-button>
        </div>
      </form>
    );
  }
}

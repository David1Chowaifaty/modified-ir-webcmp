import { Booking } from '@/models/booking.dto';
import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'ir-amenities-config',
  styleUrl: 'ir-amenities-config.css',
  scoped: true,
})
export class IrAmenitiesConfig {
  @Prop() booking: Pick<Booking, 'from_date' | 'to_date' | 'currency'>;

  @State() service: {
    description: string;
    dates?: { on: string; until: string };
    price?: number;
    cost?: number;
  };
  @State() error: boolean;

  @Event() closeModal: EventEmitter<null>;
  @Event() resetBookingData: EventEmitter<null>;

  private handleFromDateChange() {}
  private async saveAmenity() {}
  private updateService(
    params: Partial<{
      description: string;
      dates?: { on: string; until: string };
      price?: number;
      cost?: number;
    }>,
  ) {
    this.service = { ...this.service, ...params };
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
              value={this.service?.description}
              class={`form-control ${this.error ? 'is-invalid' : ''}`}
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
                  date={new Date()}
                  class="hidden-date-picker"
                  autoApply
                  singleDatePicker
                  minDate={this.booking.from_date}
                  maxDate={this.booking.to_date}
                  onDateChanged={this.handleFromDateChange.bind(this)}
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
                  date={new Date()}
                  class="hidden-date-picker"
                  autoApply
                  singleDatePicker
                  minDate={this.booking.from_date}
                  maxDate={this.booking.to_date}
                  onDateChanged={this.handleFromDateChange.bind(this)}
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
              <input class="form-control price-input" type="text" aria-label="Price" aria-describedby="amenity price" />
            </div>
            <div class="input-group cost-input-group  mb-1 mb-sm-0">
              <div class="input-group-prepend ">
                <span class="input-group-text cost-input-placeholder">Cost</span>
              </div>
              <span class="currency-ph">{this.booking.currency.symbol}</span>
              <input type="text" class="form-control cost-input" aria-label="Cost" aria-describedby="amenity cost" />
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
              // isLoading={this.isLoading}
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

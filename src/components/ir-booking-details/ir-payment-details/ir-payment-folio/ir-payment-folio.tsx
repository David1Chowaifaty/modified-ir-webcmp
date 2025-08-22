import calendar_data from '@/stores/calendar-data';
import { Component, Event, EventEmitter, State, h } from '@stencil/core';
import { MaskedRange } from 'imask';

@Component({
  tag: 'ir-payment-folio',
  styleUrls: ['ir-payment-folio.css', '../../../../common/sheet.css'],
  scoped: true,
})
export class IrPaymentFolio {
  @State() isLoading: boolean;
  @State() errors: any;
  @State() autoValidate: boolean;

  @Event() closeModal: EventEmitter<null>;

  private time_mask: {
    mask: 'HH:mm';
    blocks: {
      HH: {
        mask: MaskedRange;
        from: 0;
        to: 23;
        placeholderChar: 'H';
      };
      mm: {
        mask: MaskedRange;
        from: 0;
        to: 59;
        placeholderChar: 'm';
      };
    };
    lazy: false;
    placeholderChar: '_';
  };

  render() {
    return (
      <form
        class={'sheet-container'}
        onSubmit={async e => {
          e.preventDefault();
        }}
      >
        <ir-title class="px-1 sheet-header" onCloseSideBar={() => this.closeModal.emit(null)} label={'Payment Folio'} displayContext="sidebar"></ir-title>
        <section class={'px-1 sheet-body d-flex flex-column'} style={{ gap: '1rem' }}>
          <div>
            <ir-price-input label="Amount" currency={calendar_data.currency.symbol}></ir-price-input>
          </div>
          <div>
            <ir-dropdown>
              <ir-menu>
                <ir-menu-item>Option 1</ir-menu-item>
                <ir-menu-item>Option 2</ir-menu-item>
                <ir-menu-item>Option 3</ir-menu-item>
              </ir-menu>
            </ir-dropdown>
          </div>
          <div>
            <ir-input-text label="Reference number"></ir-input-text>
          </div>
          {/*Date and Time Picker container */}
          <div class={'d-flex'}>
            {/*Date Picker */}
            <div class="form-group  mr-1">
              <div class="input-group row m-0">
                <div class={`input-group-prepend col-5 p-0 text-dark border-0`}>
                  <label class={`input-group-text  flex-grow-1 text-dark border-theme `}>Date</label>
                </div>
                <div class="form-control  form-control-md col-7 d-flex align-items-center px-0 mx-0" style={{ border: '0' }}>
                  <ir-date-picker
                    data-testid="pickup_arrival_date"
                    // date={this.pickupData.arrival_date}
                    // minDate={this.bookingDates.from}
                    // maxDate={this.bookingDates?.to}
                    emitEmptyDate={true}
                    // aria-invalid={this.errors?.arrival_date && !this.pickupData.arrival_date ? 'true' : 'false'}
                    onDateChanged={evt => {
                      console.log(evt);
                      // this.updatePickupData('arrival_date', evt.detail.start?.format('YYYY-MM-DD'));
                    }}
                  >
                    <input
                      type="text"
                      slot="trigger"
                      // value={this.pickupData.arrival_date ? moment(this.pickupData.arrival_date).format('MMM DD, YYYY') : null}
                      // class={`form-control input-sm ${this.errors?.arrival_date && !this.pickupData.arrival_date ? 'border-danger' : ''} text-center`}
                      style={{ borderTopLeftRadius: '0', borderBottomLeftRadius: '0', width: '100%' }}
                    ></input>
                  </ir-date-picker>
                </div>
              </div>
            </div>
            {/*Time Picker */}
            <ir-input-text
              autoValidate={this.autoValidate}
              wrapKey="arrival_time"
              testId="payment_arrival_time"
              error={this.errors?.arrival_time}
              // value={}

              // zod={this.pickupSchema.pick({ arrival_time: true })}
              label={'Time'}
              inputStyles="col-sm-4"
              // data-state={this.cause === 'arrival_time' ? 'error' : ''}
              mask={this.time_mask}
              // onTextChange={e => this.updatePickupData('arrival_time', e.detail)}
            ></ir-input-text>
          </div>
        </section>
        <div class={'sheet-footer'}>
          <ir-button onClick={() => this.closeModal.emit(null)} btn_styles="justify-content-center" class={`flex-fill`} text={'Cancel'} btn_color="secondary"></ir-button>
          <ir-button
            btn_styles="justify-content-center align-items-center"
            class={'flex-fill'}
            isLoading={this.isLoading}
            text={'Save'}
            btn_color="primary"
            btn_type="submit"
          ></ir-button>
        </div>
      </form>
    );
  }
}

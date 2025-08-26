import calendar_data from '@/stores/calendar-data';
import { Component, Event, EventEmitter, Prop, State, Watch, h } from '@stencil/core';
import moment from 'moment';
import { z, ZodError } from 'zod';
export type TFolioData = {
  arrival_time: string;
  arrival_date: string;
  amount: number;
  reference?: string;
  selected_option: any;
};
@Component({
  tag: 'ir-payment-folio',
  styleUrls: ['ir-payment-folio.css', '../../../../common/sheet.css'],
  scoped: true,
})
export class IrPaymentFolio {
  @Prop() payment: TFolioData;

  @State() isLoading: boolean;
  @State() errors: any;
  @State() autoValidate: boolean = false;
  @State() folioData: TFolioData;

  @Event() closeModal: EventEmitter<null>;

  private folioSchema: z.ZodObject<
    { arrival_date: z.ZodEffects<z.ZodString, string, string>; amount: z.ZodNumber; reference: z.ZodNullable<z.ZodOptional<z.ZodString>>; selected_option: z.ZodString },
    'strip',
    z.ZodTypeAny,
    { arrival_date?: string; amount?: number; reference?: string; selected_option?: string },
    { arrival_date?: string; amount?: number; reference?: string; selected_option?: string }
  >;

  private createPickupSchema(minDate: string, maxDate: string) {
    return z.object({
      arrival_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Invalid date format, expected YYYY-MM-DD' })
        .refine(
          dateStr => {
            const date = moment(dateStr, 'YYYY-MM-DD', true);
            const min = moment(minDate, 'YYYY-MM-DD', true);
            const max = moment(maxDate, 'YYYY-MM-DD', true);
            return date.isValid() && min.isValid() && max.isValid() && date.isBetween(min, max, undefined, '[]');
          },
          { message: `arrival_date must be between ${minDate} and ${maxDate}` },
        ),
      amount: z.coerce.number(),
      reference: z.string().optional().nullable(),
      selected_option: z.string(),
    });
  }

  componentWillLoad() {
    this.folioSchema = this.createPickupSchema(moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'));
    if (this.payment) {
      this.folioData = { ...this.payment };
    }
  }

  @Watch('payment')
  handlePaymentChange(newValue: TFolioData, oldValue: TFolioData) {
    if (newValue !== oldValue && newValue) {
      this.folioData = { ...newValue };
    }
  }

  private updateFolioData(params: Partial<TFolioData>): void {
    this.folioData = { ...this.folioData, ...params };
  }

  private saveFolio() {
    try {
      this.isLoading = true;
      this.autoValidate = true;
      if (this.errors) {
        this.errors = null;
      }
      this.folioSchema.parse(this.folioData ?? {});
    } catch (error) {
      const err = {};
      if (error instanceof ZodError) {
        console.log(error.issues);
        error.issues.forEach(e => {
          err[e.path[0]] = true;
        });
      }
      this.errors = err;
      console.log(this.errors);
    } finally {
      this.isLoading = false;
    }
  }

  render() {
    return (
      <form
        class={'sheet-container'}
        onSubmit={async e => {
          e.preventDefault();
          this.saveFolio();
        }}
      >
        <ir-title class="px-1 sheet-header" onCloseSideBar={() => this.closeModal.emit(null)} label={'Payment Folio'} displayContext="sidebar"></ir-title>
        <section class={'px-1 sheet-body d-flex flex-column'} style={{ gap: '1rem' }}>
          <div class={'d-flex w-fill'} style={{ gap: '0.5rem' }}>
            {/*Date Picker */}
            <div class="form-group  mb-0 flex-grow-1">
              <div class="input-group row m-0 flex-grow-1">
                <div class={`input-group-prepend col-4 p-0 text-dark border-0`}>
                  <label class={`input-group-text flex-grow-1 text-dark border-theme `}>Date</label>
                </div>
                <div class="form-control  form-control-md col-10 flex-grow-1 d-flex align-items-center px-0 mx-0" style={{ border: '0' }}>
                  <ir-date-picker
                    data-testid="pickup_arrival_date"
                    date={this.folioData?.arrival_date}
                    // minDate={this.bookingDates.from}
                    // maxDate={this.bookingDates?.to}
                    class="w-100"
                    emitEmptyDate={true}
                    aria-invalid={this.errors?.arrival_date && !this.folioData?.arrival_date ? 'true' : 'false'}
                    onDateChanged={evt => {
                      this.updateFolioData({ arrival_date: evt.detail.start?.format('YYYY-MM-DD') });
                    }}
                  >
                    <input
                      type="text"
                      slot="trigger"
                      value={this.folioData?.arrival_date ? moment(this.folioData?.arrival_date).format('MMM DD, YYYY') : null}
                      class={`form-control w-100 input-sm ${this.errors?.arrival_date && !this.folioData?.arrival_date ? 'border-danger' : ''} text-center`}
                      style={{ borderTopLeftRadius: '0', borderBottomLeftRadius: '0', width: '100%' }}
                    ></input>
                  </ir-date-picker>
                </div>
              </div>
            </div>
          </div>
          <div>
            <ir-price-input
              autoValidate={this.autoValidate}
              zod={this.folioSchema.pick({ amount: true })}
              label="Amount"
              error={this.errors?.amount && !this.folioData?.amount}
              value={this.folioData?.amount?.toString()}
              currency={calendar_data.currency.symbol}
              onTextChange={e => this.updateFolioData({ amount: Number(e.detail) })}
            ></ir-price-input>
          </div>
          <div>
            <ir-dropdown
              value={this.folioData?.selected_option}
              onOptionChange={e => {
                this.updateFolioData({ selected_option: e.detail });
              }}
            >
              <div slot="trigger" class={'input-group row m-0 '}>
                <div class={`input-group-prepend col-3 p-0 text-dark border-0`}>
                  <label class={`input-group-text flex-grow-1 text-dark  border-theme`}>Transaction type</label>
                </div>
                <button
                  type="button"
                  class={`form-control d-flex align-items-center cursor-pointer ${this.errors?.selected_option && !this.folioData?.selected_option ? 'border-danger' : ''}`}
                >
                  {this.folioData?.selected_option ? <span>{this.folioData.selected_option}</span> : <span></span>}
                </button>
              </div>
              <ir-dropdown-item value="option1">Option 1</ir-dropdown-item>
              <ir-dropdown-item value="option2">Option 2</ir-dropdown-item>
              <ir-dropdown-item value="option3">Option 3</ir-dropdown-item>
            </ir-dropdown>
          </div>
          <div>
            <ir-input-text
              error={this.errors?.reference_number}
              autoValidate={this.autoValidate}
              zod={this.folioSchema.pick({ reference: true })}
              label="Reference"
              inputContainerStyle={{
                margin: '0',
              }}
              labelWidth={4}
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

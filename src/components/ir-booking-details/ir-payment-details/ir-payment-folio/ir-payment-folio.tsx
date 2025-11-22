import calendar_data from '@/stores/calendar-data';
import { Component, Event, EventEmitter, Fragment, Prop, State, Watch, h } from '@stencil/core';
import moment from 'moment';
import { z, ZodError } from 'zod';
import { IEntries } from '@/models/IBooking';
import { PaymentService } from '@/services/payment.service';
import { FolioEntryMode, Payment, PaymentEntries } from '../../types';
import { buildPaymentTypes } from '@/services/booking.service';
import { PAYMENT_TYPES_WITH_METHOD } from '../global.variables';
@Component({
  tag: 'ir-payment-folio',
  styleUrls: ['ir-payment-folio.css', '../../../../common/sheet.css'],
  scoped: true,
})
export class IrPaymentFolio {
  @Prop() paymentEntries: PaymentEntries;
  @Prop() bookingNumber: string;
  @Prop() payment: Payment = {
    date: moment().format('YYYY-MM-DD'),
    amount: 0,
    designation: undefined,
    currency: null,
    reference: null,
    id: -1,
  };

  @Prop() mode: FolioEntryMode;

  @State() isLoading: 'save' | 'save-print' = null;
  @State() errors: any;
  @State() autoValidate: boolean = false;
  @State() folioData: Payment;
  @State() _paymentTypes: Record<string, IEntries[]> = {};

  @Event() closeModal: EventEmitter<null>;
  @Event() resetBookingEvt: EventEmitter<null>;
  @Event() resetExposedCancellationDueAmount: EventEmitter<null>;

  private folioSchema: any;
  private paymentService = new PaymentService();

  componentWillLoad() {
    this.folioSchema = z.object({
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .refine(
          dateStr => {
            const date = moment(dateStr, 'YYYY-MM-DD', true);
            return date.isValid();
          },
          { message: `Invalid date` },
        ),
      amount: z.coerce.number().refine(a => a >= 0),
      reference: z.string().optional().nullable(),
      // designation: z.string().min(1),
      payment_type: z.object({
        code: z.string().min(3).max(4),
        description: z.string().min(1),
        operation: z.union([z.literal('CR'), z.literal('DB')]),
      }),
      payment_method: z.object({
        code: z.string().min(3).max(4),
        description: z.string().min(1),
      }),
    });
    if (this.payment) {
      this.folioData = { ...this.payment };
    }
    this.getPaymentTypes();
  }

  @Watch('payment')
  handlePaymentChange(newValue: Payment, oldValue: Payment) {
    if (newValue !== oldValue && newValue) {
      this.folioData = { ...newValue };
      this.getPaymentTypes();
    }
  }
  @Watch('paymentTypes')
  handlePaymentTypesChange(newValue: IEntries[], oldValue: IEntries[]) {
    if (newValue !== oldValue && newValue) {
      this.getPaymentTypes();
    }
  }

  private updateFolioData(params: Partial<Payment>): void {
    this.folioData = { ...this.folioData, ...params };
  }

  private async savePayment(print: boolean = false) {
    try {
      this.isLoading = print ? 'save-print' : 'save';
      this.autoValidate = true;
      if (this.errors) {
        this.errors = null;
      }
      this.folioSchema.parse(this.folioData ?? {});
      const data = await this.paymentService.AddPayment(
        {
          ...this.folioData,
          currency: calendar_data.currency,
          reference: this.folioData.reference ?? '',
          designation: this.folioData.payment_type?.description || '',
        },
        this.bookingNumber,
      );
      if (print) {
        console.log(data);
      }
      this.resetBookingEvt.emit(null);
      this.resetExposedCancellationDueAmount.emit(null);
      this.closeModal.emit(null);
    } catch (error) {
      const err = {};
      if (error instanceof ZodError) {
        error.issues.forEach(e => {
          err[e.path[0]] = true;
        });
      }
      console.error(error);
      this.errors = err;
    } finally {
      this.isLoading = null;
    }
  }

  private handleDropdownChange(value: string) {
    this.updateFolioData({ designation: value });
    if (!value) {
      this.updateFolioData({
        payment_type: null,
      });
    } else {
      const payment_type = this.paymentEntries?.types.find(pt => pt.CODE_NAME === value);
      if (!payment_type) {
        console.warn(`Invalid payment type ${value}`);
        this.updateFolioData({
          payment_type: null,
        });
        return;
      }

      this.updateFolioData({
        payment_type: {
          code: payment_type.CODE_NAME,
          description: payment_type.CODE_VALUE_EN,
          operation: payment_type.NOTES,
        },
        payment_method: PAYMENT_TYPES_WITH_METHOD.includes(payment_type.CODE_NAME)
          ? undefined
          : {
              code: this.paymentEntries.methods[0].CODE_NAME,
              description: this.paymentEntries.methods[0].CODE_VALUE_EN,
              operation: this.paymentEntries.methods[0].NOTES,
            },
      });
    }
  }
  private handlePaymentMethodDropdownChange(value: string) {
    const payment_method = this.paymentEntries?.methods.find(pt => pt.CODE_NAME === value);
    if (!payment_method) {
      console.warn(`Invalid payment method ${value}`);
      this.updateFolioData({
        payment_type: null,
      });
      return;
    }
    this.updateFolioData({
      payment_method: {
        code: payment_method.CODE_NAME,
        description: payment_method.CODE_VALUE_EN,
        operation: payment_method.NOTES,
      },
    });
  }

  private async getPaymentTypes() {
    const rec = buildPaymentTypes(this.paymentEntries);
    if (this.mode === 'payment-action' && this.payment.payment_type?.code === '001') {
      const { PAYMENTS, CANCELLATION } = rec;
      return (this._paymentTypes = {
        PAYMENTS,
        CANCELLATION,
      });
    }
    this._paymentTypes = rec;
  }

  private renderDropdownItems() {
    return Object.values(this._paymentTypes).map((p, idx) => (
      <Fragment>
        {p.map(pt => (
          <wa-option value={pt.CODE_NAME} label={pt.CODE_VALUE_EN}>
            <div class={'payment-folio__payment-type-option'}>
              <span>{pt.CODE_VALUE_EN}</span>
              <wa-badge variant={pt.NOTES === 'CR' ? 'success' : 'danger'} style={{ fontSize: 'var(--wa-font-size-s)' }}>
                {pt.NOTES === 'CR' ? 'credit' : 'debit'}
              </wa-badge>
            </div>
          </wa-option>
        ))}
        {idx !== Object.values(this._paymentTypes).length - 1 && <wa-divider></wa-divider>}
      </Fragment>
    ));
  }
  render() {
    // const isNewPayment = this.folioData?.payment_type?.code === '001' && this.folioData.id === -1;
    return (
      <form
        class="payment-folio__form"
        id="ir__folio-form"
        onSubmit={e => {
          e.preventDefault();
          this.savePayment();
        }}
      >
        {/* <ir-title
          class="px-1 sheet-header"
          onCloseSideBar={() => this.closeModal.emit(null)}
          label={this.mode === 'edit' ? 'Edit Folio Entry' : 'New Folio Entry'}
          displayContext="sidebar"
        ></ir-title> */}

        <div class={'d-flex w-fill'} style={{ gap: '0.5rem' }}>
          {/*Date Picker */}
          <div class="form-group  mb-0 flex-grow-1">
            <div class="input-group row m-0 flex-grow-1">
              <div class={`input-group-prepend col-4 col-md-3 p-0 text-dark border-0`}>
                <label class={`input-group-text flex-grow-1 text-dark border-theme `}>Date</label>
              </div>
              <div class="form-control  form-control-md col-10 flex-grow-1 d-flex align-items-center px-0 mx-0" style={{ border: '0' }}>
                <style>
                  {`.ir-date-picker-trigger{
                    width:100%;}`}
                </style>
                <ir-date-picker
                  data-testid="pickup_date"
                  date={this.folioData?.date}
                  class="w-100"
                  emitEmptyDate={true}
                  maxDate={moment().format('YYYY-MM-DD')}
                  aria-invalid={this.errors?.date && !this.folioData?.date ? 'true' : 'false'}
                  onDateChanged={evt => {
                    this.updateFolioData({ date: evt.detail.start?.format('YYYY-MM-DD') });
                  }}
                >
                  <input
                    type="text"
                    slot="trigger"
                    value={this.folioData?.date ? moment(this.folioData?.date).format('MMM DD, YYYY') : null}
                    class={`form-control w-100 input-sm ${this.errors?.date && !this.folioData?.date ? 'border-danger' : ''} text-left`}
                    style={{ borderTopLeftRadius: '0', borderBottomLeftRadius: '0', width: '100%' }}
                  ></input>
                </ir-date-picker>
              </div>
            </div>
          </div>
        </div>

        <div>
          <wa-select
            onwa-hide={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
            }}
            onwa-show={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
            }}
            placeholder="Select..."
            label="Transaction type"
            value={this.folioData?.payment_type?.code}
            disabled={this.mode === 'payment-action'}
            onchange={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
              this.handleDropdownChange((e.target as any).value);
            }}
          >
            <wa-option value="">Select...</wa-option>
            {this.renderDropdownItems()}
          </wa-select>
        </div>
        {PAYMENT_TYPES_WITH_METHOD.includes(this.folioData?.payment_type?.code) && (
          <div>
            <wa-select
              label={`${this.folioData.payment_type?.code === '001' ? 'Payment' : 'Refund'} method`}
              onwa-show={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
              }}
              onwa-hide={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
              }}
              value={this.folioData?.payment_method?.code ?? ''}
              onchange={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                this.handlePaymentMethodDropdownChange((e.target as any).value);
              }}
              aria-invalid={String(this.errors?.payment_method && !this.folioData?.payment_method?.code)}
            >
              <wa-option value="">Select...</wa-option>
              {this.paymentEntries?.methods?.map(pt => {
                return (
                  <wa-option label={pt.CODE_VALUE_EN} value={pt.CODE_NAME}>
                    {pt.CODE_VALUE_EN}
                  </wa-option>
                );
              })}
            </wa-select>
          </div>
        )}
        <div>
          <ir-price-input
            containerClassname="row"
            labelContainerClassname="col-4 col-md-3 p-0 text-dark border-0"
            minValue={0}
            autoValidate={this.autoValidate}
            zod={this.folioSchema.pick({ amount: true })}
            wrapKey="amount"
            label="Amount"
            labelStyle={'flex-grow-1 text-dark  border-theme'}
            error={this.errors?.amount && !this.folioData?.amount}
            value={this.folioData?.amount?.toString()}
            currency={calendar_data.currency.symbol}
            onTextChange={e => this.updateFolioData({ amount: Number(e.detail) })}
          ></ir-price-input>
        </div>
        <div>
          <ir-input-text
            value={this.folioData?.reference}
            error={this.errors?.reference_number}
            autoValidate={this.autoValidate}
            zod={this.folioSchema.pick({ reference: true })}
            label="Reference"
            maxLength={50}
            inputContainerStyle={{
              margin: '0',
            }}
            onTextChange={e => this.updateFolioData({ reference: e.detail })}
            labelWidth={3}
            labelContainerClassname={'col-4 col-md-3'}
          ></ir-input-text>
        </div>

        {/* <div class={'sheet-footer'}>
       
          <ir-custom-button onClickHandler={() => this.closeModal.emit(null)} size="medium" appearance="filled" variant="neutral">
            Cancel
          </ir-custom-button>
          <ir-custom-button
            type={'button'}
            onClickHandler={e => {
              e.stopImmediatePropagation();
              this.savePayment();
            }}
            size="medium"
            loading={this.isLoading === 'save'}
            appearance={isNewPayment ? 'filled' : 'accent'}
            variant="brand"
          >
            Save
          </ir-custom-button>
          {isNewPayment && (
            <ir-custom-button
              size="medium"
              type={'button'}
              onClickHandler={e => {
                e.stopPropagation();
                this.savePayment(true);
              }}
              loading={this.isLoading === 'save-print'}
              variant="brand"
            >
              Save And Print Receipt
            </ir-custom-button>
          )}
        </div> */}
      </form>
    );
  }
}

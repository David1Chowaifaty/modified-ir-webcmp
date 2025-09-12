import calendar_data from '@/stores/calendar-data';
import { Component, Event, EventEmitter, Fragment, Prop, State, Watch, h } from '@stencil/core';
import moment from 'moment';
import { z, ZodError } from 'zod';
import { IPayment } from '@/models/booking.dto';
import { IEntries } from '@/models/IBooking';
import { PaymentService } from '@/services/payment.service';
import { FolioEntryMode, PaymentEntries } from '../../types';
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
  @Prop() payment: IPayment = {
    date: moment().format('YYYY-MM-DD'),
    amount: 0,
    designation: undefined,
    currency: null,
    reference: null,
    id: -1,
  };

  @Prop() mode: FolioEntryMode;

  @State() isLoading: boolean;
  @State() errors: any;
  @State() autoValidate: boolean = false;
  @State() folioData: IPayment;
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
      amount: z.coerce.number().refine(a => a !== 0),
      reference: z.string().optional().nullable(),
      designation: z.string().min(1),
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
  handlePaymentChange(newValue: IPayment, oldValue: IPayment) {
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

  private updateFolioData(params: Partial<IPayment>): void {
    this.folioData = { ...this.folioData, ...params };
  }

  private async savePayment() {
    try {
      this.isLoading = true;
      this.autoValidate = true;
      if (this.errors) {
        this.errors = null;
      }
      this.folioSchema.parse(this.folioData ?? {});
      await this.paymentService.AddPayment(
        {
          ...this.folioData,
          currency: calendar_data.currency,
          reference: this.folioData.reference ?? '',
          designation: this.folioData.payment_type?.description,
        },
        this.bookingNumber,
      );
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
      this.isLoading = false;
    }
  }

  private handleDropdownChange(e: CustomEvent<string | number>) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const value = e.detail.toString();
    console.log(value);
    this.updateFolioData({ designation: value });
    if (!e.detail) {
      this.updateFolioData({
        payment_type: null,
      });
    } else {
      const payment_type = this.paymentEntries?.types.find(pt => pt.CODE_NAME === value);
      if (!payment_type) {
        console.warn(`Invalid payment type ${e.detail}`);
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
  private handlePaymentMethodDropdownChange(e: CustomEvent<string | number>) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const value = e.detail.toString();
    const payment_method = this.paymentEntries?.methods.find(pt => pt.CODE_NAME === value);
    if (!payment_method) {
      console.warn(`Invalid payment method ${e.detail}`);
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
          <ir-dropdown-item value={pt.CODE_NAME} class="dropdown-item-payment">
            <span>{pt.CODE_VALUE_EN}</span>
            <span class={`payment-type-badge ${pt.NOTES === 'CR' ? 'credit-badge' : 'debit-badge'}`}>{pt.NOTES === 'CR' ? 'credit' : 'debit'}</span>
          </ir-dropdown-item>
        ))}
        {idx !== Object.values(this._paymentTypes).length - 1 && <div class="dropdown-divider"></div>}
      </Fragment>
    ));
  }
  render() {
    return (
      <form
        class={'sheet-container'}
        onSubmit={async e => {
          e.preventDefault();
          this.savePayment();
        }}
      >
        <ir-title
          class="px-1 sheet-header"
          onCloseSideBar={() => this.closeModal.emit(null)}
          label={this.mode === 'edit' ? 'Edit Folio Entry' : 'New Folio Entry'}
          displayContext="sidebar"
        ></ir-title>
        <section class={'px-1 sheet-body d-flex flex-column'} style={{ gap: '1rem' }}>
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
            <ir-dropdown
              value={this.folioData?.payment_type?.code}
              disabled={this.payment.payment_type?.code !== '001' && this.mode === 'payment-action'}
              onOptionChange={this.handleDropdownChange.bind(this)}
            >
              <div slot="trigger" class={'input-group row m-0 '}>
                <div class={`input-group-prepend col-4 col-md-3 p-0 text-dark border-0`}>
                  <label class={`input-group-text flex-grow-1 text-dark  border-theme`}>Transaction type</label>
                </div>
                <button
                  type="button"
                  disabled={this.payment.payment_type?.code !== '001' && this.mode === 'payment-action'}
                  class={`form-control  d-flex align-items-center cursor-pointer ${this.errors?.designation && !this.folioData?.designation ? 'border-danger' : ''}`}
                >
                  {this.folioData?.payment_type ? <span>{this.folioData.payment_type?.description}</span> : <span>Select...</span>}
                </button>
              </div>
              <ir-dropdown-item value="">Select...</ir-dropdown-item>
              {this.renderDropdownItems()}
            </ir-dropdown>
          </div>
          {PAYMENT_TYPES_WITH_METHOD.includes(this.folioData?.payment_type?.code) && (
            <div>
              <ir-dropdown
                value={this.folioData?.payment_type?.code}
                disabled={this.payment.payment_type?.code !== '001' && this.mode === 'payment-action'}
                onOptionChange={this.handlePaymentMethodDropdownChange.bind(this)}
              >
                <button
                  slot="trigger"
                  type="button"
                  disabled={this.payment.payment_type?.code !== '001' && this.mode === 'payment-action'}
                  class={`form-control d-flex align-items-center cursor-pointer ${this.errors?.payment_method && !this.folioData?.payment_method?.code ? 'border-danger' : ''}`}
                >
                  {this.folioData?.payment_method ? (
                    <span>{this.folioData.payment_method?.description}</span>
                  ) : (
                    <span>Select {this.folioData?.payment_type?.code === '001' ? 'payment' : 'refund'} method...</span>
                  )}
                </button>

                <ir-dropdown-item value="">Select {this.folioData.payment_type?.code === '001' ? 'payment' : 'refund'} method...</ir-dropdown-item>
                {this.paymentEntries?.methods?.map(pt => {
                  return (
                    <ir-dropdown-item value={pt.CODE_NAME} class="dropdown-item-payment">
                      <span>{pt.CODE_VALUE_EN}</span>
                    </ir-dropdown-item>
                  );
                })}
              </ir-dropdown>
            </div>
          )}
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

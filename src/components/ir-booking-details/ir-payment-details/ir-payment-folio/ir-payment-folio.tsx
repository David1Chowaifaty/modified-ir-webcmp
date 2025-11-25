import calendar_data from '@/stores/calendar-data';
import { Component, Event, EventEmitter, Fragment, Method, Prop, State, Watch, h } from '@stencil/core';
import moment from 'moment';
import { z, ZodError } from 'zod';
import { IEntries } from '@/models/IBooking';
import { PaymentService } from '@/services/payment.service';
import { FolioEntryMode, Payment, PaymentEntries } from '../../types';
import { buildPaymentTypes } from '@/services/booking.service';
import { PAYMENT_TYPES_WITH_METHOD } from '../global.variables';

const DATE_FORMAT = 'YYYY-MM-DD';

const requiresPaymentMethodCode = (code?: string) => {
  if (!code) {
    return false;
  }
  return PAYMENT_TYPES_WITH_METHOD.includes(code);
};

const paymentTypeSchema = z.object({
  code: z.string().min(3).max(4),
  description: z.string(),
  operation: z.union([z.literal('CR'), z.literal('DB')]),
});

const paymentMethodSchema = z.object({
  code: z.string().min(3).max(4),
  description: z.string(),
  operation: z.string(),
});

const folioBaseSchema = z.object({
  id: z.number().nullable().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(
      dateStr => {
        const date = moment(dateStr, DATE_FORMAT, true);
        return date.isValid();
      },
      { message: `Invalid date` },
    ),
  amount: z.coerce.number().min(0.01),
  reference: z.string().optional().nullable(),
  payment_type: paymentTypeSchema,
  payment_method: paymentMethodSchema.nullable().optional(),
});

type FolioFormData = z.infer<typeof folioBaseSchema>;

const folioValidationSchema = folioBaseSchema.superRefine((data, ctx) => {
  if (requiresPaymentMethodCode(data.payment_type?.code) && !data.payment_method?.code) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['payment_method'],
      message: 'Payment method is required for this transaction type.',
    });
  }
});
@Component({
  tag: 'ir-payment-folio',
  styleUrls: ['ir-payment-folio.css', '../../../../common/sheet.css'],
  scoped: true,
})
export class IrPaymentFolio {
  @Prop() paymentEntries: PaymentEntries;
  @Prop() bookingNumber: string;
  @Prop() payment: Payment = {
    date: moment().format(DATE_FORMAT),
    amount: 0,
    designation: undefined,
    currency: null,
    reference: null,
    id: -1,
  };

  @Prop() mode: FolioEntryMode;

  @State() isLoading: 'save' | 'save-print' = null;
  @State() errors: Record<string, boolean> = {};
  @State() autoValidate: boolean = false;
  @State() folioData: Payment;
  @State() _paymentTypes: Record<string, IEntries[]> = {};
  @State() isOpen: boolean;

  @Event() closeModal: EventEmitter<null>;
  @Event() resetBookingEvt: EventEmitter<null>;
  @Event() resetExposedCancellationDueAmount: EventEmitter<null>;

  private readonly today = moment().format(DATE_FORMAT);

  private paymentService = new PaymentService();

  componentWillLoad() {
    if (this.payment) {
      this.folioData = { ...this.payment };
    }
    this.syncPaymentTypes();
  }

  @Watch('payment')
  handlePaymentChange(newValue: Payment, oldValue: Payment) {
    if (newValue !== oldValue && newValue) {
      this.folioData = { ...newValue };
      this.syncPaymentTypes();
    }
  }

  @Watch('paymentEntries')
  handlePaymentEntriesChange(newValue: PaymentEntries, oldValue: PaymentEntries) {
    if (newValue !== oldValue) {
      this.syncPaymentTypes();
    }
  }
  @Method()
  async openFolio() {
    this.isOpen = true;
  }
  @Method()
  async closeFolio() {
    this.isOpen = false;
    this.autoValidate = false;
    this.errors = {};
    this.closeModal.emit(null);
  }

  private updateFolioData(params: Partial<Payment>): void {
    this.folioData = { ...(this.folioData ?? {}), ...params } as Payment;
  }

  private requiresPaymentMethod(code?: string) {
    return requiresPaymentMethodCode(code);
  }

  private getDefaultPaymentMethod() {
    const method = this.paymentEntries?.methods?.[0];
    if (!method) {
      return null;
    }
    return {
      code: method.CODE_NAME,
      description: method.CODE_VALUE_EN,
      operation: method.NOTES,
    };
  }

  private stopEventPropagation(event: Event) {
    event.stopImmediatePropagation();
    event.stopPropagation();
  }

  private syncPaymentTypes() {
    if (!this.paymentEntries) {
      this._paymentTypes = {};
      return;
    }
    const mappedTypes = buildPaymentTypes(this.paymentEntries);
    if (this.mode === 'payment-action' && this.payment?.payment_type?.code === '001') {
      const { PAYMENTS, CANCELLATION } = mappedTypes;
      this._paymentTypes = { PAYMENTS, CANCELLATION };
      return;
    }
    this._paymentTypes = mappedTypes;
  }

  private async savePayment(print: boolean = false) {
    try {
      this.isLoading = print ? 'save-print' : 'save';
      this.autoValidate = true;
      this.errors = {};
      const parsedData: FolioFormData = folioValidationSchema.parse({ ...(this.folioData ?? {}), amount: this.folioData?.amount ?? undefined });
      const { payment_type, payment_method, ...rest } = parsedData;
      const payload: Payment = {
        ...rest,
        payment_type: payment_type as Payment['payment_type'],
        payment_method: payment_method ? (payment_method as Payment['payment_method']) : undefined,
        id: rest.id ?? this.payment?.id ?? -1,
        date: rest.date ?? this.payment?.date ?? this.today,
        amount: rest.amount ?? 0,
        currency: calendar_data.currency,
        reference: rest.reference ?? '',
        designation: payment_type?.description || '',
      };
      await this.paymentService.AddPayment(payload, this.bookingNumber);
      this.resetBookingEvt.emit(null);
      this.resetExposedCancellationDueAmount.emit(null);
      this.closeFolio();
    } catch (error) {
      const err: Record<string, boolean> = {};
      if (error instanceof ZodError) {
        error.issues.forEach(e => {
          const field = e.path[0]?.toString();
          if (field) {
            err[field] = true;
          }
        });
      }
      console.error('Failed to save payment folio entry', error);
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
        payment_method: null,
      });
      return;
    }
    const selectedType = this.paymentEntries?.types?.find(pt => pt.CODE_NAME === value);
    if (!selectedType) {
      console.warn(`Invalid payment type ${value}`);
      this.updateFolioData({
        payment_type: null,
        payment_method: null,
      });
      return;
    }

    this.updateFolioData({
      payment_type: {
        code: selectedType.CODE_NAME,
        description: selectedType.CODE_VALUE_EN,
        operation: selectedType.NOTES,
      },
      payment_method: this.requiresPaymentMethod(selectedType.CODE_NAME) ? null : this.getDefaultPaymentMethod(),
    });
  }
  private handlePaymentMethodDropdownChange(value: string) {
    const payment_method = this.paymentEntries?.methods?.find(pt => pt.CODE_NAME === value);
    if (!payment_method) {
      console.warn(`Invalid payment method ${value}`);
      this.updateFolioData({ payment_method: null });
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

  private renderDropdownItems() {
    const groups = Object.values(this._paymentTypes ?? {});
    if (!groups.length) {
      return null;
    }
    return groups.map((p, idx) => (
      <Fragment>
        {p.map(pt => (
          <wa-option key={pt.CODE_NAME} value={pt.CODE_NAME} label={pt.CODE_VALUE_EN}>
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
    const isNewPayment = this.folioData?.payment_type?.code === '001' && this.folioData.id === -1;
    return (
      <ir-drawer
        placement="start"
        label={this.payment?.id !== -1 ? 'Edit Folio Entry' : 'New Folio Entry'}
        open={this.isOpen}
        onDrawerHide={event => {
          this.stopEventPropagation(event);
          this.isOpen = false;
        }}
      >
        {this.isOpen && (
          <div class="payment-folio__form" id="ir__folio-form">
            <ir-custom-date-picker
              aria-invalid={this.errors?.date && !this.folioData?.date ? 'true' : 'false'}
              data-testid="pickup_date"
              onDateChanged={evt => {
                this.updateFolioData({ date: evt.detail.start?.format(DATE_FORMAT) });
              }}
              emitEmptyDate={true}
              maxDate={this.today}
              date={this.folioData?.date}
            ></ir-custom-date-picker>
            <ir-validator
              value={this.folioData?.payment_type?.code}
              autovalidate={this.autoValidate}
              schema={paymentTypeSchema.shape.code}
              valueEvent="change wa-change select-change"
              blurEvent="wa-hide"
            >
              <wa-select
                onwa-hide={event => this.stopEventPropagation(event)}
                onwa-show={event => this.stopEventPropagation(event)}
                placeholder="Select..."
                label="Transaction type"
                defaultValue={this.folioData?.payment_type?.code}
                value={this.folioData?.payment_type?.code}
                disabled={this.mode === 'payment-action'}
                onchange={event => {
                  this.stopEventPropagation(event);
                  this.handleDropdownChange((event.target as HTMLSelectElement).value);
                }}
              >
                <wa-option value="">Select...</wa-option>
                {this.renderDropdownItems()}
              </wa-select>
            </ir-validator>

            {this.requiresPaymentMethod(this.folioData?.payment_type?.code) && (
              <ir-validator
                value={this.folioData?.payment_method?.code ?? ''}
                autovalidate={this.autoValidate}
                schema={paymentMethodSchema.shape.code}
                valueEvent="change wa-change select-change"
                blurEvent="wa-hide"
              >
                <wa-select
                  label={`${this.folioData.payment_type?.code === '001' ? 'Payment' : 'Refund'} method`}
                  onwa-show={event => this.stopEventPropagation(event)}
                  onwa-hide={event => this.stopEventPropagation(event)}
                  defaultValue={this.folioData?.payment_method?.code}
                  value={this.folioData?.payment_method?.code ?? ''}
                  onchange={event => {
                    this.stopEventPropagation(event);
                    this.handlePaymentMethodDropdownChange((event.target as HTMLSelectElement).value);
                  }}
                  // aria-invalid={String(this.errors?.payment_method && !this.folioData?.payment_method?.code)}
                >
                  <wa-option value="">Select...</wa-option>
                  {this.paymentEntries?.methods?.map(pt => {
                    return (
                      <wa-option key={pt.CODE_NAME} label={pt.CODE_VALUE_EN} value={pt.CODE_NAME}>
                        {pt.CODE_VALUE_EN}
                      </wa-option>
                    );
                  })}
                </wa-select>
              </ir-validator>
            )}
            <ir-validator
              value={this.folioData?.amount?.toString() ?? undefined}
              autovalidate={this.autoValidate}
              schema={folioBaseSchema.shape.amount}
              valueEvent="text-change input input-change"
              blurEvent="input-blur"
            >
              <ir-custom-input
                value={this.folioData?.amount?.toString() ?? ''}
                label="Amount"
                mask="price"
                min={0}
                onText-change={e => this.updateFolioData({ amount: !e.detail ? undefined : Number(e.detail) })}
              >
                <span slot="start">{calendar_data.currency.symbol}</span>
              </ir-custom-input>
            </ir-validator>
            <ir-validator
              value={this.folioData?.reference ?? ''}
              autovalidate={this.autoValidate}
              schema={folioBaseSchema.shape.reference}
              valueEvent="text-change input input-change"
              blurEvent="input-blur"
            >
              <ir-custom-input
                value={this.folioData?.reference ?? ''}
                label="Reference"
                maxlength={50}
                onText-change={e => this.updateFolioData({ reference: e.detail ?? '' })}
              ></ir-custom-input>
            </ir-validator>
          </div>
        )}
        <div slot="footer" class="w-100 d-flex align-items-center" style={{ gap: 'var(--wa-space-xs)' }}>
          <ir-custom-button class="flex-fill" size="medium" data-drawer="close" appearance="filled" variant="neutral" onClickHandler={() => this.closeFolio()}>
            Cancel
          </ir-custom-button>
          <ir-custom-button
            onClickHandler={() => this.savePayment()}
            loading={this.isLoading === 'save'}
            class="flex-fill"
            size="medium"
            appearance={isNewPayment ? 'filled' : 'accent'}
            variant="brand"
          >
            Save
          </ir-custom-button>
          {isNewPayment && (
            <ir-custom-button
              onClickHandler={() => this.savePayment(true)}
              loading={this.isLoading === 'save-print'}
              class="flex-fill"
              size="medium"
              appearance="accent"
              variant="brand"
            >
              Save & Print
            </ir-custom-button>
          )}
        </div>
      </ir-drawer>
    );
  }
}

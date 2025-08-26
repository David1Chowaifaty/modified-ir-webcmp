import { Component, h, Prop, State, Event, EventEmitter, Watch, Listen } from '@stencil/core';
import { Booking, IPayment } from '@/models/booking.dto';
import { BookingService } from '@/services/booking.service';
import moment from 'moment';
import { PaymentService, IPaymentAction } from '@/services/payment.service';
import { formatAmount, toFloat } from '@/utils/utils';
import locales from '@/stores/locales.store';
import { IToast } from '@/components/ui/ir-toast/toast';
import calendar_data from '@/stores/calendar-data';
import { PaymentSidebarEvent } from '../types';
const payments = [
  {
    id: 1,
    currency: {
      id: 1,
      symbol: '$US',
      code: '',
    },
    designation: 'Reservation deposit',
    amount: 363.02,
    type: 'credit',
    date: '2025-08-12',
    reference: 'INV-2025-0812-001',
  },
  {
    id: 2,
    currency: {
      id: 1,
      symbol: '$US',
      code: '',
    },
    designation: 'Housekeeping fee',
    amount: 355.45,
    type: 'debit',
    date: '2025-08-16',
    reference: null,
  },
  {
    id: 3,
    currency: {
      id: 1,
      symbol: '$US',
      code: '',
    },
    designation: 'Mini-bar',
    amount: 360.49,
    type: 'debit',
    date: '2025-08-08',
    reference: 'RM120-MB-8842',
  },
  {
    id: 4,
    currency: {
      id: 1,
      symbol: '$US',
      code: '',
    },
    designation: 'Refund – canceled tour',
    amount: 294.34,
    type: 'credit',
    date: '2025-08-16',
    reference: null,
  },
  {
    id: 5,
    currency: {
      id: 1,
      symbol: '$US',
      code: '',
    },
    designation: 'Late checkout',
    amount: 80.97,
    type: 'credit',
    date: '2025-08-04',
    reference: 'CHKO-2025-0804',
  },
  {
    id: 6,
    currency: {
      id: 1,
      symbol: '$US',
      code: '',
    },
    designation: 'Airport pickup',
    amount: 346.6,
    type: 'credit',
    date: '2025-08-17',
    reference: null,
  },
  {
    id: 7,
    currency: {
      id: 1,
      symbol: '$US',
      code: '',
    },
    designation: 'Room service',
    amount: 430.52,
    type: 'credit',
    date: '2025-08-05',
    reference: 'RSV-7421',
  },
  {
    id: 8,
    currency: {
      id: 1,
      symbol: '$US',
      code: '',
    },
    designation: 'City tax',
    amount: 89.39,
    type: 'credit',
    date: '2025-08-09',
    reference: null,
  },
  {
    id: 9,
    currency: {
      id: 1,
      symbol: '$US',
      code: '',
    },
    designation: 'Laundry',
    amount: 49.93,
    type: 'credit',
    date: '2025-07-30',
    reference: 'LND-20541',
  },
  {
    id: 10,
    currency: {
      id: 1,
      symbol: '$US',
      code: '',
    },
    designation: 'Spa treatment',
    amount: 469.32,
    type: 'credit',
    date: '2025-08-13',
    reference: null,
  },
] as IPayment[];
@Component({
  styleUrl: 'ir-payment-details.css',
  tag: 'ir-payment-details',
  scoped: true,
})
export class IrPaymentDetails {
  @Prop({ mutable: true }) bookingDetails: Booking;
  @Prop() paymentActions: IPaymentAction[];

  @State() newTableRow: boolean = false;

  @State() collapsedPayment: boolean = false;
  @State() collapsedGuarantee: boolean = false;

  @State() flag: boolean = false;

  @State() confirmModal: boolean = false;
  @State() toBeDeletedItem: IPayment;

  @State() paymentDetailsUrl: string = '';
  @State() paymentExceptionMessage: string = '';
  @State() modal_mode: 'delete' | 'save' | null = null;
  @State() itemToBeAdded: IPayment;

  @Event({ bubbles: true }) resetBookingEvt: EventEmitter<null>;
  @Event({ bubbles: true }) resetExposedCancellationDueAmount: EventEmitter<null>;
  @Event({ bubbles: true }) toast: EventEmitter<IToast>;
  @Event({ bubbles: true }) openSidebar: EventEmitter<PaymentSidebarEvent>;

  private paymentService = new PaymentService();
  private bookingService = new BookingService();

  @Watch('bookingDetails')
  handleBookingDetails() {
    if (this.newTableRow) {
      this.newTableRow = false;
    }
  }

  @Listen('generatePayment')
  handlePaymentGeneration(e: CustomEvent) {
    const value = e.detail;
    this.openSidebar.emit({
      type: 'payment-folio',
      payload: { ...value, date: value.due_on, id: -1, amount: value.amount },
    });
    // this.newTableRow = true;
    // this.itemToBeAdded = { ...this.itemToBeAdded, amount: value.amount, date: value.due_on };
  }
  async componentWillLoad() {
    try {
      this.initializeItemToBeAdded();
    } catch (error) {
      if (this.bookingDetails.guest.cci) {
        return;
      }
      if (!this.bookingDetails.is_direct && this.bookingDetails.channel_booking_nbr) {
        this.paymentExceptionMessage = error;
      }
    }
  }

  private initializeItemToBeAdded() {
    this.itemToBeAdded = {
      id: -1,
      date: moment().format('YYYY-MM-DD'),
      amount: null,
      currency: this.bookingDetails.currency,
      designation: '',
      reference: '',
    };
  }

  async _handleSave() {
    try {
      await this.paymentService.AddPayment(this.itemToBeAdded, this.bookingDetails.booking_nbr);
      this.initializeItemToBeAdded();
      this.resetBookingEvt.emit(null);
      this.resetExposedCancellationDueAmount.emit(null);
    } catch (error) {
      console.log(error);
    }
  }

  private async cancelPayment() {
    try {
      await this.paymentService.CancelPayment(this.toBeDeletedItem.id);
      const newPaymentArray = this.bookingDetails.financial.payments.filter((item: IPayment) => item.id !== this.toBeDeletedItem.id);
      this.bookingDetails = { ...this.bookingDetails, financial: { ...this.bookingDetails.financial, payments: newPaymentArray } };
      this.confirmModal = !this.confirmModal;
      this.resetBookingEvt.emit(null);
      this.resetExposedCancellationDueAmount.emit(null);
      this.toBeDeletedItem = null;
      this.modal_mode = null;
    } catch (error) {
      console.log(error);
    }
  }
  private async handleConfirmModal(e: CustomEvent) {
    // this.paymentBackground = 'white';
    e.stopImmediatePropagation();
    e.stopPropagation();
    if (this.modal_mode === 'delete') {
      await this.cancelPayment();
    } else {
      await this._handleSave();
    }
  }
  private openModal() {
    const modal: any = document.querySelector('.delete-record-modal');
    modal.openModal();
  }

  private async handleCancelModal(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    try {
      // this.paymentBackground = 'white';
      if (this.modal_mode === 'save') {
        this.initializeItemToBeAdded();
      }
    } catch (error) {
      console.log(error);
    }
  }

  private formatCurrency(amount: number, currency: string, locale: string = 'en-US'): string {
    if (!currency) {
      return;
    }
    if (amount >= 0) {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    }
    return;
  }

  private bookingGuarantee() {
    const paymentMethod = this.bookingDetails.is_direct ? this.getPaymentMethod() : null;
    if (this.bookingDetails.is_direct && !paymentMethod && !this.bookingDetails.guest.cci) {
      return null;
    }
    return (
      <div class="mb-1">
        <div class="d-flex align-items-center">
          <span class="mr-1 font-medium">
            {locales.entries.Lcz_BookingGuarantee}
            {!!paymentMethod && <span>: {paymentMethod}</span>}
          </span>
          {(!this.bookingDetails.is_direct || (this.bookingDetails.is_direct && this.bookingDetails.guest.cci)) && (
            <ir-button
              id="drawer-icon"
              data-toggle="collapse"
              data-target={`.guarrantee`}
              aria-expanded={this.collapsedGuarantee ? 'true' : 'false'}
              aria-controls="myCollapse"
              class="sm-padding-right pointer"
              variant="icon"
              icon_name="credit_card"
              onClickHandler={async () => {
                if (!this.bookingDetails.is_direct && this.bookingDetails.channel_booking_nbr && !this.bookingDetails.guest.cci && !this.collapsedGuarantee) {
                  this.paymentDetailsUrl = await this.bookingService.getPCICardInfoURL(this.bookingDetails.booking_nbr);
                }
                this.collapsedGuarantee = !this.collapsedGuarantee;
              }}
            ></ir-button>
          )}
        </div>
        <div class="collapse guarrantee ">
          {this.bookingDetails.guest.cci ? (
            [
              <div>
                {this.bookingDetails?.guest?.cci && 'Card:'} <span>{this.bookingDetails?.guest?.cci?.nbr || ''}</span> {this.bookingDetails?.guest?.cci?.expiry_month && 'Expiry: '}
                <span>
                  {' '}
                  {this.bookingDetails?.guest?.cci?.expiry_month || ''} {this.bookingDetails?.guest?.cci?.expiry_year && '/' + this.bookingDetails?.guest?.cci?.expiry_year}
                </span>
              </div>,
              <div>
                {this.bookingDetails?.guest?.cci.holder_name && 'Name:'} <span>{this.bookingDetails?.guest?.cci?.holder_name || ''}</span>{' '}
                {this.bookingDetails?.guest?.cci?.cvc && '- CVC:'} <span> {this.bookingDetails?.guest?.cci?.cvc || ''}</span>
              </div>,
            ]
          ) : this.paymentDetailsUrl ? (
            <iframe src={this.paymentDetailsUrl} width="100%" class="iframeHeight" frameborder="0" name="payment"></iframe>
          ) : (
            <div class="text-center">{this.paymentExceptionMessage}</div>
          )}
        </div>
        {!this.bookingDetails.is_direct && this.bookingDetails.ota_guarante && (
          <div>
            <ir-label
              content={this.bookingDetails.ota_guarante?.card_type + `${this.bookingDetails.ota_guarante?.is_virtual ? ' (virtual)' : ''}`}
              labelText={`${locales.entries.Lcz_CardType}:`}
            ></ir-label>
            <ir-label content={this.bookingDetails.ota_guarante?.cardholder_name} labelText={`${locales.entries.Lcz_CardHolderName}:`}></ir-label>
            <ir-label content={this.bookingDetails.ota_guarante?.card_number} labelText={`${locales.entries.Lcz_CardNumber}:`}></ir-label>
            <ir-label
              content={this.formatCurrency(
                toFloat(Number(this.bookingDetails.ota_guarante?.meta?.virtual_card_current_balance), Number(this.bookingDetails.ota_guarante?.meta?.virtual_card_decimal_places)),
                this.bookingDetails.ota_guarante?.meta?.virtual_card_currency_code,
              )}
              labelText={`${locales.entries.Lcz_CardBalance}:`}
            ></ir-label>
          </div>
        )}
      </div>
    );
  }

  private checkPaymentCode(value: string) {
    return calendar_data.allowed_payment_methods?.find(pm => pm.code === value)?.description ?? null;
  }

  private getPaymentMethod() {
    let paymentMethod = null;
    const payment_code = this.bookingDetails?.extras?.find(e => e.key === 'payment_code');
    if (this.bookingDetails.agent) {
      const code = this.bookingDetails?.extras?.find(e => e.key === 'agent_payment_mode');
      if (code) {
        paymentMethod = code.value === '001' ? locales.entries.Lcz_OnCredit : payment_code ? this.checkPaymentCode(payment_code.value) : null;
      }
    } else {
      if (payment_code) {
        paymentMethod = this.checkPaymentCode(payment_code.value);
      }
    }
    return paymentMethod;
  }

  render() {
    if (!this.bookingDetails.financial) {
      return null;
    }
    return [
      <div class="card m-0">
        <div class="p-1">
          {this.bookingDetails.financial.gross_cost > 0 && this.bookingDetails.financial.gross_cost !== null && (
            <div class="mb-2 h4 total-cost-container">
              {locales.entries.Lcz_TotalCost}: <span>{formatAmount(this.bookingDetails.currency.symbol, this.bookingDetails.financial.gross_cost)}</span>
            </div>
          )}
          <div class="h4 d-flex align-items-center justify-content-between">
            <span>{locales.entries.Lcz_Balance}: </span>
            <span class="danger font-weight-bold">{formatAmount(this.bookingDetails.currency.symbol, this.bookingDetails.financial.due_amount)}</span>
          </div>
          <div class="mb-2 h4 d-flex align-items-center justify-content-between">
            <span>{locales.entries.Lcz_Collected}: </span>
            <span class="">
              {formatAmount(
                this.bookingDetails.currency.symbol,
                this.bookingDetails.financial.payments ? this.bookingDetails.financial.payments.reduce((prev, curr) => prev + curr.amount, 0) : 0,
              )}
            </span>
          </div>

          {this.bookingGuarantee()}
          {this.paymentActions?.filter(pa => pa.amount !== 0).length > 0 && this.bookingDetails.is_direct && (
            <div>
              <ir-payment-actions paymentAction={this.paymentActions} booking={this.bookingDetails}></ir-payment-actions>
            </div>
          )}
        </div>
      </div>,
      <div class=" mt-1">
        <div class="d-flex  flex-column rounded payment-container">
          <div class="d-flex align-items-center justify-content-between">
            <p class={'font-size-large p-0 m-0 '}>Payment folio</p>
            <ir-button
              id="add-payment"
              variant="icon"
              icon_name="square_plus"
              style={{ '--icon-size': '1.5rem' }}
              onClickHandler={() => {
                // this.newTableRow = true;
                this.openSidebar.emit({
                  type: 'payment-folio',
                  payload: null,
                });
              }}
            ></ir-button>
          </div>

          <div class="mt-1 card p-1 payments-container">
            {payments.map((row, index) => [
              <ir-payment-item
                onDeletePayment={e => {
                  this.modal_mode = 'delete';
                  this.toBeDeletedItem = e.detail;
                  this.openModal();
                }}
                onEditPayment={e => {
                  this.openSidebar.emit({
                    type: 'payment-folio',
                    payload: { ...e.detail },
                  });
                }}
                key={row.id}
                payment={row}
              ></ir-payment-item>,
              index < payments.length - 1 && <hr class={'p-0 m-0'} />,
            ])}
          </div>
        </div>
      </div>,
      <ir-modal
        item={this.toBeDeletedItem}
        class={'delete-record-modal'}
        modalTitle={locales.entries.Lcz_Confirmation}
        modalBody={this.modal_mode === 'delete' ? locales.entries.Lcz_IfDeletedPermantlyLost : locales.entries.Lcz_EnteringAmountGreaterThanDue}
        iconAvailable={true}
        icon="ft-alert-triangle danger h1"
        leftBtnText={locales.entries.Lcz_Cancel}
        rightBtnText={this.modal_mode === 'delete' ? locales.entries.Lcz_Delete : locales.entries.Lcz_Confirm}
        leftBtnColor="secondary"
        rightBtnColor={this.modal_mode === 'delete' ? 'danger' : 'primary'}
        onConfirmModal={this.handleConfirmModal.bind(this)}
        onCancelModal={this.handleCancelModal.bind(this)}
      ></ir-modal>,
    ];
  }
}

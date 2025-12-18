import { Component, h, Prop, State, Event, EventEmitter, Listen } from '@stencil/core';
import { Booking, IPayment } from '@/models/booking.dto';
import { BookingService } from '@/services/booking-service/booking.service';
import { PaymentService, IPaymentAction } from '@/services/payment.service';
import locales from '@/stores/locales.store';
import { IToast } from '@/components/ui/ir-toast/toast';
import { Payment, PaymentEntries, PaymentSidebarEvent, PrintScreenOptions } from '../types';
import moment from 'moment';
import { formatAmount } from '@/utils/utils';
import calendar_data from '@/stores/calendar-data';

@Component({
  styleUrl: 'ir-payment-details.css',
  tag: 'ir-payment-details',
  scoped: true,
})
export class IrPaymentDetails {
  @Prop({ mutable: true }) booking: Booking;
  @Prop() paymentActions: IPaymentAction[];
  @Prop() propertyId: number;
  @Prop() paymentEntries: PaymentEntries;

  @State() confirmModal: boolean = false;
  @State() toBeDeletedItem: IPayment | null = null;
  @State() modalMode: 'delete' | 'save' | null = null;
  @State() isLoading: boolean = false;

  @Event({ bubbles: true }) resetBookingEvt: EventEmitter<null>;
  @Event({ bubbles: true }) resetExposedCancellationDueAmount: EventEmitter<null>;
  @Event({ bubbles: true }) toast: EventEmitter<IToast>;
  @Event({ bubbles: true }) openSidebar: EventEmitter<PaymentSidebarEvent>;
  @Event({ bubbles: true }) openPrintScreen: EventEmitter<PrintScreenOptions>;

  private paymentService = new PaymentService();
  private bookingService = new BookingService();
  private dialogRef: HTMLIrDialogElement;

  @Listen('generatePayment')
  handlePaymentGeneration(e: CustomEvent) {
    const value = e.detail;
    const paymentType = this.paymentEntries?.types?.find(p => p.CODE_NAME === (this.booking.status.code === '003' ? value.pay_type_code : '001'));
    this.openSidebar.emit({
      type: 'payment-folio',
      payload: {
        payment: {
          ...value,
          date: moment().format('YYYY-MM-DD'),
          id: -1,
          amount: value.amount,
          payment_type: paymentType
            ? {
                code: paymentType.CODE_NAME,
                description: paymentType.CODE_VALUE_EN,
                operation: paymentType.NOTES,
              }
            : null,
          designation: paymentType?.CODE_VALUE_EN ?? null,
        },
        mode: 'payment-action',
      },
    });
  }

  private handleAddPayment = (props?: { type: 'cancellation-penalty' | 'refund'; amount: number }) => {
    let payment: Payment = {
      id: -1,
      date: moment().format('YYYY-MM-DD'),
      amount: null,
      currency: calendar_data.currency,
      designation: null,
      reference: null,
    };
    if (props) {
      const { amount, type } = props;
      const cashMethod = this.paymentEntries.methods.find(pt => pt.CODE_NAME === '001');
      const payment_method = {
        code: cashMethod.CODE_NAME,
        description: cashMethod.CODE_VALUE_EN,
        operation: cashMethod.NOTES,
      };
      const paymentType = this.paymentEntries.types.find(pt => pt.CODE_NAME === (type === 'cancellation-penalty' ? '001' : '010'));
      payment = {
        ...payment,
        amount: amount,
        designation: paymentType.CODE_VALUE_EN,
        payment_type: {
          code: paymentType.CODE_NAME,
          description: paymentType.CODE_VALUE_EN,
          operation: paymentType.NOTES,
        },
        payment_method: type === 'refund' ? undefined : payment_method,
      };
      this.openSidebar.emit({
        type: 'payment-folio',
        payload: {
          payment,
          mode: 'payment-action',
        },
      });
      return;
    }
    this.openSidebar.emit({
      type: 'payment-folio',
      payload: {
        payment,
        mode: 'new',
      },
    });
  };

  private handleEditPayment(payment: IPayment) {
    this.openSidebar.emit({
      type: 'payment-folio',
      payload: { payment, mode: 'edit' },
    });
  }

  private handleDeletePayment(payment: IPayment) {
    this.modalMode = 'delete';
    this.toBeDeletedItem = payment;
    this.dialogRef.openModal();
  }

  private async handleIssueReceipt(detail: IPayment) {
    if (detail.receipt_nbr) {
      this.openPrintScreen.emit({
        mode: 'receipt',
        payload: {
          pid: detail.id.toString(),
          rnb: detail.receipt_nbr,
        },
      });
      return;
    }
    const _number = await this.bookingService.getNextValue({ starter: 'RC' });
    this.openPrintScreen.emit({
      mode: 'receipt',
      payload: {
        pid: detail.id.toString(),
        rnb: `RC-${_number.My_Result}`,
      },
    });
  }

  private async cancelPayment() {
    try {
      this.isLoading = true;
      await this.paymentService.CancelPayment(this.toBeDeletedItem.system_id);
      const newPaymentArray = this.booking.financial.payments.filter((item: IPayment) => item.id !== this.toBeDeletedItem.id);

      this.booking = {
        ...this.booking,
        financial: { ...this.booking.financial, payments: newPaymentArray },
      };

      this.dialogRef.closeModal();
      this.confirmModal = false;
      this.resetBookingEvt.emit(null);
      this.resetExposedCancellationDueAmount.emit(null);
      this.toBeDeletedItem = null;
    } catch (error) {
      console.error('Error canceling payment:', error);
      this.toast.emit({
        type: 'error',
        title: 'Error',
        description: 'Failed to cancel payment. Please try again.',
        position: 'top-right',
      });
    } finally {
      this.isLoading = false;
    }
  }

  private handleConfirmModal = async (e: CustomEvent) => {
    e.stopImmediatePropagation();
    e.stopPropagation();

    if (this.modalMode === 'delete') {
      await this.cancelPayment();
    }
  };

  private handleCancelModal = (e: CustomEvent) => {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.modalMode = null;
    this.toBeDeletedItem = null;
  };

  private hasValidFinancialData(): boolean {
    return Boolean(this.booking?.financial);
  }

  // private shouldShowPaymentActions(): boolean {
  //   return Boolean(this.paymentActions?.filter(pa => pa.amount !== 0).length > 0 && this.booking.is_direct);
  // }
  private shouldShowRefundButton(): boolean {
    if (!this.booking.is_direct) {
      return false;
    }
    if (this.booking.financial.due_amount === 0) {
      return false;
    }
    if (this.booking.financial.cancelation_penality_as_if_today === 0) {
      return false;
    }
    if (this.booking.is_requested_to_cancel || ['003', '004'].includes(this.booking.status.code)) {
      return this.booking.financial.cancelation_penality_as_if_today < 0;
    }
    return false;
  }

  private shouldCancellationButton(): boolean {
    if (!this.booking.is_direct) {
      return false;
    }
    if (this.booking.financial.due_amount === 0) {
      return false;
    }
    if (this.booking.financial.cancelation_penality_as_if_today === 0) {
      return false;
    }
    if (['003', '004'].includes(this.booking.status.code) && this.booking.financial.cancelation_penality_as_if_today > 0) {
      return true;
    }
    return false;
  }

  render() {
    if (!this.hasValidFinancialData()) {
      return null;
    }

    const { financial, currency } = this.booking;

    return [
      <wa-card>
        <ir-payment-summary
          isBookingCancelled={['003', '004'].includes(this.booking.status.code)}
          totalCost={financial.gross_cost}
          balance={financial.due_amount}
          collected={this.booking.financial.collected + this.booking.financial.refunds}
          currency={currency}
        />
        <ir-booking-guarantee booking={this.booking} bookingService={this.bookingService} />
        {/* {this.shouldShowPaymentActions() && <ir-payment-actions paymentAction={this.paymentActions} booking={this.booking} />} */}
        {!['003', '004'].includes(this.booking.status.code) && this.booking.is_direct && (
          <ir-applicable-policies propertyId={this.propertyId} booking={this.booking}></ir-applicable-policies>
        )}

        {this.shouldShowRefundButton() && (
          <div class="d-flex mt-1">
            <ir-custom-button
              variant="brand"
              appearance="outlined"
              onClickHandler={() => {
                this.handleAddPayment({ type: 'refund', amount: Math.abs(this.booking.financial.cancelation_penality_as_if_today) });
              }}
            >
              {`Refund ${formatAmount(currency.symbol, Math.abs(this.booking.financial.cancelation_penality_as_if_today))}`}
            </ir-custom-button>
          </div>
        )}
        {this.shouldCancellationButton() && (
          <div class="d-flex mt-1">
            <ir-custom-button
              variant="brand"
              appearance="outlined"
              onClickHandler={() => {
                this.handleAddPayment({ type: 'cancellation-penalty', amount: Math.abs(this.booking.financial.cancelation_penality_as_if_today) });
              }}
            >
              {`Charge cancellation penalty ${formatAmount(currency.symbol, this.booking.financial.cancelation_penality_as_if_today)}`}
            </ir-custom-button>
          </div>
        )}
      </wa-card>,
      <ir-payments-folio
        payments={financial.payments || []}
        onAddPayment={() => this.handleAddPayment()}
        onEditPayment={e => this.handleEditPayment(e.detail)}
        onDeletePayment={e => this.handleDeletePayment(e.detail)}
        onIssueReceipt={e => this.handleIssueReceipt(e.detail)}
      />,
      <ir-dialog
        onIrDialogHide={e => {
          e.stopImmediatePropagation();
          e.stopPropagation();
        }}
        onIrDialogAfterHide={e => {
          this.handleCancelModal(e);
        }}
        ref={el => (this.dialogRef = el)}
        label="Alert"
        lightDismiss={this.modalMode !== 'delete'}
      >
        <p>{this.modalMode === 'delete' ? locales.entries.Lcz_IfDeletedPermantlyLost : locales.entries.Lcz_EnteringAmountGreaterThanDue}</p>
        <div slot="footer" class="ir-dialog__footer">
          <ir-custom-button size="medium" data-dialog="close" variant="neutral" appearance="filled">
            {locales.entries.Lcz_Cancel}
          </ir-custom-button>
          <ir-custom-button loading={this.isLoading} size="medium" onClickHandler={e => this.handleConfirmModal(e)} variant={this.modalMode === 'delete' ? 'danger' : 'brand'}>
            {this.modalMode === 'delete' ? locales.entries.Lcz_Delete : locales.entries.Lcz_Confirm}
          </ir-custom-button>
        </div>
      </ir-dialog>,
    ];
  }
}

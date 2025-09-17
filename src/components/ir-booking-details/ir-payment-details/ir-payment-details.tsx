import { Component, h, Prop, State, Event, EventEmitter, Listen } from '@stencil/core';
import { Booking, IPayment } from '@/models/booking.dto';
import { BookingService } from '@/services/booking.service';
import { PaymentService, IPaymentAction } from '@/services/payment.service';
import locales from '@/stores/locales.store';
import { IToast } from '@/components/ui/ir-toast/toast';
import { PaymentEntries, PaymentSidebarEvent } from '../types';
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

  @Event({ bubbles: true }) resetBookingEvt: EventEmitter<null>;
  @Event({ bubbles: true }) resetExposedCancellationDueAmount: EventEmitter<null>;
  @Event({ bubbles: true }) toast: EventEmitter<IToast>;
  @Event({ bubbles: true }) openSidebar: EventEmitter<PaymentSidebarEvent>;

  private paymentService = new PaymentService();
  private bookingService = new BookingService();

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
        mode: 'new',
      },
    });
  }

  private handleAddPayment = (props?: { type: 'cancellation-penalty' | 'refund'; amount: number }) => {
    let payment: IPayment = {
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
      const paymentType = this.paymentEntries.types.find(pt => pt.CODE_NAME === (type === 'cancellation-penalty' ? '013' : '010'));
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
    }
    this.openSidebar.emit({
      type: 'payment-folio',
      payload: {
        payment,
        mode: 'new',
      },
    });
  };

  private handleEditPayment = (payment: IPayment) => {
    this.openSidebar.emit({
      type: 'payment-folio',
      payload: { payment, mode: 'edit' },
    });
  };

  private handleDeletePayment = (payment: IPayment) => {
    this.modalMode = 'delete';
    this.toBeDeletedItem = payment;
    this.openModal();
  };

  private async cancelPayment() {
    try {
      await this.paymentService.CancelPayment(this.toBeDeletedItem.id);
      const newPaymentArray = this.booking.financial.payments.filter((item: IPayment) => item.id !== this.toBeDeletedItem.id);

      this.booking = {
        ...this.booking,
        financial: { ...this.booking.financial, payments: newPaymentArray },
      };

      this.confirmModal = false;
      this.resetBookingEvt.emit(null);
      this.resetExposedCancellationDueAmount.emit(null);
      this.toBeDeletedItem = null;
      this.modalMode = null;
    } catch (error) {
      console.error('Error canceling payment:', error);
      this.toast.emit({
        type: 'error',
        title: 'Error',
        description: 'Failed to cancel payment. Please try again.',
        position: 'top-right',
      });
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

  private openModal() {
    const modal: any = document.querySelector('.delete-record-modal');
    modal?.openModal();
  }

  private hasValidFinancialData(): boolean {
    return Boolean(this.booking?.financial);
  }

  // private shouldShowPaymentActions(): boolean {
  //   return Boolean(this.paymentActions?.filter(pa => pa.amount !== 0).length > 0 && this.booking.is_direct);
  // }
  private shouldShowRefundButton(): boolean {
    if (this.booking.is_requested_to_cancel || ['003', '004'].includes(this.booking.status.code)) {
      return this.booking.financial.cancelation_penality_as_if_today < 0;
    }
    return false;
  }

  render() {
    if (!this.hasValidFinancialData()) {
      return null;
    }

    const { financial, currency } = this.booking;

    return [
      <div class="card p-1">
        <ir-payment-summary totalCost={financial.gross_cost} balance={financial.due_amount} collected={this.booking.financial.collected} currency={currency} />
        <ir-booking-guarantee booking={this.booking} bookingService={this.bookingService} />
        {/* {this.shouldShowPaymentActions() && <ir-payment-actions paymentAction={this.paymentActions} booking={this.booking} />} */}
        {!['003', '004'].includes(this.booking.status.code) && <ir-applicable-policies propertyId={this.propertyId} booking={this.booking}></ir-applicable-policies>}

        {this.shouldShowRefundButton() && (
          <div class="d-flex mt-1">
            <ir-button
              btn_color="outline"
              text={`Refund ${formatAmount(currency.symbol, Math.abs(this.booking.financial.cancelation_penality_as_if_today))}`}
              size="sm"
              onClickHandler={() => {
                this.handleAddPayment({ type: 'refund', amount: Math.abs(this.booking.financial.cancelation_penality_as_if_today) });
              }}
            ></ir-button>
          </div>
        )}
        {['003', '004'].includes(this.booking.status.code) && this.booking.financial.cancelation_penality_as_if_today > 0 && (
          <div class="d-flex mt-1">
            <ir-button
              btn_color="outline"
              text={`Cancellation penalty ${formatAmount(currency.symbol, this.booking.financial.cancelation_penality_as_if_today)}`}
              size="sm"
              onClickHandler={() => {
                this.handleAddPayment({ type: 'cancellation-penalty', amount: Math.abs(this.booking.financial.cancelation_penality_as_if_today) });
              }}
            ></ir-button>
          </div>
        )}
      </div>,
      <ir-payments-folio
        payments={financial.payments || []}
        onAddPayment={() => this.handleAddPayment()}
        onEditPayment={e => this.handleEditPayment(e.detail)}
        onDeletePayment={e => this.handleDeletePayment(e.detail)}
      />,
      <ir-modal
        item={this.toBeDeletedItem}
        class="delete-record-modal"
        modalTitle={locales.entries.Lcz_Confirmation}
        modalBody={this.modalMode === 'delete' ? locales.entries.Lcz_IfDeletedPermantlyLost : locales.entries.Lcz_EnteringAmountGreaterThanDue}
        iconAvailable={true}
        icon="ft-alert-triangle danger h1"
        leftBtnText={locales.entries.Lcz_Cancel}
        rightBtnText={this.modalMode === 'delete' ? locales.entries.Lcz_Delete : locales.entries.Lcz_Confirm}
        leftBtnColor="secondary"
        rightBtnColor={this.modalMode === 'delete' ? 'danger' : 'primary'}
        onConfirmModal={this.handleConfirmModal}
        onCancelModal={this.handleCancelModal}
      />,
    ];
  }
}

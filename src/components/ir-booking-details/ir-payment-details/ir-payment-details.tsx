import { Component, h, Prop, State, Event, EventEmitter, Listen } from '@stencil/core';
import { Booking, IPayment } from '@/models/booking.dto';
import { BookingService } from '@/services/booking.service';
import { PaymentService, IPaymentAction } from '@/services/payment.service';
import locales from '@/stores/locales.store';
import { IToast } from '@/components/ui/ir-toast/toast';
import { PaymentSidebarEvent } from '../types';
const MOCK_PAYMENTS: IPayment[] = [
  {
    id: 1,
    currency: { id: 1, symbol: '$US', code: 'USD' },
    designation: 'Reservation deposit',
    amount: 363.02,
    type: 'credit',
    date: '2025-08-12',
    reference: 'INV-2025-0812-001',
  },
  {
    id: 2,
    currency: { id: 1, symbol: '$US', code: 'USD' },
    designation: 'Housekeeping fee',
    amount: 355.45,
    type: 'debit',
    date: '2025-08-16',
    reference: null,
  },
  {
    id: 3,
    currency: { id: 1, symbol: '$US', code: 'USD' },
    designation: 'Mini-bar',
    amount: 360.49,
    type: 'debit',
    date: '2025-08-08',
    reference: 'RM120-MB-8842',
  },
  {
    id: 4,
    currency: { id: 1, symbol: '$US', code: 'USD' },
    designation: 'Refund — canceled tour',
    amount: 294.34,
    type: 'credit',
    date: '2025-08-16',
    reference: null,
  },
  {
    id: 5,
    currency: { id: 1, symbol: '$US', code: 'USD' },
    designation: 'Late checkout',
    amount: 80.97,
    type: 'credit',
    date: '2025-08-04',
    reference: 'CHKO-2025-0804',
  },
  {
    id: 6,
    currency: { id: 1, symbol: '$US', code: 'USD' },
    designation: 'Airport pickup',
    amount: 346.6,
    type: 'credit',
    date: '2025-08-17',
    reference: null,
  },
  {
    id: 7,
    currency: { id: 1, symbol: '$US', code: 'USD' },
    designation: 'Room service',
    amount: 430.52,
    type: 'credit',
    date: '2025-08-05',
    reference: 'RSV-7421',
  },
  {
    id: 8,
    currency: { id: 1, symbol: '$US', code: 'USD' },
    designation: 'City tax',
    amount: 89.39,
    type: 'credit',
    date: '2025-08-09',
    reference: null,
  },
  {
    id: 9,
    currency: { id: 1, symbol: '$US', code: 'USD' },
    designation: 'Laundry',
    amount: 49.93,
    type: 'credit',
    date: '2025-07-30',
    reference: 'LND-20541',
  },
  {
    id: 10,
    currency: { id: 1, symbol: '$US', code: 'USD' },
    designation: 'Spa treatment',
    amount: 469.32,
    type: 'credit',
    date: '2025-08-13',
    reference: null,
  },
];
@Component({
  styleUrl: 'ir-payment-details.css',
  tag: 'ir-payment-details',
  scoped: true,
})
export class IrPaymentDetails {
  @Prop({ mutable: true }) bookingDetails: Booking;
  @Prop() paymentActions: IPaymentAction[];

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
    this.openSidebar.emit({
      type: 'payment-folio',
      payload: { ...value, date: value.due_on, id: -1, amount: value.amount },
    });
  }

  private handleAddPayment = () => {
    this.openSidebar.emit({
      type: 'payment-folio',
      payload: null,
    });
  };

  private handleEditPayment = (payment: IPayment) => {
    this.openSidebar.emit({
      type: 'payment-folio',
      payload: { ...payment },
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
      const newPaymentArray = this.bookingDetails.financial.payments.filter((item: IPayment) => item.id !== this.toBeDeletedItem.id);

      this.bookingDetails = {
        ...this.bookingDetails,
        financial: { ...this.bookingDetails.financial, payments: newPaymentArray },
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

  private calculateCollectedAmount(): number {
    if (!this.bookingDetails.financial?.payments) return 0;
    return this.bookingDetails.financial.payments.reduce((total, payment) => total + payment.amount, 0);
  }

  private hasValidFinancialData(): boolean {
    return Boolean(this.bookingDetails?.financial);
  }

  private shouldShowPaymentActions(): boolean {
    return Boolean(this.paymentActions?.filter(pa => pa.amount !== 0).length > 0 && this.bookingDetails.is_direct);
  }

  render() {
    if (!this.hasValidFinancialData()) {
      return null;
    }

    const { financial, currency } = this.bookingDetails;
    const collectedAmount = this.calculateCollectedAmount();

    return [
      <div class="card p-1">
        <ir-payment-summary totalCost={financial.gross_cost} balance={financial.due_amount} collected={collectedAmount} currency={currency} />
        <ir-booking-guarantee booking={this.bookingDetails} bookingService={this.bookingService} />
        {this.shouldShowPaymentActions() && <ir-payment-actions paymentAction={this.paymentActions} booking={this.bookingDetails} />}
      </div>,
      <ir-payments-folio
        // payments={financial.payments || []}
        payments={MOCK_PAYMENTS}
        onAddPayment={this.handleAddPayment}
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

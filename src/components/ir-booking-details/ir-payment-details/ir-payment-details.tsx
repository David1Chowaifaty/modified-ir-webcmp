import { Component, h, Prop, State, Event, EventEmitter, Listen } from '@stencil/core';
import { Booking, IPayment } from '@/models/booking.dto';
import { BookingService } from '@/services/booking.service';
import { PaymentService, IPaymentAction } from '@/services/payment.service';
import locales from '@/stores/locales.store';
import { IToast } from '@/components/ui/ir-toast/toast';
import { PaymentSidebarEvent } from '../types';
import { IEntries } from '@/models/IBooking';
import moment from 'moment';
@Component({
  styleUrl: 'ir-payment-details.css',
  tag: 'ir-payment-details',
  scoped: true,
})
export class IrPaymentDetails {
  @Prop({ mutable: true }) bookingDetails: Booking;
  @Prop() paymentActions: IPaymentAction[];
  @Prop() paymentTypes: IEntries[];

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
    console.log({ value });
    this.openSidebar.emit({
      type: 'payment-folio',
      payload: { ...value, date: value.due_on, id: -1, amount: value.amount },
    });
  }

  private handleAddPayment = () => {
    this.openSidebar.emit({
      type: 'payment-folio',
      payload: {
        id: -1,
        date: moment().format('YYYY-MM-DD'),
        amount: null,
        currency: undefined,
        designation: null,
        reference: null,
      },
    });
  };

  private handleEditPayment = (payment: IPayment) => {
    console.log(payment);
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

    return [
      <div class="card p-1">
        <ir-payment-summary totalCost={financial.gross_cost} balance={financial.due_amount} collected={this.bookingDetails.financial.collected} currency={currency} />
        <ir-booking-guarantee booking={this.bookingDetails} bookingService={this.bookingService} />
        {this.shouldShowPaymentActions() && <ir-payment-actions paymentAction={this.paymentActions} booking={this.bookingDetails} />}
      </div>,
      <ir-payments-folio
        paymentTypes={this.paymentTypes}
        payments={financial.payments || []}
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

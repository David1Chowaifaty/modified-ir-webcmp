import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';
import { IPayment } from '@/models/booking.dto';
import { IEntries } from '@/models/IBooking';
@Component({
  styleUrl: 'ir-payments-folio.css',
  tag: 'ir-payments-folio',
  scoped: true,
})
export class IrPaymentsFolio {
  @Prop() payments: IPayment[] = [];
  @Prop() paymentTypes: IEntries[];

  @Event({ bubbles: true }) addPayment: EventEmitter<void>;
  @Event({ bubbles: true }) editPayment: EventEmitter<IPayment>;
  @Event({ bubbles: true }) deletePayment: EventEmitter<IPayment>;

  private handleAddPayment = () => {
    this.addPayment.emit();
  };

  private handleEditPayment = (payment: IPayment) => {
    this.editPayment.emit(payment);
  };

  private handleDeletePayment = (payment: IPayment) => {
    this.deletePayment.emit(payment);
  };

  private hasPayments(): boolean {
    return this.payments && this.payments.length > 0;
  }

  private renderPaymentItem(payment: IPayment, index: number) {
    return [
      <ir-payment-item key={payment.id} payment={payment} onDeletePayment={e => this.handleDeletePayment(e.detail)} onEditPayment={e => this.handleEditPayment(e.detail)} />,
      index < this.payments.length - 1 && <hr class="p-0 m-0" />,
    ];
  }

  private renderEmptyState() {
    return (
      <div class="text-center p-3">
        <p class="text-muted">No payments recorded yet</p>
      </div>
    );
  }

  render() {
    return (
      <div class="mt-1">
        <div class="d-flex flex-column rounded payment-container">
          <div class="d-flex align-items-center justify-content-between">
            <p class="font-size-large p-0 m-0">Payment folio</p>
            <ir-button id="add-payment" variant="icon" icon_name="square_plus" style={{ '--icon-size': '1.5rem' }} onClickHandler={this.handleAddPayment} />
          </div>

          <div class="mt-1 card p-1 payments-container">
            {this.hasPayments() ? this.payments.map((payment, index) => this.renderPaymentItem(payment, index)) : this.renderEmptyState()}
          </div>
        </div>
      </div>
    );
  }
}

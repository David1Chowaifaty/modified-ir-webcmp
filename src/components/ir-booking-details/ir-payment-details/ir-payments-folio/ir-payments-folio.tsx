import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';
import { IPayment } from '@/models/booking.dto';
import { HelpDocButton } from '@/components/HelpButton';

@Component({
  styleUrl: 'ir-payments-folio.css',
  tag: 'ir-payments-folio',
  scoped: true,
})
export class IrPaymentsFolio {
  @Prop() payments: IPayment[] = [];

  @Event({ bubbles: true }) addPayment: EventEmitter<void>;
  @Event({ bubbles: true }) editPayment: EventEmitter<IPayment>;
  @Event({ bubbles: true }) deletePayment: EventEmitter<IPayment>;
  @Event({ bubbles: true }) issueReceipt: EventEmitter<IPayment>;

  private handleAddPayment = () => {
    this.addPayment.emit();
  };

  private handleEditPayment = (payment: IPayment) => {
    this.editPayment.emit(payment);
  };

  private handleDeletePayment = (payment: IPayment) => {
    this.deletePayment.emit(payment);
  };

  private handleIssueReceipt(payment: IPayment) {
    this.issueReceipt.emit(payment);
  }

  private hasPayments(): boolean {
    return this.payments && this.payments.length > 0;
  }

  private renderPaymentItem(payment: IPayment, index: number) {
    return [
      <ir-payment-item
        key={payment.id}
        payment={payment}
        onDeletePayment={e => {
          e.stopImmediatePropagation();
          e.stopPropagation();
          this.handleDeletePayment(e.detail);
        }}
        onEditPayment={e => {
          e.stopImmediatePropagation();
          e.stopPropagation();
          this.handleEditPayment(e.detail);
        }}
        onIssueReceipt={e => {
          e.stopImmediatePropagation();
          e.stopPropagation();
          this.handleIssueReceipt(e.detail);
        }}
      />,
      index < this.payments.length - 1 && <wa-divider class="payment-divider"></wa-divider>,
    ];
  }

  private renderEmptyState() {
    return <ir-empty-state></ir-empty-state>;
  }

  render() {
    return (
      <wa-card class=" payments-container">
        <div slot="header" class={'d-flex align-items-center'} style={{ gap: '0.5rem' }}>
          <p class="font-size-large p-0 m-0">Guest Folio</p>
          <HelpDocButton message="Help" href="https://help.igloorooms.com/extranet/booking-details/guest-folio" />
        </div>
        <wa-tooltip for="create-payment">Add Payment</wa-tooltip>
        <ir-custom-button slot="header-actions" id="create-payment" size="small" variant="neutral" appearance="plain" onClickHandler={this.handleAddPayment}>
          <wa-icon name="plus" style={{ fontSize: '1rem' }}></wa-icon>
        </ir-custom-button>

        {this.hasPayments() ? this.payments.map((payment, index) => this.renderPaymentItem(payment, index)) : this.renderEmptyState()}
      </wa-card>
    );
  }
}

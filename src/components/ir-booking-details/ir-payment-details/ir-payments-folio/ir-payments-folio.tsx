import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';
import { IPayment } from '@/models/booking.dto';

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
      />,
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
            <div class={'d-flex align-items-center'} style={{ gap: '0.5rem' }}>
              <p class="font-size-large p-0 m-0">Guest Folio</p>
              <style>
                {`.documentation-btn{
                    display:flex;
                    align-items:center;
                    justify-content-center;
                    height:1rem;
                    width:1rem;
                    border:1px solid #6b6f82;
                    color:#6b6f82;
                    padding:0.1rem;
                    border-radius:0.5rem;
                    background:transparent;
                  }
                  .documentation-btn:hover{
                    border-color:#104064;
                    background:transparent;
                    color:#104064 !important;
                  }
                `}
              </style>
              <ir-tooltip customSlot message="Help">
                <a slot="tooltip-trigger" class="documentation-btn" target="_blank" href="https://help.igloorooms.com/extranet/booking-details/guest-folio">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path
                      fill="currentColor"
                      d="M224 224C224 171 267 128 320 128C373 128 416 171 416 224C416 266.7 388.1 302.9 349.5 315.4C321.1 324.6 288 350.7 288 392L288 416C288 433.7 302.3 448 320 448C337.7 448 352 433.7 352 416L352 392C352 390.3 352.6 387.9 355.5 384.7C358.5 381.4 363.4 378.2 369.2 376.3C433.5 355.6 480 295.3 480 224C480 135.6 408.4 64 320 64C231.6 64 160 135.6 160 224C160 241.7 174.3 256 192 256C209.7 256 224 241.7 224 224zM320 576C342.1 576 360 558.1 360 536C360 513.9 342.1 496 320 496C297.9 496 280 513.9 280 536C280 558.1 297.9 576 320 576z"
                    />
                  </svg>
                </a>
              </ir-tooltip>
            </div>
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

import { Component, Host, Prop, h } from '@stencil/core';
import { IPaymentAction } from '@/services/payment.service';
import { Booking } from '@/models/booking.dto';

@Component({
  tag: 'ir-payment-actions',
  styleUrl: 'ir-payment-actions.css',
  scoped: true,
})
export class IrPaymentActions {
  @Prop() booking: Booking;
  @Prop() paymentAction: IPaymentAction[];

  render() {
    if (this.paymentAction?.filter(pa => pa.amount !== 0).length == 0) {
      return null;
    }
    return (
      <Host>
        <div class={'my-1 d-flex align-items-center'} style={{ gap: '0.5rem' }}>
          <p class={'font-size-large p-0 m-0 '}>Payment Actions</p>
          <span class="beta">Beta</span>
        </div>
        <div class="payment-actions-container">
          {([...this.paymentAction, { ...this.paymentAction[0], type: 'future' }] as any)?.map((pa, index) => (
            <ir-payment-action key={pa.due_on + index} paymentAction={pa}></ir-payment-action>
          ))}
        </div>
      </Host>
    );
  }
}

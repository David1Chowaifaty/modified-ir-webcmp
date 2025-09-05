import { colorVariants } from '@/components/ui/ir-icons/icons';
import { Component, Event, EventEmitter, Prop, h } from '@stencil/core';
import { IPayment } from '@/models/booking.dto';
import { formatAmount } from '@/utils/utils';

@Component({
  tag: 'ir-payment-item',
  styleUrl: 'ir-payment-item.css',
  shadow: true,
})
export class IrPaymentItem {
  @Prop() payment: IPayment;

  @Event() editPayment: EventEmitter<IPayment>;
  @Event() deletePayment: EventEmitter<IPayment>;

  render() {
    const isCredit = this.payment.payment_type.operation === 'CR';
    return (
      <div class="payment-item" part="base">
        <div class="payment-body" part="payment-body">
          <div class="payment-fields" part="payment-fields">
            <p class="text-muted">{this.payment.date}</p>
            <p>
              <b>{this.payment.payment_type.description ?? this.payment.designation}</b>
            </p>
          </div>
          {this.payment.reference && <p class="payment-reference text-muted">{this.payment?.reference}</p>}
        </div>

        <div class="payment-toolbar" part="payment-toolbar">
          <p class={`payment-amount ${isCredit ? 'is-credit' : 'is-debit'}`}>
            {formatAmount(this.payment.currency.symbol, this.payment.payment_type.code === '012' ? this.payment.amount * -1 : this.payment.amount)}
          </p>
          <div class="payment-actions">
            <ir-button
              class="action-button"
              variant="icon"
              onClickHandler={() => {
                this.editPayment.emit(this.payment);
              }}
              icon_name="edit"
              style={colorVariants.secondary}
            ></ir-button>
            <ir-button
              class="action-button"
              onClickHandler={() => {
                this.deletePayment.emit(this.payment);
              }}
              variant="icon"
              style={colorVariants.danger}
              icon_name="trash"
            ></ir-button>
          </div>
        </div>
      </div>
    );
  }
}

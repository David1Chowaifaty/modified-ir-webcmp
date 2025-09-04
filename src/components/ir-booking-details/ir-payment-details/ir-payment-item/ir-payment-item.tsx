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
        <div class="payment-content" part="payment-content">
          <div class="payment-body" part="payment-body">
            <div class="payment-fields" part="payment-fields">
              <p class="payment-date">{this.payment.date}</p>
              <p class="payment-description">{this.payment.payment_type.description ?? this.payment.designation}</p>
            </div>
            {this.payment.reference && (
              <p class="payment-reference" title={this.payment.reference}>
                {this.payment.reference}
              </p>
            )}
          </div>

          <div class="payment-amount-section" part="payment-amount-section">
            <p class={`payment-amount ${isCredit ? 'is-credit' : 'is-debit'}`}>
              {formatAmount(this.payment.currency.symbol, this.payment.payment_type.code === '012' ? this.payment.amount * -1 : this.payment.amount)}
            </p>
            <div class="payment-actions" part="payment-actions">
              <ir-button
                class="action-button"
                variant="icon"
                onClickHandler={() => {
                  this.editPayment.emit(this.payment);
                }}
                icon_name="edit"
                style={colorVariants.secondary}
                size="sm"
              ></ir-button>
              <ir-button
                class="action-button"
                onClickHandler={() => {
                  this.deletePayment.emit(this.payment);
                }}
                variant="icon"
                style={colorVariants.danger}
                icon_name="trash"
                size="sm"
              ></ir-button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

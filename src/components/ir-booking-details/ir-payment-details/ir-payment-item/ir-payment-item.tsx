import { colorVariants } from '@/components/ui/ir-icons/icons';
import { Component, Event, EventEmitter, Prop, h } from '@stencil/core';
import { IPayment } from '@/models/booking.dto';
import { formatAmount } from '@/utils/utils';
import { PAYMENT_TYPES_WITH_METHOD } from '../global.variables';
import moment from 'moment';

@Component({
  tag: 'ir-payment-item',
  styleUrl: 'ir-payment-item.css',
  scoped: true,
})
export class IrPaymentItem {
  @Prop() payment: IPayment;

  @Event() editPayment: EventEmitter<IPayment>;
  @Event() deletePayment: EventEmitter<IPayment>;

  render() {
    const isCredit = this.payment.payment_type.operation === 'CR';

    const paymentDescription =
      (PAYMENT_TYPES_WITH_METHOD.includes(this.payment.payment_type?.code)
        ? `${this.payment.payment_type?.description}: ${this.payment.payment_method.description}`
        : this.payment.payment_type.description) ?? this.payment.designation;
    return (
      <div class="payment-item__payment-item">
        <div class="payment-item__payment-body" part="payment-body">
          <div class="payment-item__payment-fields" part="payment-fields">
            <div class="d-flex align-items-center" style={{ gap: '0.5rem' }}>
              <ir-popover trigger="hover" content={`User: ${this.payment.time_stamp.user}`}>
                <ir-icons name="user" style={{ '--icon-size': '0.875rem' }}></ir-icons>
              </ir-popover>
              <p class="payment-item__payment-date">{moment(this.payment.date, 'YYYY-MM-DD').format('MMM DD, YYYY')}</p>
            </div>
            <p class={`payment-item__payment-amount ${isCredit ? 'is-credit' : 'is-debit'}`}>{formatAmount(this.payment.currency.symbol, this.payment.amount)}</p>
            <p class="payment-item__payment-description">{paymentDescription}</p>
          </div>
          {this.payment.reference && <p class="payment-item__payment-reference">{this.payment?.reference}</p>}
        </div>
        <div class="payment-item__payment-toolbar">
          <p class={`payment-item__payment-amount ${isCredit ? 'is-credit' : 'is-debit'}`}>{formatAmount(this.payment.currency.symbol, this.payment.amount)}</p>
          <p class="payment-item__payment-description">{paymentDescription}</p>
          <div class="payment-item__payment-actions">
            <ir-button
              class="payment-item__action-button"
              variant="icon"
              onClickHandler={() => {
                this.editPayment.emit(this.payment);
              }}
              icon_name="edit"
              style={colorVariants.secondary}
            ></ir-button>
            <ir-button
              class="payment-item__action-button"
              onClickHandler={() => {
                this.deletePayment.emit(this.payment);
              }}
              variant="icon"
              style={colorVariants.danger}
              icon_name="trash"
            ></ir-button>
          </div>
        </div>

        {this.payment.reference && <p class="payment-item__payment-reference">{this.payment?.reference}</p>}
      </div>
    );
  }
}

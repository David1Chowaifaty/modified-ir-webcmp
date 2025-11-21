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
  @Event() issueReceipt: EventEmitter<IPayment>;

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
            <p class="payment-item__payment-date">{moment(this.payment.date, 'YYYY-MM-DD').format('MMM DD, YYYY')}</p>
            <p class={`payment-item__payment-amount ${isCredit ? 'is-credit' : 'is-debit'}`}>{formatAmount(this.payment.currency.symbol, this.payment.amount)}</p>
            <p class="payment-item__payment-description">{paymentDescription}</p>
          </div>
          {this.payment.reference && <p class="payment-item__payment-reference">{this.payment?.reference}</p>}
        </div>
        <div class="payment-item__payment-toolbar">
          <p class={`payment-item__payment-amount ${isCredit ? 'is-credit' : 'is-debit'}`}>{formatAmount(this.payment.currency.symbol, this.payment.amount)}</p>
          <p class="payment-item__payment-description">{paymentDescription}</p>
          <div class="payment-item__payment-actions">
            <div class="d-flex align-items-center">
              <ir-popover trigger="hover" content={`User: ${this.payment.time_stamp.user}`}>
                <ir-button variant="icon" style={{ 'color': colorVariants.secondary['--icon-button-color'], '--icon-size': '1.1rem' }} icon_name="user"></ir-button>
                {/* <ir-icons name="user" style={{ '--icon-size': '1rem', 'color': colorVariants.secondary['--icon-button-color'] }}></ir-icons> */}
              </ir-popover>
            </div>
            <wa-dropdown
              onwa-select={e => {
                switch ((e.detail as any).item.value) {
                  case 'edit':
                    this.editPayment.emit(this.payment);
                    break;
                  case 'delete':
                    this.deletePayment.emit(this.payment);
                    break;
                  case 'receipt':
                    this.issueReceipt.emit(this.payment);
                    break;
                }
              }}
            >
              <ir-custom-button slot="trigger" appearance="plain">
                <wa-icon name="ellipsis-vertical"></wa-icon>
              </ir-custom-button>

              {this.payment.payment_type.code === '001' && (
                <wa-dropdown-item value="receipt">
                  <wa-icon name="receipt" slot="icon"></wa-icon>
                  Print Receipt
                </wa-dropdown-item>
              )}
              <wa-dropdown-item value="edit">
                <wa-icon slot="icon" name="edit"></wa-icon>
                Edit
              </wa-dropdown-item>
              <wa-dropdown-item value="delete" variant="danger">
                <wa-icon slot="icon" name="trash"></wa-icon>
                Delete
              </wa-dropdown-item>
            </wa-dropdown>
          </div>
        </div>

        {this.payment.reference && <p class="payment-item__payment-reference">{this.payment?.reference}</p>}
      </div>
    );
  }
}

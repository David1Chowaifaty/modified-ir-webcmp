import { Component, Host, Prop, h } from '@stencil/core';
import { FolioPayment, GroupedFolioPayment } from '../types';
import { formatAmount } from '@/utils/utils';
import calendar_data from '@/stores/calendar-data';
import { PaymentEntries } from '@/components/ir-booking-details/types';

@Component({
  tag: 'ir-revenue-summary',
  styleUrl: 'ir-revenue-summary.css',
  scoped: true,
})
export class IrRevenueSummary {
  @Prop() groupedPayments: GroupedFolioPayment = new Map();
  @Prop() previousDateGroupedPayments: GroupedFolioPayment = new Map();
  @Prop() paymentEntries: PaymentEntries;

  private calculateTotalPayments(groupedPayments: GroupedFolioPayment) {
    let total = 0;
    groupedPayments.forEach((value, key) => {
      if (key.split('_')[0] === '001') {
        total += this.calculateTotalValue(value);
      }
    });
    return total;
  }

  // private calculateTotalAmount(groupedPayments: GroupedFolioPayment) {
  //   return Array.from(groupedPayments.entries()).reduce((prev, curr) => prev + this.calculateTotalValue(curr[1]), 0);
  // }

  private calculateTotalRefunds(groupedPayments: GroupedFolioPayment) {
    const refundKeyCode = '010';
    const payments: any = [];
    groupedPayments.forEach((value, key) => {
      if (key.split('_')[0] === refundKeyCode) {
        payments.push(...value);
      }
    });

    return this.calculateTotalValue(payments);
  }

  private calculateTotalValue(payments: FolioPayment[]) {
    return payments.reduce((p, c) => p + c.amount, 0);
  }

  private getTrendIcon(val1: number, val2: number) {
    if (val1 === val2) {
      return undefined;
    }
    return val1 > val2 ? 'arrow-trend-up' : 'arrow-trend-down';
  }
  render() {
    const paymentsTotal = this.calculateTotalPayments(this.groupedPayments);
    const refundAmount = this.calculateTotalRefunds(this.groupedPayments);
    const totalAmount = paymentsTotal - refundAmount;

    const previousDatePaymentsTotal = this.calculateTotalPayments(this.previousDateGroupedPayments);
    const previousDateRefundAmount = this.calculateTotalRefunds(this.previousDateGroupedPayments);
    const previousDateTotalAmount = previousDatePaymentsTotal - previousDateRefundAmount;

    return (
      <Host>
        <div class="ir-revenue-summary__mobile">
          <ir-stats-card icon={'arrow-trend-up'} value={formatAmount(calendar_data.currency.symbol, paymentsTotal)} cardTitle="Payments">
            <p class="stats-card__payments-value" slot="value">
              {formatAmount(calendar_data.currency.symbol, paymentsTotal)}
            </p>
          </ir-stats-card>
          <ir-stats-card value="123$" class="refunds-card" icon={'arrow-trend-down'} cardTitle="Refunds">
            <p class="stats-card__refund-value" slot="value">
              {formatAmount(calendar_data.currency.symbol, refundAmount)}
            </p>
          </ir-stats-card>
        </div>
        <div class="ir-revenue-summary__tablet">
          <ir-stats-card
            icon={'arrow-trend-up'}
            value={formatAmount(calendar_data.currency.symbol, paymentsTotal)}
            cardTitle="Payments"
            subtitle={`Previous day  ${formatAmount(calendar_data.currency.symbol, previousDatePaymentsTotal)}`}
          >
            <p class="stats-card__payments-value" slot="value">
              {formatAmount(calendar_data.currency.symbol, paymentsTotal)}
            </p>
          </ir-stats-card>
          <ir-stats-card
            value="123$"
            class="refunds-card"
            icon={'arrow-trend-down'}
            cardTitle="Refunds"
            subtitle={`Previous day  ${formatAmount(calendar_data.currency.symbol, previousDateRefundAmount)}`}
          >
            <p class="stats-card__refund-value" slot="value">
              {formatAmount(calendar_data.currency.symbol, refundAmount)}
            </p>
          </ir-stats-card>
          <ir-stats-card
            icon={this.getTrendIcon(totalAmount, previousDateTotalAmount)}
            value={formatAmount(calendar_data.currency.symbol, totalAmount)}
            cardTitle="Difference"
            subtitle={`Previous day  ${formatAmount(calendar_data.currency.symbol, previousDateTotalAmount)}`}
          ></ir-stats-card>
        </div>
      </Host>
    );
  }
}

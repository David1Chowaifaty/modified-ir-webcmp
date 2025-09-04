import { IEntries } from '@/models/IBooking';
import { Component, Host, Prop, h } from '@stencil/core';
import { FolioPayment, GroupedFolioPayment } from '../types';
import { formatAmount } from '@/utils/utils';
import calendar_data from '@/stores/calendar-data';

@Component({
  tag: 'ir-revenue-summary',
  styleUrl: 'ir-revenue-summary.css',
  scoped: true,
})
export class IrRevenueSummary {
  @Prop() groupedPayments: GroupedFolioPayment = new Map();
  @Prop() previousDateGroupedPayments: GroupedFolioPayment = new Map();
  @Prop() payTypesGroup: IEntries[];

  private calculateTotalPayments(groupedPayments: GroupedFolioPayment) {
    let total = 0;
    groupedPayments.forEach((value, key) => {
      if (this.payTypesGroup.find(p => p.CODE_NAME === key)) {
        total += this.calculateTotalValue(value);
      }
    });
    return total;
  }

  private calculateTotalAmount(groupedPayments: GroupedFolioPayment) {
    return Array.from(groupedPayments.entries()).reduce((prev, curr) => prev + this.calculateTotalValue(curr[1]), 0);
  }

  private calculateTotalRefunds(groupedPayments: GroupedFolioPayment) {
    const refundKeyCode = '010';
    if (!groupedPayments.has(refundKeyCode)) {
      return 0;
    }
    return this.calculateTotalValue(groupedPayments.get(refundKeyCode));
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
    const totalAmount = this.calculateTotalAmount(this.groupedPayments);
    const refundAmount = this.calculateTotalRefunds(this.groupedPayments);

    const previousDatePaymentsTotal = this.calculateTotalPayments(this.previousDateGroupedPayments);
    const previousDateTotalAmount = this.calculateTotalAmount(this.previousDateGroupedPayments);
    const previousDateRefundAmount = this.calculateTotalRefunds(this.previousDateGroupedPayments);

    return (
      <Host>
        <ir-stats-card
          icon={this.getTrendIcon(paymentsTotal, previousDatePaymentsTotal)}
          value={formatAmount(calendar_data.currency.symbol, paymentsTotal)}
          cardTitle="Payments"
          subtitle={`Previous day payments ${formatAmount(calendar_data.currency.symbol, previousDatePaymentsTotal)}`}
        ></ir-stats-card>
        <ir-stats-card
          value="123$"
          class="refunds-card"
          icon={this.getTrendIcon(refundAmount, previousDateRefundAmount)}
          cardTitle="Refunds"
          subtitle={`Previous day refunds ${formatAmount(calendar_data.currency.symbol, previousDateRefundAmount)}`}
        >
          <p class="p-0 m-0 text-danger" slot="value">
            {formatAmount(calendar_data.currency.symbol, refundAmount)}
          </p>
        </ir-stats-card>
        <ir-stats-card
          icon={this.getTrendIcon(totalAmount, previousDateTotalAmount)}
          value={formatAmount(calendar_data.currency.symbol, totalAmount)}
          cardTitle="Total"
          subtitle={`Previous day total ${formatAmount(calendar_data.currency.symbol, previousDateTotalAmount)}`}
        ></ir-stats-card>
      </Host>
    );
  }
}

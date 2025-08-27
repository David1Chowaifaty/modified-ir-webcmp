import { Currency } from '@/models/property';
import locales from '@/stores/locales.store';
import { formatAmount } from '@/utils/utils';
import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-payment-summary',
  styleUrl: 'ir-payment-summary.css',
  scoped: true,
})
export class IrPaymentSummary {
  @Prop() totalCost: number;
  @Prop() balance: number;
  @Prop() collected: number;
  @Prop() currency: Currency;

  private shouldShowTotalCost(): boolean {
    return this.totalCost > 0 && this.totalCost !== null;
  }

  render() {
    return (
      <div class=" m-0">
        {this.shouldShowTotalCost() && (
          <div class="mb-2 h4 total-cost-container">
            {locales.entries.Lcz_TotalCost}:<span>{formatAmount(this.currency.symbol, this.totalCost)}</span>
          </div>
        )}

        <div class="h4 d-flex align-items-center justify-content-between">
          <span>{locales.entries.Lcz_Balance}: </span>
          <span class="danger font-weight-bold">{formatAmount(this.currency.symbol, this.balance)}</span>
        </div>

        <div class="mb-2 h4 d-flex align-items-center justify-content-between">
          <span>{locales.entries.Lcz_Collected}: </span>
          <span>{formatAmount(this.currency.symbol, this.collected)}</span>
        </div>
      </div>
    );
  }
}

import { formatAmount } from '@/utils/utils';
import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-balance-cell',
  styleUrl: 'ir-balance-cell.css',
  scoped: true,
})
export class IrBalanceCell {
  @Prop() amount: number;
  render() {
    return (
      <Host>
        <p class="ir-price">{formatAmount('$US', this.amount)}</p>
      </Host>
    );
  }
}

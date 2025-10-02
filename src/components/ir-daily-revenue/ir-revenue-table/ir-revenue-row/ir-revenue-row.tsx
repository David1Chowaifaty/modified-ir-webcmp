import { Component, Host, Prop, h, Element } from '@stencil/core';
import { FolioPayment } from '../../types';
import { formatAmount } from '@/utils/utils';
import calendar_data from '@/stores/calendar-data';

let accId = 0;

@Component({
  tag: 'ir-revenue-row',
  styleUrl: 'ir-revenue-row.css',
  scoped: true,
})
export class IrRevenueRow {
  @Element() host!: HTMLElement;

  /** Array of payments for this method group */
  @Prop() payments: FolioPayment[] = [];

  /** Group display name (e.g., "Credit Card") */
  @Prop() groupName!: string;

  private contentId = `ir-rr-content-${++accId}`;

  render() {
    const total = this.payments.reduce((prev, curr) => prev + curr.amount, 0);
    return (
      <Host>
        <ir-accordion class="ir-revenue-row__accordion">
          <div slot="trigger" class="ir-revenue-row__title">
            <div class="ir-revenue-row__header-left">
              <p class="ir-revenue-row__group">
                {this.groupName}{' '}
                <span class="ir-revenue-row__badge" aria-label={`${this.payments.length} transactions`}>
                  {this.payments.length}
                </span>
              </p>
            </div>
            <p class="ir-revenue-row__total">{formatAmount(calendar_data.property.currency.symbol, total)}</p>
          </div>
          <div class="ir-revenue-row__details" id={this.contentId}>
            <div class="ir-revenue-row__details-inner">
              {this.payments.map(payment => (
                <ir-revenue-row-details class="ir-revenue-row__detail" id={payment.id} payment={payment} key={payment.id}></ir-revenue-row-details>
              ))}
            </div>
          </div>
        </ir-accordion>
      </Host>
    );
  }
}

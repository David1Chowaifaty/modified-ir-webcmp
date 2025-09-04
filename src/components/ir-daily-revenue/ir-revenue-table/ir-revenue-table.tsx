import { Component, Fragment, h, Prop } from '@stencil/core';
import { DailyPaymentFilter, GroupedFolioPayment } from '../types';
import { IEntries } from '@/models/IBooking';

@Component({
  tag: 'ir-revenue-table',
  styleUrl: 'ir-revenue-table.css',
  scoped: true,
})
export class IrRevenueTable {
  @Prop() payments: GroupedFolioPayment = new Map();
  @Prop() payTypes: IEntries[];
  @Prop() filters: DailyPaymentFilter;

  private payTypesObj: {};

  componentWillLoad() {
    let pt = {};
    this.payTypes.forEach(p => {
      pt = { ...pt, [p.CODE_NAME]: p.CODE_VALUE_EN };
    });
    this.payTypesObj = pt;
  }

  render() {
    return (
      <div class="card p-1 revenue-table__table">
        {this.payments.size > 0 ? (
          <Fragment>
            <div class="revenue-table__header">
              <p>Method</p>
              <p>Amount</p>
            </div>
            {Array.from(this.payments.entries()).map(([key, p]) => {
              return <ir-revenue-row key={key} payments={p} groupName={this.payTypesObj[key]}></ir-revenue-row>;
            })}
          </Fragment>
        ) : (
          <p class="text-center my-auto mx-auto">There are no payment transactions recorded for the selected date.</p>
        )}
      </div>
    );
  }
}

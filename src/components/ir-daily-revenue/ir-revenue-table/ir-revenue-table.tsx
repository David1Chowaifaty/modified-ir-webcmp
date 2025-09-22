import { Component, Fragment, h, Prop } from '@stencil/core';
import { DailyPaymentFilter, GroupedFolioPayment } from '../types';
import { PaymentEntries } from '@/components/ir-booking-details/types';
import { PAYMENT_TYPES_WITH_METHOD } from '@/components/ir-booking-details/ir-payment-details/global.variables';

@Component({
  tag: 'ir-revenue-table',
  styleUrl: 'ir-revenue-table.css',
  scoped: true,
})
export class IrRevenueTable {
  @Prop() payments: GroupedFolioPayment = new Map();
  @Prop() paymentEntries: PaymentEntries;
  @Prop() filters: DailyPaymentFilter;

  private payTypesObj: {};
  private payMethodObj: {};

  componentWillLoad() {
    const buildPaymentLookup = (key: keyof PaymentEntries) => {
      let pt = {};
      this.paymentEntries[key].forEach(p => {
        pt = { ...pt, [p.CODE_NAME]: p.CODE_VALUE_EN };
      });
      return pt;
    };

    this.payTypesObj = buildPaymentLookup('types');
    this.payMethodObj = buildPaymentLookup('methods');
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
              const [paymentType, paymentMethod] = key.split('_');
              const groupName = PAYMENT_TYPES_WITH_METHOD.includes(paymentType)
                ? `${this.payTypesObj[paymentType]}: ${this.payMethodObj[paymentMethod]}`
                : this.payTypesObj[paymentType];
              return <ir-revenue-row key={key} payments={p} groupName={groupName}></ir-revenue-row>;
            })}
          </Fragment>
        ) : (
          <p class="text-center my-auto mx-auto">There are no payment transactions recorded for the selected date.</p>
        )}
      </div>
    );
  }
}

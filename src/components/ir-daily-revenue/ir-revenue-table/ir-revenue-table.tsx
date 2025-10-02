import { Component, Fragment, h, Prop } from '@stencil/core';
import { DailyPaymentFilter, FolioPayment, GroupedFolioPayment } from '../types';
import { PaymentEntries } from '@/components/ir-booking-details/types';
import { PAYMENT_TYPES_WITH_METHOD } from '@/components/ir-booking-details/ir-payment-details/global.variables';
import { formatAmount } from '@/utils/utils';
import calendar_data from '@/stores/calendar-data';

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
  private groupType: 'method' | 'type' = 'method';

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

  /**
   * Groups payments by method, then by type.
   * - Never throws on bad input (null/undefined, non-Map, malformed keys, non-array values).
   * - Keys are parsed defensively; unknown parts fall back to "UNKNOWN".
   */
  private regroupPaymentsByMethod(): Map<string, Map<string, FolioPayment[]>> {
    const result = new Map<string, Map<string, FolioPayment[]>>();

    // Early return on empty/invalid source
    const src = this.payments;
    if (!(src instanceof Map) || src.size === 0) return result;

    // Helper: parse "TYPE_METHOD" into [type, method] safely
    const parseKey = (key: unknown): [string, string] => {
      if (typeof key !== 'string') return ['UNKNOWN', 'UNKNOWN'];
      // Allow extra underscores on the method side: TYPE_METHOD_WITH_UNDERSCORES
      const [type, ...rest] = key.split('_');
      const method = rest.join('_');
      const safeType = (type && type.trim()) || 'UNKNOWN';
      const safeMethod = (method && method.trim()) || 'UNKNOWN';
      return [safeType, safeMethod];
    };

    for (const [rawKey, rawList] of src.entries()) {
      const [paymentType, paymentMethod] = parseKey(rawKey);

      // Normalize value to a clean array of FolioPayment
      const list: FolioPayment[] = Array.isArray(rawList) ? (rawList.filter(Boolean) as FolioPayment[]) : [];

      // Skip silently if nothing to add
      if (list.length === 0) {
        // Still ensure the buckets exist so consumers can rely on them if needed
        if (!result.has(paymentMethod)) result.set(paymentMethod, new Map());
        if (!result.get(paymentMethod)!.has(paymentType)) {
          result.get(paymentMethod)!.set(paymentType, []);
        }
        continue;
      }

      const typeMap = result.get(paymentMethod) ?? new Map<string, FolioPayment[]>();
      const existing = typeMap.get(paymentType) ?? [];
      typeMap.set(paymentType, existing.concat(list));
      result.set(paymentMethod, typeMap);
    }

    return result;
  }

  render() {
    const hasPayments = this.payments instanceof Map && this.payments.size > 0;

    return (
      <div class="card p-1 revenue-table__table">
        {hasPayments ? (
          <Fragment>
            <div class="revenue-table__header">
              <p>Method</p>
              <p>Amount</p>
            </div>
            {this.groupType === 'type' &&
              Array.from((this.payments as Map<string, FolioPayment[]>).entries()).map(([key, list]) => {
                const [paymentType, paymentMethod] = key.split('_');
                const groupName = PAYMENT_TYPES_WITH_METHOD.includes(paymentType)
                  ? `${this.payTypesObj[paymentType] ?? paymentType}: ${this.payMethodObj[paymentMethod] ?? paymentMethod}`
                  : this.payTypesObj[paymentType] ?? paymentType;

                return <ir-revenue-row key={key} payments={list} groupName={groupName}></ir-revenue-row>;
              })}
            {this.groupType === 'method' &&
              Array.from(this.regroupPaymentsByMethod().entries()).flatMap(([methodKey, byType]) => {
                const total = Array.from(byType.entries()).reduce((prev, [_, list]) => prev + list.reduce((p, c) => p + c.amount, 0), 0);
                return (
                  <div key={`method_${methodKey}`}>
                    <div class="revenue-table__method_header">
                      <p>{this.payMethodObj[methodKey] ?? methodKey}</p>
                      <p>{formatAmount(calendar_data.property.currency.symbol, total)}</p>
                    </div>
                    {Array.from(byType.entries()).map(([typeKey, list]) => {
                      const groupName = PAYMENT_TYPES_WITH_METHOD.includes(typeKey) ? `${this.payTypesObj[typeKey] ?? typeKey}` : this.payTypesObj[typeKey] ?? typeKey;

                      return (
                        <div key={`type_${typeKey}`} class="px-1">
                          <ir-revenue-row payments={list} groupName={groupName}></ir-revenue-row>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
          </Fragment>
        ) : (
          <p class="text-center my-auto mx-auto">There are no payment transactions recorded for the selected date.</p>
        )}
      </div>
    );
  }
}

import { Component, h, Prop } from '@stencil/core';
import { SalesRecord } from '../types';
import { formatAmount } from '@/utils/utils';
import calendar_data from '@/stores/calendar-data';

export type NumericKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

@Component({
  tag: 'ir-sales-by-country-summary',
  styleUrl: 'ir-sales-by-country-summary.css',
  scoped: true,
})
export class IrSalesByCountrySummary {
  @Prop() salesReports: SalesRecord[];

  private calculateTotalValues(field: NumericKeys<SalesRecord>, lastYear: boolean = false) {
    return this.salesReports?.reduce((prev, curr) => {
      const value = lastYear ? (curr.last_year ? curr.last_year[field] : 0) : curr[field];
      return prev + value;
    }, 0);
  }

  private getIcon(val1: number, val2: number): 'arrow-trend-up' | 'arrow-trend-down' | undefined {
    if (this.salesReports?.length && this.salesReports[0].last_year) {
      return val1 > val2 ? 'arrow-trend-up' : 'arrow-trend-down';
    }
    return;
  }

  render() {
    const totalRoomNights = this.calculateTotalValues('nights');
    const totalGuests = this.calculateTotalValues('number_of_guests');
    const totalRevenue = this.calculateTotalValues('revenue');

    const lastYearTotalRoomNights = this.calculateTotalValues('nights', true);
    const lastYearTotalGuests = this.calculateTotalValues('number_of_guests', true);
    const lastYearTotalRevenue = this.calculateTotalValues('revenue', true);

    return (
      <div class="sales-by-country-summary__container">
        <ir-stats-card
          cardTitle="Total Room Nights"
          icon={this.getIcon(totalRoomNights, lastYearTotalRoomNights)}
          value={totalRoomNights.toString()}
          subtitle={lastYearTotalRoomNights ? `Last year ${lastYearTotalRoomNights}` : undefined}
        ></ir-stats-card>
        <ir-stats-card
          icon={this.getIcon(totalGuests, lastYearTotalGuests)}
          cardTitle="Total Guests"
          value={totalGuests.toString()}
          subtitle={lastYearTotalGuests ? `Last year ${lastYearTotalGuests}` : undefined}
        ></ir-stats-card>
        <ir-stats-card
          icon={this.getIcon(totalRevenue, lastYearTotalRevenue)}
          cardTitle="Total Revenue"
          value={formatAmount(calendar_data.property.currency.symbol, totalRevenue)}
          subtitle={lastYearTotalRevenue ? `Last year ${formatAmount(calendar_data.property.currency.symbol, lastYearTotalRevenue)}` : undefined}
        ></ir-stats-card>
      </div>
    );
  }
}

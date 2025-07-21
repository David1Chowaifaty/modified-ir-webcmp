import { Component, Prop, h, State } from '@stencil/core';
import { MappedCountries, SalesRecord } from '../types';
import { formatAmount } from '@/utils/utils';
import calendar_data from '@/stores/calendar-data';

@Component({
  tag: 'ir-sales-table',
  styleUrls: ['ir-sales-table.css', '../../../common/table.css'],
  scoped: true,
})
export class IrSalesTable {
  @Prop() records: SalesRecord[] = [];
  @Prop() mappedCountries: MappedCountries;
  @State() visibleCount: number = 10;

  private handleLoadMore = () => {
    this.visibleCount = Math.min(this.visibleCount + 10, this.records.length);
  };

  render() {
    const visibleRecords = this.records.slice(0, this.visibleCount);
    return (
      <div class="table-container h-100 p-1 m-0 table-responsive">
        <table class="table" data-testid="hk_tasks_table">
          <thead class="table-header">
            <tr>
              <th class="text-left">Country</th>
              <th class="text-center">Room nights</th>
              <th class="text-right">Revenue</th>
              <th class=""></th>
            </tr>
          </thead>

          <tbody>
            {this.records.length === 0 && (
              <tr>
                <td colSpan={4} style={{ height: '300px' }}>
                  No data found.
                </td>
              </tr>
            )}
            {visibleRecords.map(record => {
              const mainPercentage = `${parseFloat(record.percentage.toString()).toFixed(2)}%`;
              const secondaryPercentage = record.last_year ? `${parseFloat(record.last_year.percentage.toString()).toFixed(2)}%` : null;
              const mappedCountry = this.mappedCountries.get(record.country_id);

              return (
                <tr data-testid={`record_row`} class={{ 'task-table-row ir-table-row': true }} key={record.id}>
                  <td class="text-left">
                    <div class={'d-flex align-items-center'} style={{ gap: '0.5rem' }}>
                      {mappedCountry?.flag && <img class="flag" alt={mappedCountry.name} src={mappedCountry.flag} />}
                      <span>{mappedCountry?.name ?? record.country}</span>
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="d-flex flex-column" style={{ gap: '0.25rem' }}>
                      <p class={`p-0 m-0 ${record.last_year?.nights ? 'font-weight-bold' : ''}`}>{record.nights}</p>
                      {record.last_year?.nights && (
                        <p class="p-0 mx-0" style={{ marginTop: '0.25rem', marginBottom: '0' }}>
                          {record.last_year.nights}
                        </p>
                      )}
                    </div>
                  </td>
                  <td class="text-right">
                    <div class="d-flex flex-column" style={{ gap: '0.25rem' }}>
                      <p class={`p-0 m-0 ${record.last_year?.revenue ? 'font-weight-bold' : ''}`}>{formatAmount(calendar_data.currency.symbol, record.revenue)}</p>
                      {record.last_year?.revenue && (
                        <p class="p-0 mx-0" style={{ marginTop: '0.25rem', marginBottom: '0' }}>
                          {formatAmount(calendar_data.currency.symbol, record.last_year.revenue)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td>
                    <div class="d-flex flex-column" style={{ gap: '0.5rem' }}>
                      <div class="progress-main">
                        <span class="progress-totle">{mainPercentage}</span>
                        <div class="progress-line">
                          <div class="progress bg-primary mb-0" style={{ width: mainPercentage }}></div>
                        </div>
                      </div>
                      {record.last_year?.percentage && (
                        <div class="progress-main">
                          <span class="progress-totle">{secondaryPercentage}</span>
                          <div class="progress-line">
                            <div class="progress secondary mb-0" style={{ width: secondaryPercentage }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ fontSize: '12px' }}>
              <td colSpan={3}></td>
              <td style={{ width: '250px' }}>
                <div class={'d-flex align-items-center justify-content-end'} style={{ gap: '1rem', paddingTop: '0.5rem' }}>
                  {this.visibleCount < this.records.length && <ir-button size="sm" text="Load More" onClickHandler={this.handleLoadMore}></ir-button>}
                  <div class="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                    <div class="legend bg-primary"></div>
                    <p class="p-0 m-0">Selected period </p>
                  </div>
                  <div class="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                    <div class="legend secondary"></div>
                    <p class="p-0 m-0">Previous year</p>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  }
}

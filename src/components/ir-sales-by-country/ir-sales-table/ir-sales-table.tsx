import { Component, Prop, h } from '@stencil/core';
import { SalesRecord } from '../types';
const sampleSalesData: SalesRecord[] = [
  {
    id: '1',
    country: 'United States',
    nights: 120,
    percentage: 65.5,
    last_year_percentage: 60.2,
  },
  {
    id: '2',
    country: 'United Kingdom',
    nights: 90,
    percentage: 55.3,
    last_year_percentage: 50.1,
  },
  {
    id: '3',
    country: 'Germany',
    nights: 75,
    percentage: 48.7,
    last_year_percentage: 45.0,
  },
  {
    id: '4',
    country: 'France',
    nights: 60,
    percentage: 42.9,
    last_year_percentage: 39.5,
  },
  {
    id: '5',
    country: 'Australia',
    nights: 30,
    percentage: 21.0,
    last_year_percentage: 19.0,
  },
];
@Component({
  tag: 'ir-sales-table',
  styleUrls: ['ir-sales-table.css', '../../../common/table.css'],
  scoped: true,
})
export class IrSalesTable {
  @Prop() records: SalesRecord[] = sampleSalesData;
  render() {
    return (
      <div class="table-container h-100 p-1 m-0 table-responsive">
        <table class="table" data-testid="hk_tasks_table">
          <thead class="table-header">
            <tr>
              <th class="text-left">Country</th>
              <th class="">Room nights</th>
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
            {this.records.map(record => {
              const mainPercentage = `${parseFloat(Math.ceil(record.percentage).toString()).toFixed(2)}%`;
              const secondaryPercentage = record.last_year_percentage ? `${parseFloat(Math.ceil(record.last_year_percentage).toString()).toFixed(2)}%` : null;
              return (
                <tr data-testid={`record_row`} class={{ 'task-table-row ir-table-row': true }} key={record.id}>
                  <td class="text-left">{record.country}</td>
                  <td>{record.nights}</td>
                  <td>
                    <div class="d-flex flex-column" style={{ gap: '0.5rem' }}>
                      <div class="progress-main">
                        <span class="progress-totle">{mainPercentage}</span>
                        <div class="progress-line">
                          <div class="progress bg-primary mb-0" style={{ width: mainPercentage }}></div>
                        </div>
                      </div>
                      {record.last_year_percentage && (
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
              <td colSpan={2}></td>
              <td style={{ width: '250px' }}>
                <div class={'d-flex align-items-center justify-content-end'} style={{ gap: '1rem' }}>
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

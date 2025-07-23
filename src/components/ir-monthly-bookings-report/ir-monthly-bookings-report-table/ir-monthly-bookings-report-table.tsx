import { Component, Host, Prop, h } from '@stencil/core';
import { DailyReport } from '../types';
import moment from 'moment';

@Component({
  tag: 'ir-monthly-bookings-report-table',
  styleUrls: ['ir-monthly-bookings-report-table.css', '../../../common/table.css'],
  scoped: true,
})
export class IrMonthlyBookingsReportTable {
  @Prop() reports: DailyReport[] = [];
  render() {
    return (
      <Host class={'card p-1  table-container table-responsive'}>
        <table class="table">
          <thead class="table-header">
            <tr>
              <th>Date</th>
              <th>Rooms / Apartments</th>
            </tr>
          </thead>
          <tbody>
            {this.reports.map(report => {
              const reportDate = moment(report.date, 'YYYY-MM-DD');
              const isFutureDate = moment().isBefore(reportDate, 'dates');
              return (
                <tr key={report.date} class={`ir-table-row ${isFutureDate ? 'future-report' : ''}`}>
                  <td>{reportDate.format('DD')}</td>
                  <td style={{ width: '100%' }}>{report.rooms}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Host>
    );
  }
}

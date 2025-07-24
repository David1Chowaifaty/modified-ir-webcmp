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
    console.log(this.reports);
    return (
      <Host class={'card p-1  table-container table-responsive'}>
        <table class="table">
          <thead class="table-header">
            <tr>
              <th class="text-center">Date</th>
              <th class="text-center">Units booked</th>
              <th>Occupancy</th>
            </tr>
          </thead>
          <tbody>
            {this.reports.map(report => {
              const mainPercentage = `${parseFloat(report.occupancy_percent.toString()).toFixed(2)}%`;
              const secondaryPercentage = report.last_year ? `${parseFloat(report.last_year.occupancy_percent.toString()).toFixed(2)}%` : null;
              const reportDate = moment(report.day, 'YYYY-MM-DD');
              const isFutureDate = moment().isBefore(reportDate, 'dates');
              return (
                <tr key={report.day} class={`ir-table-row ${isFutureDate ? 'future-report' : ''}`}>
                  <td class={'text-center'}>{reportDate.format('DD')}</td>
                  <td class="text-center">
                    <div class={'d-flex flex-column'} style={{ gap: '0.5rem' }}>
                      <p class={`p-0 m-0 ${report.last_year?.units_booked ? 'font-weight-bold' : ''}}`}>{report.units_booked}</p>
                      {report.last_year?.units_booked && <p class="p-0 m-0">{report.units_booked}</p>}
                    </div>
                  </td>
                  <td style={{ width: '100%' }}>
                    <div class={'d-flex flex-column'} style={{ gap: '0.5rem' }}>
                      <ir-progress-indicator percentage={mainPercentage}></ir-progress-indicator>
                      {report.last_year?.occupancy_percent && <ir-progress-indicator percentage={secondaryPercentage} color="secondary"></ir-progress-indicator>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Host>
    );
  }
}

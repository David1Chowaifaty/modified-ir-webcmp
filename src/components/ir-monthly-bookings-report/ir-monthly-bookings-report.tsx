import Token from '@/models/Token';
import { sleep } from '@/utils/utils';
import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import { DailyReport, DailyReportFilter, ReportDate } from './types';
import moment from 'moment';
const fakeDailyReports: DailyReport[] = [
  { date: '2025-07-01', rooms: 12 },
  { date: '2025-07-02', rooms: 9 },
  { date: '2025-07-03', rooms: 14 },
  { date: '2025-07-04', rooms: 11 },
  { date: '2025-07-05', rooms: 10 },
  { date: '2025-07-06', rooms: 13 },
  { date: '2025-07-07', rooms: 7 },
  { date: '2025-07-08', rooms: 16 },
  { date: '2025-07-09', rooms: 8 },
  { date: '2025-07-10', rooms: 15 },
  { date: '2025-07-11', rooms: 10 },
  { date: '2025-07-12', rooms: 9 },
  { date: '2025-07-13', rooms: 12 },
  { date: '2025-07-14', rooms: 14 },
  { date: '2025-07-15', rooms: 11 },
  { date: '2025-07-16', rooms: 13 },
  { date: '2025-07-17', rooms: 8 },
  { date: '2025-07-18', rooms: 7 },
  { date: '2025-07-19', rooms: 15 },
  { date: '2025-07-20', rooms: 10 },
  { date: '2025-07-21', rooms: 9 },
  { date: '2025-07-22', rooms: 16 },
  { date: '2025-07-23', rooms: 14 },
  { date: '2025-07-24', rooms: 12 },
  { date: '2025-07-25', rooms: 11 },
  { date: '2025-07-26', rooms: 13 },
  { date: '2025-07-27', rooms: 9 },
  { date: '2025-07-28', rooms: 10 },
  { date: '2025-07-29', rooms: 14 },
  { date: '2025-07-30', rooms: 8 },
  { date: '2025-07-31', rooms: 12 },
];

@Component({
  tag: 'ir-monthly-bookings-report',
  styleUrl: 'ir-monthly-bookings-report.css',
  scoped: true,
})
export class IrMonthlyBookingsReport {
  @Prop() ticket: string;
  @Prop() language: string = 'en';
  @Prop() propertyid: number | string;

  @State() isLoading: boolean = true;
  @State() reports: DailyReport[] = fakeDailyReports;
  @State() selectedMonth: ReportDate;

  private baseFilters: DailyReportFilter;

  private tokenService = new Token();

  componentWillLoad() {
    this.baseFilters = {
      date: {
        description: moment().format('MMM YYY'),
        firstOfMonth: moment().startOf('month').format('YYYY-MM-DD'),
        lastOfMonth: moment().endOf('month').format('YYYY-MM-DD'),
      },
      include_previous_year: false,
    };
    if (this.ticket) {
      this.tokenService.setToken(this.ticket);
      this.init();
    }
  }
  @Watch('ticket')
  handleTicketChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.tokenService.setToken(this.ticket);
      this.init();
    }
  }
  private async init() {
    console.log('init');
    await this.getReports();
    this.isLoading = false;
  }

  private async getReports() {
    await sleep(1000);
    console.log(this.selectedMonth);
  }
  render() {
    if (this.isLoading) {
      return <ir-loading-screen></ir-loading-screen>;
    }
    return (
      <Host class={'p-2'}>
        <ir-monthly-bookings-report-filter baseFilters={this.baseFilters}></ir-monthly-bookings-report-filter>
        <ir-monthly-bookings-report-table reports={this.reports}></ir-monthly-bookings-report-table>
      </Host>
    );
  }
}

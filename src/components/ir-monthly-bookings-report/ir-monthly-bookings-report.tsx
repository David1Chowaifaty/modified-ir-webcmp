import Token from '@/models/Token';
import { sleep } from '@/utils/utils';
import { Component, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import { DailyReport, DailyReportFilter } from './types';
import moment from 'moment';
import locales from '@/stores/locales.store';
import { RoomService } from '@/services/room.service';
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
  @Prop() language: string = '';
  @Prop() ticket: string = '';
  @Prop() propertyid: number;
  @Prop() p: string;

  @State() isPageLoading = true;
  @State() isLoading: 'export' | 'filter' | null = null;

  @State() reports: DailyReport[] = fakeDailyReports;
  @State() filters: DailyReportFilter;
  @State() property_id: number;

  private baseFilters: DailyReportFilter;

  private tokenService = new Token();
  private roomService = new RoomService();
  // private propertyService = new PropertyService();

  componentWillLoad() {
    this.baseFilters = {
      date: {
        description: moment().format('MMM YYYY'),
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
  @Listen('applyFilters')
  handleApplyFiltersChange(e: CustomEvent<DailyReportFilter>) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.filters = e.detail;
    this.getReports();
  }

  private async init() {
    try {
      let propertyId = this.propertyid;
      if (!this.propertyid && !this.p) {
        throw new Error('Property ID or username is required');
      }
      // let roomResp = null;
      if (!propertyId) {
        console.log(propertyId);
        const propertyData = await this.roomService.getExposedProperty({
          id: 0,
          aname: this.p,
          language: this.language,
          is_backend: true,
          include_units_hk_status: true,
        });
        // roomResp = propertyData;
        propertyId = propertyData.My_Result.id;
      }
      this.property_id = propertyId;
      const requests = [this.roomService.fetchLanguage(this.language), this.getReports()];
      if (this.propertyid) {
        requests.push(
          this.roomService.getExposedProperty({
            id: this.propertyid,
            language: this.language,
            is_backend: true,
            include_units_hk_status: true,
          }),
        );
      }

      await Promise.all(requests);
    } catch (error) {
      console.log(error);
    } finally {
      this.isPageLoading = false;
    }
  }

  private async getReports(isExportToExcel = false) {
    await sleep(1000);
    console.log(this.filters, isExportToExcel);
  }
  render() {
    if (this.isPageLoading) {
      return <ir-loading-screen></ir-loading-screen>;
    }
    return (
      <Host>
        <ir-toast></ir-toast>
        <ir-interceptor></ir-interceptor>
        <section class="p-2 d-flex flex-column" style={{ gap: '1rem' }}>
          <div class="d-flex align-items-center justify-content-between">
            <h3 class="mb-1 mb-md-0">Daily Reports</h3>
            <ir-button
              size="sm"
              btn_color="outline"
              isLoading={this.isLoading === 'export'}
              text={locales.entries?.Lcz_Export}
              onClickHandler={async e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                await this.getReports(true);
              }}
              btnStyle={{ height: '100%' }}
              iconPosition="right"
              icon_name="file"
              icon_style={{ '--icon-size': '14px' }}
            ></ir-button>
          </div>
          <div class="d-flex flex-column flex-lg-row mt-1 " style={{ gap: '1rem' }}>
            <ir-monthly-bookings-report-filter isLoading={this.isLoading === 'filter'} class="filters-card" baseFilters={this.baseFilters}></ir-monthly-bookings-report-filter>
            <ir-monthly-bookings-report-table reports={this.reports}></ir-monthly-bookings-report-table>
          </div>
        </section>
      </Host>
    );
  }
}

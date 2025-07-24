import Token from '@/models/Token';
import { Component, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import { DailyReport, DailyReportFilter } from './types';
import moment from 'moment';
import locales from '@/stores/locales.store';
import { RoomService } from '@/services/room.service';
import { PropertyService } from '@/services/property.service';

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

  @State() reports: DailyReport[] = [];
  @State() filters: DailyReportFilter;
  @State() property_id: number;

  private baseFilters: DailyReportFilter;

  private tokenService = new Token();
  private roomService = new RoomService();
  private propertyService = new PropertyService();

  componentWillLoad() {
    this.baseFilters = {
      date: {
        description: moment().format('MMM YYYY'),
        firstOfMonth: moment().startOf('month').format('YYYY-MM-DD'),
        lastOfMonth: moment().endOf('month').format('YYYY-MM-DD'),
      },
      include_previous_year: false,
    };
    this.filters = this.baseFilters;
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
    try {
      this.isLoading = isExportToExcel ? 'export' : 'filter';
      const { date, include_previous_year } = this.filters;
      const currentReports = await this.propertyService.getMonthlyStats({
        from_date: date.firstOfMonth,
        to_date: date.lastOfMonth,
        property_id: this.property_id,
        is_export_to_excel: isExportToExcel,
      });
      let enrichedReports: DailyReport[] = [];
      if (include_previous_year) {
        const previousYearReports = await this.propertyService.getMonthlyStats({
          from_date: moment(date.firstOfMonth, 'YYYY-MM-DD').add(-1, 'year').format('YYYY-MM-DD'),
          to_date: moment(date.lastOfMonth, 'YYYY-MM-DD').add(-1, 'years').format('YYYY-MM-DD'),
          property_id: this.property_id,
        });
        enrichedReports = currentReports.map(current => {
          const previous = previousYearReports.find(prev => prev.day === current.day);
          return {
            ...current,
            last_year: previous ?? null,
          };
        });
      } else {
        enrichedReports = [...currentReports];
      }
      this.reports = [...enrichedReports];
    } catch (e) {
      console.log(e);
    } finally {
      this.isLoading = null;
    }
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
            <h3 class="mb-1 mb-md-0">Daily Occupancy</h3>
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

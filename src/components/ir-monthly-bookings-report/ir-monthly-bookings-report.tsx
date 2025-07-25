import Token from '@/models/Token';
import { Component, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import { DailyReport, DailyReportFilter } from './types';
import moment from 'moment';
import locales from '@/stores/locales.store';
import { RoomService } from '@/services/room.service';
import { MonthlyStatsResults, PropertyService } from '@/services/property.service';
import { TIcons } from '@/components/ui/ir-icons/icons';

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
  @State() stats: Omit<MonthlyStatsResults, 'DailyStats'> & {
    OccupancyDelta: number;
  };

  private baseFilters: DailyReportFilter;

  private tokenService = new Token();
  private roomService = new RoomService();
  private propertyService = new PropertyService();

  componentWillLoad() {
    this.baseFilters = {
      date: {
        description: moment().format('MMMM YYYY'),
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
      const getReportObj = (report): DailyReport => {
        return {
          day: report.Date,
          units_booked: report.Units_booked,
          occupancy_percent: report.Occupancy,
        };
      };
      this.isLoading = isExportToExcel ? 'export' : 'filter';
      const { date, include_previous_year } = this.filters;

      const requests = [
        this.propertyService.getMonthlyStats({
          from_date: date.firstOfMonth,
          to_date: date.lastOfMonth,
          property_id: this.property_id,
          is_export_to_excel: isExportToExcel,
        }),
      ];

      if (!isExportToExcel) {
        requests.push(
          this.propertyService.getMonthlyStats({
            from_date: moment(date.firstOfMonth, 'YYYY-MM-DD').subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
            to_date: moment(date.firstOfMonth, 'YYYY-MM-DD').subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
            property_id: this.property_id,
          }),
        );
      }

      if (include_previous_year) {
        requests.push(
          this.propertyService.getMonthlyStats({
            from_date: moment(date.firstOfMonth, 'YYYY-MM-DD').add(-1, 'year').format('YYYY-MM-DD'),
            to_date: moment(date.lastOfMonth, 'YYYY-MM-DD').add(-1, 'years').format('YYYY-MM-DD'),
            property_id: this.property_id,
          }),
        );
      }

      const results = await Promise.all(requests);
      const currentReports = results[0];
      let enrichedReports: DailyReport[] = [];
      const { DailyStats, ...rest } = currentReports;

      let occupancyDelta = -1;
      if (!isExportToExcel && results[1]) {
        occupancyDelta = parseFloat(rest.AverageOccupancy.toString()) - parseFloat(results[1].AverageOccupancy.toString());
      }

      this.stats = { ...rest, OccupancyDelta: occupancyDelta };

      if (include_previous_year && results[isExportToExcel ? 1 : 2]) {
        const previousYearReports = results[isExportToExcel ? 1 : 2];
        let formattedReports = previousYearReports.DailyStats.map(getReportObj);
        enrichedReports = DailyStats.map(getReportObj).map(current => {
          const previous = formattedReports.find(prev => prev.day === moment(current.day, 'YYYY-MM-DD').add(-1, 'years').format('YYYY-MM-DD'));
          return {
            ...current,
            last_year: previous ?? null,
          };
        });
      } else {
        enrichedReports = DailyStats.map(getReportObj);
      }
      this.reports = [...enrichedReports];
    } catch (e) {
      console.log(e);
    } finally {
      this.isLoading = null;
    }
  }
  private StatsCard({ icon, subtitle, title, value }: { icon: TIcons; title: string; subtitle: string; value: string }) {
    return (
      <div class="card p-1 d-flex flex-column flex-fill m-0" style={{ gap: '0.5rem' }}>
        <div class="d-flex align-items-center justify-content-between">
          <p class="m-0 p-0">{title}</p>
          <ir-icons name={icon}></ir-icons>
        </div>
        <h4 class="m-0 p-0">
          <b class="m-0 p-0">{value}</b>
        </h4>
        {subtitle && <p class="m-0 p-0 small text-muted">{subtitle}</p>}
      </div>
    );
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
          <section>
            <div class="d-flex flex-column flex-md-row w-100" style={{ gap: '1rem', alignItems: 'stretch' }}>
              {this.StatsCard({
                icon: this.stats.OccupancyDelta < 0 ? 'arrow-trend-down' : 'arrow-trend-up',
                title: 'Average Occupancy',
                value: this.stats?.AverageOccupancy.toFixed(2) + '%',
                subtitle: `${this.stats?.OccupancyDelta.toFixed(2)}% from last month`,
              })}
              {this.StatsCard({
                icon: 'hotel',
                title: 'Total Units',
                value: this.stats?.TotalUnitsBooked.toString(),
                subtitle: 'Booked',
              })}
              {this.StatsCard({
                icon: 'calendar',
                title: 'Peak Days',
                value: this.stats?.PeakDays?.map(pd => moment(pd.Date, 'YYYY-MM-DD').format('D').concat('th')).join(' - '),
                subtitle: `${Math.max(...(this.stats.PeakDays?.map(pd => pd.OccupancyPercent) || []))}% occupancy`,
              })}
            </div>
            <div class="d-flex flex-column flex-lg-row mt-1 " style={{ gap: '1rem' }}>
              <ir-monthly-bookings-report-filter isLoading={this.isLoading === 'filter'} class="filters-card" baseFilters={this.baseFilters}></ir-monthly-bookings-report-filter>
              <ir-monthly-bookings-report-table reports={this.reports}></ir-monthly-bookings-report-table>
            </div>
          </section>
        </section>
      </Host>
    );
  }
}

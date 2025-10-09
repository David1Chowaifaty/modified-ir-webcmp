import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import Token from '@/models/Token';
import { AllowedProperties, PropertyService } from '@/services/property.service';
import { RoomService } from '@/services/room.service';
import locales from '@/stores/locales.store';
import moment from 'moment';
import { ChannelReport, ChannelReportResult, ChannelSaleFilter } from './types';
@Component({
  tag: 'ir-sales-by-channel',
  styleUrl: 'ir-sales-by-channel.css',
  scoped: true,
})
export class IrSalesByChannel {
  @Prop() language: string = '';
  @Prop() ticket: string = '';
  @Prop() propertyid: string;

  @State() isLoading: 'filter' | 'export' | null = null;
  @State() isPageLoading = true;

  @State() salesData: ChannelReportResult;
  @State() channelSalesFilters: ChannelSaleFilter;
  @State() allowedProperties: AllowedProperties;

  private token = new Token();
  private roomService = new RoomService();
  private propertyService = new PropertyService();

  private baseFilters: ChannelSaleFilter = {
    FROM_DATE: moment().add(-7, 'days').format('YYYY-MM-DD'),
    TO_DATE: moment().format('YYYY-MM-DD'),
    BOOK_CASE: '001',
    WINDOW: 7,
    include_previous_year: false,
  };

  componentWillLoad() {
    this.channelSalesFilters = this.baseFilters;
    if (this.ticket) {
      this.token.setToken(this.ticket);
      this.initializeApp();
    }
  }

  @Watch('ticket')
  ticketChanged(newValue: string, oldValue: string) {
    if (newValue === oldValue) {
      return;
    }
    this.token.setToken(this.ticket);
    this.initializeApp();
  }

  private async initializeApp() {
    try {
      const requests = [this.propertyService.getExposedAllowedProperties(), this.roomService.fetchLanguage(this.language)];
      const [properties] = await Promise.all(requests);
      this.allowedProperties = [...(properties as any)];

      this.baseFilters = { ...this.baseFilters, LIST_AC_ID: this.allowedProperties.map(p => p.id) };
      this.channelSalesFilters = { ...this.baseFilters };

      await this.getChannelSales();
    } catch (error) {
      console.log(error);
    } finally {
      this.isPageLoading = false;
    }
  }

  private async getChannelSales(isExportToExcel = false) {
    try {
      const { include_previous_year, ...filterParams } = this.channelSalesFilters;
      this.isLoading = isExportToExcel ? 'export' : 'filter';
      const currentSales = await this.propertyService.getChannelSales({
        // AC_ID: this.propertyid,
        is_export_to_excel: isExportToExcel,
        ...filterParams,
      });
      const shouldFetchPreviousYear = !isExportToExcel && include_previous_year;
      let enrichedSales: ChannelReportResult = [];
      if (shouldFetchPreviousYear) {
        const previousYearSales = await this.propertyService.getChannelSales({
          // AC_ID: this.propertyid.toString(),
          is_export_to_excel: isExportToExcel,
          ...filterParams,
          FROM_DATE: moment(filterParams.FROM_DATE).subtract(1, 'year').format('YYYY-MM-DD'),
          TO_DATE: moment(filterParams.TO_DATE).subtract(1, 'year').format('YYYY-MM-DD'),
        });

        enrichedSales = currentSales.map(current => {
          const previous = previousYearSales.find(prev => prev.SOURCE.toLowerCase() === current.SOURCE.toLowerCase());
          return {
            ...current,
            last_year: previous ? previous : null,
          };
        });
      } else {
        enrichedSales = currentSales.map(record => ({
          ...record,
          last_year: null,
        }));
      }
      /**
       * Groups sales records by SOURCE and currency.id, summing numeric fields
       * and recalculating PCT based on the total REVENUE.
       */
      const groupSalesRecordsBySource = (records: ChannelReportResult): ChannelReportResult => {
        if (!records || records.length === 0) return records;

        // Helper to extract currency ID from various possible formats
        const getCurrencyId = (r: ChannelReport): string | null => {
          return r?.currency ?? null;
        };

        // Create unique key for grouping
        const createKey = (r: ChannelReport): string => {
          const source = r.SOURCE.toString().toLowerCase().trim();
          const currencyId = getCurrencyId(r);
          return `${source}__${currencyId ?? 'null'}`;
        };

        // Sum two values safely
        const sumValues = (a: number | undefined, b: number | undefined): number => {
          return (a ?? 0) + (b ?? 0);
        };

        // Merge numeric fields from last_year objects
        const mergeLastYear = (base: ChannelReport['last_year'], incoming: ChannelReport['last_year']): ChannelReport['last_year'] => {
          if (!incoming) return base;
          if (!base) return { ...incoming };

          return {
            NIGHTS: sumValues(base.NIGHTS, incoming.NIGHTS),
            PCT: sumValues(base.PCT, incoming.PCT), // Will recalculate later
            REVENUE: sumValues(base.REVENUE, incoming.REVENUE),
            SOURCE: base.SOURCE,
            PROPERTY_ID: base.PROPERTY_ID,
            PROPERTY_NAME: base.PROPERTY_NAME,
            currency: base.currency,
          };
        };

        // Group records by key
        const grouped = new Map<string, ChannelReport>();

        for (const record of records) {
          const key = createKey(record);
          const existing = grouped.get(key);

          if (!existing) {
            // First record for this key - clone it
            grouped.set(key, { ...record });
          } else {
            // Merge with existing record
            const merged: ChannelReport = {
              ...existing,
              NIGHTS: sumValues(existing.NIGHTS, record.NIGHTS),
              PCT: 0, // Will recalculate after summing all REVENUE
              REVENUE: sumValues(existing.REVENUE, record.REVENUE),
              last_year: mergeLastYear(existing.last_year, record.last_year),
            };
            grouped.set(key, merged);
          }
        }

        // Convert to array
        const result = Array.from(grouped.values());

        // Recalculate PCT based on total REVENUE
        const totalRevenue = result.reduce((sum, r) => sum + (r.REVENUE ?? 0), 0);

        if (totalRevenue > 0) {
          for (const record of result) {
            record.PCT = (record.REVENUE / totalRevenue) * 100;

            // Also recalculate last_year PCT if it exists
            if (record.last_year) {
              const lastYearTotal = result.reduce((sum, r) => sum + (r.last_year?.REVENUE ?? 0), 0);
              if (lastYearTotal > 0) {
                record.last_year.PCT = (record.last_year.REVENUE / lastYearTotal) * 100;
              }
            }
          }
        }

        return result;
      };

      this.salesData = [...groupSalesRecordsBySource(enrichedSales)];
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
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
            <h3 class="mb-1 mb-md-0">Sales by Channel</h3>
            <ir-button
              size="sm"
              btn_color="outline"
              isLoading={this.isLoading === 'export'}
              text={locales.entries.Lcz_Export}
              onClickHandler={async e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                await this.getChannelSales(true);
              }}
              btnStyle={{ height: '100%' }}
              iconPosition="right"
              icon_name="file"
              icon_style={{ '--icon-size': '14px' }}
            ></ir-button>
          </div>
          {/* <ir-sales-by-country-summary salesReports={this.salesData}></ir-sales-by-country-summary> */}
          <div class="d-flex flex-column flex-lg-row mt-1 " style={{ gap: '1rem' }}>
            <ir-sales-by-channel-filters
              isLoading={this.isLoading === 'filter'}
              onApplyFilters={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                this.channelSalesFilters = { ...e.detail };
                this.getChannelSales();
              }}
              allowedProperties={this.allowedProperties}
              baseFilters={this.baseFilters}
            ></ir-sales-by-channel-filters>
            <ir-sales-by-channel-table allowedProperties={this.allowedProperties} class="card mb-0" records={this.salesData}></ir-sales-by-channel-table>
          </div>
        </section>
      </Host>
    );
  }
}

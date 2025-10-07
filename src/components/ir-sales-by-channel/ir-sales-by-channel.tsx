import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import Token from '@/models/Token';
import { AllowedProperties, PropertyService } from '@/services/property.service';
import { RoomService } from '@/services/room.service';
import locales from '@/stores/locales.store';
import moment from 'moment';
import { ChannelReportResult, ChannelSaleFilter } from './types';
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
      // --- Group by PROPERTY_ID and sort so that hotels with most revenue are on top ---
      const totalsByProperty: Record<number, number> = enrichedSales.reduce((acc, r) => {
        acc[r.PROPERTY_ID] = (acc[r.PROPERTY_ID] ?? 0) + r.REVENUE;
        return acc;
      }, {} as Record<number, number>);

      enrichedSales.sort((a, b) => {
        const tA = totalsByProperty[a.PROPERTY_ID] ?? 0;
        const tB = totalsByProperty[b.PROPERTY_ID] ?? 0;

        // 1) Sort groups by total revenue (desc)
        if (tB !== tA) return tB - tA;

        // 2) Within the same property, sort each channel row by REVENUE (desc),
        //    then by SOURCE for a stable, readable order
        if (a.PROPERTY_ID === b.PROPERTY_ID) {
          if (b.REVENUE !== a.REVENUE) return b.REVENUE - a.REVENUE;
          return a.SOURCE.localeCompare(b.SOURCE);
        }

        // 3) Tie-breaker when two different properties have identical totals
        return String(a.PROPERTY_NAME).localeCompare(String(b.PROPERTY_NAME));
      });
      // -------------------------------------------------------------------------------

      this.salesData = [...enrichedSales];
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

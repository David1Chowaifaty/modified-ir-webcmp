import Token from '@/models/Token';
import { PropertyService } from '@/services/property.service';
import { RoomService } from '@/services/room.service';
import locales from '@/stores/locales.store';
import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import { BaseSalesRecord, CountrySalesFilter, MappedCountries, SalesRecord } from './types';
import moment from 'moment';
import { v4 } from 'uuid';
import { BookingService } from '@/services/booking.service';
import { ICountry } from '@/models/IBooking';

@Component({
  tag: 'ir-sales-by-country',
  styleUrl: 'ir-sales-by-country.css',
  scoped: true,
})
export class IrSalesByCountry {
  @Prop() language: string = '';
  @Prop() ticket: string = '';
  @Prop() propertyid: number;
  @Prop() p: string;

  @State() isLoading: 'filter' | 'export' | null = null;
  @State() isPageLoading = true;
  @State() property_id: number;
  @State() salesData: SalesRecord[];
  @State() salesFilters: CountrySalesFilter;
  @State() countries: MappedCountries = new Map();

  private token = new Token();
  private roomService = new RoomService();
  private propertyService = new PropertyService();
  private bookingService = new BookingService();

  private baseFilters = {
    FROM_DATE: moment().add(-7, 'days').format('YYYY-MM-DD'),
    TO_DATE: moment().format('YYYY-MM-DD'),
    BOOK_CASE: '001',
    WINDOW: 7,
    include_previous_year: false,
  };

  componentWillLoad() {
    this.salesFilters = this.baseFilters;
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
      const requests = [this.bookingService.getCountries(this.language), this.roomService.fetchLanguage(this.language), this.getCountrySales()];
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

      const [countries] = await Promise.all(requests);
      const mappedCountries = new Map();
      (countries as ICountry[]).map(country => {
        mappedCountries.set(country.id, {
          flag: country.flag,
          name: country.name,
        });
      });
      this.countries = mappedCountries;
    } catch (error) {
      console.log(error);
    } finally {
      this.isPageLoading = false;
    }
  }

  private async getCountrySales(isExportToExcel = false) {
    const formatSalesData = (data): Omit<BaseSalesRecord, 'id'> => {
      return {
        country: data.COUNTRY,
        country_id: data.COUNTRY_ID,
        nights: data.NIGHTS,
        percentage: data.PCT,
        revenue: data.REVENUE,
        number_of_guests: data.Total_Guests,
      };
    };
    try {
      const { include_previous_year, ...filterParams } = this.salesFilters;
      this.isLoading = isExportToExcel ? 'export' : 'filter';

      const currentSales = await this.propertyService.getCountrySales({
        AC_ID: this.property_id,
        is_export_to_excel: isExportToExcel,
        ...filterParams,
      });

      const shouldFetchPreviousYear = !isExportToExcel && include_previous_year;

      let enrichedSales: SalesRecord[] = [];

      if (shouldFetchPreviousYear) {
        const previousYearSales = await this.propertyService.getCountrySales({
          AC_ID: this.property_id,
          is_export_to_excel: false,
          ...filterParams,
          FROM_DATE: moment(filterParams.FROM_DATE).subtract(1, 'year').format('YYYY-MM-DD'),
          TO_DATE: moment(filterParams.TO_DATE).subtract(1, 'year').format('YYYY-MM-DD'),
        });

        enrichedSales = currentSales.map(current => {
          const previous = previousYearSales.find(prev => prev.COUNTRY.toLowerCase() === current.COUNTRY.toLowerCase());
          return {
            id: v4(),
            ...formatSalesData(current),
            last_year: previous ? formatSalesData(previous) : null,
          };
        });
      } else {
        enrichedSales = currentSales.map(record => ({
          id: v4(),
          ...formatSalesData(record),
          last_year: null,
        }));
      }

      // this.salesData = enrichedSales.sort((a, b) => {
      //   if (a.country_id === 0) return -1;
      //   if (b.country_id === 0) return 1;
      //   return 0;
      // });
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
            <h3 class="mb-1 mb-md-0">Sales by Country</h3>
            <ir-button
              size="sm"
              btn_color="outline"
              isLoading={this.isLoading === 'export'}
              text={locales.entries.Lcz_Export}
              onClickHandler={async e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                await this.getCountrySales(true);
              }}
              btnStyle={{ height: '100%' }}
              iconPosition="right"
              icon_name="file"
              icon_style={{ '--icon-size': '14px' }}
            ></ir-button>
          </div>
          <ir-sales-by-country-summary salesReports={this.salesData}></ir-sales-by-country-summary>
          <div class="d-flex flex-column flex-lg-row mt-1 " style={{ gap: '1rem' }}>
            <ir-sales-filters
              isLoading={this.isLoading === 'filter'}
              onApplyFilters={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                this.salesFilters = e.detail;
                this.getCountrySales();
              }}
              class="filters-card"
              baseFilters={this.baseFilters}
            ></ir-sales-filters>
            <ir-sales-table mappedCountries={this.countries} class="card mb-0" records={this.salesData}></ir-sales-table>
          </div>
        </section>
      </Host>
    );
  }
}

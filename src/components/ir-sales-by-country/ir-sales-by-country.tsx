import Token from '@/models/Token';
import { PropertyService } from '@/services/property.service';
import { RoomService } from '@/services/room.service';
import locales from '@/stores/locales.store';
import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import { CountrySalesFilter, SalesRecord } from './types';
import moment from 'moment';

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

  @State() isLoading = true;
  @State() property_id: number;
  @State() salesData: SalesRecord[];
  @State() salesFilters: CountrySalesFilter;

  private token = new Token();
  private roomService = new RoomService();
  private propertyService = new PropertyService();

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
      this.isLoading = true;
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
      const requests = [this.roomService.fetchLanguage(this.language), this.getCountrySales()];
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
      this.isLoading = false;
    }
  }
  private async getCountrySales(withExcel = false) {
    const { include_previous_year, ...rest } = this.salesFilters;

    const res = await this.propertyService.getCountrySales({
      AC_ID: this.property_id,
      is_export_to_excel: withExcel,
      ...rest,
    });
    if (include_previous_year && rest.WINDOW === 365) {
    }
    this.salesFilters = res;
    // this.
  }
  render() {
    if (this.isLoading) {
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
          <div class="d-flex flex-column flex-lg-row mt-1 " style={{ gap: '1rem' }}>
            <ir-sales-filters
              onApplyFilters={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                this.salesFilters = e.detail;
                this.getCountrySales();
              }}
              baseFilters={this.baseFilters}
            ></ir-sales-filters>
            <ir-sales-table class="card"></ir-sales-table>
          </div>
        </section>
      </Host>
    );
  }
}

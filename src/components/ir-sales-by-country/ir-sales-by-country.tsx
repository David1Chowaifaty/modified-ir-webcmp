import Token from '@/models/Token';
import { RoomService } from '@/services/room.service';
import locales from '@/stores/locales.store';
import { Component, Host, Prop, State, Watch, h } from '@stencil/core';

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

  private token = new Token();
  private roomService = new RoomService();

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
      const requests = [this.roomService.fetchLanguage(this.language)];
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
              onClickHandler={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
              }}
              btnStyle={{ height: '100%' }}
              iconPosition="right"
              icon_name="file"
              icon_style={{ '--icon-size': '14px' }}
            ></ir-button>
          </div>
          <div class="d-flex flex-column flex-lg-row mt-1 " style={{ gap: '1rem' }}>
            <ir-sales-filters></ir-sales-filters>
            <ir-sales-table></ir-sales-table>
          </div>
        </section>
      </Host>
    );
  }
}

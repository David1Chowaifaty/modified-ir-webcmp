import Token from '@/models/Token';
import { HouseKeepingService } from '@/services/housekeeping.service';
import { RoomService } from '@/services/room.service';
import { updateHKStore } from '@/stores/housekeeping.store';
import { Component, Host, Listen, Prop, State, Watch, h } from '@stencil/core';

@Component({
  tag: 'ir-housekeeping',
  styleUrl: 'ir-housekeeping.css',
  scoped: true,
})
export class IrHousekeeping {
  @Prop() language: string = '';
  @Prop() ticket: string = '';

  @Prop() propertyid: number;
  @Prop() p: string;

  @State() isLoading = false;

  private roomService = new RoomService();
  private houseKeepingService = new HouseKeepingService();
  private token = new Token();

  componentWillLoad() {
    if (this.ticket !== '') {
      this.token.setToken(this.ticket);
      this.initializeApp();
    }
  }
  @Listen('resetData')
  async handleResetData(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    await this.houseKeepingService.getExposedHKSetup(this.propertyid);
  }
  @Watch('ticket')
  ticketChanged(newValue: string, oldValue: string) {
    if (newValue === oldValue) {
      return;
    }
    this.token.setToken(this.ticket);
    this.initializeApp();
  }

  async initializeApp() {
    try {
      this.isLoading = true;
      let propertyId = this.propertyid;
      if (!propertyId) {
        const propertyData = await this.roomService.getExposedProperty({
          id: 0,
          aname: this.p,
          language: this.language,
          is_backend: true,
        });
        propertyId = propertyData.My_Result.id;
      }
      updateHKStore('default_properties', { token: this.ticket, property_id: propertyId, language: this.language });
      const requests = [this.houseKeepingService.getExposedHKSetup(propertyId), this.roomService.fetchLanguage(this.language, ['_HK_FRONT'])];

      if (this.propertyid) {
        requests.unshift(
          this.roomService.getExposedProperty({
            id: propertyId,
            language: this.language,
            is_backend: true,
          }),
        );
      }

      await Promise.all(requests);
    } catch (error) {
      console.error(error);
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
        <ir-interceptor></ir-interceptor>
        <ir-toast></ir-toast>
        <section class="p-1">
          <div class="card p-1">
            <ir-select
              LabelAvailable={false}
              showFirstOption={false}
              onSelectChange={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                this.roomService.SetAutomaticCheckInOut({
                  property_id: this.propertyid,
                  flag: e.detail === 'auto',
                });
              }}
              data={[
                { text: 'Manual', value: 'manual' },
                { text: 'Auto', value: 'auto' },
              ]}
            ></ir-select>
          </div>
          {/*<ir-unit-status class="mb-1"></ir-unit-status>*/}
          <ir-hk-team class="mb-1"></ir-hk-team>
        </section>
      </Host>
    );
  }
}

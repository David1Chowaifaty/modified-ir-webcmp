import Token from '@/models/Token';
import { HouseKeepingService } from '@/services/housekeeping.service';
import { RoomService } from '@/services/room.service';
import calendar_data from '@/stores/calendar-data';
import { updateHKStore } from '@/stores/housekeeping.store';
import { Component, Event, EventEmitter, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import { IToast } from '@components/ui/ir-toast/toast';
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

  @Event() toast: EventEmitter<IToast>;

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
          include_sales_rate_plans: true,
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
            include_sales_rate_plans: true,
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
  private saveAutomaticCheckInCheckout(e: CustomEvent): void {
    e.stopImmediatePropagation();
    e.stopPropagation();
    try {
      this.roomService.SetAutomaticCheckInOut({
        property_id: this.propertyid,
        flag: e.detail === 'auto',
      });
      this.toast.emit({
        position: 'top-right',
        title: 'Saved Successfully',
        description: '',
        type: 'success',
      });
    } catch (error) {
      console.log(error);
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
          <h3 class="mb-2">Housekeeping & Check-In Setup</h3>
          <div class="card p-1">
            <ir-title borderShown label="Check-In Mode"></ir-title>
            <div class={'d-flex align-items-center'}>
              <p class="my-0 py-0 mr-1  ">Check in & Check out guests automatically:</p>
              <ir-select
                LabelAvailable={false}
                showFirstOption={false}
                selectedValue={calendar_data.is_automatic_check_in_out ? 'auto' : 'manual'}
                onSelectChange={e => this.saveAutomaticCheckInCheckout(e)}
                data={[
                  { text: `Yes, as per the property's policy.`, value: 'auto' },
                  { text: 'No, I will do it manually. ', value: 'manual' },
                ]}
              ></ir-select>
            </div>
          </div>
          {/*<ir-unit-status class="mb-1"></ir-unit-status>*/}
          <ir-hk-team class="mb-1"></ir-hk-team>
        </section>
      </Host>
    );
  }
}

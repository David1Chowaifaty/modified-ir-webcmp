import Token from '@/models/Token';
import { HouseKeepingService } from '@/services/housekeeping.service';
import { RoomService } from '@/services/room.service';
import calendar_data from '@/stores/calendar-data';
import housekeeping_store, { updateHKStore } from '@/stores/housekeeping.store';
import { Component, Event, EventEmitter, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import { IToast } from '@components/ui/ir-toast/toast';
import locales from '@/stores/locales.store';
import { PropertyService } from '@/services/property.service';
import { isRequestPending } from '@/stores/ir-interceptor.store';
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
  @Prop() baseUrl: string;

  @State() isLoading = false;

  @Event() toast: EventEmitter<IToast>;

  private roomService = new RoomService();
  private houseKeepingService = new HouseKeepingService();
  private propertyService = new PropertyService();
  private token = new Token();
  modal: HTMLIrModalElement;
  selectedCleaningFrequency: any;

  componentWillLoad() {
    if (this.baseUrl) {
      this.token.setBaseUrl(this.baseUrl);
    }
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
      const requests: Array<Promise<any>> = [];
      if (calendar_data.housekeeping_enabled) {
        requests.push(this.houseKeepingService.getExposedHKSetup(propertyId));
      }
      requests.push(this.roomService.fetchLanguage(this.language, ['_HK_FRONT', '_PMS_FRONT']));
      if (this.propertyid) {
        requests.push(
          this.roomService.getExposedProperty({
            id: propertyId,
            language: this.language,
            is_backend: true,
            include_sales_rate_plans: true,
          }),
        );
      }

      await Promise.all(requests);
      this.selectedCleaningFrequency = calendar_data.cleaning_frequency?.code;
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
  private async saveAutomaticCheckInCheckout(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    try {
      await this.roomService.SetAutomaticCheckInOut({
        property_id: housekeeping_store.default_properties.property_id,
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
  private async saveCleaningFrequency(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    try {
      await this.propertyService.setExposedCleaningFrequency({
        property_id: housekeeping_store.default_properties.property_id,
        code: this.selectedCleaningFrequency,
      });
      calendar_data.cleaning_frequency = { code: this.selectedCleaningFrequency, description: '' };
      this.toast.emit({
        position: 'top-right',
        title: 'Saved Successfully',
        description: '',
        type: 'success',
      });
      this.modal.closeModal();
    } catch (error) {
      console.log(error);
    }
  }
  render() {
    if (this.isLoading) {
      return <ir-loading-screen></ir-loading-screen>;
    }
    console.log(calendar_data.cleaning_frequency);
    return (
      <Host>
        <ir-interceptor></ir-interceptor>
        <ir-toast></ir-toast>
        <section class="p-1">
          <h3 class="mb-2">{locales.entries.Lcz_HouseKeepingAndCheckInSetup}</h3>
          <div class="card p-1">
            <ir-title borderShown label="Operations Settings"></ir-title>
            <div class={'d-flex align-items-center mb-1'}>
              <p class="my-0 py-0 mr-1">{locales.entries.Lcz_CheckInOutGuestsAutomatically}</p>
              <ir-select
                LabelAvailable={false}
                showFirstOption={false}
                selectedValue={calendar_data.is_automatic_check_in_out ? 'auto' : 'manual'}
                onSelectChange={e => this.saveAutomaticCheckInCheckout(e)}
                data={[
                  { text: locales.entries.Lcz_YesAsPerPropertyPolicy, value: 'auto' },
                  { text: locales.entries.Lcz_NoIWillDoItManually, value: 'manual' },
                ]}
              ></ir-select>
            </div>
            <div class={'d-flex align-items-center'}>
              <p class="my-0 py-0 mr-1">{locales.entries.Lcz_CleaningFrequency}:</p>
              <ir-select
                LabelAvailable={false}
                showFirstOption={false}
                selectedValue={this.selectedCleaningFrequency}
                onSelectChange={e => {
                  e.stopImmediatePropagation();
                  e.stopPropagation();
                  this.selectedCleaningFrequency = e.detail;
                  this.modal.openModal();
                }}
                data={housekeeping_store?.hk_criteria?.cleaning_frequencies.map(v => ({
                  text: v.description,
                  value: v.code,
                }))}
              ></ir-select>
            </div>
          </div>
          {/*<ir-unit-status class="mb-1"></ir-unit-status>*/}
          {calendar_data.housekeeping_enabled && <ir-hk-team class="mb-1"></ir-hk-team>}
          <ir-modal
            autoClose={false}
            ref={el => (this.modal = el)}
            isLoading={isRequestPending('/Set_Exposed_Cleaning_Frequency')}
            onConfirmModal={this.saveCleaningFrequency.bind(this)}
            iconAvailable={true}
            onCancelModal={() => {
              this.selectedCleaningFrequency = calendar_data.cleaning_frequency?.code;
            }}
            icon="ft-alert-triangle danger h1"
            leftBtnText={locales.entries.Lcz_Cancel}
            rightBtnText={locales.entries.Lcz_Confirm}
            leftBtnColor="secondary"
            rightBtnColor={'primary'}
            modalTitle={locales.entries.Lcz_Confirmation}
            modalBody={'This action will reset all skipped tasks. Do you want to continue?'}
          ></ir-modal>
        </section>
      </Host>
    );
  }
}

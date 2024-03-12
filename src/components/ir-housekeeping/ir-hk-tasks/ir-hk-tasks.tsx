import { IPendingActions } from '@/models/housekeeping';
import { HouseKeepingService } from '@/services/housekeeping.service';
import { RoomService } from '@/services/room.service';
import housekeeping_store, { updateHKStore } from '@/stores/housekeeping.store';
import locales from '@/stores/locales.store';
import { Component, Host, Listen, Prop, State, Watch, h, Element } from '@stencil/core';
import axios from 'axios';

@Component({
  tag: 'ir-hk-tasks',
  styleUrl: 'ir-hk-tasks.css',
  scoped: true,
})
export class IrHkTasks {
  @Element() el: HTMLElement;

  @Prop() language: string = '';
  @Prop() ticket: string = '';
  @Prop() baseurl: string = '';
  @Prop() propertyid: number;

  @State() isLoading = false;
  @State() selectedDuration = '';
  @State() selectedHouseKeeper = '0';
  @State() selectedRoom: IPendingActions | null = null;
  @State() archiveOpened = false;

  private modalOpenTimeOut: NodeJS.Timeout;
  private roomService = new RoomService();
  private houseKeepingService = new HouseKeepingService();

  componentWillLoad() {
    if (this.baseurl) {
      axios.defaults.baseURL = this.baseurl;
    }
    if (this.ticket !== '') {
      this.roomService.setToken(this.ticket);
      this.houseKeepingService.setToken(this.ticket);
      updateHKStore('default_properties', { token: this.ticket, property_id: this.propertyid, language: this.language });
      this.initializeApp();
    }
  }

  @Listen('resetData')
  async handleResetData(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const { arrival, arrival_time, housekeeper, unit, status } = this.selectedRoom;
    this.houseKeepingService.executeHKAction({
      property_id: this.propertyid,
      arrival,
      arrival_time,
      housekeeper: {
        id: housekeeper.id,
      },
      status: {
        code: status.code,
      },
      unit: {
        id: unit.id,
      },
    });
    await this.houseKeepingService.getExposedHKSetup(this.propertyid);
  }

  @Watch('ticket')
  async ticketChanged(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.roomService.setToken(this.ticket);
      this.houseKeepingService.setToken(this.ticket);
      updateHKStore('default_properties', { token: this.ticket, property_id: this.propertyid, language: this.language });
      this.initializeApp();
    }
  }
  handleCheckChange(e: CustomEvent, action: IPendingActions) {
    if (e.detail) {
      this.selectedRoom = action;
      this.modalOpenTimeOut = setTimeout(() => {
        const modal = this.el.querySelector('ir-modal');
        if (modal) {
          (modal as HTMLIrModalElement).openModal();
        }
      }, 50);
    }
  }
  @Listen('closeSideBar')
  handleCloseSidebar(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.archiveOpened = false;
  }
  disconnectedCallback() {
    if (this.modalOpenTimeOut) {
      clearTimeout(this.modalOpenTimeOut);
    }
  }
  async getPendingActions() {
    await this.houseKeepingService.getHKPendingActions({
      property_id: this.propertyid,
      bracket: {
        code: this.selectedDuration,
      },
      housekeeper: {
        id: +this.selectedHouseKeeper,
      },
    });
  }
  async initializeApp() {
    try {
      this.isLoading = true;
      await Promise.all([
        this.houseKeepingService.getExposedHKStatusCriteria(this.propertyid),
        this.roomService.fetchData(this.propertyid, this.language),
        this.roomService.fetchLanguage(this.language, ['_HK_FRONT']),
      ]);
      this.selectedDuration = housekeeping_store.hk_tasks.brackets[0].code;
      await this.getPendingActions();
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
  async handleConfirm(e: CustomEvent) {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
    try {
      await this.getPendingActions();
    } catch (error) {
      console.error(error);
    } finally {
      this.selectedRoom = null;
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
        <section class="p-2">
          <ir-title class="d-none d-md-flex" label="Housekeeping Tasks" justifyContent="space-between">
            <ir-button slot="title-body" text={locales.entries.Lcz_Archive} size="sm"></ir-button>
          </ir-title>
          <div class="d-flex align-items-center mb-2 justify-content-between d-md-none">
            <ir-title class="mb-0" label="Housekeeping Tasks" justifyContent="space-between"></ir-title>
            <ir-button slot="title-body" text={locales.entries.Lcz_Archive} size="sm" onClickHanlder={() => (this.archiveOpened = true)}></ir-button>
          </div>
          <div class="d-flex flex-column flex-sm-row align-items-center mb-1  select-container">
            <ir-select
              selectedValue={this.selectedDuration}
              onSelectChange={e => {
                this.selectedDuration = e.detail;
                this.getPendingActions();
              }}
              data={housekeeping_store.hk_tasks.brackets.map(bracket => ({
                text: bracket.description,
                value: bracket.code,
              }))}
              class="mb-1 w-100 mb-sm-0"
              showFirstOption={false}
              LabelAvailable={false}
            ></ir-select>
            <ir-select
              onSelectChange={e => {
                this.selectedHouseKeeper = e.detail;
                this.getPendingActions();
              }}
              selectedValue={this.selectedHouseKeeper}
              data={[
                { text: 'All housekeepers', value: '0' },
                ...housekeeping_store.hk_tasks.housekeepers.map(bracket => ({
                  text: bracket.name,
                  value: bracket.id.toString(),
                })),
              ]}
              showFirstOption={false}
              LabelAvailable={false}
              class="ml-sm-2 w-100"
            ></ir-select>
          </div>
          <div class="card p-1">
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th class="text-left">{locales.entries.Lcz_Unit}</th>
                    <th class="text-left">{locales.entries.Lcz_Status}</th>
                    <th class="text-left">{locales.entries.Lcz_Arrivaldate}</th>
                    <th class="text-left">{locales.entries.Lcz_ArrivalTime}</th>
                    <th class="text-left">{locales.entries.Lcz_Housekeeper}</th>
                    <th class="text-center">{locales.entries.Lcz_Done}</th>
                  </tr>
                </thead>
                <tbody>
                  {housekeeping_store.pending_housekeepers?.map(action => (
                    <tr key={action.housekeeper.id}>
                      <td class="text-left">{action.unit.name}</td>
                      <td class="text-left">{action.status.description}</td>
                      <td class="text-left">{action.arrival}</td>
                      <td class="text-left">{action.arrival_time}</td>
                      <td class="text-left">{action.housekeeper.name}</td>
                      <td>
                        <div class="checkbox-container">
                          <ir-checkbox onCheckChange={e => this.handleCheckChange(e, action)} checked={this.selectedRoom?.unit.id === action.unit.id}></ir-checkbox>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        {this.selectedRoom && (
          <ir-modal
            leftBtnText={locales.entries.Lcz_No}
            rightBtnText={locales.entries.Lcz_Yes}
            onConfirmModal={this.handleConfirm.bind(this)}
            onCancelModal={() => (this.selectedRoom = null)}
            modalBody={`Is ${this.selectedRoom.unit.name} cleaned?`}
          ></ir-modal>
        )}
        {/* <ir-sidebar open={this.archiveOpened} showCloseButton={false} onIrSidebarToggle={() => (this.archiveOpened = false)}>
          {this.archiveOpened && <ir-hk-archive slot="sidebar-body"></ir-hk-archive>}
        </ir-sidebar> */}
      </Host>
    );
  }
}

import { IPendingActions } from '@/models/housekeeping';
import { HouseKeepingService } from '@/services/housekeeping.service';
import { RoomService } from '@/services/room.service';
import housekeeping_store, { updateHKStore } from '@/stores/housekeeping.store';
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
  render() {
    if (this.isLoading) {
      return <ir-loading-screen></ir-loading-screen>;
    }
    return (
      <Host>
        <ir-toast></ir-toast>
        <ir-interceptor></ir-interceptor>
        <section class="p-2">
          <ir-title label="Housekeeping Tasks" justifyContent="space-between">
            <ir-button slot="title-body" text={'Create task'} size="sm"></ir-button>
          </ir-title>
          <div class="d-flex align-items-center mb-1">
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
              class="ml-2"
            ></ir-select>
          </div>
          <div class="card p-1">
            <table>
              <thead>
                <th>Unit</th>
                <th>Status</th>
                <th>Arrival</th>
                <th>Arrival Time</th>
                <th>Housekeeper</th>
                <th class="text-center">Done?</th>
              </thead>
              <tbody>
                {housekeeping_store.pending_housekeepers?.map(action => (
                  <tr key={action.housekeeper.id}>
                    <td>{action.unit.name}</td>
                    <td>{action.status.description}</td>
                    <td>{action.arrival}</td>
                    <td>{action.arrival_time}</td>
                    <td>{action.housekeeper.name}</td>
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
        </section>
        {this.selectedRoom && (
          <ir-modal onCancelModal={() => (this.selectedRoom = null)} modalBody={`Are you sure that room ${this.selectedRoom.unit.name} is cleaned?`}></ir-modal>
        )}
      </Host>
    );
  }
}

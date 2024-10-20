import { RoomService } from '@/services/room.service';
import channels_data, { resetStore, selectChannel, setChannelIdAndActiveState, testConnection, updateChannelSettings } from '@/stores/channel.store';
import locales from '@/stores/locales.store';
import { Component, Host, Prop, Watch, h, Element, State, Fragment, Listen } from '@stencil/core';
import axios from 'axios';
import { actions } from './data';
import { IModalCause } from './types';
import { ChannelService } from '@/services/channel.service';
import { IChannel } from '@/models/calendarData';
import Token from '@/models/Token';

@Component({
  tag: 'ir-channel',
  styleUrl: 'ir-channel.css',
  scoped: true,
})
export class IrChannel {
  @Element() el: HTMLElement;

  @Prop() ticket: string = '';
  @Prop() propertyid: number;
  @Prop() language: string;
  @Prop() baseurl: string;
  @Prop() p: string;
  @Prop() isSameSite: boolean;

  @State() channel_status: 'create' | 'edit' | null = null;
  @State() modal_cause: IModalCause | null = null;
  @State() isLoading = false;

  private roomService = new RoomService();
  private channelService = new ChannelService();
  private token = new Token();

  private irModalRef: HTMLIrModalElement;
  private initializedApp: boolean = false;

  componentWillLoad() {
    this.isLoading = true;
    if (this.baseurl) {
      axios.defaults.baseURL = this.baseurl;
    }
    if (this.ticket !== '') {
      this.token.setToken(this.ticket);
      this.initializeApp();
    }
  }

  async handleConfirmClicked(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    if (!this.modal_cause) {
      return;
    }
    await this.modal_cause.action();
    if (this.modal_cause.cause === 'remove') {
      resetStore();
      await this.refreshChannels();
    }
    this.modal_cause = null;
  }
  openModal() {
    this.irModalRef.openModal();
  }
  async refreshChannels() {
    const [, ,] = await Promise.all([this.channelService.getExposedChannels(), this.channelService.getExposedConnectedChannels(this.propertyid)]);
  }
  async initializeApp() {
    this.initializedApp = true;
    if (!this.propertyid && !this.p) {
      throw new Error('Property ID or username is required');
    }
    try {
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

      const requests = [
        this.channelService.getExposedChannels(),
        this.channelService.getExposedConnectedChannels(propertyId),
        this.roomService.fetchLanguage(this.language, ['_CHANNEL_FRONT']),
      ];

      if (this.propertyid) {
        requests.unshift(
          this.roomService.getExposedProperty({
            id: this.propertyid,
            language: this.language,
            is_backend: true,
          }),
        );
      }

      const results = await Promise.all(requests);
      const languageTexts = results[results.length - 1];

      channels_data.property_id = this.propertyid;
      if (!locales.entries) {
        locales.entries = languageTexts.entries;
        locales.direction = languageTexts.direction;
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
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
  @Watch('isSameSite')
  async isSameSiteChanged(newValue: boolean, oldValue: boolean) {
    if (newValue === oldValue) {
      return;
    }
    this.token.setIsSameSite(newValue);
    if (!this.initializedApp) {
      this.initializeApp();
    }
  }

  handleCancelModal(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.modal_cause = null;
  }
  handleSidebarClose(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    if (channels_data.selectedChannel) {
      this.modal_cause = {
        action: () => {
          return new Promise(reselove => {
            this.resetSideBar();
            reselove('');
          });
        },
        cause: 'channel',
        main_color: 'primary',
        message: locales.entries?.Lcz_UnSavedChangesWillBeLost,
        title: '',
      };
      this.openModal();
    } else {
      this.resetSideBar();
    }
  }

  resetSideBar() {
    this.channel_status = null;
    resetStore();
  }
  @Listen('saveChannelFinished')
  async handleSaveChange(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    await this.refreshChannels();
    this.resetSideBar();
  }
  async handleCheckChange(check: boolean, params: IChannel) {
    const selectedProperty = params.map.find(m => m.type === 'property');
    setChannelIdAndActiveState(params.id, check);
    updateChannelSettings('hotel_id', selectedProperty.channel_id);
    updateChannelSettings('hotel_title', params.title);
    selectChannel(params.channel.id.toString());
    testConnection();
    await this.channelService.saveConnectedChannel(null, false);
    resetStore();
    this.refreshChannels();
  }
  render() {
    if (this.isLoading) {
      return (
        <div class="h-screen bg-white d-flex flex-column align-items-center justify-content-center">
          {/* <div class="dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div> */}
          <ir-loading-screen></ir-loading-screen>
        </div>
      );
    }
    return (
      <Host class="h-100 ">
        <ir-toast></ir-toast>
        <section class="p-2 px-lg-5 py-0 h-100 d-flex flex-column">
          <div class="d-flex w-100 justify-content-between mb-2 align-items-center">
            <h3 class="font-weight-bold m-0 p-0">{locales.entries?.Lcz_iSWITCH}</h3>
            <ir-button iconPostion="left" icon_name="circle_plus" text={locales.entries?.Lcz_CreateChannel} size="sm" onClickHanlder={() => (this.channel_status = 'create')}>
              {/* <svg slot="icon" stroke-width={3} width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM7.50003 4C7.77617 4 8.00003 4.22386 8.00003 4.5V7H10.5C10.7762 7 11 7.22386 11 7.5C11 7.77614 10.7762 8 10.5 8H8.00003V10.5C8.00003 10.7761 7.77617 11 7.50003 11C7.22389 11 7.00003 10.7761 7.00003 10.5V8H4.50003C4.22389 8 4.00003 7.77614 4.00003 7.5C4.00003 7.22386 4.22389 7 4.50003 7H7.00003V4.5C7.00003 4.22386 7.22389 4 7.50003 4Z"
                  fill="currentColor"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                ></path>
              </svg> */}
            </ir-button>
          </div>
          <div class="card p-1 flex-fill m-0">
            <table class="table table-striped table-bordered no-footer dataTable">
              <thead>
                <tr>
                  <th scope="col" class="text-left">
                    {locales.entries?.Lcz_Channel}
                  </th>
                  <th scope="col">{locales.entries?.Lcz_Status}</th>
                  <th scope="col" class="actions-theader">
                    {locales.entries?.Lcz_Actions}
                  </th>
                </tr>
              </thead>
              <tbody class="">
                {channels_data.connected_channels?.map(channel => (
                  <tr key={channel.channel.id}>
                    <td class="text-left">
                      {channel.channel.name} {channel.title ? `(${channel.title})` : ''}
                    </td>
                    <td>
                      <ir-switch checked={channel.is_active} onCheckChange={e => this.handleCheckChange(e.detail, channel)}></ir-switch>
                    </td>
                    <th>
                      <div class="d-flex justify-content-end">
                        <div class="btn-group">
                          <button type="button" class="btn  dropdown-toggle px-0" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <span class="mr-1"> {locales.entries?.Lcz_Actions}</span>
                            <svg class={'caret-icon'} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height={14} width={14}>
                              <path
                                fill="var(--blue)"
                                d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"
                              />
                            </svg>
                          </button>
                          <div class="dropdown-menu dropdown-menu-right">
                            {actions(locales.entries).map((a, index) => (
                              <Fragment>
                                <button
                                  onClick={() => {
                                    if (a.id === 'pull_future_reservation' || a.id === 'view_logs') {
                                      return;
                                    }
                                    a.action(channel);
                                    if (a.id === 'edit') {
                                      setTimeout(() => {
                                        this.channel_status = 'edit';
                                      }, 300);
                                    } else {
                                      this.modal_cause = a.action(channel) as any;
                                      this.openModal();
                                    }
                                  }}
                                  key={a.id + '_item'}
                                  class={`dropdown-item my-0 ${a.id === 'remove' ? 'danger' : ''}`}
                                  type="button"
                                >
                                  {a.icon()}
                                  {a.name}
                                </button>
                                {index < actions(locales.entries).length - 1 && <div key={a.id + '_divider'} class="dropdown-divider my-0"></div>}
                              </Fragment>
                            ))}
                          </div>
                        </div>
                      </div>
                    </th>
                  </tr>
                ))}
              </tbody>
            </table>
            {channels_data.connected_channels.length === 0 && <p class="text-center">{locales.entries?.Lcz_NoChannelsAreConnected}</p>}
          </div>
        </section>

        <ir-sidebar
          sidebarStyles={{
            // width: '60rem',
            padding: '0',
          }}
          showCloseButton={false}
          onIrSidebarToggle={this.handleSidebarClose.bind(this)}
          open={this.channel_status !== null}
        >
          {this.channel_status && (
            <ir-channel-editor
              slot="sidebar-body"
              ticket={this.ticket}
              channel_status={this.channel_status}
              onCloseSideBar={this.handleSidebarClose.bind(this)}
            ></ir-channel-editor>
          )}
        </ir-sidebar>

        <ir-modal
          modalTitle={this.modal_cause?.title}
          modalBody={this.modal_cause?.message}
          ref={el => (this.irModalRef = el)}
          rightBtnText={locales.entries?.Lcz_Confirm}
          leftBtnText={locales.entries?.Lcz_Cancel}
          onCancelModal={this.handleCancelModal.bind(this)}
          rightBtnColor={this.modal_cause?.main_color ?? 'primary'}
          onConfirmModal={this.handleConfirmClicked.bind(this)}
        ></ir-modal>
      </Host>
    );
  }
}

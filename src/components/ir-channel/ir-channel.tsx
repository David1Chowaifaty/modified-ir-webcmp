import { RoomService } from '@/services/room.service';
import channels_data, { resetStore } from '@/stores/channel.store';
import locales from '@/stores/locales.store';
import { Component, Host, Prop, Watch, h, Element, State, Fragment } from '@stencil/core';
import axios from 'axios';
import { actions } from './data';

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

  @State() channel_status: 'create' | 'edit' | null = null;

  private roomService = new RoomService();

  componentWillLoad() {
    if (this.baseurl) {
      axios.defaults.baseURL = this.baseurl;
    }
    if (this.ticket !== '') {
      this.initializeApp();
    }
  }
  async initializeApp() {
    try {
      const [, , , languageTexts] = await Promise.all([
        this.roomService.fetchData(this.propertyid, this.language),
        this.roomService.getExposedChannels(),
        this.roomService.getExposedConnectedChannels(this.propertyid),
        this.roomService.fetchLanguage(this.language),
      ]);
      if (!locales.entries) {
        locales.entries = languageTexts.entries;
        locales.direction = languageTexts.direction;
      }
    } catch (error) {
      console.error(error);
    }
  }

  @Watch('ticket')
  async ticketChanged() {
    sessionStorage.setItem('token', JSON.stringify(this.ticket));
    this.initializeApp();
  }
  render() {
    return (
      <Host class="bg-white h-100">
        <section class="p-2">
          <div class="d-flex w-100 justify-content-end mb-2">
            <ir-button text={'Create'} size="sm" onClickHanlder={() => (this.channel_status = 'create')}></ir-button>
          </div>
          <div>
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col" class="text-left">
                    Title
                  </th>
                  <th scope="col">Channel</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody class="">
                {channels_data.connected_channels?.map(channel => (
                  <tr key={channel.channel.id}>
                    <th scope="row" class="text-left">
                      {channel.title}
                    </th>
                    <th scope="row">{channel.channel.name}</th>
                    <td>
                      <ir-switch checked={channel.is_active}></ir-switch>
                    </td>
                    <th>
                      <div class="btn-group">
                        <button type="button" class="btn  dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          <span class="mr-1">Actions</span>
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
                              {index === actions(locales.entries).length - 1 && <div key={a.id + '_divider'} class="dropdown-divider my-0"></div>}
                              <button
                                onClick={() => {
                                  console.log(a.id);
                                  a.action(channel);
                                  if (a.id === 'edit') {
                                    setTimeout(() => {
                                      this.channel_status = 'edit';
                                    }, 300);
                                  }
                                }}
                                key={a.id + '_item'}
                                class={`dropdown-item my-0 ${a.id === 'remove' ? 'danger' : ''}`}
                                type="button"
                              >
                                {a.icon()}
                                {a.name}
                              </button>
                            </Fragment>
                          ))}
                        </div>
                      </div>
                    </th>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <ir-sidebar
          sidebarStyles={{
            width: '60rem',
          }}
          showCloseButton={false}
          onIrSidebarToggle={e => {
            e.stopImmediatePropagation();
            e.stopPropagation();
            this.channel_status = null;
            resetStore();
          }}
          open={this.channel_status !== null}
        >
          {this.channel_status && (
            <ir-channel-editor
              onCloseSideBar={() => {
                this.channel_status = null;
                resetStore();
              }}
            ></ir-channel-editor>
          )}
        </ir-sidebar>
        <ir-modal></ir-modal>
      </Host>
    );
  }
}

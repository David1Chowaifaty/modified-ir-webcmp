import { RoomService } from '@/services/room.service';
import channels_data, { resetStore } from '@/stores/channel.store';
import locales from '@/stores/locales.store';
import { Component, Host, Prop, Watch, h, Element, State } from '@stencil/core';
import axios from 'axios';

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
      const [, , languageTexts] = await Promise.all([
        this.roomService.fetchData(this.propertyid, this.language),
        this.roomService.getExposedChannels(),
        this.roomService.fetchLanguage(this.language),
      ]);
      console.log(languageTexts);
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
      <Host>
        <section class="p-2">
          <div class="d-flex w-100 justify-content-end mb-2">
            <ir-button text={'Create'} size="sm" onClickHanlder={() => (this.channel_status = 'create')}></ir-button>
          </div>
          <div>
            <table class="table">
              <thead class="">
                <tr>
                  <th scope="col" class="text-left">
                    Title
                  </th>
                  <th scope="col">Channel</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
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
                          <button class="dropdown-item border-bottom border-light" type="button">
                            Edit
                          </button>
                          <button class="dropdown-item border-bottom border-light" type="button">
                            View logs
                          </button>
                          <button class="dropdown-item border-bottom border-light" type="button">
                            Full Sync
                          </button>
                          <button class="dropdown-item border-bottom border-light" type="button">
                            Pull Future Reservations
                          </button>
                          <button class="dropdown-item" type="button">
                            Remove
                          </button>
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

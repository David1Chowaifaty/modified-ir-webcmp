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
      const [, , , languageTexts] = await Promise.all([
        this.roomService.fetchData(this.propertyid, this.language),
        this.roomService.getExposedChannels(),
        this.roomService.getExposedConnectedChannels(this.propertyid),
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
      <Host class="bg-white h-100">
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
                          <button class="dropdown-item my-0" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" height="14" width="14" viewBox="0 0 512 512">
                              <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z" />
                            </svg>
                            Edit
                          </button>
                          <div class="dropdown-divider my-0"></div>
                          <button class="dropdown-item" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" height="14" width="14" viewBox="0 0 512 512">
                              <path d="M40 48C26.7 48 16 58.7 16 72v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V72c0-13.3-10.7-24-24-24H40zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zM16 232v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V232c0-13.3-10.7-24-24-24H40c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V392c0-13.3-10.7-24-24-24H40z" />
                            </svg>
                            View logs
                          </button>
                          <div class="dropdown-divider my-0"></div>
                          <button class="dropdown-item" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" height="14" width="14" viewBox="0 0 512 512">
                              <path d="M142.9 142.9c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5c0 0 0 0 0 0H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5c7.7-21.8 20.2-42.3 37.8-59.8zM16 312v7.6 .7V440c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2l41.6-41.6c87.6 86.5 228.7 86.2 315.8-1c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.2 62.2-162.7 62.5-225.3 1L185 329c6.9-6.9 8.9-17.2 5.2-26.2s-12.5-14.8-22.2-14.8H48.4h-.7H40c-13.3 0-24 10.7-24 24z" />
                            </svg>
                            Full Sync
                          </button>
                          <div class="dropdown-divider my-0"></div>
                          <button class="dropdown-item " type="button">
                            Pull Future Reservations
                          </button>
                          <div class="dropdown-divider my-0"></div>
                          <button class="dropdown-item" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
                              <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z" />
                            </svg>
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

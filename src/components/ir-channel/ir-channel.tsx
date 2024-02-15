import { RoomService } from '@/services/room.service';
import channels_data from '@/stores/channel.store';
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
                      <input data-switchery="true" type="checkbox" class="" checked={channel.is_active} />
                    </td>
                    <th>
                      <div class="btn-group">
                        <button type="button" class="btn  dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          Actions
                        </button>
                        <div class="dropdown-menu dropdown-menu-right">
                          <button class="dropdown-item" type="button">
                            Action
                          </button>
                          <button class="dropdown-item" type="button">
                            Another action
                          </button>
                          <button class="dropdown-item" type="button">
                            Something else here
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
          }}
          open={this.channel_status !== null}
        >
          {this.channel_status && <ir-channel-editor onCloseSideBar={() => (this.channel_status = null)}></ir-channel-editor>}
        </ir-sidebar>
      </Host>
    );
  }
}

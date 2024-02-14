import { RoomService } from '@/services/room.service';
import calendar_data from '@/stores/calendar-data';
import { Component, Host, Prop, Watch, h, Element, State } from '@stencil/core';
import axios from 'axios';

@Component({
  tag: 'ir-channel',
  styleUrl: 'ir-channel.css',
  scoped: true,
})
export class IrChannel {
  @Element() el: HTMLElement;

  @Prop() ticket: string;
  @Prop() propertyid: number;
  @Prop() language: string;
  @Prop() baseurl: string;

  @State() channel_status: 'create' | 'edit' | null = null;

  private roomService = new RoomService();

  componentDidLoad() {
    if (this.baseurl) {
      axios.defaults.baseURL = this.baseurl;
    }
    if (this.ticket !== '') {
      this.initializeApp();
    }
  }
  async initializeApp() {
    try {
      await Promise.all([this.roomService.fetchData(this.propertyid, this.language), this.roomService.fetchLanguage(this.language)]);
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
                {calendar_data.channels?.map(channel => (
                  <tr key={channel.id}>
                    <th scope="row" class="text-left">
                      {channel.title}
                    </th>
                    <th scope="row">{channel.name}</th>
                    <td>
                      <input data-switchery="true" type="checkbox" class="" checked={channel.is_active} />
                    </td>
                    <th>
                      <div class="dropdown">
                        <button class="btn dropdown-toggle text-primary" type="button" data-toggle="dropdown" aria-expanded="false">
                          Actions
                        </button>
                        <div class="dropdown-menu dropdown-menu-right">
                          <a class="dropdown-item" href="#">
                            Action
                          </a>
                          <a class="dropdown-item" href="#">
                            Another action
                          </a>
                          <a class="dropdown-item" href="#">
                            Something else here
                          </a>
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
          <ir-channel-editor onCloseSideBar={() => (this.channel_status = null)}></ir-channel-editor>
        </ir-sidebar>
      </Host>
    );
  }
}

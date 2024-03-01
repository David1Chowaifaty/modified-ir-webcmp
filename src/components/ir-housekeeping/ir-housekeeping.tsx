import { IHKStatuses } from '@/models/housekeeping';
import { HouseKeepingService } from '@/services/housekeeping.service';
import { RoomService } from '@/services/room.service';
import housekeeping_store from '@/stores/housekeeping.store';
import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import axios from 'axios';

@Component({
  tag: 'ir-housekeeping',
  styleUrl: 'ir-housekeeping.css',
  scoped: true,
})
export class IrHousekeeping {
  @Prop() language: string = '';
  @Prop() ticket: string = '';
  @Prop() baseurl: string = '';
  @Prop() propertyid: number;

  @State() isLoading = false;
  @State() exposedHouseKeepingStatuses: IHKStatuses[];

  private roomService = new RoomService();
  private houseKeepingService = new HouseKeepingService();

  componentWillLoad() {
    if (this.baseurl) {
      axios.defaults.baseURL = this.baseurl;
    }
    if (this.ticket !== '') {
      this.roomService.setToken(this.ticket);
      this.houseKeepingService.setToken(this.ticket);
      housekeeping_store.token = this.ticket;
      this.initializeApp();
    }
  }
  @Watch('ticket')
  async ticketChanged(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.roomService.setToken(this.ticket);
      this.houseKeepingService.setToken(this.ticket);
      housekeeping_store.token = this.ticket;
      this.initializeApp();
    }
  }

  async initializeApp() {
    try {
      this.isLoading = true;
      const [housekeeping] = await Promise.all([this.houseKeepingService.getExposedHKSetup(this.propertyid)]);
      this.exposedHouseKeepingStatuses = housekeeping.statuses;
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
        <ir-interceptor></ir-interceptor>
        <ir-toast></ir-toast>
        <section class="p-1">
          <div class="card p-1">
            <h4>Room or Unit Status</h4>
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Code</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {this.exposedHouseKeepingStatuses?.map(status => (
                  <tr key={status.code}>
                    <td>
                      <div class="status-container">
                        <span class={`circle ${status.style.shape} ${status.style.color}`}></span>
                        <p>{status.description}</p>
                      </div>
                    </td>
                    <td>{status.code}</td>
                    <td>
                      <div class="action-container">
                        <p class={'m-0'}>{status.action}</p>
                        {status.inspection_mode?.is_active && (
                          <div>
                            <ir-select
                              LabelAvailable={false}
                              firstOption="No"
                              data={Array.from(Array(status.inspection_mode.window + 1), (_, i) => i).map(i => {
                                const text = i === 0 ? 'Yes on the same day.' : i.toString() + ' day prior.';
                                return {
                                  text,
                                  value: i.toString(),
                                };
                              })}
                            ></ir-select>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Host>
    );
  }
}

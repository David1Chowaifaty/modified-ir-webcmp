import channels_data, { selectChannel, testConnection, updateChannelSettings } from '@/stores/channel.store';
import locales from '@/stores/locales.store';
import { Component, Host, Prop, State, h, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'ir-channel-general',
  styleUrl: 'ir-channel-general.css',
  scoped: true,
})
export class IrChannelGeneral {
  @Prop() channel_status: 'create' | 'edit' | null = null;

  @State() buttonClicked: boolean = false;
  @State() connection_status_message = '';
  @State() status: boolean = false;
  @Event() connectionStatus: EventEmitter<boolean>;
  componentWillLoad() {
    if (this.channel_status !== 'create' || !channels_data.isConnectedToChannel) {
      return;
    }
    this.connection_status_message = channels_data.isConnectedToChannel ? locales.entries?.Lcz_ConnectedChannel : '';
    this.status = true;
  }
  handleTestConnectionClicked(e: Event) {
    e.preventDefault();
    this.buttonClicked = true;
    if (this.channel_status !== 'create' || !channels_data.channel_settings?.hotel_id || channels_data.isConnectedToChannel) {
      return;
    }
    const status = testConnection();
    this.status = status;
    this.connection_status_message = status ? locales.entries?.Lcz_ConnectedChannel : locales.entries?.Lcz_IncorrectConnection;
    this.buttonClicked = false;
    this.connectionStatus.emit(this.status);
  }
  render() {
    return (
      <Host class="px-1">
        <section class="ml-18">
          <fieldset class="d-flex align-items-center">
            <label htmlFor="hotel_channels" class="m-0 p-0 label-style">
              {locales.entries?.Lcz_Channel}
            </label>
            <ir-combobox
              input_id="hotel_channels"
              disabled={channels_data.isConnectedToChannel}
              class="flex-fill"
              value={channels_data.selectedChannel?.name}
              onComboboxValueChange={(e: CustomEvent) => {
                selectChannel(e.detail.data.toString());
              }}
              data={
                channels_data.channels.map(channel => ({
                  id: channel.id,
                  name: channel.name,
                })) as any
              }
            ></ir-combobox>
          </fieldset>
          <fieldset class="d-flex align-items-center mt-1">
            <label htmlFor="hotel_title" class="m-0 p-0 label-style">
              {locales.entries?.Lcz_Title}
            </label>
            <div class="flex-fill">
              <input
                id="hotel_title"
                value={channels_data.channel_settings?.hotel_title}
                onInput={e => updateChannelSettings('hotel_title', (e.target as HTMLInputElement).value)}
                class="form-control  flex-fill"
              />
            </div>
          </fieldset>
        </section>
        {channels_data.selectedChannel && (
          <form onSubmit={this.handleTestConnectionClicked.bind(this)} class="mt-3 connection-container">
            <h3 class="text-left font-medium-2  py-0 my-0 connection-title py-1 mb-2">{locales.entries?.Lcz_ConnectionSettings}</h3>
            <div class="ml-18">
              <fieldset class="d-flex align-items-center my-1">
                <label htmlFor="hotel_id" class="m-0 p-0 label-style">
                  {locales.entries?.Lcz_HotelID}
                </label>
                <div class="flex-fill">
                  <input
                    id="hotel_id"
                    disabled={channels_data.isConnectedToChannel}
                    class={`form-control  flex-fill bg-white ${this.buttonClicked && !channels_data.channel_settings?.hotel_id && 'border-danger'}`}
                    value={channels_data.channel_settings?.hotel_id}
                    onInput={e => updateChannelSettings('hotel_id', (e.target as HTMLInputElement).value)}
                  />
                </div>
              </fieldset>
              <div class={'connection-testing-container'}>
                <div class="d-flex align-items-center">
                  {this.connection_status_message &&
                    (this.status ? (
                      <svg xmlns="http://www.w3.org/2000/svg" height="12" width="12" viewBox="0 0 512 512">
                        <path
                          fill="var(--green)"
                          d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"
                        />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" height="12" width="12" viewBox="0 0 512 512">
                        <path
                          fill="var(--yellow)"
                          d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
                        />
                      </svg>
                    ))}
                  <span>{this.connection_status_message}</span>
                </div>
                <button class="btn btn-outline-secondary btn-sm" type="submit">
                  {locales.entries?.Lcz_TestConnection}
                </button>
              </div>
            </div>
          </form>
        )}
      </Host>
    );
  }
}

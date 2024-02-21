import channels_data, { selectChannel, testConnection, updateChannelSettings } from '@/stores/channel.store';
import locales from '@/stores/locales.store';
import { Component, Host, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'ir-channel-general',
  styleUrl: 'ir-channel-general.css',
  scoped: true,
})
export class IrChannelGeneral {
  @Prop() channel_status: 'create' | 'edit' | null = null;

  @State() buttonClicked: boolean = false;
  @State() connection_status_message = '';
  componentWillLoad() {
    if (this.channel_status !== 'create') {
      return;
    }
    this.connection_status_message = channels_data.isConnectedToChannel ? locales.entries?.Lcz_ConnectedChannel : '';
  }
  handleTestConnectionClicked(e: Event) {
    e.preventDefault();
    this.buttonClicked = true;
    if (this.channel_status !== 'create' || !channels_data.channel_settings?.hotel_id || channels_data.isConnectedToChannel) {
      return;
    }
    const status = testConnection();
    this.connection_status_message = status ? locales.entries?.Lcz_ConnectedChannel : locales.entries?.Lcz_IncorrectConnection;
    this.buttonClicked = false;
  }
  render() {
    return (
      <Host>
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
                <span>{this.connection_status_message}</span>
                <button class="btn btn-outline-secondary btn-sm" type="submit">
                  Test Connection
                </button>
              </div>
            </div>
          </form>
        )}
      </Host>
    );
  }
}

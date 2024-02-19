import channels_data, { selectChannel, testConnection, updateChannelSettings } from '@/stores/channel.store';
import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-channel-general',
  styleUrl: 'ir-channel-general.css',
  scoped: true,
})
export class IrChannelGeneral {
  render() {
    return (
      <Host>
        <fieldset class="d-flex align-items-center">
          <label htmlFor="" class="m-0 p-0 label-style">
            Channel:
          </label>
          <ir-combobox
            disabled={channels_data.isConnectedToChannel}
            class="flex-fill"
            value={channels_data.selectedChannel?.name}
            onComboboxValueChange={(e: CustomEvent) => {
              selectChannel(e.detail.data.toString());
            }}
            placeholder="Choose channel from list"
            data={
              channels_data.channels.map(channel => ({
                id: channel.id,
                name: channel.name,
              })) as any
            }
          ></ir-combobox>
        </fieldset>
        {/* <fieldset class="d-flex align-items-center mt-1">
          <label htmlFor="" class="m-0 p-0 label-style">
            Group:
          </label>
          <div class="flex-fill">
            <input class="form-control  flex-fill" />
          </div>
        </fieldset> */}
        <fieldset class="d-flex align-items-center mt-1">
          <label htmlFor="" class="m-0 p-0 label-style">
            Title:
          </label>
          <div class="flex-fill">
            <input
              value={channels_data.channel_settings?.hotel_title}
              onInput={e => updateChannelSettings('hotel_title', (e.target as HTMLInputElement).value)}
              class="form-control  flex-fill"
            />
          </div>
        </fieldset>
        {/* <fieldset class="d-flex align-items-center mt-1">
          <label htmlFor="" class="m-0 p-0 label-style">
            Currency:
          </label>
          <div class="flex-fill">
            <input class="form-control  flex-fill" />
          </div>
        </fieldset> */}
        {channels_data.selectedChannel && (
          <section class="mt-3 connection-container">
            <h3 class="text-left font-medium-2  py-0 my-0 connection-title py-1 mb-2">Connection Settings</h3>
            <fieldset class="d-flex align-items-center my-1">
              <label htmlFor="" class="m-0 p-0 label-style">
                Hotel ID:
              </label>
              <div class="flex-fill">
                <input
                  disabled={channels_data.isConnectedToChannel}
                  class="form-control  flex-fill bg-white"
                  value={channels_data.channel_settings?.hotel_id}
                  onInput={e => updateChannelSettings('hotel_id', (e.target as HTMLInputElement).value)}
                />
              </div>
            </fieldset>
            <div class={'connection-testing-container'}>
              <span>{channels_data.isConnectedToChannel ? 'Connected Channel' : ''}</span>
              <button class="btn btn-outline-secondary btn-sm" onClick={() => testConnection()}>
                Test Connection
              </button>
            </div>
          </section>
        )}
      </Host>
    );
  }
}

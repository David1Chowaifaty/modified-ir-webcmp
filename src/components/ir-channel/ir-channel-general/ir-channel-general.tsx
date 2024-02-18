import channels_data, { selectChannel } from '@/stores/channel.store';
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
            class="ml-1 flex-fill"
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
        <fieldset class="d-flex align-items-center mt-1">
          <label htmlFor="" class="m-0 p-0 label-style">
            Group:
          </label>
          <ir-combobox
            class="ml-1 flex-fill"
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
        <fieldset class="d-flex align-items-center mt-1">
          <label htmlFor="" class="m-0 p-0 label-style">
            Title:
          </label>
          <input class="form-control" />
        </fieldset>
      </Host>
    );
  }
}

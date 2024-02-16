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
        <p>Channel</p>
        <ir-combobox
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
      </Host>
    );
  }
}

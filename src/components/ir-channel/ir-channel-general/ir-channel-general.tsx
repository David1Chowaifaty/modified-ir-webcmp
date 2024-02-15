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
        <ir-select
          selectContainerStyle="mb-1"
          onSelectChange={(e: CustomEvent) => selectChannel(e.detail)}
          class={'m-0 mb-1'}
          LabelAvailable={false}
          data={
            channels_data.channels.map(channel => ({
              value: channel.id,
              text: channel.name,
            })) as any
          }
        ></ir-select>
      </Host>
    );
  }
}

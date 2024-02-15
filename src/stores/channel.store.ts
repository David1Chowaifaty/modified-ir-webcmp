import { IChannel, IExposedChannel, IMap } from '@/models/calendarData';
import { createStore } from '@stencil/store';
export interface IChannelStore {
  channels: IExposedChannel[];
  connected_channels: IChannel[];
  selectedChannel: IExposedChannel | null;
  mappedChannel: IMap[];
}
const initialState: IChannelStore = {
  channels: [],
  selectedChannel: null,
  mappedChannel: [],
  connected_channels: [],
};
export const { state: channels_data, onChange: onChannelChange } = createStore<IChannelStore>(initialState);
export function selectChannel(channel_id: string) {
  if (channel_id === '') {
    channels_data.selectedChannel = null;
    return;
  }
  const selectedChannel = channels_data.channels.find(c => c.id.toString() === channel_id);
  let selectedChannelMap = channels_data.connected_channels.find(c => c.channel.id === selectedChannel.id);
  channels_data.mappedChannel = selectedChannelMap.map;
  channels_data.selectedChannel = selectedChannel;
}
export default channels_data;

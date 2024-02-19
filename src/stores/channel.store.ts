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
export const { state: channels_data, onChange: onChannelChange, dispose } = createStore<IChannelStore>(initialState);
export function selectChannel(channel_id: string) {
  if (channel_id === '') {
    channels_data.selectedChannel = null;
    return;
  }
  const selectedChannel = channels_data.channels.find(c => c.id.toString() === channel_id);
  channels_data.selectedChannel = selectedChannel;
  setMappedChannel();
}
export function setMappedChannel() {
  let selectedChannelMap = channels_data.connected_channels.find(c => c.channel.id === channels_data.selectedChannel.id);
  channels_data.mappedChannel = [...selectedChannelMap.map];
}
export function resetStore() {
  channels_data.selectedChannel = null;
  channels_data.mappedChannel = [];
}
export function addMapping(ir_id: string, fr_id: string) {
  channels_data.mappedChannel.push({
    channel_id: fr_id,
    ir_id,
  });
}
export function removedMapping(ir_id: string) {
  channels_data.mappedChannel = channels_data.mappedChannel.filter(c => c.ir_id !== ir_id);
}
export default channels_data;

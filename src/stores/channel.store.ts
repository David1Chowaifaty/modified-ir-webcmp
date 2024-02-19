import { IChannel, IExposedChannel, IMap } from '@/models/calendarData';
import { createStore } from '@stencil/store';
export interface IChannelSettings {
  hotel_id: string;
  hotel_title: string;
}
export interface IChannelStore {
  channels: IExposedChannel[];
  connected_channels: IChannel[];
  selectedChannel: IExposedChannel | null;
  mappedChannels: IMap[];
  isConnectedToChannel: boolean;
  channel_settings: IChannelSettings | null;
}
const initialState: IChannelStore = {
  channels: [],
  selectedChannel: null,
  mappedChannels: [],
  connected_channels: [],
  isConnectedToChannel: false,
  channel_settings: null,
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
export function updateChannelSettings(key: keyof IChannelSettings, value: string) {
  if (!channels_data.channel_settings) {
    channels_data.channel_settings = {
      hotel_id: '',
      hotel_title: '',
    };
  }
  channels_data.channel_settings[key] = value;
}
export function setMappedChannel() {
  let selectedChannelMap = channels_data.connected_channels.find(c => c.channel.id === channels_data.selectedChannel.id);
  channels_data.mappedChannels = [...selectedChannelMap.map];
}
export function resetStore() {
  channels_data.selectedChannel = null;
  channels_data.mappedChannels = [];
  channels_data.isConnectedToChannel = false;
  channels_data.channel_settings = null;
}
export function addMapping(ir_id: string, fr_id: string) {
  channels_data.mappedChannels.push({
    channel_id: fr_id,
    ir_id,
  });
}
export function removedMapping(ir_id: string) {
  channels_data.mappedChannels = channels_data.mappedChannels.filter(c => c.ir_id !== ir_id);
}
export function testConnection() {
  const hotelConnection = channels_data.selectedChannel.properties.find(property => property.id === channels_data.channel_settings.hotel_id);
  if (!hotelConnection) {
    return;
  }
  channels_data.selectedChannel.property = hotelConnection;
  channels_data.isConnectedToChannel = true;
}
export default channels_data;

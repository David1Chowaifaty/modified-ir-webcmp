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
  property_id: number | null;
}
const initialState: IChannelStore = {
  channels: [],
  selectedChannel: null,
  mappedChannels: [],
  connected_channels: [],
  isConnectedToChannel: false,
  channel_settings: null,
  property_id: null,
};
export const { state: channels_data, onChange: onChannelChange, dispose } = createStore<IChannelStore>(initialState);

export function selectChannel(channel_id: string) {
  if (channel_id === '') {
    channels_data.selectedChannel = null;
    return;
  }
  const selectedChannel = channels_data.channels.find(c => c.id.toString() === channel_id);
  if (selectedChannel) {
    channels_data.selectedChannel = selectedChannel;
  } else {
    channels_data.selectedChannel = {
      id: channel_id,
      name: '',
      properties: [],
    };
  }
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
  let selectedChannelMap = channels_data.connected_channels.find(c => c.channel.id.toString() === channels_data.selectedChannel.id.toString());
  if (!selectedChannelMap) {
    channels_data.mappedChannels = [];
    return;
  }
  channels_data.mappedChannels = [...selectedChannelMap.map];
}
export function resetStore() {
  channels_data.selectedChannel = null;
  channels_data.mappedChannels = [];
  channels_data.isConnectedToChannel = false;
  channels_data.channel_settings = null;
}
export function addMapping(ir_id: string, fr_id: string, isRoomType: boolean) {
  channels_data.mappedChannels.push({
    channel_id: fr_id,
    ir_id,
    type: isRoomType ? 'room_type' : 'rate_plan',
  });
}
export function testConnection() {
  // const hotelConnection = channels_data.selectedChannel.properties.find(property => property.id === 'd09e6374-1ebf-45e0-a130-64c8c9930987');
  const hotelConnection = channels_data.selectedChannel.properties.find(property => property.id === channels_data.channel_settings.hotel_id);
  if (!hotelConnection) {
    return false;
  }
  channels_data.selectedChannel.property = hotelConnection;
  if (channels_data.mappedChannels.length === 0) {
    channels_data.mappedChannels.push({ ir_id: (channels_data.property_id ?? -1).toString(), channel_id: channels_data.channel_settings.hotel_id, type: 'property' });
  }
  channels_data.isConnectedToChannel = true;
  return true;
}
export default channels_data;

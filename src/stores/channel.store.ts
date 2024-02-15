import { IExposedChannel } from '@/models/calendarData';
import { createStore } from '@stencil/store';
export interface IChannelStore {
  channels: IExposedChannel[];
  selectedChannel: IExposedChannel | null;
}
const initialState: IChannelStore = {
  channels: [],
  selectedChannel: null,
};
export const { state: channels_data, onChange: onChannelChange } = createStore<IChannelStore>(initialState);
export function selectChannel(channel_id: string) {
  if (channel_id === '') {
    channels_data.selectedChannel = null;
  }
  channels_data.selectedChannel = channels_data.channels.find(c => c.id.toString() === channel_id);
}
export default channels_data;

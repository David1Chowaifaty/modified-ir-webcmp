import calendar_data from '@/stores/calendar-data';
import channels_data from '@/stores/channel.store';
import axios from 'axios';

export class ChannelService {
  public async getExposedChannels() {
    try {
      const token = JSON.parse(sessionStorage.getItem('token'));
      if (token !== null) {
        const { data } = await axios.post(`/Get_Exposed_Channels?Ticket=${token}`, {});
        if (data.ExceptionMsg !== '') {
          throw new Error(data.ExceptionMsg);
        }
        const results = data.My_Result;
        channels_data.channels = [...results];
        return data;
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  public async getExposedConnectedChannels(property_id: number) {
    try {
      const token = JSON.parse(sessionStorage.getItem('token'));
      if (token !== null) {
        const { data } = await axios.post(`/Get_Exposed_Connected_Channels?Ticket=${token}`, { property_id });
        if (data.ExceptionMsg !== '') {
          throw new Error(data.ExceptionMsg);
        }
        channels_data.connected_channels = [...data.My_Result];
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  public async saveConnectedChannel(is_remove: boolean) {
    try {
      const body = {
        id: channels_data.channel_id,
        title: channels_data.channel_settings.hotel_title,
        is_active: channels_data.is_active,
        channel: { id: channels_data.selectedChannel.id, name: channels_data.selectedChannel.name },
        property: { id: calendar_data.id, name: calendar_data.name },
        map: channels_data.mappedChannels,
        is_remove,
      };
      const token = JSON.parse(sessionStorage.getItem('token'));
      if (!token) {
        throw new Error('Invalid Token');
      }
      const { data } = await axios.post(`/Handle_Connected_Channel?Ticket=${token}`, body);

      return data;
    } catch (error) {
      console.error(error);
    }
  }
}

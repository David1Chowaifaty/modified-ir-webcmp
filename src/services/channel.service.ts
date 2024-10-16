import Token from '@/models/Token';
import calendar_data from '@/stores/calendar-data';
import channels_data from '@/stores/channel.store';
import axios from 'axios';

export class ChannelService extends Token {
  public async getExposedChannels() {
    try {
      const { data } = await axios.post(`/Get_Exposed_Channels`, {});
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      const results = data.My_Result;
      channels_data.channels = [...results];
      return data;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  public async getExposedConnectedChannels(property_id: number) {
    try {
      const { data } = await axios.post(`/Get_Exposed_Connected_Channels`, { property_id });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      channels_data.connected_channels = [...data.My_Result];
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  public async saveConnectedChannel(id: number = null, is_remove: boolean) {
    try {
      let body: any = {};
      if (is_remove) {
        body = {
          id,
          is_remove,
        };
      } else {
        body = {
          id: channels_data.channel_id,
          title: channels_data.channel_settings.hotel_title,
          is_active: channels_data.is_active,
          channel: { id: channels_data.selectedChannel.id, name: channels_data.selectedChannel.name },
          property: { id: calendar_data.id, name: calendar_data.name },
          map: channels_data.mappedChannels,
          is_remove,
        };
      }

      const { data } = await axios.post(`/Handle_Connected_Channel`, body);

      return data;
    } catch (error) {
      console.error(error);
    }
  }
}

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
        channels_data.channels = results;
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
        channels_data.connected_channels = data.My_Result;
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}

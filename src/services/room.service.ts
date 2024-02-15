import calendar_data from '@/stores/calendar-data';
import channels_data from '@/stores/channel.store';
import { locales } from '@/stores/locales.store';
import axios from 'axios';

export class RoomService {
  private token: string;
  constructor() {
    this.token = JSON.parse(sessionStorage.getItem('token'));
  }
  public async fetchData(id: number, language: string) {
    try {
      if (this.token !== null) {
        const { data } = await axios.post(`/Get_Exposed_Property?Ticket=${this.token}`, { id, language });
        if (data.ExceptionMsg !== '') {
          throw new Error(data.ExceptionMsg);
        }
        const results = data.My_Result;
        calendar_data.adultChildConstraints = results.adult_child_constraints;
        calendar_data.allowedBookingSources = results.allowed_booking_sources;
        calendar_data.allowed_payment_methods = results.allowed_booking_methods;
        calendar_data.currency = results.currency;
        calendar_data.is_vacation_rental = results.is_vacation_rental;
        calendar_data.pickup_service = results.pickup_service;
        calendar_data.max_nights = results.max_nights;
        calendar_data.connected_channels = results.connected_channels;
        calendar_data.is_frontdesk_enabled = results.is_frontdesk_enabled;
        return data;
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  public async getExposedChannels() {
    try {
      if (this.token !== null) {
        const { data } = await axios.post(`/Get_Exposed_Channels?Ticket=${this.token}`, {});
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
  public async fetchLanguage(code: string) {
    try {
      if (this.token !== null) {
        const { data } = await axios.post(`/Get_Exposed_Language?Ticket=${this.token}`, { code });
        if (data.ExceptionMsg !== '') {
          throw new Error(data.ExceptionMsg);
        }
        let entries = this.transformArrayToObject(data.My_Result.entries);
        locales.entries = entries;
        locales.direction = data.My_Result.direction;
        return { entries, direction: data.My_Result.direction };
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  private transformArrayToObject(data: any) {
    let object: any = {};
    for (const d of data) {
      object[d.code] = d.description;
    }
    return object;
  }
}

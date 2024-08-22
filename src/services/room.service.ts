import { Token } from '@/models/Token';
import calendar_data from '@/stores/calendar-data';
import { locales } from '@/stores/locales.store';
import axios from 'axios';

export class RoomService extends Token {
  public async fetchData(id: number, language: string, is_backend: boolean = false) {
    try {
      const token = this.getToken();
      if (token !== null) {
        const { data } = await axios.post(`/Get_Exposed_Property?Ticket=${token}`, { id, language, is_backend });
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
        calendar_data.roomsInfo = results.roomtypes;
        calendar_data.taxes = results.taxes;
        calendar_data.id = results.id;
        calendar_data.country = results.country;
        calendar_data.name = results.name;
        calendar_data.tax_statement = results.tax_statement;
        calendar_data.is_frontdesk_enabled = results.is_frontdesk_enabled;
        calendar_data.is_pms_enabled = results.is_pms_enabled;
        return data;
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async fetchLanguage(code: string, sections: string[] = ['_PMS_FRONT']) {
    try {
      const token = this.getToken();
      if (token !== null) {
        const { data } = await axios.post(`/Get_Exposed_Language?Ticket=${token}`, { code, sections });
        if (data.ExceptionMsg !== '') {
          throw new Error(data.ExceptionMsg);
        }
        let entries = this.transformArrayToObject(data.My_Result.entries);
        locales.entries = { ...locales.entries, ...entries };
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

import { BookingColor } from '@/models/booking.dto';
import calendar_data from '@/stores/calendar-data';
import { locales } from '@/stores/locales.store';
import axios from 'axios';

const DEFAULT_BOOKING_COLORS: BookingColor[] = [
  { color: '#F9A9FE', design: 'skew', name: '' },
  { color: '#ffe502', design: 'skew', name: '' },
  { color: '#6FF1EF', design: 'skew', name: '' },
  { color: '#9BF091', design: 'skew', name: '' },
  { color: '#C28D6B', design: 'skew', name: '' },
  { color: '#9B84D6', design: 'skew', name: '' },
];

const FRONT_DESK_STRIPE_COLORS = {
  '#31bef1': '#85d0ff',
  '#45b16d': '#bbdbc4',
  '#FF9149': '#ffcfbc',
  '#a0a0a0': '#d5d5d5',
  '#f34752': '#f8727b',
  '#f88c91': '#f8727b',
  '#F9A9FE': '#fcd8ff',
  '#ffe502': '#fff2b4',
  '#6FF1EF': '#c5f8f7',
  '#9BF091': '#d3f8cf',
  '#C28D6B': '#e5b08f',
  '#9B84D6': '#beadf0',
};

export class RoomService {
  public async SetAutomaticCheckInOut(props: { property_id: number; flag: boolean }) {
    const { data } = await axios.post(`/Set_Automatic_Check_In_Out`, props);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data;
  }

  public async getExposedProperty(params: {
    id: number | null;
    language: string;
    is_backend?: boolean;
    aname?: string;
    include_units_hk_status?: boolean;
    include_sales_rate_plans?: boolean;
  }) {
    try {
      const { data } = await axios.post(`/Get_Exposed_Property`, params);
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      const results = data.My_Result;
      calendar_data.property = { ...results, calendar_extra: results.calendar_extra ? JSON.parse(results.calendar_extra) : null };
      calendar_data.adultChildConstraints = results.adult_child_constraints;
      calendar_data.cleaning_frequency = results.cleaning_frequency;
      calendar_data.allowedBookingSources = results.allowed_booking_sources;
      calendar_data.allowed_payment_methods = results.allowed_payment_methods;
      calendar_data.currency = results.currency;
      calendar_data.is_vacation_rental = results.is_vacation_rental;
      calendar_data.pickup_service = results.pickup_service;
      calendar_data.max_nights = results.max_nights;
      calendar_data.roomsInfo = results.roomtypes;
      calendar_data.taxes = results.taxes;
      calendar_data.id = results.id;
      calendar_data.country = results.country;
      calendar_data.name = results.name;
      calendar_data.is_automatic_check_in_out = results.is_automatic_check_in_out;
      calendar_data.tax_statement = results.tax_statement;
      calendar_data.is_frontdesk_enabled = results.is_frontdesk_enabled;
      calendar_data.is_pms_enabled = results.is_pms_enabled;
      const spitTime = results?.time_constraints?.check_out_till?.split(':');
      calendar_data.checkin_checkout_hours = {
        offset: results.city.gmt_offset,
        hour: Number(spitTime[0] || 0),
        minute: Number(spitTime[1] || 0),
      };
      this.initializeBookingColors();
      this.generateColorForegrounds();
      return data;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  private generateColorForegrounds() {
    const data = {};
    if (!calendar_data.property?.calendar_legends) {
      return;
    }

    calendar_data.property.calendar_legends.forEach(legend => {
      if (legend.design === 'skew') {
        data[legend.color] = {
          foreground: 'white',
          stripe: FRONT_DESK_STRIPE_COLORS[legend.color] ?? '',
        };
      }
    });
    DEFAULT_BOOKING_COLORS.forEach(d => {
      data[d.color] = {
        foreground: ['#C28D6B', '#9B84D6'].includes(d.color) ? 'white' : 'black',
        stripe: FRONT_DESK_STRIPE_COLORS[d.color] ?? '',
      };
    });
    calendar_data.colorsForegrounds = { ...data };
  }
  private initializeBookingColors() {
    const calendarExtra = calendar_data.property.calendar_extra ?? { booking_colors: [] };
    const rawColors = Array.isArray(calendarExtra?.booking_colors) && calendarExtra.booking_colors.length ? calendarExtra.booking_colors : DEFAULT_BOOKING_COLORS;

    const normalized = rawColors.map(color => this.normalizeBookingColor(color));
    this.syncCalendarExtra(normalized);
  }

  private normalizeBookingColor(color: Partial<BookingColor>): BookingColor {
    return {
      design: color.design || 'skew',
      color: color.color || '#ffffff',
      name: color.name || '',
    };
  }

  private syncCalendarExtra(colors: BookingColor[]) {
    const calendarExtra = calendar_data.property.calendar_extra ?? {};
    calendar_data.property.calendar_extra = {
      ...calendarExtra,
      booking_colors: colors.map(color => ({ ...color })),
    };
  }
  public async fetchLanguage(code: string, sections: string[] = ['_PMS_FRONT']) {
    try {
      const { data } = await axios.post(`https://gateway.igloorooms.com/IRBE/Get_Exposed_Language`, { code, sections });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      let entries = this.transformArrayToObject(data.My_Result.entries);
      locales.entries = { ...locales.entries, ...entries };
      locales.direction = data.My_Result.direction;
      //copy entries
      // this.copyEntries(entries);
      return { entries, direction: data.My_Result.direction };
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  // private copyEntries(data: Record<string, string>) {
  //   const typedObject: Record<string, string> = {};
  //   Object.keys(data).forEach(key => {
  //     typedObject[key] = 'string' as unknown as string;
  //   });
  //   const output = Object.keys(typedObject).reduce((acc, key) => {
  //     acc[key] = 'string';
  //     return acc;
  //   }, {} as Record<string, string>);
  //   navigator.clipboard.writeText(JSON.stringify(output, null, 2).replace(/"string"/g, 'string'));
  // }

  private transformArrayToObject(data: any) {
    let object: any = {};
    for (const d of data) {
      object[d.code] = d.description;
    }
    return object;
  }
}

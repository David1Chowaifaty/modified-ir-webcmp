import { z } from 'zod';

import { PropertySchema } from '@/models/property-types';
import calendar_data from '@/stores/calendar-data';
import { downloadFile } from '@/utils/utils';
import axios from 'axios';
export type CountrySalesParams = {
  AC_ID: number;
  WINDOW: number;
  FROM_DATE: string;
  TO_DATE: string;
  BOOK_CASE: string;
  is_export_to_excel: boolean;
};
export type DailyRevenueReportParams = {
  date: string;
  property_id: string;
  is_export_to_excel: boolean;
};
export type MonthlyStatsParams = {
  property_id: number;
  from_date: string;
  to_date: string;
  is_export_to_excel?: boolean;
};
export interface MonthlyStatsResults {
  AverageOccupancy: number;
  DailyStats: DailyStat[];
  ExcelLink: null;
  PeakDays: PeakDay[];
  Occupancy_Difference_From_Previous_Month: number;
  TotalUnitsBooked: number;
  Total_Guests: number;
}

export interface PeakDay {
  Date: string;
  OccupancyPercent: number;
}

export interface DailyStat {
  Date: string;
  Occupancy: number;
  Units_booked: number;
  Rooms_Revenue: number;
  ADR: number;
  Total_Guests: number | undefined;
}

export const SetPropertyCalendarExtraParamsSchema = z.object({
  property_id: z.number(),
  value: z.string(),
});
export type SetPropertyCalendarExtraParams = z.infer<typeof SetPropertyCalendarExtraParamsSchema>;

export const SetRoomCalendarExtraParamsSchema = z.object({
  property_id: z.number(),
  room_identifier: z.string(),
  value: z.string(),
});
export type SetRoomCalendarExtraParams = z.infer<typeof SetRoomCalendarExtraParamsSchema>;

export class PropertyService {
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
      // calendar_data.adultChildConstraints = results.adult_child_constraints;
      // calendar_data.allowedBookingSources = results.allowed_booking_sources;
      // calendar_data.allowed_payment_methods = results.allowed_payment_methods;
      // calendar_data.currency = results.currency;
      // calendar_data.is_vacation_rental = results.is_vacation_rental;
      // calendar_data.pickup_service = results.pickup_service;
      // calendar_data.max_nights = results.max_nights;
      // calendar_data.roomsInfo = results.roomtypes;
      calendar_data.property = PropertySchema.parse(results);
      // calendar_data.taxes = results.taxes;
      // calendar_data.id = results.id;
      // calendar_data.country = results.country;
      // calendar_data.name = results.name;
      // calendar_data.is_automatic_check_in_out = results.is_automatic_check_in_out;
      // calendar_data.tax_statement = results.tax_statement;
      // calendar_data.is_frontdesk_enabled = results.is_frontdesk_enabled;
      // calendar_data.is_pms_enabled = results.is_pms_enabled;
      const spitTime = results?.time_constraints?.check_out_till?.split(':');
      calendar_data.checkin_checkout_hours = {
        offset: results.city.gmt_offset,
        hour: Number(spitTime[0] || 0),
        minute: Number(spitTime[1] || 0),
      };
      return data;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async getCountrySales(params: CountrySalesParams) {
    const { data } = await axios.post('/Get_Country_Sales', params);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    if (params.is_export_to_excel) {
      downloadFile(data.My_Params_Get_Country_Sales.Link_excel);
    }
    return data.My_Result;
  }

  public async getDailyRevenueReport(params: DailyRevenueReportParams) {
    const { data } = await axios.post('/Get_Daily_Revenue_Report', params);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    if (params.is_export_to_excel) {
      downloadFile(data.My_Params_Get_Daily_Revenue_Report.Link_excel);
    }
    return data.My_Result;
  }

  public async setExposedCleaningFrequency(params: { property_id: number; code: string }) {
    const { data } = await axios.post('/Set_Exposed_Cleaning_Frequency', params);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data.My_Result;
  }

  public async setPropertyCalendarExtra(params: SetPropertyCalendarExtraParams) {
    const payload = SetPropertyCalendarExtraParamsSchema.parse(params);
    const { data } = await axios.post('/Set_Property_Calendar_Extra', payload);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data.My_Result;
  }

  public async setRoomCalendarExtra(params: SetRoomCalendarExtraParams) {
    const payload = SetRoomCalendarExtraParamsSchema.parse(params);
    const { data } = await axios.post('/Set_Room_Calendar_Extra', payload);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data.My_Result;
  }

  public async getMonthlyStats(params: MonthlyStatsParams): Promise<MonthlyStatsResults> {
    const { data } = await axios.post('/Get_Monthly_Stats', params);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    if (params.is_export_to_excel) {
      downloadFile(data.My_Params_Get_Monthly_Stats.Link_excel);
    }
    return data.My_Result;
  }
}

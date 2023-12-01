import { DayType, MonthType } from './IBooking';
import { CalendarLegend } from './property-types';

export interface ICalendarData {
  legendData: CalendarLegend[];
  months: MonthType[];
  days: DayType[];
  bookingEvents: [];
  roomsInfo: any;
  monthsInfo: any;
}
export interface IPageTwoDataUpdateProps {
  key: 'applicationInfoUpdateEvent' | 'propertyBookedBy';
  value: any;
}

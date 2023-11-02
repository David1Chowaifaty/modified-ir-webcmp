import { DayType, MonthType } from "./IBooking";
import { CalendarLegend } from "./property-types";

export interface ICalendarData {
  legendData: CalendarLegend[];
  months: MonthType[];
  days: DayType[];
  bookingEvents: [];
  roomsInfo: any;
  monthsInfo: any;
}
export type PageTwoButtonsTypes =
  | "cancel"
  | "save"
  | "back"
  | "book"
  | "bookAndCheckIn";
export interface IPageTwoDataUpdateProps {
  key: "applicationInfoUpdateEvent" | "propertyBookedBy";
  value: any;
}

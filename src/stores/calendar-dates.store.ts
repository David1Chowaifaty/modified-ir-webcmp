import { DayData } from '@/models/DayType';
import { createStore } from '@stencil/store';
export interface ICalendarDates {
  days: DayData[];
  months: { daysCount: number; monthName: string }[];
  fromDate: string;
  toDate: string;
}
const initialState: ICalendarDates = {
  days: [],
  months: [],
  fromDate: '',
  toDate: '',
};
export const { state: calendar_dates, onChange: onCalendarDatesChange } = createStore<ICalendarDates>(initialState);

export default calendar_dates;

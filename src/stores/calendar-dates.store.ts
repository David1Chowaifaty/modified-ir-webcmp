import { DayData } from '@/models/DayType';
import { createStore } from '@stencil/store';
export interface ICalendarDates {
  days: DayData[];
  months: { daysCount: number; monthName: string }[];
}
const initialState: ICalendarDates = {
  days: [],
  months: [],
};
export const { state: calendar_dates, onChange: onCalendarDatesChange } = createStore<ICalendarDates>(initialState);

export default calendar_dates;

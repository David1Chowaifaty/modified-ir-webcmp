import { DayData } from '@/models/DayType';
import { createStore } from '@stencil/store';
import { Task } from '@/models/housekeeping';
export interface ICalendarDates {
  days: DayData[];
  disabled_cells: Map<
    string,
    {
      disabled: boolean;
      reason: 'inventory' | 'stop_sale';
    }
  >;
  months: { daysCount: number; monthName: string }[];
  fromDate: string;
  toDate: string;
  cleaningTasks: Map<number, Map<string, Task>>;
}
const initialState: ICalendarDates = {
  days: [],
  months: [],
  fromDate: '',
  toDate: '',
  disabled_cells: new Map(),
  cleaningTasks: new Map(),
};
export const { state: calendar_dates, onChange: onCalendarDatesChange } = createStore<ICalendarDates>(initialState);

export default calendar_dates;

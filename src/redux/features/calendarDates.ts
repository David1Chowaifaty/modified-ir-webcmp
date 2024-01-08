import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DayData } from '../../models/DayType';
export interface ICalendarDates {
  days: DayData[];
  months: { daysCount: number; monthName: string }[];
}
const initialState: ICalendarDates = {
  days: [],
  months: [],
};

export const calendarDatesSlice = createSlice({
  name: 'calendar_dates',
  initialState,
  reducers: {
    addCalendarDates: (state, action: PayloadAction<ICalendarDates>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    updateCalendarDates: (state, action: PayloadAction<ICalendarDates>) => {
      const updates = action.payload;
      for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
          state[key] = {
            ...state[key],
            ...updates[key],
          };
        }
      }
      return state;
    },
  },
});
export const { addCalendarDates, updateCalendarDates } = calendarDatesSlice.actions;
export default calendarDatesSlice.reducer;

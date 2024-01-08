import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CalendarDataDetails } from '../../models/calendarData';

const initialState: CalendarDataDetails = {
  adultChildConstraints: {
    adult_max_nbr: 0,
    child_max_nbr: 0,
    child_max_age: 0,
  },
  allowedBookingSources: [],
  currency: undefined,
  endingDate: 0,
  formattedLegendData: undefined,
  is_vacation_rental: false,
  legendData: [],
  roomsInfo: [],
  startingDate: 0,
  language: '',
  toBeAssignedEvents: [],
};

export const calendarDataSlice = createSlice({
  name: 'calendar_data',
  initialState,
  reducers: {
    addCalendarData: (state, action: PayloadAction<CalendarDataDetails>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    updateCalendarData: (state, action: PayloadAction<Partial<CalendarDataDetails>>) => {
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
export const { addCalendarData, updateCalendarData } = calendarDataSlice.actions;
export default calendarDataSlice.reducer;

import { configureStore } from '@reduxjs/toolkit';
import languagesSlice from './features/languages';
import calendarDataSlice from './features/calendarData';

export const store = configureStore({
  reducer: {
    languages: languagesSlice,
    calendar_data: calendarDataSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

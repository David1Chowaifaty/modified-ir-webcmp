import { configureStore } from '@reduxjs/toolkit';
import languagesSlice from './features/languages';

export const store = configureStore({
  reducer: {
    languages: languagesSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

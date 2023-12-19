import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Languages {
  entries: { [key: string]: any };
  direction: 'ltr' | 'rtl';
}

const initialState: Languages = {
  entries: {},
  direction: 'ltr',
};

export const languagesSlice = createSlice({
  name: 'languages',
  initialState,
  reducers: {
    addLanguages: (state, action: PayloadAction<Languages>) => {
      const { direction, entries } = action.payload;
      state.entries = entries;
      state.direction = direction;
    },
  },
});
export const { addLanguages } = languagesSlice.actions;
export default languagesSlice.reducer;

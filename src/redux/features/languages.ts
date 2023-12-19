import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Languages {
  entries: Object;
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
    addLanguages: (_state, action: PayloadAction<Languages>) => {
      _state = action.payload;
    },
  },
});
export const { addLanguages } = languagesSlice.actions;
export default languagesSlice.reducer;

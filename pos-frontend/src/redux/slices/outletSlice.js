import { createSlice } from "@reduxjs/toolkit";

const outletSlice = createSlice({
  name: "outlet",
  initialState: {
    selected: null,
    list: []
  },
  reducers: {
    setOutlet: (state, action) => {
      state.selected = action.payload;
    },
    setOutlets: (state, action) => {
      state.list = action.payload;
    }
  }
});

export const { setOutlet, setOutlets } = outletSlice.actions;
export default outletSlice.reducer;

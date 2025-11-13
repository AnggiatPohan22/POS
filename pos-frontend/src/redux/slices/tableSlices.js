import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentTable: null,
};

const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    updateTable: (state, action) => {
      state.currentTable = action.payload.tableNo;
    },
    clearTable: (state) => {
      state.currentTable = null;
    },
  },
});

export const { updateTable, clearTable } = tableSlice.actions;
export default tableSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  outletId: null,   // hanya simpan ID outlet aktif
};

const outletSlice = createSlice({
  name: "outlet",
  initialState,
  reducers: {
    // 🏪 Simpan outlet yang dipilih (ID saja)
    setSelectedOutlet(state, action) {
      state.outletId = action.payload;  // payload = string UUID
    },
    // 🔄 Reset outlet (misal saat logout)
    resetOutlet(state) {
      state.selectedOutletId = null;
    },
  },
});

export const { setSelectedOutlet, resetOutlet } = outletSlice.actions;
export default outletSlice.reducer;

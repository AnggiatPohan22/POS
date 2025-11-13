// src/redux/slices/customerSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "",
  phone: "",
  guests: 1,
  orderType: "Dine-In",
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    setCustomerInfo: (state, action) => {
      state.name = action.payload.name;
      state.phone = action.payload.phone;
      state.guests = action.payload.guests;
      state.orderType = action.payload.orderType;
    },
    clearCustomerInfo: (state) => {
      state.name = "";
      state.phone = "";
      state.guests = 1;
      state.orderType = "Dine-In";
    },
  },
});

export const { setCustomerInfo, clearCustomerInfo } = customerSlice.actions;
export default customerSlice.reducer;

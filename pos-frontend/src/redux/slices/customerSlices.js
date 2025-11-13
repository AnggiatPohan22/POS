import { createSlice } from "@reduxjs/toolkit";

// 🧠 Fungsi untuk generate nomor bill otomatis
const generateBillNo = (orderType) => {
  const prefix = orderType === "Dine-In" ? "DIN" : "TAK";
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${day}${month}${year}-${random}`;
};

const initialState = {
  name: "",
  phone: "",
  guests: 1,
  orderType: "Dine-In",
  billNo: "",
  createdAt: null,
  paidAt: null,
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    // ✅ Set customer info saat buat order
    setCustomerInfo: (state, action) => {
      const { name, phone, guests, orderType } = action.payload;
      state.name = name;
      state.phone = phone;
      state.guests = guests;
      state.orderType = orderType;
      state.billNo = generateBillNo(orderType);
      state.createdAt = new Date().toISOString();
    },

    // ✅ Update waktu paid (setelah payment sukses)
    setPaidTime: (state) => {
      state.paidAt = new Date().toISOString();
    },

    // ✅ Reset customer info setelah transaksi selesai
    resetCustomerInfo: () => initialState,
  },
});

export const { setCustomerInfo, setPaidTime, resetCustomerInfo } = customerSlice.actions;
export default customerSlice.reducer;

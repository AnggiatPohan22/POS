import { createSlice } from "@reduxjs/toolkit";

/**
 * 🧠 Initial state customer order (bill)
 * Digunakan untuk menyimpan:
 * - Informasi customer (nama, phone, outlet, guest)
 * - Nomor bill hasil generate backend
 * - Status & timestamp pembayaran
 */
const initialState = {
  customerId: null, // UUID dari backend (primary key)
  name: "",
  phone: "",
  guests: 1,
  orderType: "Dine-In",
  outletId: null,
  status: "PENDING", // PENDING, PAID, or CANCELLED
  billNumber: "", // dari backend
  createdAt: null,  // UTC timestamp saat bill dibuat
  paidAt: null,     // UTC timestamp saat payment sukses
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    /**
     * 🏁 Dipanggil setelah customer berhasil dibuat di backend
     * Hanya menyimpan data penting yang akan dipakai di step selanjutnya.
     */
    setCustomerInfo: (state, action) => {
    const { customerId, name, phone, guests, outletId, orderType } = action.payload;
    state.customerId = customerId;
    state.name = name;
    state.phone = phone;
    state.guests = guests;
    state.outletId = outletId;
    state.orderType = orderType; // 🔥 penting!
  },


    /**
     * 💳 Dipanggil ketika payment berhasil → update paid timestamp
     */
    setPaidTime: (state, action) => {
      state.paidAt = action.payload;
      state.status = "PAID";
    },

    /**
     * 🔄 Reset semua data customer setelah transaksi selesai/cancel
     */
    resetCustomerInfo: () => initialState,
  },
});

export const {
  setCustomerInfo,
  setPaidTime,
  resetCustomerInfo,
} = customerSlice.actions;

export default customerSlice.reducer;

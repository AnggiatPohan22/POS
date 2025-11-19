import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orderId: null,
  tableId: null,
  tableNo: null,
  billNumber: null,
  orderDate: null,
  items: [],
  total: 0,
  tax: 0,
  totalWithTax: 0,
  status: "PENDING",
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setCurrentOrder: (state, action) => {
      state.orderId = action.payload.orderId || action.payload.id; // 🟢 force string
      state.tableId = action.payload.tableId;
      state.tableNo = action.payload.tableNo;
      state.billNumber = action.payload.billNumber;
      state.orderDate = action.payload.orderDate;
    },


    setOrderTable: (state, action) => {
      state.tableId = action.payload.id;
      state.tableNo = action.payload.tableNo;
    },

    setOrderItems: (state, action) => {
      state.items = action.payload;
    },

    setOrderTotals: (state, action) => {
      const { total, tax, totalWithTax } = action.payload;
      state.total = total;
      state.tax = tax;
      state.totalWithTax = totalWithTax;
    },

    restoreOrderFromDB: (state, action) => {
      const order = action.payload;
      state.orderId = order.id;
      state.items = order.items || [];
      state.total = Number(order.total) || 0;
      state.tax = Number(order.tax) || 0;
      state.totalWithTax = Number(order.totalWithTax) || 0;
      state.tableId = order.tableId || null;
      state.tableNo = order.tables?.tableNo || null;
      state.billNumber = order.billNumber || null;
      state.orderDate = order.orderDate || null;
    },

    clearOrder: () => initialState,
  },
});

export const {
  setCurrentOrder,
  setOrderTable,
  setOrderItems,
  setOrderTotals,
  restoreOrderFromDB,
  clearOrder,
} = orderSlice.actions;

export default orderSlice.reducer;

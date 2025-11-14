import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tables: [],
  selectedTable: null,    // <-- WAJIB ada!
  loading: false,
  error: null,
};

const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    setTables: (state, action) => {
      state.tables = action.payload;
    },

    // Simpan meja yang dipilih user
    setSelectedTable: (state, action) => {
      state.selectedTable = action.payload; 
      // contoh payload: { id: "6740ab...", tableNo: "Table 3" }
    },

    updateTableStatus: (state, action) => {
      const { id, status, currentOrder } = action.payload;
      const index = state.tables.findIndex((t) => t._id === id);
      if (index !== -1) {
        state.tables[index].status = status;
        state.tables[index].currentOrder = currentOrder || null;
      }
    },

    updateTable: (state, action) => {
      const updatedTable = action.payload;
      const index = state.tables.findIndex((t) => t._id === updatedTable._id);
      if (index !== -1) {
        state.tables[index] = updatedTable;
      }
    },

    resetTable: (state) => {
      state.tables = [];
      state.selectedTable = null;   // pastikan direset
      state.loading = false;
      state.error = null;
    },
  },
});

export const { 
  setTables, 
  setSelectedTable,    // <-- EXPORT INI!
  updateTableStatus, 
  updateTable, 
  resetTable 
} = tableSlice.actions;

export default tableSlice.reducer;

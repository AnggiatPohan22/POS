import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import carSlice from "./slices/cartSlices";
import userSlice from "./slices/userSlice";
import customerReducer from "./slices/customerSlices";
import tableReducer from "./slices/tableSlices";
import outletSlice from "./slices/outletSlices";
import orderReducer from "./slices/orderSlices";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["customer", "order"], // hanya data aktif yang disimpan
};

const rootReducer = combineReducers({
  customer: customerReducer,
  order: orderReducer,
  table: tableReducer,
  outlet: outletSlice,
  cart: carSlice,
  user: userSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: true,
});

export const persistor = persistStore(store);

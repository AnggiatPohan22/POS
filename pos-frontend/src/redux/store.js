import { configureStore } from "@reduxjs/toolkit";
import customerSlice from "./slices/customerSlices"
import carSlice from "./slices/cartSlices";
import userSlice from "./slices/userSlice";
import customerReducer from "./slices/customerSlices";
import tableReducer from "./slices/tableSlices";


// File ini di buat setelah instalasi Redux-React
const store = configureStore({
    reducer: {
        customer : customerReducer, //memanggil isi konten file customerSlice.js
        cart : carSlice,
        user : userSlice,
        table : tableReducer,
    },
    
    // code ini untuk melihat data di redux store
    // jangan lupa install extension Redux DevTools di browser
    devTools: true,
});

export default store;

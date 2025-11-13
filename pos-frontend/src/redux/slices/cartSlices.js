import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const cartSlices = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addItems: (state, action) => {
            const newItem = action.payload;
            const existingItem = state.find(item => item.id === newItem.id);
            
            if (existingItem) {
                // ✅ Jika item sudah ada, tambah quantity-nya
                existingItem.quantity += newItem.quantity || 1;
            } else {
                // ✅ Jika item baru, pastikan ada quantity
                state.push({
                    ...newItem,
                    quantity: newItem.quantity || 1
                });
            }
        },

        removeItem: (state, action) => {
            return state.filter(item => item.id !== action.payload);
        },

        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const existingItem = state.find(item => item.id === id);
            
            if (existingItem) {
                if (quantity <= 0) {
                    // ✅ Jika quantity <= 0, remove item
                    return state.filter(item => item.id !== id);
                } else {
                    // ✅ Update quantity
                    existingItem.quantity = quantity;
                }
            }
        },

        incrementQuantity: (state, action) => {
            const id = action.payload;
            const existingItem = state.find(item => item.id === id);
            
            if (existingItem) {
                existingItem.quantity += 1;
            }
        },

        decrementQuantity: (state, action) => {
            const id = action.payload;
            const existingItem = state.find(item => item.id === id);
            
            if (existingItem) {
                if (existingItem.quantity <= 1) {
                    // ✅ Jika quantity jadi 0, remove item
                    return state.filter(item => item.id !== id);
                } else {
                    existingItem.quantity -= 1;
                }
            }
        },

        clearCart: (state) => {
            return [];
        }
    }
});

// ✅ SELECTORS - untuk calculate totals
export const getTotalPrice = (state) => 
    state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);

export const getTotalItems = (state) =>
    state.cart.reduce((total, item) => total + item.quantity, 0);

export const getItemQuantity = (state, itemId) => {
    const item = state.cart.find(item => item.id === itemId);
    return item ? item.quantity : 0;
};

export const getCartItems = (state) => state.cart;

// ✅ Export semua actions
export const { 
    addItems, 
    removeItem, 
    updateQuantity, 
    incrementQuantity, 
    decrementQuantity, 
    clearCart 
} = cartSlices.actions;

export default cartSlices.reducer;
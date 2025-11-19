// src/services/orderService.jsx
import axios from "axios";
import {store} from "../redux/store";

// ➕ update existing order (items, total, etc)
export const updateOrder = async (orderId, payload) => {
  try {
    const res = await axios.put(`http://localhost:8000/api/order/${orderId}`, payload);
    return res.data;
  } catch (err) {
    console.error("❌ updateOrder error:", err.response?.data || err.message);
    return { success: false, message: "Failed to update order" };
  }
};



// Update Order Status (PAID / COMPLETED / dll)
export const updateOrderStatus = async (id, status) => {
  try {
    const res = await axios.put(
      `http://localhost:8000/api/order/${id}`,
      { orderStatus: status }
    );

    return res.data?.success;
  } catch (error) {
    console.error(
      "Update status error:",
      error.response?.data || error.message
    );
    return false;
  }
};



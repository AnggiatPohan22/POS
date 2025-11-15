// src/services/orderService.jsx
import axios from "axios";
import store from "../redux/store";

// Create Order
export const createOrder = async (payload) => {
  console.log("🚀 CreateOrder Payload:", payload);
  try {
    const res = await fetch("http://localhost:8000/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    return await res.json();
  } catch (error) {
    console.error("❌ createOrder Frontend Error:", error);
    return { success: false, message: "Create order failed" };
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



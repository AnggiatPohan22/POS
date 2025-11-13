import axios from "axios";
import Order from "../models/orderModel.js";

export const createVA = async (req, res) => {
  try {
    const { orderId, amount, customerName } = req.body;

    // Validasi input
    if (!orderId || !amount || !customerName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: orderId, amount, customerName"
      });
    }

    // Cek apakah order exists
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Buat Virtual Account via Xendit API
    const response = await axios.post(
      "https://api.xendit.co/callback_virtual_accounts",
      {
        external_id: `order-${orderId}`,
        bank_code: "BCA",
        name: customerName,
        expected_amount: amount,
        is_closed: true,
        expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 jam dari sekarang
        is_single_use: false
      },
      {
        auth: {
          username: process.env.XENDIT_SECRET_KEY,
          password: "",
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const vaData = response.data;

    // Simpan data ke database (update order) - SESUAI SCHEMA
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          "payment.vaExternalId": vaData.external_id,
          "payment.vaAccountNumber": vaData.account_number,
          "payment.bankCode": vaData.bank_code,
          "payment.status": "PENDING",
          "payment.paidAmount": 0
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "VA created successfully",
      order: updatedOrder,
      va: vaData,
    });
  } catch (error) {
    console.error("Error creating VA:", error.response?.data || error.message);
    
    // Error handling yang lebih spesifik
    let errorMessage = "Failed to create virtual account";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.response?.data || error.message
    });
  }
};

export const vaCallback = async (req, res) => {
  try {
    const { external_id, status, amount } = req.body;

    console.log("VA Callback received:", req.body);

    // Validasi callback data
    if (!external_id) {
      return res.status(400).json({
        success: false,
        message: "external_id is required"
      });
    }

    // Cari order berdasarkan vaExternalId
    const order = await Order.findOneAndUpdate(
      { "payment.vaExternalId": external_id },
      {
        $set: {
          "payment.status": status === "PAID" ? "PAID" : "PENDING",
          "payment.paidAmount": amount || 0,
          "payment.paidAt": status === "PAID" ? new Date() : null,
          "orderStatus": status === "PAID" ? "PAID" : "PENDING"
        }
      },
      { new: true }
    );

    if (!order) {
      console.warn("Order not found for external_id:", external_id);
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    console.log("Order updated successfully:", order._id);
    
    // Response untuk Xendit
    res.status(200).json({ 
      success: true, 
      message: "Callback processed successfully",
      order 
    });
  } catch (error) {
    console.error("VA Callback error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

// Tambahkan function untuk get order details
export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get order"
    });
  }
};
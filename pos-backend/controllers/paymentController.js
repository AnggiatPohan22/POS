import axios from "axios";
import prisma from "../config/prismaConfig.js";

export const createVA = async (req, res) => {
  try {
    const { orderId, amount, customerName } = req.body;

    if (!orderId || !amount || !customerName) {
      return res.status(400).json({
        success: false,
        message: "orderId, amount & customerName are required",
      });
    }

    const order = await prisma.orders.findUnique({
      where: { id: Number(orderId) },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const response = await axios.post(
      "https://api.xendit.co/callback_virtual_accounts",
      {
        external_id: `order-${orderId}`,
        bank_code: "BCA",
        name: customerName,
        expected_amount: amount,
        is_closed: true,
        expiration_date: new Date(Date.now() + 86400000),
        is_single_use: false,
      },
      {
        auth: {
          username: process.env.XENDIT_SECRET_KEY,
          password: "",
        },
      }
    );

    const va = response.data;

    const updatedOrder = await prisma.orders.update({
      where: { id: Number(orderId) },
      data: {
        payment_external_id: va.external_id,
        payment_va_number: va.account_number,
        payment_bank_code: va.bank_code,
        payment_status: "PENDING",
        payment_paid_amount: 0,
      },
    });

    res.json({
      success: true,
      message: "VA created successfully",
      order: updatedOrder,
      va,
    });
  } catch (err) {
    console.log("VA Error:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Failed to create VA" });
  }
};

export const vaCallback = async (req, res) => {
  try {
    const { external_id, status, amount } = req.body;

    const order = await prisma.orders.updateMany({
      where: { payment_external_id: external_id },
      data: {
        payment_status: status,
        payment_paid_amount: amount,
        payment_paid_at: status === "PAID" ? new Date() : null,
        orderStatus: status,
      },
    });

    if (!order.count)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, message: "Callback processed successfully" });
  } catch (err) {
    console.log("VA Callback error:", err);
    res.status(500).json({ success: false });
  }
};

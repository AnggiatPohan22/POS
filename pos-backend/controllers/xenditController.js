// controllers/xenditController.js
import Order from "../models/orderModel.js";

export const vaCallback = async (req, res) => {
    try {
        console.log("Callback diterima:", req.body);

        const { external_id, status, amount } = req.body;

        // Update order berdasarkan external_id (karena kita simpan di payment)
        const order = await Order.findOne({ paymentExternalId: external_id });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Update status pembayaran
        order.paymentStatus = status;
        order.paidAmount = amount;
        order.paidAt = new Date();

        await order.save();

        return res.status(200).json({ success: true });
    } catch (error) {
        console.log("Error Callback:", error);
        return res.status(500).json({ success: false });
    }
};

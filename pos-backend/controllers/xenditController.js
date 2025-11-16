import prisma from "../config/prismaConfig.js";

export const vaCallback = async (req, res) => {
  try {
    const { external_id, status, amount } = req.body;

    const order = await prisma.orders.updateMany({
      where: { payment_external_id: external_id },
      data: {
        payment_status: status,
        payment_paid_amount: amount,
        payment_paid_at: new Date(),
        orderStatus: status,
      },
    });

    if (!order.count)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

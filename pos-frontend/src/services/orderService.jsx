// src/services/orderService.jsx
export const createOrder = async ({
  customer,
  cartData,
  total,
  tax,
  totalWithTax,
  tableId,
  status,
}) => {
  try {
    const body = {
      customerName: customer.name,
      customerPhone: customer.phone || "0000000000",
      guests: parseInt(customer.guests, 10) || 1,
      orderType: customer.orderType || "Dine-In",

      items: cartData.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),

      total,
      tax,
      totalWithTax,

      table: tableId || null,
      orderStatus: status, // PENDING / PAID
    };

    const res = await fetch("http://localhost:8000/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    return res.json();
  } catch (error) {
    console.error("❌ createOrder Frontend Error:", error);
    return { success: false, message: "Create order failed" };
  }
};

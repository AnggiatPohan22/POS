// src/components/menu/Bill.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

import { getTotalPrice, clearCart } from "../../redux/slices/cartSlices";
import { useCurrency } from "../hooks/useCurrency";
import PaymentModal from "./PaymentModal";

// Services
import { updateOrder } from "../../services/orderService";

const Bill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formatIDR } = useCurrency();

  // Redux States
  const cartData = useSelector((state) => state.cart);
  const customer = useSelector((state) => state.customer);
  const order = useSelector((state) => state.order);

  const orderId = order?.orderId;

  // Calculations
  const total = useSelector(getTotalPrice);
  const tax = (total * 11) / 100;
  const serviceCharge = (total * 10) / 100;
  const allTotal = total + tax + serviceCharge;

  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // 🧹 Reset session when order completed
  const finishOrderSuccess = async () => {
    dispatch(clearCart());
    navigate("/"); // Kembali ke Home setelah sukses
  };

  // Convert cart → DB payload
  const buildOrderPayload = () => ({
    items: cartData.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      price: i.pricePerQuantity,
      total: i.price,
    })),
    total,
    tax,
    allTotal,
  });

  // 🚀 Processing for Virtual Account or Paid
  const handlePaymentProcess = async (paymentMethodSelected) => {
    try {
      setIsLoading(true);
      console.log("📌 ORDER ID:", orderId);
      const payload = buildOrderPayload();
      const result = await updateOrder(orderId, payload);

      if (!result.success) {
        enqueueSnackbar(result.message || "Failed to process order!", {
          variant: "error",
        });
        return false;
      }

      enqueueSnackbar("Payment Success!", { variant: "success" });
      finishOrderSuccess();
      return true;
    } catch (err) {
      console.error("Payment Error:", err);
      enqueueSnackbar("Payment Error!", { variant: "error" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 🟡 FOR DONE BUTTON → only Save Order (Pending Payment)
  const handlePlaceOrder = async () => {
  if (!paymentMethod) {
    enqueueSnackbar("Please select Done or Payment", { variant: "warning" });
    return;
  }

  if (!orderId) {
    enqueueSnackbar("Active order not found", { variant: "error" });
    return;
  }

  if (!cartData.length) {
    enqueueSnackbar("No items in cart", { variant: "warning" });
    return;
  }

  try {
    setIsLoading(true);

    const payload = {
      orderStatus: "PENDING",
      total,
      tax,
      serviceCharge,
      totalPayment: allTotal,
      items: cartData.map(i => ({
        menuId: i.id,         // 🔥 ID asli dari DB
        qty: i.quantity,
        price: Number(i.price), // 🔥 gunakan price dari redux
        subtotal: i.quantity * Number(i.price)
      })),
    };

    console.log("🛒 UPDATE ORDER PAYLOAD:", payload);

    const result = await updateOrder(orderId, payload);

    if (!result.success) {
      enqueueSnackbar(result.message || "Failed to update order", { variant: "error" });
      return;
    }

    enqueueSnackbar("Order saved successfully!", { variant: "success" });
    await finishOrderSuccess();

  } catch (err) {
    console.error("❌ Save Error:", err);
    enqueueSnackbar("Failed updating order", { variant: "error" });
  } finally {
    setIsLoading(false);
  }
};



  return (
    <>
      {/* Order Summary */}
      <div className="px-5 mb-3 mt-3">
        <div className="bg-[#1f1f1f] rounded-lg p-4 border border-[#383737]">
          <h3 className="text-sm font-semibold text-[#f5f5f5] mb-3">
            Order Summary
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <p className="text-[#ababab]">
                Items ({cartData.reduce((t, i) => t + i.quantity, 0)} pcs)
              </p>
              <span className="text-[#f5f5f5] font-bold">
                {formatIDR(total)}
              </span>
            </div>

            <div className="flex justify-between text-xs">
              <p className="text-[#ababab]">Tax</p>
              <span className="text-[#f5f5f5] font-bold">{formatIDR(tax)}</span>
            </div>

            <div className="flex justify-between text-xs">
              <p className="text-[#ababab]">Service</p>
              <span className="text-[#f5f5f5] font-bold">{formatIDR(serviceCharge)}</span>
            </div>

            <div className="flex justify-between text-sm border-t border-[#383737] pt-2">
              <p className="text-[#f5f5f5] font-semibold">Total Amount</p>
              <span className="text-[#f5f5f5] font-bold">
                {formatIDR(allTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Done | Payment */}
      <div className="flex gap-3 px-5 mb-3">
        <button
          onClick={() => setPaymentMethod("Done")}
          disabled={isLoading}
          className={`flex-1 px-3 py-3 rounded-lg font-semibold text-sm transition-all ${
            paymentMethod === "Done"
              ? "bg-green-600 text-white"
              : "bg-[#1f1f1f] text-[#ababab] hover:bg-[#2a2a2a]"
          }`}
        >
          ✅ Done
        </button>

        <button
          onClick={() => setPaymentMethod("Payment")}
          disabled={isLoading}
          className={`flex-1 px-3 py-3 rounded-lg font-semibold text-sm transition-all ${
            paymentMethod === "Payment"
              ? "bg-blue-600 text-white"
              : "bg-[#1f1f1f] text-[#ababab] hover:bg-[#2a2a2a]"
          }`}
        >
          💳 Payment
        </button>
      </div>

      {/* Confirm */}
      <div className="px-5 mb-4">
        <button
          onClick={handlePlaceOrder}
          disabled={isLoading || cartData.length === 0}
          className={`w-full px-3 py-3 rounded-lg font-semibold text-sm transition-colors ${
            isLoading || cartData.length === 0
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-[#f6b100] text-[#1f1f1f] hover:bg-[#e6a900]"
          }`}
        >
          {isLoading ? "⏳ Processing..." : "Confirm Order"}
        </button>
      </div>

      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onPaymentProcessed={handlePaymentProcess}
        onSuccess={finishOrderSuccess}
      />
    </>
  );
};

export default Bill;

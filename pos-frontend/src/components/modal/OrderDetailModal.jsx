import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "../../utils";
import { X } from "lucide-react";
import axios from "axios";

const OrderDetailModal = ({ order, onClose }) => {

  useEffect(() => {
    const closeOnEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEsc);
    return () => window.removeEventListener("keydown", closeOnEsc);
  }, [onClose]);

  if (!order) return null;

  const handlePayment = async (type) => {
    try {
      if (type === "Cash") {
        await axios.put(`http://localhost:8000/api/order/${order.id}`, {
          orderStatus: "Paid"
        });
      }
      onClose();
      window.location.reload();
    } catch (error) {
      console.log("❌ handlePayment error:", error);
    }
  };

  const handleCancelOrder = async () => {
    const confirm = window.confirm("⚠️ Batalkan Order ini?");
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:8000/api/order/${order.id}`);
      onClose();
      window.location.reload();
    } catch (error) {
      console.log("❌ Error cancel order:", error);
    }
  };

  return (
    <>
      {/** 
       * 🔹 BACKDROP OVERLAY 
       * - initial = kondisi saat pertama render → fade in
       * - exit = kondisi saat ditutup → fade out
       */}
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
        initial={{ opacity: 0 }} // Fade In saat muncul
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }} // Fade Out saat hilang
        transition={{ duration: 0.25 }}
      />

      {/** 
       * 🔹 MODAL SIDE PANEL
       * - initial X = posisi awal di luar layar (kanan)
       * - animate X = masuk ke layar (slide-in)
       * - exit X = keluar lagi ke kanan (slide-out)
       */}
      <motion.div
        className="fixed right-0 top-0 h-full w-[450px] bg-[#1d1d1d] text-white p-6 z-50 shadow-xl overflow-y-auto rounded-l-2xl"
        onClick={(e) => e.stopPropagation()}
        initial={{ x: "100%" }}  // Slide-in From Right
        animate={{ x: 0 }}
        exit={{ x: "100%" }}     // Slide-out To Right
        transition={{
          type: "tween",
          duration: 0.35,
          ease: "easeInOut",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Order Detail</h2>
          <button onClick={onClose}>
            <X className="text-white hover:text-red-500" />
          </button>
        </div>

        {/* Customer + Table */}
        <div className="mb-4">
          <p className="text-sm text-gray-400">Name :</p>
          <p className="text-lg font-semibold">
            {order.customers?.customerName || "Unknown Customer"}
          </p>

          <p className="text-sm text-gray-400 mt-2"></p>
          <span className="bg-yellow-500 text-black px-3 py-1  text-sm font-bold">
            {order.tables?.tableNo ? `Table No : ${order.tables.tableNo}` : "No Table"}
          </span>
        </div>

        {/* Items */}
        <div className="bg-[#2a2a2a] p-4 rounded-xl mb-4 h-52 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Items</h3>
            <button
              className="text-blue-400 text-sm hover:text-blue-300 underline"
              onClick={() => alert('Add Item Popup Coming!')}
            >
              + Add Item
            </button>
          </div>

          {order.items?.length > 0 ? (
            order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm py-1 border-b border-gray-700">
                <span>{item.name || item.menuItemId?.slice(0, 8)}</span>
                <span>{formatCurrency(item.price * item.qty)}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No items yet...</p>
          )}
        </div>


        {/* Totals */}
        <div className="bg-[#222] p-4 rounded-xl space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatCurrency(order.tax)}</span>
          </div>
          <div className="flex justify-between">
            <span>Service Charge</span>
            <span>{formatCurrency(order.serviceCharge)}</span>
          </div>

          <div className="border-t border-gray-600 pt-2 flex justify-between text-base font-semibold">
            <span>Total</span>
            <span className="text-green-400">
              {formatCurrency(order.totalPayment)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            className="bg-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-500 text-sm"
            onClick={() => alert("Print Bill Coming Soon")}
          >
            🧾 Print Bill
          </button>

          {order.orderStatus === "PENDING" && (
            <button
              className="bg-green-600 py-3 rounded-lg font-semibold hover:bg-green-500 text-sm"
              onClick={() => handlePayment("Cash")}
            >
              💵 Paid
            </button>
          )}

          {order.orderStatus === "PAID" && (
            <button
              className="bg-blue-700 py-3 rounded-lg font-semibold hover:bg-blue-600 text-sm"
              onClick={() => handlePayment("Complete")}
            >
              ✔ Completed
            </button>
          )}

          <button
            className="w-full py-2 bg-purple-600 rounded-lg font-semibold hover:bg-purple-500"
            onClick={() => handlePayment("Card")}
          >
            💳 BCA Card
          </button>

          <button
            className="w-full py-2 bg-purple-600 rounded-lg font-semibold hover:bg-purple-500"
            onClick={() => handlePayment("Card")}
          >
            💳 BNI Card
          </button>

          <button
            className="bg-red-600 py-3 rounded-lg font-semibold hover:bg-red-500 text-sm col-span-2"
            onClick={handleCancelOrder}
          >
            ❌ Cancel Order
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default OrderDetailModal;

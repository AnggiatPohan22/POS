// src/components/menu/Bill.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

import { getTotalPrice, clearCart } from "../../redux/slices/cartSlices";
import { resetCustomerInfo } from "../../redux/slices/customerSlices";
import { resetTable } from "../../redux/slices/tableSlices";
import { useCurrency } from "../hooks/useCurrency";
import PaymentModal from "./PaymentModal";

// Services
import { createOrder } from "../../services/orderService";
import { updateTableStatus } from "../../services/tableService";
import { createVA } from "../../services/paymentService";

const Bill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formatIDR } = useCurrency();

  const user = useSelector((state) => state.user);
  const customer = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const selectedTable = useSelector((state) => state.table.selectedTable);

  const total = useSelector(getTotalPrice);
  const tax = (total * 11) / 100;
  const totalWithTax = total + tax;

  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null); // "Done" | "Payment"
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // ✅ Validasi data sebelum submit
  const validateCustomerData = () => {
    if (!customer.name?.trim()) {
      enqueueSnackbar("Please enter customer name", { variant: "warning" });
      return false;
    }
    if (!customer.guests || customer.guests < 1) {
      enqueueSnackbar("Number of guests must be at least 1", {
        variant: "warning",
      });
      return false;
    }
    if (!cartData || cartData.length === 0) {
      enqueueSnackbar("Cart is empty. Please add items first.", {
        variant: "warning",
      });
      return false;
    }
    return true;
  };

  // ✅ Cleanup setelah transaksi sukses (dipakai juga oleh PaymentModal)
  const finishOrderSuccess = async () => {
    dispatch(clearCart());
    dispatch(resetCustomerInfo());

    if (selectedTable?.id) {
      try {
        await updateTableStatus(selectedTable.id, "Available");
      } catch (err) {
        console.error("Failed to update table status:", err);
      }
    }

    dispatch(resetTable());
    navigate("/");
  };

  // 🔥 Function yang dipanggil dari PaymentModal
const handlePaymentProcess = async (paymentMethodSelected) => {
  try {
    setIsLoading(true);

    const status =
      paymentMethodSelected === "Virtual Account BCA" ? "PENDING" : "PAID";

    const result = await createOrder({
      customer,
      cartData,
      total,
      tax,
      totalWithTax,
      tableId: selectedTable?.id || null,
      status,
      paymentMethod: paymentMethodSelected,
    });

    if (!result.success) {
      enqueueSnackbar(result.message || "Failed to process payment", {
        variant: "error",
      });
      return false;
    }

    const orderId = result.data._id;

    // Jika VA maka kita buat Virtual Account
    if (paymentMethodSelected === "Virtual Account BCA") {
      const va = await createVA(
        orderId,
        Math.round(totalWithTax),
        customer?.name
      );

      if (!va.success) {
        enqueueSnackbar("Failed to generate VA!", { variant: "error" });
        return false;
      }

      enqueueSnackbar("VA Generated Successfully!", { variant: "success" });
      return true; // Modal tetap terbuka menunggu callback pembayaran
    }

    // Jika non-VA maka langsung sukses dan cleanup
    enqueueSnackbar("Payment Success!", { variant: "success" });
    return true;
  } catch (err) {
    console.error("Payment Error:", err);
    enqueueSnackbar("Payment Error!", { variant: "error" });
    return false;
  } finally {
    setIsLoading(false);
  }
};


  // ✅ Handler utama ketika klik "Confirm Order"
  const handlePlaceOrder = async () => {
    if (!user?._id) {
      enqueueSnackbar("Please login first!", { variant: "warning" });
      return;
    }

    if (!paymentMethod) {
      enqueueSnackbar("Please select Done or Payment", { variant: "warning" });
      return;
    }

    if (!validateCustomerData()) return;

    // 🔹 Mode Payment → hanya buka modal, order dibuat di PaymentModal
    if (paymentMethod === "Payment") {
      setPaymentModalOpen(true);
      return;
    }

    // 🔹 Mode Done → simpan order saja (status PENDING) tanpa pilih metode pembayaran
    if (paymentMethod === "Done") {
      try {
        setIsLoading(true);

        const result = await createOrder({
          customer,
          cartData,
          total,
          tax,
          totalWithTax,
          tableId: selectedTable?.id || null,
          status: "PENDING", // pending payment
        });

        if (!result.success) {
          enqueueSnackbar(result.message || "Failed to save order", {
            variant: "error",
          });
          return;
        }

        enqueueSnackbar("Order saved successfully!", { variant: "success" });
        await finishOrderSuccess();
      } catch (err) {
        console.error("Save order error:", err);
        enqueueSnackbar("Failed to save order", { variant: "error" });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 🔐 Kalau belum login
  if (!user?._id) {
    return (
      <div className="p-5">
        <div className="bg-[#1f1f1f] p-6 rounded-lg text-center">
          <p className="text-[#ababab] mb-4">Please login to place an order</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-[#f6b100] px-6 py-3 rounded-lg text-[#1f1f1f] font-semibold hover:bg-[#e6a900]"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  // ================== RENDER UI ==================
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
              <p className="text-[#ababab]">Tax (11%)</p>
              <span className="text-[#f5f5f5] font-bold">
                {formatIDR(tax)}
              </span>
            </div>

            <div className="flex justify-between text-sm border-t border-[#383737] pt-2">
              <p className="text-[#f5f5f5] font-semibold">Total Amount</p>
              <span className="text-[#f5f5f5] font-bold">
                {formatIDR(totalWithTax)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Selector Done / Payment */}
      <div className="flex gap-3 px-5 mb-3">
        <button
          onClick={() => setPaymentMethod("Done")}
          disabled={isLoading}
          className={`flex-1 px-3 py-3 rounded-lg font-semibold text-sm transition-all ${
            paymentMethod === "Done"
              ? "bg-green-600 text-white"
              : "bg-[#1f1f1f] text-[#ababab] hover:bg-[#2a2a2a]"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
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
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          💳 Payment
        </button>
      </div>

      {/* Confirm Order */}
      <div className="px-5 mb-4">
        <button
          onClick={handlePlaceOrder}
          disabled={isLoading || !cartData || cartData.length === 0}
          className={`w-full px-3 py-3 rounded-lg font-semibold text-sm transition-colors ${
            isLoading || !cartData || cartData.length === 0
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-[#f6b100] text-[#1f1f1f] hover:bg-[#e6a900]"
          }`}
        >
          {isLoading ? "⏳ Processing..." : "Confirm Order"}
        </button>
      </div>

      {/* Modal Payment → di sini semua createOrder + VA dikerjakan */}
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

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { getTotalPrice } from "../../redux/slices/cartSlices";
import { resetCustomerInfo } from '../../redux/slices/customerSlices';
import { useCurrency } from '../hooks/useCurrency';
import PaymentModal from './PaymentModal';
import { clearCart } from "../../redux/slices/cartSlices";
import { useNavigate } from "react-router-dom";

// Base URL
const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://your-api-domain.com'
    : 'http://localhost:8000';

const Bill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formatIDR } = useCurrency();

  const user = useSelector((state) => state.user);
  const customer = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);

  const taxRate = 11;
  const tax = (total * taxRate) / 100;
  const totalWithTax = total + tax;

  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  // 🧩 Validate data sebelum kirim
  const validateCustomerData = () => {
    if (!customer.name?.trim()) {
      enqueueSnackbar("Please enter customer name", { variant: "warning" });
      return false;
    }
    if (!customer.guests || customer.guests < 1) {
      enqueueSnackbar("Number of guests must be at least 1", { variant: "warning" });
      return false;
    }
    if (cartData.length === 0) {
      enqueueSnackbar("Cart is empty. Please add items first.", { variant: "warning" });
      return false;
    }
    return true;
  };

  // 🧩 Buat order di backend
  const createOrder = async (status = "PENDING") => {
    const orderBody = {
      customerName: customer.name,
      customerPhone: customer?.phone || "0000000000",
      guests: parseInt(customer.guests) || 1,
      orderType: customer.orderType || "Dine-In",
      total,
      tax,
      totalWithTax,
      items: cartData.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        pricePerQuantity: item.pricePerQuantity || item.price,
      })),
      orderStatus: status,
    };

    const response = await fetch(`${API_BASE_URL}/api/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify(orderBody),
    });

    return await response.json();
  };

  // 🧩 Buat Virtual Account via Xendit
  const createVA = async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/api/xendit/create-va`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        amount: Math.round(totalWithTax),
        customerName: customer.name,
      }),
    });

    return await response.json();
  };

    const handleClosePaymentModal = () => {
    setPaymentModalOpen(false); // Tutup modal dulu
    dispatch(clearCart());      // Bersihkan keranjang
    dispatch(resetCustomerInfo()); // Reset data customer

    // Tunggu sedikit biar UX lebih halus
    setTimeout(() => {
        navigate("/"); // Arahkan ke home page
    }, 500);
    };

  // 🧩 Cek status pembayaran
  const checkPaymentStatus = async (orderId) => {
    if (!orderId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/xendit/order/${orderId}`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (data.success) {
        if (data.data.payment.status === "PAID") {
          enqueueSnackbar("✅ Payment confirmed! Thank you for your order.", { variant: "success" });
          setPaymentModalOpen(false);
        } else {
          enqueueSnackbar("⌛ Payment still pending...", { variant: "info" });
        }
      }
    } catch (error) {
      console.error("Error checking payment:", error);
      enqueueSnackbar("Failed to check payment status", { variant: "error" });
    }
  };

  // 🧩 Handler utama
  const handlePlaceOrder = async () => {
    if (!user?._id) {
      enqueueSnackbar("Please login to place an order", { variant: "warning" });
      return;
    }
    if (!paymentMethod) {
      enqueueSnackbar("Please select a payment method", { variant: "warning" });
      return;
    }
    if (!validateCustomerData()) return;

    try {
      setIsLoading(true);

      // ✅ CASH
      if (paymentMethod === "Cash") {
        const result = await createOrder("PAID");

        if (result.success) {
          enqueueSnackbar("✅ Cash payment successful! Order placed.", { variant: "success" });
          dispatch(resetCustomerInfo());
          setPaymentMethod(null);
        } else {
          enqueueSnackbar(result.message || "Failed to create order", { variant: "error" });
        }

        return;
      }

      // ✅ ONLINE
      const orderResult = await createOrder("PENDING");
      if (!orderResult.success || !orderResult.data?._id) {
        enqueueSnackbar(orderResult.message || "Failed to create order", { variant: "error" });
        return;
      }

      const vaResult = await createVA(orderResult.data._id);
      if (vaResult.success) {
        setPaymentData({
          account_number: vaResult.va?.account_number,
          bank_code: vaResult.va?.bank_code,
          expected_amount: vaResult.va?.expected_amount,
          external_id: vaResult.va?.external_id,
          orderId: orderResult.data._id,
          customerName: customer.name,
          totalAmount: formatIDR(totalWithTax),
        });
        setPaymentModalOpen(true);
        enqueueSnackbar("✅ Virtual Account created successfully!", { variant: "success" });
      } else {
        enqueueSnackbar(vaResult.message || "Failed to create VA", { variant: "error" });
      }

    } catch (error) {
      console.error("Frontend Error:", error);
      enqueueSnackbar("Network error. Please try again.", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // 🧩 Render login prompt jika belum login
  if (!user?._id) {
    return (
      <div className="p-5">
        <div className="bg-[#1f1f1f] p-6 rounded-lg text-center">
          <p className="text-[#ababab] mb-4">Please login to place an order</p>
          <button
            onClick={() => (window.location.href = '/login')}
            className="bg-[#f6b100] px-6 py-3 rounded-lg text-[#1f1f1f] font-semibold hover:bg-[#e6a900]"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  // 🧩 Render UI utama
  return (
    <>
      {/* Order Summary */}
      <div className="px-5 mb-3 mt-3">
        <div className="bg-[#1f1f1f] rounded-lg p-4 border border-[#383737]">
          <h3 className="text-sm font-semibold text-[#f5f5f5] mb-3">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <p className="text-[#ababab]">Items ({cartData.reduce((t, i) => t + i.quantity, 0)} pcs)</p>
              <span className="text-[#f5f5f5] font-bold">{formatIDR(total)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <p className="text-[#ababab]">Tax (11%)</p>
              <span className="text-[#f5f5f5] font-bold">{formatIDR(tax)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-[#383737] pt-2">
              <p className="text-[#f5f5f5] font-semibold">Total Amount</p>
              <span className="text-[#f5f5f5] font-bold">{formatIDR(totalWithTax)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Selection */}
      <div className="flex gap-3 px-5 mb-3">
        {["Cash", "Online"].map((type) => (
          <button
            key={type}
            onClick={() => setPaymentMethod(type)}
            disabled={isLoading}
            className={`flex-1 px-3 py-3 rounded-lg font-semibold text-sm transition-all
              ${paymentMethod === type
                ? "bg-[#383737] border-2 border-[#f6b100] text-[#f6b100]"
                : "bg-[#1f1f1f] text-[#ababab] hover:bg-[#2a2a2a] border border-[#383737]"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {type === "Cash" ? "💵 Cash" : "🏦 Online"}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="px-5">
        <div className="bg-[#1f1f1f] rounded-lg p-4 border border-[#383737]">
          <div className="flex gap-3">
            <button
              className="bg-[#025cca] flex-1 px-3 py-3 rounded-lg text-[#f5f5f5] font-semibold hover:bg-[#024aa6]"
              onClick={() => enqueueSnackbar("🖨️ Print feature coming soon!", { variant: "info" })}
            >
              🖨️ Print
            </button>

            <button
              onClick={handlePlaceOrder}
              disabled={isLoading || cartData.length === 0}
              className={`flex-1 px-3 py-3 rounded-lg font-semibold text-sm transition-colors
                ${isLoading || cartData.length === 0
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-[#f6b100] text-[#1f1f1f] hover:bg-[#e6a900]"
                }`}
            >
              {isLoading
                ? "⏳ Processing..."
                : paymentMethod === "Online"
                  ? "💳 Pay Now"
                  : "✅ Place Order"}
            </button>
          </div>

          {cartData.length === 0 && (
            <p className="text-xs text-yellow-400 text-center mt-3">
              🛒 Your cart is empty. Add some items first!
            </p>
          )}
        </div>
      </div>



      {/* Payment Modal */}
      <PaymentModal
        open={paymentModalOpen}
        onClose={() => handleClosePaymentModal()}
        data={paymentData}
        onCheckStatus={() => checkPaymentStatus(paymentData?.orderId)}
      />

    </>
  );
};

export default Bill;

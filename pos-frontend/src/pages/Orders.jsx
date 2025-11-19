import React, { useState, useEffect } from "react";
import axios from "axios";
import BottomNav from "../components/shared/BottomNav";
import OrderCards from "../components/orders/OrderCards";
import BackButton from "../components/shared/BackButton";
import OrderDetailModal from "../components/modal/OrderDetailModal";
import { AnimatePresence } from "framer-motion";

const Orders = () => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/order");
      setOrders(res.data.data || []);
    } catch (err) {
      console.log("Fetch Orders Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🔥 STATUS OPTIONS
  const STATUS_OPTIONS = ["All", "Pending", "Paid", "Cancelled", "Completed"];

  // 🔥 FILTER + SORT ORDER DATA
  const filteredOrders = orders
    .filter((o) => {
      if (statusFilter === "All") return true;
      return o.orderStatus?.toUpperCase() === statusFilter.toUpperCase();
    })
    .sort((a, b) => {
      // ✔ Completed selalu di bawah
      if (a.orderStatus === "COMPLETED") return 1;
      if (b.orderStatus === "COMPLETED") return -1;
      return new Date(b.orderDate) - new Date(a.orderDate);
    });

  return (
    <section className="bg-[#1f1f1f] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-white text-2xl font-bold">Orders</h1>
        </div>

        {/* 🔥 STATUS FILTER */}
      <div className="flex gap-2 px-6 pb-2 overflow-x-auto scrollbar-hide">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-lg text-sm font-semibold transition
              ${
                statusFilter === s
                  ? "bg-[#383838] text-white"
                  : "text-gray-400 hover:bg-[#2e2e2e]"
              }
            `}
          >
            {s}
          </button>
        ))}
      </div>

      </div>

      {/* List Orders */}
      <div className="px-4 py-4 flex flex-wrap gap-4 justify-center md:justify-start">
        {loading ? (
          <div className="text-white text-lg py-10">Loading orders...</div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCards
              key={order.id}
              data={order}
              onSelect={() => setSelectedOrder(order)}
            />
          ))
        ) : (
          <p className="text-gray-400 text-lg py-10">No orders found</p>
        )}
      </div>

      {/* 🔥 Modal Order Detail */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </AnimatePresence>

      <BottomNav />
    </section>
  );
};

export default Orders;

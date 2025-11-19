import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { AnimatePresence } from "framer-motion";
import OrderList from "./OrderList";
import OrderDetailModal from "../modal/OrderDetailModal";
import axios from "axios";


const RecentOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null); 
  

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/order");
      setOrders(res.data.data);
    } catch (error) {
      console.log("❌ Failed to fetch orders:", error);
    }
  };

  // 🔎 Filter search by customer name or bill number
  const filteredOrders = orders.filter((order) =>
    order.customers?.name?.toLowerCase().includes(search.toLowerCase()) ||
    order.billNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-8 mt-2">
      <div className="bg-[#1a1a1a] w-full h-[420px] rounded-lg">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
            Recent Orders
          </h1>

          {/* Search */}
          <div className="flex items-center gap-2 bg-[#1f1f1f] rounded-[12px] px-4 py-2 mx-6">
            <FaSearch className="text-[#f5f5f5]" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#1f1f1f] outline-none text-[#f5f5f5] w-40"
            />
          </div>

          <button className="text-[#025cca] text-sm font-semibold">
            View All
          </button>
        </div>

        {/* List */}
        <div className="mt-4 px-6 overflow-y-scroll h-[320px] scrollbar-hide">
          {filteredOrders.length === 0 ? (
            <p className="text-gray-400">No matching orders...</p>
          ) : (
            filteredOrders.slice(0, 10).map((order) => (
              <OrderList 
              key={order.id}
              order={order}
              onSelect={() => setSelectedOrder(order)}
              />
            ))
          )}
        </div>
        <AnimatePresence>
          {selectedOrder && (
            <OrderDetailModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RecentOrders;

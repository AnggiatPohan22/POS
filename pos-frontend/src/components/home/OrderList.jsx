import React from "react";
import { formatCurrency } from "../../utils/index"; // adjust path sesuai folder
import { useNavigate } from "react-router-dom";

const OrderList = ({ order, onSelect }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={onSelect}
      className="flex justify-between items-center py-3 border-b border-gray-700 cursor-pointer hover:bg-[#222] transition rounded-lg px-3"
    >
      {/* Customer Name */}
      <div>
        <h4 className="text-white font-semibold">
          {order.customers?.customerName || "Unknown"}
        </h4>
        <p className="text-gray-400 text-sm">
          {formatCurrency(order.totalPayment)}
        </p>
      </div>

      {/* Table No */}
      <span className="bg-yellow-500 text-black px-3 py-1 rounded-lg text-sm font-bold">
        {order.tables?.tableNo
          ? `Table No : ${order.tables.tableNo}`
          : "No Table"}
      </span>

      {/* Status */}
      <div
        className={`text-sm font-semibold ${
          order.orderStatus === "Pending"
            ? "text-yellow-400"
            : order.orderStatus === "Ready"
            ? "text-green-400"
            : "text-gray-400"
        }`}
      >
        {order.orderStatus || "Pending"}
      </div>
    </div>
  );
};

export default OrderList;

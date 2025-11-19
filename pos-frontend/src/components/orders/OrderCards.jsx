import React from "react";
import { formatCurrency } from "../../utils";

const OrderCards = ({ data, onSelect }) => {
    
  const customerName = data?.customers?.customerName || "Unknown Customer";
  const avatar = customerName?.substring(0, 2).toUpperCase();
  const tableNo = data?.tables?.tableNo;
  const status = data?.orderStatus?.toUpperCase() || "PENDING";
  const itemsCount = data?.items?.reduce((acc, i) => acc + (i.qty || 1), 0) || 0;
  const amount = Number(data?.totalPayment) || 0;
  const outletCode = data?.outlets?.code;

  // 🔥 Outlet Theme by Code
  const outletTheme = {
    NR: "bg-purple-600",  // Nexos Restaurant
    NB: "bg-red-600",     // Nexos Bar
  };

  const colorClass = outletTheme[outletCode] || "bg-gray-600";

  // 🔥 Status UI style
  const statusStyle = {
    PENDING: "text-yellow-400",
    PAID: "text-green-400",
    COMPLETED: "text-blue-400",
  }[status];

  return (
    <div 
      className="w-full max-w-[420px] bg-[#262626] p-5 rounded-xl cursor-pointer hover:bg-[#2d2d2d] transition border border-[#383838]"
      onClick={() => onSelect && onSelect(data)}
    >

      {/* Avatar + Details */}
      <div className="flex justify-between items-start gap-4">
        
        {/* Avatar */}
        <div className={`${colorClass} w-[55px] h-[55px] rounded-lg flex items-center justify-center text-xl font-bold`}>
          {avatar}
        </div>

        {/* Details */}
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg truncate">
            {customerName}
          </h3>

          {/* Bill / Type / Table */}
          <p className="text-gray-400 text-sm mt-1 flex flex-wrap gap-2">
            <span>#{data.billNumber}</span>
            <span>•</span>
            <span>{data.orderType}</span>
            {tableNo && (
              <>
                <span>•</span>
                <span>Table {tableNo}</span>
              </>
            )}
            <span>•</span>
            <span>{outletCode}</span>
          </p>
        </div>

        {/* Status */}
        <span className={`${statusStyle} text-sm font-bold`}>
          {status}
        </span>
      </div>

      {/* Footer Order Info */}
      <div className="flex justify-between items-center mt-4 text-gray-400 text-sm">
        <span>{itemsCount} items</span>
        <span>{formatCurrency(amount)}</span>
      </div>

    </div>
  );
};

export default OrderCards;

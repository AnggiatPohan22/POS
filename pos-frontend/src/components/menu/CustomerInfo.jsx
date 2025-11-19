import React from "react";
import { useSelector } from "react-redux";
import { formatDate, getAvatarName } from "../../utils";

const CustomerInfo = () => {
  const customerData = useSelector((state) => state.customer);
  const order = useSelector((state) => state.order);

  // Ambil orderDate dari backend & format
  const formattedDate = order.orderDate
    ? formatDate(new Date(order.orderDate))
    : "Order Date";

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#1f1f1f] rounded-lg shadow-md">

      {/* INFO CUSTOMER */}
      <div className="flex flex-col items-start">
        <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide">
          {customerData.name || "Customer Name"}
        </h1>

        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-[#ababab] font-medium">
            #{order.billNumber || "No Bill"}
          </p>
          <p className="text-xs text-[#ababab] font-medium">|</p>
          <p className="text-xs text-[#ababab] font-medium">
            {customerData.orderType || "Order Type"}
          </p>
        </div>

        <p className="text-xs text-[#ababab] font-medium mt-2">
          {formattedDate}
        </p>
      </div>

      {/* AVATAR */}
      <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg text-[#1f1f1f]">
        {getAvatarName(customerData.name)}
      </button>

    </div>
  );
};

export default CustomerInfo;

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { formatDate, getAvatarName } from "../../utils";

const CustomerInfo = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const customerData = useSelector((state) => state.customer);

  // Auto-update waktu tiap menit
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#1f1f1f] rounded-lg shadow-md">
      {/* Info Customer */}
      <div className="flex flex-col items-start">
        <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide">
          {customerData.name || "Customer Name"}
        </h1>

        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-[#ababab] font-medium">
            #{customerData.billNo || "No Bill"}
          </p>
          <p className="text-xs text-[#ababab] font-medium">|</p>
          <p className="text-xs text-[#ababab] font-medium">
            {customerData.orderType || "Order Type"}
          </p>
        </div>

        <p className="text-xs text-[#ababab] font-medium mt-2">
          {formatDate(dateTime)}
        </p>
      </div>

      {/* Avatar */}
      <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg text-[#1f1f1f]">
        {getAvatarName(customerData.name) || "CN"}
      </button>
    </div>
  );
};

export default CustomerInfo;

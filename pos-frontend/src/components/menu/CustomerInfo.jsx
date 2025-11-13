import React from 'react';
import { useSelector } from 'react-redux';
import { formatDate, getAvatarName } from '../../utils';

const CustomerInfo = () => {
  const customerData = useSelector(state => state.customer);
  const dateTime = new Date();

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex flex-col items-start">
        <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide">
          {customerData?.name || "Customer Name"}
        </h1>
        <div className='flex flex-center gap-2'>
          <p className="text-[10px] text-[#ababab] font-medium mt-1">
            {customerData?.orderId || "No Bill"}
          </p>
          <p className="text-[10px] text-[#ababab] font-medium mt-1">|</p>
          <p className="text-[10px] text-[#ababab] font-medium mt-1">
            {customerData?.orderType || "Type Consume"}
          </p>
        </div>
        <p className="text-xs text-[#ababab] font-medium mt-2">
          {formatDate(dateTime)}
        </p>
      </div>
      <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg">
        {getAvatarName(customerData?.name) || "CN"}
      </button>
    </div>
  );
};

export default CustomerInfo;

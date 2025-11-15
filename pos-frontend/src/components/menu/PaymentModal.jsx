import React, { useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaUniversity,
  FaWallet,
  FaBed,
  FaQrcode,
} from "react-icons/fa";
import { SiVisa, SiMastercard } from "react-icons/si";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { MdLocalOffer, MdCreditCard } from "react-icons/md";
import { enqueueSnackbar } from "notistack";

const PaymentModal = ({
  open,
  onClose,
  onPaymentProcessed,
  onSuccess,
}) => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!open) return null;

  const paymentGroups = [
    {
      label: "BCA",
      color: "bg-blue-700",
      icon: <FaUniversity size={18} />,
      methods: [
        { name: "QRIS", icon: <FaQrcode size={16} /> },
        { name: "Debit", icon: <MdCreditCard size={16} /> },
        { name: "VISA", icon: <SiVisa size={16} /> },
        { name: "MasterCard", icon: <SiMastercard size={16} /> },
      ],
    },
    {
      label: "BNI",
      color: "bg-orange-600",
      icon: <FaUniversity size={18} />,
      methods: [
        { name: "QRIS", icon: <FaQrcode size={16} /> },
        { name: "Debit", icon: <MdCreditCard size={16} /> },
        { name: "VISA", icon: <SiVisa size={16} /> },
        { name: "MasterCard", icon: <SiMastercard size={16} /> },
      ],
    },
    {
      label: "E-Wallet",
      color: "bg-purple-700",
      icon: <FaWallet size={18} />,
      methods: [
        { name: "Gopay", icon: <FaWallet size={16} /> },
        { name: "OVO", icon: <FaWallet size={16} /> },
        { name: "DANA", icon: <FaWallet size={16} /> },
      ],
    },
  ];

  const miscPayments = [
    { name: "Cash", icon: <RiMoneyDollarCircleFill />, color: "bg-green-700" },
    { name: "Voucher", icon: <MdLocalOffer />, color: "bg-yellow-700" },
    { name: "Charge To Room", icon: <FaBed />, color: "bg-blue-900" },
    { name: "Virtual Account BCA", icon: <FaUniversity />, color: "bg-blue-600" },
  ];

  const handleGroupToggle = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const handleClickProcess = async () => {
  if (isProcessing) return; // prevent spam clicking

  if (!selectedPayment)
    return enqueueSnackbar("Select payment method", { variant: "warning" });

  try {
    setIsProcessing(true);
    const success = await onPaymentProcessed(selectedPayment);

    if (success) {
      await onSuccess();
      onClose();
    }
  } catch (err) {
    console.error(err);
    enqueueSnackbar("Payment error", { variant: "error" });
  } finally {
    setIsProcessing(false);
  }
};
  


  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[999]">
      <div className="bg-[#222] rounded-xl p-6 w-[600px] border border-[#333] shadow-xl shadow-black/40">
        <h3 className="text-[#f6b100] font-bold text-lg mb-4 text-center">
          Select Payment Method
        </h3>

        <div className="grid grid-cols-2 gap-4">

          {paymentGroups.map((group) => (
            <div key={group.label} className="col-span-2 space-y-2">
              <button
                onClick={() => handleGroupToggle(group.label)}
                className={`w-full py-3 rounded-lg flex justify-between items-center px-4 text-sm font-semibold text-white ${group.color}`}
              >
                <span className="flex items-center gap-2">
                  {group.icon} {group.label}
                </span>
                {openDropdown === group.label ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </button>

              {openDropdown === group.label && (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {group.methods.map((method) => (
                    <button
                      key={method.name}
                      onClick={() =>
                        setSelectedPayment(`${group.label} - ${method.name}`)
                      }
                      className={`py-2 text-xs font-semibold rounded-lg border flex justify-center gap-2
                      ${
                        selectedPayment === `${group.label} - ${method.name}`
                          ? "border-[#f6b100] text-[#f6b100] bg-[#2e2e2e]"
                          : "border-[#444] text-white hover:bg-[#333]"
                      }`}
                    >
                      {method.icon} {method.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {miscPayments.map(({ name, icon, color }) => (
            <button
              key={name}
              onClick={() => setSelectedPayment(name)}
              className={`col-span-1 py-3 font-semibold rounded-lg flex justify-center items-center gap-2 text-white ${color}
              ${
                selectedPayment === name
                  ? "ring-2 ring-yellow-400 shadow-lg shadow-yellow-900/50"
                  : "hover:opacity-85"
              }`}
            >
              {icon} {name}
            </button>
          ))}
        </div>

        <div className="flex justify-between gap-3 mt-6">
          <button
            onClick={onClose}
            className="w-1/2 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold"
          >
            Close
          </button>

          <button
            onClick={handleClickProcess}
            disabled={!selectedPayment || isProcessing}
            className={`w-1/2 py-3 rounded-lg font-semibold transition-all
              ${
                isProcessing
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-[#f6b100] text-black hover:bg-[#d99a00]"
              }`}
          >
            {isProcessing ? "Processing..." : "Process"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

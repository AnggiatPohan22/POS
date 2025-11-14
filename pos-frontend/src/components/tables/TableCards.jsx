import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAvatarName } from "../../utils";
import { setSelectedTable } from "../../redux/slices/tableSlices";
import { enqueueSnackbar } from "notistack";

const TableCards = ({ id, name, status, initials, seat }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isBooked, setIsBooked] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  // 🔍 Cek apakah table sedang ada order aktif
  useEffect(() => {
    const checkActiveOrder = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/order/check/${id}`);
        console.log(`Table ${name} Dine-In status →`, res.data?.isBooked);

        setIsBooked(res.data?.isBooked || false);
      } catch (error) {
        console.error("❌ Error checking active order:", error);
      }
    };

    checkActiveOrder();
  }, [id, API_BASE_URL]);

  // 🧠 Saat klik table → arah ke Menu dan simpan table yang dipilih
  const handleClick = () => {
    if (isBooked) return;

    dispatch(setSelectedTable({ id, tableNo: name }));
    console.log("🟢 Table Selected:", { id, tableNo: name });

    navigate("/menu");
  };

  return (
    <div
      onClick={!isBooked ? handleClick : undefined}
      className={`w-[260px] h-[180px] p-4 rounded-xl transition relative
        ${isBooked 
          ? "bg-[#0f271e] border border-green-700 cursor-not-allowed shadow-lg shadow-green-900/50 animate-glow"
          : "bg-[#262626] hover:bg-[#383838] cursor-pointer shadow-md shadow-black/30"
        }`}
    >

      {/* Table Header */}
      <div className="flex items-center justify-between px-1">
        <h1 className="text-[#f5f5f5] text-lg font-bold">{name}</h1>
        <span
          className={`px-2 py-1 text-xs rounded-md font-semibold
            ${isBooked ? "bg-green-700 text-white" : "bg-yellow-700 text-white"}`}
        >
          {isBooked ? "Dine-In" : "Available"}
        </span>
      </div>

      {/* Avatar */}
      <div className="flex items-center justify-center my-3">
        <h1
          className={`rounded-full p-4 text-xl font-bold
            ${isBooked ? "bg-green-600 text-white" : "bg-[#664a04] text-white"}`}
        >
          {isBooked && initials ? getAvatarName(initials) : "N/A"}
        </h1>
      </div>

      {/* Customer Display */}
      {isBooked && initials ? (
        <p className="text-xs text-green-400 text-center font-medium">
          Dine-In by <span className="font-bold text-green-300">{initials}</span>
        </p>
      ) : (
        <p className="text-xs text-[#ababab] text-center">Seats: {seat}</p>
      )}

    </div>
  );
};

export default TableCards;

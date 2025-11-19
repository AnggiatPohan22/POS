import React from "react";

const getInitials = (name) => {
  if (!name) return "NA";
  const parts = name.split(" ");
  return `${parts[0][0] || ""}${parts[1]?.[0] || ""}`.toUpperCase();
};

const TableCards = ({ id, tableNo, seats, isBooked, initials, onSelect }) => {
  return (
    <div
      onClick={() => !isBooked && onSelect({ id, tableNo, seats })}
      className={`
        w-[260px] h-[180px] p-4 rounded-xl transition text-white
        ${isBooked
          ? "bg-[#502020] border border-red-700 cursor-not-allowed"
          : "bg-[#262626] hover:bg-[#383838] cursor-pointer"
        }
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        {/* 👉 Menampilkan nomor meja */}
        <p className="font-bold text-xm">Table {tableNo}</p>

        <span
          className={`px-2 py-1 text-xs rounded-md font-semibold ${
            isBooked ? "bg-blue-700" : "bg-green-600"
          }`}
        >
          {isBooked ? "Occupied" : "Available"}
        </span>
      </div>

      {/* Avatar */}
      <div className="flex justify-center mt-4">
        <div
          className={`
            w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold
            ${isBooked ? "bg-blue-500" : "bg-[#f0be2a]"}
          `}
        >
          {isBooked ? getInitials(initials) : "NA"}
        </div>
      </div>

      <p className="text-center text-gray-300 text-sm mt-2">
        Seats: {seats}
      </p>
    </div>
  );
};

export default TableCards;

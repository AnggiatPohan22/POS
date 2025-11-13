import React, { useState } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { addTable } from "../../https"; // pastikan path benar

const Modal = ({ setIsTableModalOpen }) => {
  const [tableData, setTableData] = useState({
    tableNo: "",
    seats: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTableData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      tableNo: Number(tableData.tableNo),
      seats: Number(tableData.seats),
    };

    tableMutation.mutate(payload);
  };

  const handleCloseModal = () => {
    setIsTableModalOpen(false);
  };

  const tableMutation = useMutation({
    mutationFn: (reqData) => addTable(reqData),

    onSuccess: (res) => {
      enqueueSnackbar(res.message || "Table added!", { variant: "success" });
      setIsTableModalOpen(false);
    },

    onError: (error) => {
      const message =
        error.response?.data?.message || "Something went wrong";

      enqueueSnackbar(message, { variant: "error" });

      console.log("❌ Error from server:", message);
    },
  });

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-[#262626] p-6 rounded-lg shadow-lg w-96"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#f5f5f5] text-xl font-semibold">Add Table</h2>
          <button
            onClick={handleCloseModal}
            className="text-[#f5f5f5] hover:text-red-500"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-10">
          <div>
            <label className="block text-[#ffffff] mt-3 mb-2 text-sm font-medium">
              Table Number
            </label>
            <div className="flex items-center rounded-[12px] p-3 px-4 bg-[#1f1f1f]">
              <input
                type="number"
                name="tableNo"
                placeholder="Enter Table Number"
                value={tableData.tableNo}
                onChange={handleInputChange}
                className="bg-transparent flex-1 text-white/50 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[#ffffff] mt-3 mb-2 text-sm font-medium">
              Number of Seats
            </label>
            <div className="flex items-center rounded-[12px] p-3 px-4 bg-[#1f1f1f]">
              <input
                type="number"
                name="seats"
                placeholder="Enter Seats"
                value={tableData.seats}
                onChange={handleInputChange}
                className="bg-transparent flex-1 text-white/50 focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            className="w-full rounded-lg mt-6 py-3 text-lg bg-yellow-300 text-gray-900 font-bold cursor-pointer"
          >
            Add Table
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Modal;

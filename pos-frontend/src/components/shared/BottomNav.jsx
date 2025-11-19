import React, { useState } from "react";
import { FaHome } from "react-icons/fa";
import { MdOutlineReorder, MdTableBar } from "react-icons/md";
import { CiCircleMore } from "react-icons/ci";
import { BiSolidDish } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";

// Modal baru untuk Create Order
import CreateOrderModal from "../../components/orders/createOrderModal.jsx";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const isActive = (path) => location.pathname === path;

  // 🔥 Action setelah submit modal (sementara tanpa backend)
  const handleCreateOrder = (data) => {
    console.log("📌 Data dari Modal:", data);

    closeModal();

    if (data.orderType === "Take-Away") {
      navigate("/menu");
    } else {
      navigate("/tables");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#262626] p-2 h-16 flex justify-around">

      {/* Navbar Buttons */}
      <button onClick={() => navigate("/")} className={`flex items-center justify-center font-bold ${isActive("/") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"} w-[200px] rounded-[20px]`}>
        <FaHome className="inline mr-2" size={20} />
        <p>Home</p>
      </button>

      <button onClick={() => navigate("/orders")} className={`flex items-center justify-center font-bold ${isActive("/orders") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"} w-[200px] rounded-[20px]`}>
        <MdOutlineReorder className="inline mr-2" size={20} />
        <p>Orders</p>
      </button>

      <button onClick={() => navigate("/tables")} className={`flex items-center justify-center font-bold ${isActive("/tables") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"} w-[200px] rounded-[20px]`}>
        <MdTableBar className="inline mr-2" size={20} />
        <p>Tables</p>
      </button>

      <button className={`flex items-center justify-center font-bold ${isActive("/more") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"} w-[200px] rounded-[20px]`}>
        <CiCircleMore className="inline mr-2" size={20} />
        <p>More</p>
      </button>

      {/* Floating Create Order Button */}
      <button
        disabled={isActive("/tables") || isActive("/menu")}
        onClick={openModal}
        className="absolute bottom-6 bg-[#3739dd] text-[#f5f5f5] rounded-full p-3 "
      >
        <BiSolidDish size={35} />
      </button>

      {/* Modal Baru */}
      <CreateOrderModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleCreateOrder}
      />
    </div>
  );
};

export default BottomNav;

import React, { useState } from 'react';
import { FaHome } from 'react-icons/fa';
import { MdOutlineReorder, MdTableBar } from 'react-icons/md';
import { CiCircleMore } from 'react-icons/ci';  
import { BiSolidDish } from 'react-icons/bi';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from './Modal';
import { useDispatch } from "react-redux";
import { setCustomerInfo } from "../../redux/slices/customerSlices.js";


const BottomNav = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [guestCount, setGuestCount] = React.useState(1);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const location = useLocation();
    const dispatch = useDispatch();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [orderType, setOrderType] = useState("Dine-In");

    // Function untuk inc di Modal Order
    const increment = () => {
        if(guestCount >= 6) return;
        setGuestCount((prev) => prev + 1);
    }

    // Function untuk dec di Modal Order
    const decrement = () => {
        if(guestCount <= 1) return;
        setGuestCount((prev) => prev - 1);
    }

    // Function untuk setiap Navbar yang aktif
    const isActive = (path) => location.pathname === path;

    // Function button Create Order pada Modal
    const handleCreateOrder = () => {
  if (!name.trim()) return alert("Please enter customer name!");
  if (!phone.trim()) return alert("Please enter phone number!");

  dispatch(setCustomerInfo({
    name,
    phone,
    guests: guestCount,
    orderType,
  }));

        // ✅ SET CUSTOMER DATA KE REDUX & LANJUT KE TABLE SELECTION
        // console.log("✅ Customer data saved to Redux:", {
        //     customerName: name,
        //     customerPhone: phone,
        //     guests: guestCount,
        //     orderType: orderType
        // });

        // Reset form dan close modal
        setName("");
        setPhone(""); 
        setGuestCount(1);
        setOrderType("Dine-In");
        
        closeModal();
        
        // ✅ NAVIGATE KE TABLE SELECTION PAGE
        navigate('/tables');
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#262626] p-2 h-16 flex justify-around ">
            {/* BUTTON NAVBAR */}
            <button 
                onClick={() => navigate('/')} 
                className={`flex items-center justify-center font-bold ${isActive("/") ? "text-[#f5f5f5] bg-[#343434]"
                    : "text-[#ababab]"} w-[200px] rounded-[20px]`}>
                <FaHome className="inline mr-2" size={20}/>
                <p>Home</p>
            </button>
            <button 
                onClick={() => navigate('/orders')} 
                className={`flex items-center justify-center font-bold ${isActive("/orders") ? "text-[#f5f5f5] bg-[#343434]"
                    : "text-[#ababab]"} w-[200px] rounded-[20px]`}>
                <MdOutlineReorder className="inline mr-2" size={20}/>
                <p>Orders</p>
            </button>
            <button 
                onClick={() => navigate('/tables')} 
                className={`flex items-center justify-center font-bold ${isActive("/tables") ? "text-[#f5f5f5] bg-[#343434]"
                    : "text-[#ababab]"} w-[200px] rounded-[20px]`}>
                <MdTableBar className="inline mr-2" size={20}/>
                <p>Tables</p>
            </button>
            <button 
                className={`flex items-center justify-center font-bold ${isActive("/more") ? "text-[#f5f5f5] bg-[#343434]"
                    : "text-[#ababab]"} w-[200px] rounded-[20px]`}>
                <CiCircleMore className="inline mr-2" size={20}/>
                <p>More</p>
            </button>
            {/* END BUTTON NAVBAR */}
            
            {/* Modal Create Order */}
            <button
                disabled={isActive("/tables") || isActive("/menu")}
                onClick={openModal}
                className='absolute bottom-6 bg-[#F6B100] text-[#f5f5f5] rounded-full p-3 items-center'>
                <BiSolidDish size={30} />
            </button>
            
            <Modal isOpen={isModalOpen} onClose={closeModal} title="Create Order">
                <div>
                    <label className='block text-[#ababab] mb-2 text-sm font-meidum'> Customer Name</label>
                    <div className='flex item-center rounded-lg p-3 px-4 bg-[#1f1f1f]'>
                        <input 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            type="text" 
                            placeholder='Enter customer name' 
                            className='bg-transparent flex-1 text-white focus:outline-none' 
                        />
                    </div>
                </div>

                <div>
                    <label className='block text-[#ababab] mb-2 mt-3 text-sm font-meidum'> Customer Phone</label>
                    <div className='flex item-center rounded-lg p-3 px-4 bg-[#1f1f1f]'>
                        <input 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                            type="text" 
                            placeholder='Enter customer phone' 
                            className='bg-transparent flex-1 text-white focus:outline-none' 
                        />
                    </div>
                </div>
                
                {/* Order Type */}
                <div className='mt-3'>
                    <label className='block mb-2 text-sm font-medium text-[#ababab]'>
                        Order Type
                    </label>
                    <div className='flex items-center gap-6 bg-[#1f1f1f] rounded-lg p-3 px-4'>
                        <label className='flex items-center gap-2 cursor-pointer'>
                            <input
                                type='radio'
                                name='orderType'
                                value='Dine-In'
                                checked={orderType === 'Dine-In'}
                                onChange={(e) => setOrderType(e.target.value)}
                                className='accent-yellow-500'
                            />
                            <span className='text-white'>Dine In</span>
                        </label>
                        <label className='flex items-center gap-2 cursor-pointer'>
                            <input
                                type='radio'
                                name='orderType'
                                value='Take-Away'
                                checked={orderType === 'Take-Away'}
                                onChange={(e) => setOrderType(e.target.value)}
                                className='accent-yellow-500'
                            />
                            <span className='text-white'>Take Away</span>
                        </label>
                    </div>
                </div>
                
                <div>
                    <label className='block mb-2 mt-3 text-sm font-medium text-[#ababab]'>Guest</label>
                    <div className='flex item-center justify-between bg-[#1f1f1f] rounded-lg p-3 px-4 py-3 rounded-lg'>
                        <button onClick={decrement} className='text-yellow-500 text-2xl'>&minus;</button>
                        <span className='text-white'>{guestCount} Person</span>
                        <button onClick={increment} className='text-yellow-500 text-2xl'>&#43;</button>
                    </div>
                </div>
                
                <button 
                    onClick={handleCreateOrder} 
                    className='w-full bg-[#f6b100] text-[#1f1f1f] font-semibold rounded-lg py-3 mt-8 hover:bg-[#e6a500] transition-colors'>
                    Continue to Table Selection
                </button>
            </Modal>
            {/* END Modal Create Order */}
        </div>
    );
};

export default BottomNav;
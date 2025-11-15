import React, { useState, useEffect } from 'react';
import BottomNav from '../components/shared/BottomNav';
import OrderCards from '../components/orders/OrderCards';
import BackButton from '../components/shared/BackButton';
import { updateOrderStatus } from '../services/orderService';
import UpdateStatusModal from '../components/orders/UpdateStatusModal';
import axios from 'axios';

const Orders = () => {
    const [status, setStatus] = useState("all"); // "all" | "pending" | "paid"
    const [orders, setOrders] = useState([]);  // Semua orders dari backend
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [selectedOrder, setSelectedOrder] = useState(null); // Untuk modal update status
    const [modalOpen, setModalOpen] = useState(false);  // Untuk modal update status
    const [outletFilter, setOutletFilter] = useState("all"); // "all" | "AR" | "AB" 


    // ✅ Base URL configuration
    const API_BASE_URL = "http://localhost:8000/api"; // Coba ganti ke /api
    // atau
    // const API_BASE_URL = "http://localhost:8000"; // Kalau endpoint langsung di root

    const fetchOrders = async () => {
    try {
        setLoading(true);

        const response = await axios.get("http://localhost:8000/api/order");
        setOrders(response.data.data || []);
        
    } catch (error) {
        console.error("Fetch Orders Error:", error);
        setError("Failed to load orders");
    } finally {
        setLoading(false);
    }
    };

    useEffect(() => {
        document.title = "Aruma Restaurant | Orders";
        fetchOrders();
    }, []);

    // Filtered Orders berdasarkan status dan outlet
   const filteredOrders = orders.filter((order) => {
    // status filter
    const matchStatus =
        status === "all"
        ? true
        : status === "pending"
        ? order.orderStatus === "PENDING"
        : status === "paid"
        ? order.orderStatus === "PAID"
        : true;

    // outlet filter – gunakan order.outlet.code dari populate
    const outletCode = order.outlet?.code; // AR / AB / undefined
    const matchOutlet =
        outletFilter === "all" ? true : outletCode === outletFilter;

    return matchStatus && matchOutlet;
    });


    


    return (
        <section className='bg-[#1f1f1f] min-h-screen overflow-hidden'>
            
            {/* Top Header */}
            <div className='flex items-center justify-between px-6 md:px-10 py-4'>
                <div className='flex items-center gap-4'>
                    <BackButton />
                    <h1 className='text-[#f5f5f5] text-2xl font-bold'>Orders</h1>
                </div>

                <div className='flex gap-2'>
                    {["all", "AR", "AB"].map((o) => (
                        <button
                        key={o}
                        onClick={() => setOutletFilter(o)}
                        className={`
                            text-xs md:text-sm px-3 py-1 rounded-lg
                            ${outletFilter === o ? "bg-[#383838] text-white" : "text-[#ababab] hover:bg-[#2a2a2a]"}
                        `}
                        >
                        {o === "all" ? "All Outlets" : o === "AR" ? "Aruma Restaurant" : "Aruma Bar"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Debug Info */}
            <div className="px-6 py-2">
                <button 
                    onClick={() => {
                        console.log("Current orders:", orders);
                        console.log("Filtered orders:", filteredOrders);
                    }}
                    className="text-xs bg-blue-600 px-2 py-1 rounded text-white"
                >
                    Debug Data
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="text-[#f5f5f5] text-lg">Loading orders...</div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                    <div className="text-red-400 text-lg mb-4 text-center">
                        {error}
                        <br />
                        <span className="text-sm">Please check your backend server</span>
                    </div>
                    <button 
                        onClick={fetchOrders}
                        className="bg-[#f6b100] text-[#1f1f1f] px-6 py-2 rounded-lg font-semibold hover:bg-[#e6a500] transition-colors"
                    >
                        Retry Connection
                    </button>
                </div>
            )}

            {/* Orders List */}
            {!loading && !error && (
                <div className='flex flex-wrap gap-4 md:gap-6 px-4 md:px-12 py-6 mb-10 overflow-y-auto scrollbar-hide justify-center md:justify-start'>
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <OrderCards 
                                key={order._id} 
                                data={order} 
                                refresh={fetchOrders}
                                onSelect={() => {
                                    setSelectedOrder(order);
                                    setModalOpen(true);
                                }} 
                            />
                        ))
                    ) : (
                        <div className="text-[#ababab] text-lg text-center w-full py-12">
                            {orders.length === 0 ? "No orders found" : `No ${status} orders`}
                        </div>
                    )}
                </div>
            )}

            {selectedOrder && (
            <UpdateStatusModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                data={selectedOrder}
                onUpdate={async () => {
                    await updateOrderStatus(selectedOrder._id, "PAID");
                    fetchOrders();
                    setModalOpen(false);
                }}
            />
            )}


            <BottomNav />
        </section>
    );
};

export default Orders;
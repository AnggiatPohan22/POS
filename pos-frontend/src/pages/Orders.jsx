import React, { useState, useEffect } from 'react';
import BottomNav from '../components/shared/BottomNav';
import OrderCards from '../components/orders/OrderCards';
import BackButton from '../components/shared/BackButton';
import axios from 'axios';

const Orders = () => {
    const [status, setStatus] = useState("all");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Base URL configuration
    const API_BASE_URL = "http://localhost:8000/api"; // Coba ganti ke /api
    // atau
    // const API_BASE_URL = "http://localhost:8000"; // Kalau endpoint langsung di root

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // ✅ Coba berbagai endpoint yang mungkin
            const endpoints = [
                `${API_BASE_URL}/xendit/transactions`,
                `${API_BASE_URL}/transactions`,
                `${API_BASE_URL}/orders`,
                `http://localhost:8000/api/transactions`,
                `http://localhost:8000/api/orders`
            ];

            let response = null;
            
            // Coba satu per satu endpoint
            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying endpoint: ${endpoint}`);
                    response = await axios.get(endpoint);
                    if (response.data) {
                        console.log("✅ Success with endpoint:", endpoint);
                        break;
                    }
                } catch (err) {
                    console.log(`❌ Failed: ${endpoint}`);
                    continue;
                }
            }

            if (response && response.data) {
                // Handle berbagai format response
                if (response.data.success) {
                    setOrders(response.data.data || []);
                } else if (Array.isArray(response.data)) {
                    setOrders(response.data);
                } else {
                    setOrders(response.data.orders || response.data.transactions || []);
                }
            } else {
                setError("No valid endpoint found");
            }
            
        } catch (error) {
            console.log("Final fetch error:", error);
            setError(`Connection error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Aruma Restaurant | Orders";
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order => {
        if (status === "all") return true;
        const orderStatus = (order.status || "").toLowerCase();
        return orderStatus === status.toLowerCase();
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
                    {["all", "pending", "paid"].map((filterStatus) => (
                        <button 
                            key={filterStatus}
                            onClick={() => setStatus(filterStatus)}
                            className={`text-[#ababab] text-sm md:text-lg transition-colors ${
                                status === filterStatus 
                                ? "bg-[#383838] text-white" 
                                : "hover:bg-[#2a2a2a]"
                            } rounded-lg px-3 md:px-5 py-2 capitalize`}
                        >
                            {filterStatus}
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
                                key={order._id || order.id} 
                                data={order} 
                                refresh={fetchOrders} 
                            />
                        ))
                    ) : (
                        <div className="text-[#ababab] text-lg text-center w-full py-12">
                            {orders.length === 0 ? "No orders found" : `No ${status} orders`}
                        </div>
                    )}
                </div>
            )}

            <BottomNav />
        </section>
    );
};

export default Orders;
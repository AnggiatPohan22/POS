import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getTotalPrice } from "../../redux/slices/cartSlices";
import { useCurrency } from '../hooks/useCurrency';
import { enqueueSnackbar } from 'notistack';
import PaymentModal from './PaymentModal';

// Base URL configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-api-domain.com' 
    : 'http://localhost:8000';

const Bill = () => {
    const cartData = useSelector(state => state.cart);
    const total = useSelector(getTotalPrice);
    const user = useSelector(state => state.user);
    const { formatIDR } = useCurrency();

    const taxRate = 11;
    const tax = (total * taxRate) / 100;
    const totalPriceWithTax = total + tax;

    const [paymentMethod, setPaymentMethod] = useState(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const customer = useSelector(state => state.customer);
    const [customerData, setCustomerData] = useState({
        name: "",
        guests: 1
    });

    // Initialize customer data dari user yang login
    // useEffect(() => {
    //     if (user?.name) {
    //         setCustomerData(prev => ({
    //             ...prev,
    //             name: user.name || ""
    //         }));
    //     }
    // }, [user]);

    const handleCustomerInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateCustomerData = () => {
    if (!customerData.name?.trim()) {
        enqueueSnackbar("Please enter customer name", { variant: "warning" });
        return false;
    }
    if (customerData.guests < 1) {
        enqueueSnackbar("Number of guests must be at least 1", { variant: "warning" });
        return false;
    }
    if (cartData.length === 0) {
        enqueueSnackbar("Cart is empty. Please add items first.", { variant: "warning" });
        return false;
    }
    return true;
};

    const handlePlaceOrder = async () => {
        // Check jika user belum login
        if (!user?._id) {
            enqueueSnackbar("Please login to place an order", { variant: "warning" });
            return;
        }

        if (!paymentMethod) {
            enqueueSnackbar("Please select a payment method", { variant: "warning" });
            return;
        }

        // Validasi customer data
        if (!validateCustomerData()) {
            return;
        }

        // ✅ FIX: Structure data sesuai dengan backend expectation
    const orderData = {
        customerName: customer.name,                    
        customerPhone: customer?.phone || "0000000000",         
        guests: parseInt(customer.guests) || 1,         
        orderType: customer.orderType || "Dine-In",                               
        
        total: total,
        tax: tax,
        totalWithTax: totalPriceWithTax,
        
        items: cartData.map(item => ({
            name: item.name,
            price: item.price,           
            quantity: item.quantity,
            pricePerQuantity: item.pricePerQuantity || item.price
        }))
    };

    

        // ✅ CASH PAYMENT
        if (paymentMethod === "Cash") {
            try {
                setIsLoading(true);
                
                const orderResponse = await fetch(`${API_BASE_URL}/api/order`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        ...orderData,
                        orderStatus: "PAID",
                        payment: {
                            status: "PAID",
                            paidAmount: totalPriceWithTax,
                            paidAt: new Date()
                        }
                    }),
                });

                // Handle response status
                if (orderResponse.status === 401) {
                    enqueueSnackbar("Session expired. Please login again.", { variant: "error" });
                    return;
                }

                if (orderResponse.status === 400) {
                    const errorData = await orderResponse.json();
                    enqueueSnackbar(errorData.message || "Invalid data", { variant: "error" });
                    return;
                }

                const orderData = await orderResponse.json();
                
                if (orderData.success) {
                    enqueueSnackbar("Cash payment successful! Order placed!", { variant: "success" });
                    console.log("Order created:", orderData.data);
                    
                    // Reset form setelah sukses
                    setCustomerData({
                        name: user?.name || "",
                        guests: 1
                    });
                    setPaymentMethod(null);
                    
                    // TODO: Reset cart setelah order berhasil
                    // dispatch(clearCart());
                    
                } else {
                    enqueueSnackbar(orderData.message || "Failed to create order", { variant: "error" });
                }
            } catch (error) {
                console.error("Cash payment error:", error);
                enqueueSnackbar("Network error. Please try again.", { variant: "error" });
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // ✅ ONLINE PAYMENT (VA)
        try {
            setIsLoading(true);

            // Step 1: Create Order
            const orderResponse = await fetch(`${API_BASE_URL}/api/order`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include',
                body: JSON.stringify({
                    ...orderData,
                    orderStatus: "PENDING"
                }),
            });

            // Handle response status
            if (orderResponse.status === 401) {
                enqueueSnackbar("Session expired. Please login again.", { variant: "error" });
                return;
            }

            if (orderResponse.status === 400) {
                const errorData = await orderResponse.json();
                enqueueSnackbar(errorData.message || "Invalid data", { variant: "error" });
                return;
            }

            const orderResult = await orderResponse.json();
            console.log("Order created:", orderResult);

            if (!orderResult.success || !orderResult.data?._id) {
                enqueueSnackbar(orderResult.message || "Failed to create order", { variant: "error" });
                return;
            }

            const orderId = orderResult.data._id;

            // Step 2: Create Virtual Account
            const vaResponse = await fetch(`${API_BASE_URL}/api/xendit/create-va`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orderId: orderId,
                    amount: Math.round(totalPriceWithTax),
                    customerName: customer.name
                }),
            });

            const vaData = await vaResponse.json();
            console.log("VA API RESPONSE:", vaData);

            if (vaData.success) {
                setPaymentData({
                    account_number: vaData.va?.account_number,
                    bank_code: vaData.va?.bank_code,
                    expected_amount: vaData.va?.expected_amount,
                    external_id: vaData.va?.external_id,
                    orderId: orderId,
                    customerName: customerData.name,
                    totalAmount: formatIDR(totalPriceWithTax)
                });
                setPaymentModalOpen(true);
                enqueueSnackbar("Virtual Account created successfully!", { variant: "success" });
                
                // Reset form setelah sukses
                setCustomerData({
                    name: user?.name || "",
                    guests: 1
                });
                setPaymentMethod(null);
                
            } else {
                enqueueSnackbar(vaData.message || "Failed to create VA", { variant: "error" });
            }

        } catch (error) {
            console.error("Frontend Error:", error);
            enqueueSnackbar("Network error. Please try again.", { variant: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    // Function untuk check payment status
    const checkPaymentStatus = async (orderId) => {
        if (!orderId) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/xendit/order/${orderId}`, {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.success) {
                if (data.data.payment.status === "PAID") {
                    enqueueSnackbar("Payment confirmed! Thank you for your order.", { variant: "success" });
                    setPaymentModalOpen(false);
                    // TODO: Reset cart atau navigasi ke success page
                } else {
                    enqueueSnackbar("Payment still pending...", { variant: "info" });
                }
            }
        } catch (error) {
            console.error("Error checking payment status:", error);
            enqueueSnackbar("Failed to check payment status", { variant: "error" });
        }
    };

    // Tampilkan login prompt jika belum login
    if (!user?._id) {
        return (
            <div className="p-5">
                <div className="bg-[#1f1f1f] p-6 rounded-lg text-center">
                    <p className="text-[#ababab] mb-4">Please login to place an order</p>
                    <button 
                        onClick={() => window.location.href = '/login'}
                        className="bg-[#f6b100] px-6 py-3 rounded-lg text-[#1f1f1f] font-semibold hover:bg-[#e6a900] transition-colors"
                    >
                        Login Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            

            {/* Price Summary - Compact */}
            <div className="px-5 mb-3 mt-3">
                <div className="bg-[#1f1f1f] rounded-lg p-4 border border-[#383737]">
                    <h3 className="text-sm font-semibold text-[#f5f5f5] mb-3">Order Summary</h3>
                    
                    <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                            <p className='text-xs text-[#ababab] font-medium'>Items ({cartData.length})</p>
                            <span className='text-xs text-[#f5f5f5] font-bold'>{formatIDR(total)}</span>
                        </div>

                        <div className='flex items-center justify-between'>
                            <p className='text-xs text-[#ababab] font-medium'>Tax (11%)</p>
                            <span className='text-xs text-[#f5f5f5] font-bold'>{formatIDR(tax)}</span>
                        </div>

                        <div className='flex items-center justify-between pt-2 border-t border-[#383737]'>
                            <p className='text-sm text-[#f5f5f5] font-semibold'>Total Amount</p>
                            <span className='text-sm text-[#f5f5f5] font-bold'>{formatIDR(totalPriceWithTax)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Selection */}
            <div className='flex items-center justify-between gap-3 px-5 mb-3'>
                <button 
                    onClick={() => setPaymentMethod('Cash')}
                    disabled={isLoading}
                    className={`flex-1 px-3 py-3 rounded-lg font-semibold transition-all text-sm ${
                        paymentMethod === "Cash" 
                            ? "bg-[#383737] border-2 border-[#f6b100] text-[#f6b100]" 
                            : "bg-[#1f1f1f] text-[#ababab] hover:bg-[#2a2a2a] border border-[#383737]"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    💵 Cash
                </button>

                <button 
                    onClick={() => setPaymentMethod('Online')}
                    disabled={isLoading}
                    className={`flex-1 px-3 py-3 rounded-lg font-semibold transition-all text-sm ${
                        paymentMethod === "Online" 
                            ? "bg-[#383737] border-2 border-[#f6b100] text-[#f6b100]" 
                            : "bg-[#1f1f1f] text-[#ababab] hover:bg-[#2a2a2a] border border-[#383737]"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    🏦 Online
                </button>
            </div>

            {/* Action Buttons - TETAP DI BAWAH */}
            <div className='px-5'>
                <div className='bg-[#1f1f1f] rounded-lg p-4 border border-[#383737]'>
                    <div className='flex items-center justify-between gap-3'>
                        <button 
                            className='bg-[#025cca] px-3 py-3 flex-1 rounded-lg text-[#f5f5f5] font-semibold hover:bg-[#024aa6] transition-colors text-sm border border-[#025cca]'
                            onClick={() => {
                                enqueueSnackbar("Print receipt feature coming soon!", { variant: "info" });
                            }}
                        >
                            🖨️ Print
                        </button>

                        <button 
                            onClick={handlePlaceOrder} 
                            disabled={isLoading || cartData.length === 0}
                            className={`px-3 py-3 flex-1 rounded-lg font-semibold transition-colors text-sm ${
                                isLoading || cartData.length === 0
                                    ? "bg-gray-600 text-gray-400 cursor-not-allowed border border-gray-600"
                                    : "bg-[#f6b100] text-[#1f1f1f] hover:bg-[#e6a900] border border-[#f6b100]"
                            }`}
                        >
                            {isLoading ? "⏳ Processing..." : 
                            paymentMethod === "Online" ? "💳 Pay Now" : "✅ Place Order"}
                        </button>
                    </div>

                    {/* Cart Empty Warning */}
                    {cartData.length === 0 && (
                        <div className="mt-3">
                            <p className="text-xs text-yellow-400 text-center">
                                🛒 Your cart is empty. Add some items first!
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ✅ Payment Modal Component */}
            <PaymentModal
                open={paymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                data={paymentData}
                onCheckStatus={() => checkPaymentStatus(paymentData?.orderId)}
            />
        </>
    );
};

export default Bill;
import React, { useState } from 'react';
import { FaCheckDouble, FaCircle, FaUtensils, FaHome } from 'react-icons/fa';
import axios from 'axios';
import UpdateStatusModal from './UpdateStatusModal';

const OrderCards = ({ data, refresh, onSelect }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [updating, setUpdating] = useState(false);

    // ✅ Enhanced Fallback Data dengan berbagai kemungkinan field names
    const customerName = data?.customerDetails?.name || "Unknown Customer";
    const avatar = customerName.substring(0, 2).toUpperCase();
    const tableNo = data?.table?.tableNo || "-";
    const items = data?.items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 0;
    const orderType = (data?.orderType || "Dine-In").toLowerCase();
    const transactionCode = data?.billNumber || data?._id?.slice(-8) || "N/A";
    const amount = data?.bills?.totalWithTax || 0;
    const status = data?.orderStatus || "PENDING";


    const updatePaid = async () => {
        if (!data._id) {
            alert("Error: Order ID not found!");
            return;
        }

        if (updating) return; // Prevent double click
        setUpdating(true);

        try {
            const res = await axios.put(
                `http://localhost:8000/api/order/${data._id}`, 
                { orderStatus: "PAID" }
            );

            if (res.data.success) {
                enqueueSnackbar("Order updated to PAID! ✅", { variant: "success" });
                setModalOpen(false);
                refresh(); // refresh list
            } else {
                enqueueSnackbar("Failed updating status", { variant: "error" });
            }

        } catch (error) {
            console.error("Payment Update Error:", error);
            enqueueSnackbar("Server error", { variant: "error" });
        }

        setUpdating(false);
    };


    // Status configuration
    const statusConfig = {
        PENDING: { 
            color: "text-yellow-400", 
            bg: "bg-[#4a3a2e]",
            dot: "text-yellow-500",
            label: "Waiting Payment"
        },
        PAID: { 
            color: "text-green-400", 
            bg: "bg-[#2e4a40]",
            dot: "text-green-500",
            label: "Paid"
        },
        COMPLETED: { 
            color: "text-blue-400", 
            bg: "bg-[#2e3a4a]",
            dot: "text-blue-500",
            label: "Completed"
        }
    };

    const currentStatus = statusConfig[status.toUpperCase()] || statusConfig.PENDING;

    return (
        <>
            <div 
                className='w-full max-w-[400px] bg-[#262626] p-4 rounded-lg mb-4 cursor-pointer hover:bg-[#2d2d2d] transition-colors border border-[#383838]'
                onClick={() => onSelect && onSelect(data)}
            >
                {/* ... (rest of the JSX remains the same) */}
                <div className='flex items-center gap-4'>
                    <div className='bg-[#f6b100] p-3 text-xl font-bold rounded-lg min-w-[60px] min-h-[60px] flex items-center justify-center'>
                        {avatar}
                    </div>

                    <div className='flex items-center justify-between w-full'>
                        <div className='flex flex-col items-start gap-1 flex-1'>
                            <h1 className='text-[#f5f5f5] text-lg font-semibold tracking-wide truncate max-w-[150px]'>
                                {customerName}
                            </h1>
                            <div className='flex items-center gap-2 text-[#ababab] text-sm flex-wrap'>
                                { data?.billNumber && (
                                        <span>#{data.billNumber}</span>
                                    )}
                                {/* DISPLAY BILL INFO */}
                                <span>•</span>
                                <span className="capitalize">
                                {data.orderType || "Unknown Type"}
                                </span>

                                {data?.table?.tableNo && (
                                <>
                                    <span>•</span>
                                    <span>Table {data.table.tableNo}</span>
                                </>
                                )}
                                {data?.outlet?.name && (
                                <>
                                    <span>{data.outlet.name}</span>
                                </>
                                )}

                            </div>
                        </div>

                        <div className='flex flex-col items-end gap-2'>
                            <div className={`${currentStatus.color} ${currentStatus.bg} px-3 py-1 rounded-lg text-sm font-medium`}>
                                <FaCheckDouble className="inline mr-2" />
                                {status}
                            </div>
                            <p className='text-[#ababab] text-xs flex items-center'>
                                <FaCircle className={`inline mr-2 ${currentStatus.dot}`} />
                                {currentStatus.label}
                            </p>
                        </div>
                    </div>
                </div>

                <div className='flex justify-between mt-4 text-[#ababab] text-sm'>
                    <p>{data?.createdAt ? new Date(data.createdAt).toLocaleString('id-ID') : "-"}</p>
                    <p>{items} Item{items !== 1 ? 's' : ''}</p>
                </div>

                <hr className='w-full mt-3 border-t border-gray-700' />

                <div className='flex justify-between mt-3 items-center'>
                    <h1 className='text-[#f5f5f5] text-lg font-semibold'>Total</h1>
                    <p className='text-[#f6b100] text-lg font-bold'>
                        IDR {amount.toLocaleString("id-ID")}
                    </p>
                </div>
            </div>

            <UpdateStatusModal 
                open={modalOpen}
                onClose={() => !updating && setModalOpen(false)}
                data={data}
                onUpdate={updatePaid}
                loading={updating}
            />
        </>
    );
};

export default OrderCards;
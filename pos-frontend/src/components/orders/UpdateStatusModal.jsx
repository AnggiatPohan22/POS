import React from 'react';

const UpdateStatusModal = ({ open, onClose, data, onUpdate, loading = false }) => {
    if (!open) return null;

    // Enhanced data fallbacks
    const customerName = data?.name || "Unknown Customer";
    const amount = data?.amount || 0;
    const transactionCode = data?.transaction_code || data?._id?.slice(-8) || "N/A";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#262626] p-6 rounded-lg w-full max-w-[400px] border border-[#383838]">
                <h2 className="text-white text-xl font-bold mb-4">
                    Update Payment Status
                </h2>

                <div className="mb-6 space-y-3">
                    <p className="text-gray-300">
                        <span className="text-[#ababab]">Customer:</span> 
                        <b className="ml-2 text-white">{customerName}</b>
                    </p>
                    <p className="text-gray-300">
                        <span className="text-[#ababab]">Order ID:</span> 
                        <b className="ml-2 text-white">#{transactionCode}</b>
                    </p>
                    <p className="text-gray-300">
                        <span className="text-[#ababab]">Amount:</span> 
                        <b className="ml-2 text-[#f6b100]">IDR {amount.toLocaleString("id-ID")}</b>
                    </p>
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={onUpdate}
                        disabled={loading}
                        className={`w-full p-3 text-white font-bold rounded-lg transition-colors ${
                            loading 
                            ? "bg-gray-600 cursor-not-allowed" 
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                    >
                        {loading ? "Updating..." : "Mark as PAID"}
                    </button>

                    <button 
                        onClick={onClose}
                        disabled={loading}
                        className="w-full bg-gray-700 p-3 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateStatusModal;
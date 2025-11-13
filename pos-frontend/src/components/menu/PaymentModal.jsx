import React from "react";

export default function PaymentModal({ open, onClose, data }) {
    if (!open || !data) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h2 style={styles.title}>Payment Information</h2>

                {/* Dinamis berdasarkan data yang dikirim */}
                {data.bank_code && (
                    <p><b>Bank:</b> {data.bank_code}</p>
                )}

                {data.account_number && (
                    <p><b>VA Number:</b> {data.account_number}</p>
                )}

                {data.owner_id && (
                    <p><b>Owner ID:</b> {data.owner_id}</p>
                )}

                {data.expected_amount && (
                    <p><b>Amount:</b> {data.expected_amount}</p>
                )}

                {data.status && (
                    <p><b>Status:</b> {data.status}</p>
                )}

                {/* Jika nanti kamu tambahkan QRIS */}
                {data.qr_string && (
                    <>
                        <p><b>Scan QR:</b></p>
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data.qr_string}`}
                            alt="QR Code"
                            style={{ marginTop: 10 }}
                        />
                    </>
                )}

                <button style={styles.button} onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
    },
    modal: {
        padding: 20,
        background: "#fff",
        borderRadius: 10,
        width: "350px",
        textAlign: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    },
    title: {
        marginBottom: 15,
        fontSize: "18px",
        fontWeight: "bold",
    },
    button: {
        marginTop: 20,
        background: "#007bff",
        color: "#fff",
        padding: "10px 20px",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
    }
};

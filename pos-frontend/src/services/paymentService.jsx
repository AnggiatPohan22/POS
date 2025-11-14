// Create Virtual Account BCA (Xendit)
export const createVA = async (orderId, amount, customerName) => {
  try {
    const res = await fetch(`http://localhost:8000/api/xendit/create-va`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        amount,
        customerName,
      }),
    });

    return await res.json();
  } catch (error) {
    console.error("VA Error:", error);
    return { success: false };
  }
};

// Check VA Payment Status
export const checkPaymentStatusAPI = async (orderId) => {
  try {
    const res = await fetch(`http://localhost:8000/api/xendit/order/${orderId}`, {
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    console.error("Check Payment Error:", error);
    return { success: false };
  }
};

export const payWithVA = async (orderId, totalAmount, customerName) => {
  const res = await axios.post(`${API_URL}/xendit/create-va`, {
    orderId,
    amount: Math.round(totalAmount),
    customerName,
  });

  return {
    success: res.data.success,
    data: res.data.va
  };
};


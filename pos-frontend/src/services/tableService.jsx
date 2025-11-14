export const updateTableStatus = async (tableId, status) => {
  try {
    const response = await fetch(`http://localhost:8000/api/table/${tableId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    return await response.json();
  } catch (error) {
    console.error("Update Table Error:", error);
    return { success: false };
  }
};

export const getOutlets = async () => {
  try {
    const res = await fetch("http://localhost:8000/api/outlet");
    return await res.json();
  } catch (err) {
    console.error("Fetch outlets error:", err);
    return { success: false };
  }
};

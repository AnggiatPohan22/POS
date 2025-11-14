import axios from "axios";


const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
});

export const login = async (reqData) => {
    const response = await axios.post('http://localhost:8000/api/user/login', reqData, {
        withCredentials: true // ✅ Penting untuk cookies
    });
    return response;
};

//function to update table status
export const updateTableStatus = async (tableId, status) => {
  const res = await axios.patch(`/api/tables/${tableId}`, { status });
  return res.data;
};

// API Endpoints
export const register = (data) => api.post("/api/user/register", data);
export const getUserData = () => api.get("/api/user");
export const logout = () => api.post("/api/user/logout");

export const addTable = (data) => api.post("/api/table/", data);
export const getTables = () => api.get("/api/table/");
import React, { useEffect, useState } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import TableCards from "../components/tables/TableCards";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setCustomerInfo } from "../redux/slices/customerSlices";
import { setCurrentOrder } from "../redux/slices/orderSlices";

// API untuk mendapatkan semua meja + status occupied
const API_URL = "http://localhost:8000/api/table/with-status";

const Tables = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const reduxCustomer = useSelector((state) => state.customer);

  const [tables, setTables] = useState([]);
  const customerId = searchParams.get("customerId");

  /* 🔍 Saat pertama masuk ke halaman Tables
     Fungsi:
     - Cek ada customerId dari URL (dibawa dari Home/Order Page)
     - Jika refresh halaman, restore customer dari backend
  */
  useEffect(() => {
    console.group("🚀 TABLES PAGE LOADED");
    console.log("🧠 REDUX CUSTOMER:", reduxCustomer);
    console.log("🔗 URL customerId:", customerId);
    console.groupEnd();

    if (!customerId) {
      enqueueSnackbar("Customer ID missing", { variant: "warning" });
      return navigate("/");
    }

    restoreCustomer();
    fetchTables();
  }, []);

  /* 📌 Ambil list meja dari backend */
  const fetchTables = async () => {
    try {
      const res = await axios.get(API_URL);
      console.log("📌 TABLE LIST:", res.data.data);
      setTables(res.data.data || []);
    } catch {
      enqueueSnackbar("Failed fetching tables", { variant: "error" });
    }
  };

  /* 🔁 Restore customer dari backend apabila hilang dari Redux */
  const restoreCustomer = async () => {
    if (reduxCustomer.customerId) return;

    try {
      const res = await axios.get(
        `http://localhost:8000/api/customers/${customerId}`
      );

      const c = res.data.data;

      dispatch(
        setCustomerInfo({
          customerId: c.id,
          name: c.customerName,
          phone: c.phone,
          guests: c.guests,
          orderType: c.orderType,
          outletId: c.outletId,
        })
      );
      console.log("🎯 Customer restored");
    } catch {
      enqueueSnackbar("❌ Session expired, please re-enter", {
        variant: "error",
      });
      navigate("/");
    }
  };

  /* 🖱 Klik meja → Buat Order baru
     Fungsi:
     - Simpan order ke DB
     - Simpan detail order ke Redux
     - Redirect ke Menu page
  */
  const handleSelectTable = async (table) => {
    console.group("🪑 SELECTING TABLE");
    console.log("Table chosen:", table);
    console.log("Customer:", reduxCustomer);
    console.groupEnd();

    const payload = {
      customerId: reduxCustomer.customerId,
      orderType: reduxCustomer.orderType,
      outletId: reduxCustomer.outletId,
      tableId: table.id,
      customerName: reduxCustomer.name,
      customerPhone: reduxCustomer.phone,
      guests: reduxCustomer.guests
    };

    try {
      const res = await axios.post("http://localhost:8000/api/order", payload);
      const order = res.data.data;

      console.log("🧾 ORDER CREATED:", order);

      dispatch(
        setCurrentOrder({
          id: order.id, // ⬅ UUID string
          tableId: table.id,
          tableNo: table.tableNo,
          billNumber: order.billNumber,
          orderDate: order.orderDate
        })
      );


      console.log("📍 Navigate to MENU →", order.id);
      navigate(`/menu?orderId=${order.id}`);

    } catch (err) {
      console.error("❌ Create order failed", err);
      enqueueSnackbar("Failed creating order", { variant: "error" });
    }
  };

  // Sort meja berdasarkan nomor meja (lebih rapi)
  const sortedTables = [...tables].sort(
    (a, b) => Number(a.tableNo) - Number(b.tableNo)
  );

  return (
    <section className="bg-[#1f1f1f] min-h-screen pb-20">
      <div className="flex items-center gap-4 px-4 py-4">
        <BackButton />
        <h1 className="text-white text-2xl font-bold">Tables</h1>
      </div>

      {/* Menampilkan semua meja */}
      <div className="flex flex-wrap justify-center gap-4 px-6">
        {sortedTables.map((tables) => (
          <TableCards
            key={tables.id}
            id={tables.id}
            tableNo={tables.tableNo}
            seats={tables.seats}
            initials={`T${tables.tableNo}`}
            isBooked={!!tables.currentCustomer}
            status={tables.currentCustomer ? "Occupied" : "Available"}
            onSelect={() => handleSelectTable(tables)}
          />
        ))}
      </div>

      <BottomNav />
    </section>
  );
};

export default Tables;

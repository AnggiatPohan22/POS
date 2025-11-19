import React, { useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { MdRestaurantMenu } from "react-icons/md";
import Bill from "../components/menu/Bill";
import CustomerInfo from "../components/menu/CustomerInfo";
import CartInfo from "../components/menu/CartInfo";
import MenuContainer from "../components/menu/MenuContainer";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { setCustomerInfo } from "../redux/slices/customerSlices";
import { setCurrentOrder, restoreOrderFromDB } from "../redux/slices/orderSlices";
import { useNavigate, useSearchParams } from "react-router-dom";

const Menu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = React.useState(true);

  const reduxCustomer = useSelector((state) => state.customer);
  const reduxOrder = useSelector((state) => state.order);

  const orderId = searchParams.get("orderId");

  // Fungsi navigasi balik kalau session rusak / hilang
  const redirectHome = (msg = "Session expired") => {
    enqueueSnackbar(msg, { variant: "warning" });
    return navigate("/");
  };

  const restoreMenuState = async () => {
    try {
      console.group("🔄 RESTORING MENU SESSION");

      // 1️⃣ Wajib ada orderId di URL → ini ID transaksi dari halaman Tables.jsx
      if (!orderId) {
        console.log("❌ Missing orderId in URL");
        return redirectHome();
      }
      console.log("📌 URL orderId:", orderId);

      // 2️⃣ Jika Redux tidak punya orderId → Fetch order detail dari server
      if (!reduxOrder.orderId) {
        const oRes = await axios.get(`http://localhost:8000/api/order/${orderId}`);
        const orderData = oRes.data.data;
        console.log("🧾 Restored Order from DB:", orderData);

        dispatch(restoreOrderFromDB(orderData)); // Simpan full order
        dispatch(
          setCurrentOrder({
            orderId: orderData.id,
            tableId: orderData.tableId, // Kita akan fetch tableNo berdasarkan ini
            billNumber: orderData.billNumber,
            orderDate: orderData.orderDate,
          })
        );
      }

      // 3️⃣ Jika Redux tidak punya customer → Fetch dari server
      if (!reduxCustomer.customerId) {
        const cRes = await axios.get(
          `http://localhost:8000/api/customers/${reduxOrder.customerId}`
        );
        const c = cRes.data.data;
        console.log("👤 Restored Customer from DB:", c);

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
      }

      // 4️⃣ Jika Redux masih belum punya tableNo → Fetch table detail
      if (!reduxOrder.tableNo && reduxOrder.tableId) {
        const tRes = await axios.get(
          `http://localhost:8000/api/tables/${reduxOrder.tableId}`
        );
        const tableData = tRes.data.data;
        console.log("🪑 Restored Table from DB:", tableData);

        dispatch(
          setCurrentOrder({
            orderId: reduxOrder.orderId,
            tableId: tableData.id,
            tableNo: tableData.tableNo,
          })
        );
      }

      console.groupEnd();
      setLoading(false);

    } catch (err) {
      console.error("❌ Restore Menu Error:", err);
      redirectHome();
    }
  };

  useEffect(() => {
    restoreMenuState();
    document.title = "Aruma Restaurant | Menu";
  }, []);

  // 🧪 Debug log untuk memastikan data lengkap
  useEffect(() => {
    console.log("🧩 MENU PAGE STATE CHECK:", {
      orderId: reduxOrder.orderId,
      tableId: reduxOrder.tableId,
      tableNo: reduxOrder.tableNo,
      customerId: reduxCustomer.customerId,
      orderDate: reduxOrder.orderDate,
      loading,
    });
  }, [reduxOrder, reduxCustomer, loading]);

  // Jika data belum siap → Tampilkan loading kecil
  if (loading || !reduxOrder.orderId) {
    return (
      <div className="text-white p-6 text-center">
        Restoring your order...
      </div>
    );
  }

  return (
    <section className="bg-[#1f1f1f] min-h-screen overflow-hidden flex gap-3">
      <div className="flex-[3]">
        {/* Header Info Menu */}
        <div className="flex items-center justify-between px-10 py-4">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
              Menu
            </h1>
          </div>

          {/* Customer & Table Info */}
          <div className="flex items-center gap-3 cursor-pointer">
            <MdRestaurantMenu className="text-[#f5f5f5] text-4xl" />
            <div className="flex flex-col">
              <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide">
                {reduxCustomer.name || "Customer"}
              </h1>
              <p className="text-xs text-[#ababab] font-medium">
                Table {reduxOrder.tableNo ?? "-"} {/* Ini sekarang selalu muncul */}
              </p>
            </div>
          </div>
        </div>

        <MenuContainer />
      </div>

      {/* Sidebar Order Details */}
      <div className="flex-[1] bg-[#1a1a1a] mt-2 mr-3 h-[780px] rounded-lg">
        <CustomerInfo />
        <hr className="border-[#2a2a2a] border-t-2" />
        <CartInfo />
        <hr className="border-[#2a2a2a] border-t-2" />
        <Bill />
      </div>

      <BottomNav />
    </section>
  );
};

export default Menu;

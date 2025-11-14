import React, { useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import TableCards from "../components/tables/TableCards";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTables } from "../https";
import { enqueueSnackbar } from "notistack";

const Tables = () => {
  // Title Page
  useEffect(() => {
    document.title = "Aruma Restaurant | Tables";
  }, []);

  const [status, setStatus] = React.useState("all");

  const {
    data: tables = [],
    isError,
  } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,

    // ✅ Ensure that we consistently return the ARRAY from backend
    select: (res) => {
      if (!res?.data) return [];              // fallback
      if (Array.isArray(res.data)) return res.data;  // backend return array
      if (Array.isArray(res.data.data)) return res.data.data; // backend return {data: []}
      return []; // fallback untuk kasus lain
    },

    placeholderData: keepPreviousData,
  });

  if (isError) {
    enqueueSnackbar("Something went wrong!", { variant: "error" });
  }

  // ✅ Safe sorting (hindari error kalau tableNo string)
  const sortedTables = [...tables].sort(
    (a, b) => Number(a.tableNo) - Number(b.tableNo)
  );

  // ---------------- CONFIRM ORDER ONLY ----------------
const handleConfirmOrder = async () => {
  if (!validateData()) return;
  if (!user?._id) return enqueueSnackbar("Login required!", { variant: "warning" });

  try {
    setIsLoading(true);

    const result = await createOrder({
      customer,
      cartData,
      total,
      tax,
      totalWithTax,
      tableId: selectedTable?.id,
      status: "PENDING",
    });

    if (!result.success) {
      enqueueSnackbar("Failed to process order", { variant: "error" });
      return;
    }

    setPendingOrderId(result.data._id);
    setPaymentModalOpen(true);

    enqueueSnackbar("Order created! Select payment method", { variant: "info" });

  } catch (err) {
    console.error(err);
    enqueueSnackbar("System error!", { variant: "error" });
  } finally {
    setIsLoading(false);
  }
};


  // ✅ Filter Table (All / DINE-IN)
  const filteredTables =
    status === "Dine-in"
      ? sortedTables.filter((t) => t.currentOrder) // 🔥 Dine-in kalau ada order aktif
      : sortedTables;

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh)] overflow-hidden">
      <div className="flex items-center justify-between px-10 py-2">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold">Tables</h1>
        </div>

        <div className="flex items-center justify-around gap-4">
          <button
            onClick={() => setStatus("all")}
            className={`text-[#ababab] text-lg px-5 py-2 rounded-lg ${
              status === "all" ? "bg-[#383838]" : ""
            }`}
          >
            All
          </button>

          <button
            onClick={() => setStatus("Dine-in")}
            className={`text-[#ababab] text-lg px-5 py-2 rounded-lg ${
              status === "Dine-in" ? "bg-[#383838]" : ""
            }`}
          >
            Dine-in
          </button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 px-10 mt-8 ">
        {filteredTables.map((table) => (
          <TableCards
            key={table._id}
            id={table._id}
            name={`Table ${table.tableNo}`}
            status={table.status}
            initials={table.currentOrder?.customerDetails.name} // Placeholder, sesuaikan jika ada data nama pemesan
            seat={table.seats}
          />
        ))}
      </div>

      <BottomNav />
    </section>
  );
};

export default Tables;

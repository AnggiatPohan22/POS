import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCustomerInfo } from "../../redux/slices/customerSlices";
import { setSelectedOutlet } from "../../redux/slices/outletSlices";
import { useNavigate } from "react-router-dom";

const CreateOrderModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState("Dine-In");
  const [guestCount, setGuestCount] = useState(1);
  const [outletId, setOutletId] = useState("");
  const [outlets, setOutlets] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    fetch("http://localhost:8000/api/outlet")
      .then((res) => res.json())
      .then((data) => setOutlets(data.data || []))
      .catch((err) => console.error("Load outlet error:", err));
  }, [isOpen]);

  const increment = () =>
    guestCount < 10 && setGuestCount((prev) => prev + 1);

  const decrement = () =>
    guestCount > 1 && setGuestCount((prev) => prev - 1);

  const handleSubmit = async () => {
    if (!name.trim()) return alert("Customer name is required");
    if (!phone.trim()) return alert("Phone is required");
    if (!outletId) return alert("Please select outlet!");

    try {
      const customerRes = await fetch("http://localhost:8000/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          phone,
          guests: guestCount,
          outletId,
          orderType,
        }),
      });

      const customerData = await customerRes.json();
      if (!customerData.success) throw new Error(customerData.message);

      const customer = customerData.data;

      dispatch(
        setCustomerInfo({
            customerId: customer.id,
            name: customer.customerName,
            phone: customer.phone,
            guests: customer.guests,
            outletId: customer.outletId,
            orderType: orderType, // 🔥 kirim yang dipilih user
        })
    );


      dispatch(setSelectedOutlet(customer.outletId));

      onClose();
      navigate(`/tables?customerId=${customer.id}`);
    } catch (err) {
      console.error("❌ Create Customer Failed:", err);
      alert("Create customer failed: " + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-[#181818] p-6 rounded-xl w-[90%] max-w-md text-white space-y-4">
        <h2 className="font-bold text-xl">Create Order</h2>

        {/* Customer Name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Customer Name</label>
          <input
            type="text"
            className="bg-[#222] text-white px-3 py-2 rounded-lg outline-none"
            placeholder="Enter customer name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Customer Phone</label>
          <input
            type="text"
            className="bg-[#222] text-white px-3 py-2 rounded-lg outline-none"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* Order Type */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Order Type</label>
          <div className="flex gap-5 items-center text-sm">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={orderType === "Dine-In"}
                onChange={() => setOrderType("Dine-In")}
              />
              Dine In
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={orderType === "Take-Away"}
                onChange={() => setOrderType("Take-Away")}
              />
              Take Away
            </label>
          </div>
        </div>

        {/* Select Outlet */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Select Outlet</label>
          <select
            className="bg-[#222] px-3 py-2 rounded-lg outline-none"
            value={outletId}
            onChange={(e) => setOutletId(e.target.value)}
          >
            <option value="">-- Select Outlet --</option>
            {outlets.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        {/* Guest */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Guest</label>
          <div className="flex justify-between items-center bg-[#222] p-2 rounded-lg text-sm">
            <button className="px-3 py-1" disabled={guestCount <= 1} onClick={decrement}>
              -
            </button>
            <span>{guestCount} Person</span>
            <button className="px-3 py-1" onClick={increment}>
              +
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full bg-[#F6B100] text-black py-3 rounded-lg font-bold mt-2"
        >
          Continue to Table Selection
        </button>

        {/* Cancel */}
        <button className="text-gray-400 text-sm w-full" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateOrderModal;

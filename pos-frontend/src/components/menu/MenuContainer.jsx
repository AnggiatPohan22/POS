import React, { useState, useEffect } from "react";
import { getBgColor } from "../../utils";
import { GrRadialSelected } from "react-icons/gr";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addItems } from "../../redux/slices/cartSlices";
import axios from "axios";

const API_URL = "http://localhost:8000/api/menu-categories/with-items";

const MenuContainer = () => {
  const dispatch = useDispatch();

  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [itemCount, setItemCount] = useState(0);
  const [itemId, setItemId] = useState(null);

  // Fetch categories from backend
  useEffect(() => {
    const getMenus = async () => {
      try {
        const res = await axios.get(API_URL);

        if (!res.data.success) throw new Error();

        const cats = res.data.data;
        setCategories(cats);
        setSelected(cats[0] ?? null);
      } catch (err) {
        console.error("❌ Fetch menu failed:", err);
      }
    };
    getMenus();
  }, []);

  // Quantity +
  const increment = (id) => {
    setItemId(id);
    setItemCount(prev => prev + 1);
  };

  // Quantity -
  const decrement = (id) => {
    setItemId(id);
    if (itemCount <= 0) return;
    setItemCount(prev => prev - 1);
  };

  // Add Item → Cart Redux
const handleAddToCart = (item) => {
  if (!itemId || itemId !== item.id || itemCount <= 0) return;

  const price = Number(item.basePrice);

  const newItem = {
    id: item.id,        // UUID asli dari DB
    menuId: item.id,    // 🔥 HARUS ada untuk DB relational
    name: item.name,
    price,
    quantity: itemCount,
  };

  dispatch(addItems(newItem));

  console.log("🛒 Item Added:", newItem);

  // Reset hanya untuk item ini
  setItemCount(0);
  setItemId(null);
};


  return (
    <>
      {/* Category Section */}
      <div className="grid grid-cols-5 gap-2 px-7 py-2 w-full">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex flex-col items-start justify-between p-2 rounded-lg h-[100px] cursor-pointer"
            style={{ backgroundColor: getBgColor(cat.name) }}
            onClick={() => {
              setSelected(cat);
              setItemCount(0);
              setItemId(null);
            }}
          >
            <div className="flex items-center justify-between w-full">
              <h1 className="text-[#f5f5f5] text-lg font-semibold">
                {cat.name}
              </h1>
              {selected?.id === cat.id && (
                <GrRadialSelected className="text-white" size={20} />
              )}
            </div>
            <p className="text-[#ababab] text-xs font-semibold">
              {(cat.menuItems ?? []).length} Items
            </p>
          </div>
        ))}
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mt-1" />

      {/* Items Section */}
      <div className="grid grid-cols-4 gap-2 px-7 py-2 w-full">
        {(selected?.menuItems ?? []).map((item) => (
          <div
            key={item.id}
            className="flex flex-col items-start justify-between p-3 rounded-lg h-[120px] hover:bg-[#2a2a2a] bg-[#1a1a1a]"
          >
            <div className="flex items-start justify-between w-full">
              <h1 className="text-[#f5f5f5] text-[15px] font-semibold">
                {item.name}
              </h1>
              <button
                onClick={() => handleAddToCart(item)}
                className="bg-[#2e4a40] text-[#02ca3a] p-2 rounded-lg cursor-pointer"
              >
                <FaShoppingCart size={20} />
              </button>
            </div>

            <div className="flex items-center justify-between w-full">
              <p className="text-[#f5f5f5] text-sm font-bold">
                IDR {Number(item.basePrice).toLocaleString("id-ID")}
              </p>

              <div className="flex item-center justify-between bg-[#1f1f1f] px-2 py-1 rounded-lg gap-4">
                <button
                  onClick={() => decrement(item.id)}
                  className="text-yellow-500 text-xs cursor-pointer"
                >
                  –
                </button>
                <span className="text-white">
                  {itemId === item.id ? itemCount : "0"}
                </span>
                <button
                  onClick={() => increment(item.id)}
                  className="text-yellow-500 text-xs cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MenuContainer;

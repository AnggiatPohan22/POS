import React, {useState} from 'react';
import {menus} from '../../constants'
import { getBgColor } from '../../utils';
import { GrRadialSelected } from 'react-icons/gr';
import { FaShoppingCart } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { addItems } from '../../redux/slices/cartSlices';




const MenuContainer = () => {

  const [selected, setSelected] = useState(menus[0]);
  const [itemCount, setItemCount] = React.useState(0);
  // Fungsi untuk button inc & dec item
  const [itemId, setItemId] = useState();
  const dispatch = useDispatch();

  const increment = (id) => {
            setItemId(id);
            if(itemCount >= 5) return;
            setItemCount((prev) => prev + 1);
        };

        const decrement = (id) => {
            setItemId(id);
            if(itemCount <= 0) return;
            setItemCount((prev) => prev - 1);
        };

  const handleAddToCart = (item) => {
    if(itemCount === 0) return;

    const {name, price} = item;
    const newObj = {id: new Date(), name, pricePerQuantity: price, quantity: itemCount, price: price * itemCount}
    //  ini memanggil addItems dari cartSlices.js
    dispatch(addItems(newObj));
    setItemCount(0);
  }

  return (
    <>
    {/* {Section Category Menu} */}
     <div className='grid grid-cols-5 gap-2 px-7 py-2 w-[100%]'>
        {
        menus.map((menu) => {
          return (
            <div key={menu.id} className='flex flex-col items-start justify-between p-2 rounded-lg
            h-[100px] cursor-pointer'
            // Fungsi untuk reset jumlah item jika pindah kategori atau untuk PUBLIK
            style={{backgroundColor : menu.bgColor}}
            onClick={() => {
              setSelected(menu);
              setItemId(0);
              setItemCount(0);
            }}
            >
              

              <div className='flex items-center justify-between w-full'>
                <h1 className='text-[#f5f5f5] text-lg font-semibold'>{menu.icon}{menu.name}</h1>
                {selected.id === menu.id && <GrRadialSelected className='text-white' size={20}/>}
              </div>
              <p className='text-[#ababab] text-xs font-semibold '>{menu.items.length} Items</p>
            </div>
          )
        })
        }
     </div>
    {/* {End Section Category Menu} */}

    {/* {Line Pemisah} */}
     <hr className='border-[#2a2a2a] border-t-2 mt-1' />
    {/* {End Line Pemisah} */}

    {/* {Section Item Menu dari Category} */}
    <div className='grid grid-cols-4 gap-2 px-7 py-2 w-[100%]'>
        {
        selected?.items.map((item) => {
          return (
            <div key={item.id} className='flex flex-col items-start justify-between p-3 rounded-lg
            h-[120px] hover:bg-[#2a2a2a] bg-[#1a1a1a]'
            >
              
                    <div className='flex items-start justify-between w-full'>
                      <h1 className='text-[#f5f5f5] text-lg text-[15px] font-semibold'>{item.name}</h1>
                      {/* ada function untuk menambahkan item ke cart */}
                      <button onClick={() => handleAddToCart(item)} className='bg-[#2e4a40] text-[#02ca3a] p-2 rounded-lg cursor-pointer'><FaShoppingCart size={20} /></button>
                    </div>
              <div className='flex items-center justify-between w-full'>
                      
                    <p className='text-[#f5f5f5] text-xm font-bold '>IDR.{item.price.toLocaleString("id-ID")}</p>
                    {/* {Button untuk Menambah & Kurang items} */}
                    <div className='flex item-center justify-between bg-[#1f1f1f] rounded-lg px-2 py-3 rounded-lg gap-6 z-20'>
                                <button onClick={ () => decrement (item.id)} 
                                className='text-yellow-500 text-xs cursor-pointer'>
                                  &minus;
                                  </button>
                                  <span className='text-white'>{itemId == item.id ? itemCount : "0"}</span>
                                <button onClick={ () => increment (item.id)} 
                                className='text-yellow-500 text-xm cursor-pointer'>
                                  &#43;
                                  </button>
                    </div>
              </div>
            </div>
          )
        })
        }
     </div>
     {/* {End Section Item Menu dari Category} */}
    </>
  )
}

export default MenuContainer;
import React, { useEffect, useRef } from 'react';
import { RiDeleteBin2Fill } from "react-icons/ri";
import { FaNotesMedical, FaMinus, FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { removeItem, incrementQuantity, decrementQuantity } from '../../redux/slices/cartSlices';
import { useCurrency } from '../hooks/useCurrency';

const CartInfo = () => {
    const cartData = useSelector((state) => state.cart);
    const scrollRef = useRef();
    const { formatIDR } = useCurrency();  
    const dispatch = useDispatch();

    // Auto scroll ke bawah saat item ditambah
    useEffect(() => {
        if(scrollRef.current){
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [cartData]);

    const handleRemove = (itemId) => {
        dispatch(removeItem(itemId));
    };

    const handleIncrement = (itemId) => {
        dispatch(incrementQuantity(itemId));
    };

    const handleDecrement = (itemId) => {
        dispatch(decrementQuantity(itemId));
    };

    return (
        <div className="px-4 py-2">
            <h1 className="text-lg text-[#e4e4e4] font-semibold tracking-wide">Order Details</h1>
            <div className="mt-3 overflow-y-scroll scrollbar-hide h-[220px]" ref={scrollRef}>
                {cartData.length === 0 ? (
                    <p className='text-[#ababab] text-sm flex justify-center items-center h-[340px]'>
                        Your cart is empty. Start adding items!
                    </p>
                ) : cartData.map((item) => (
                    <div key={item.id} className="bg-[#1f1f1f] rounded-lg px-4 py-2 mb-2">
                        <div className="flex items-center justify-between">
                            <h1 className="text-[#ababab] font-semibold tracking-wide text-xs">{item.name}</h1>
                            <p className="text-[#ababab] font-semibold text-xs">x{item.quantity}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3">
                                {/* Delete Button */}
                                <RiDeleteBin2Fill
                                    onClick={() => handleRemove(item.id)}
                                    title='Delete Item'
                                    className="text-[#ababab] cursor-pointer hover:text-red-400" 
                                    size={15} 
                                />
                                
                                {/* Decrement Quantity */}
                                <FaMinus 
                                    onClick={() => handleDecrement(item.id)}
                                    title='Decrease Quantity'
                                    className="text-[#ababab] cursor-pointer hover:text-yellow-400" 
                                    size={13} 
                                />
                                
                                {/* Increment Quantity */}
                                <FaPlus 
                                    onClick={() => handleIncrement(item.id)}
                                    title='Increase Quantity' 
                                    className="text-[#ababab] cursor-pointer hover:text-yellow-400"
                                    size={13} 
                                />
                            </div>
                            
                            <p className="text-[#f5f5f5] text-xs font-bold">
                                {formatIDR(item.price * item.quantity)}
                            </p>
                        </div>
                    </div>
                ))}   
            </div>
            
            
        </div>
    );
};

export default CartInfo;
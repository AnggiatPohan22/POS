import React from 'react';
import { popularDishes } from '../../constants'; //mengambil data dari folder constants (index.js)

const PopularDishes = () => {
    // Urutkan berdasarkan jumlah order (descending)
    const sortedDishes = [...popularDishes].sort((a, b) => b.numberOfOrders - a.numberOfOrders);

    // Fungsi untuk render trophy/icon top 3
    const renderTrophy = (index) => {
        if (index === 0) {
            return <span className="text-yellow-400 text-lg">🥇</span>; // Gold
        } else if (index === 1) {
            return <span className="text-gray-300 text-lg">🥈</span>; // Silver
        } else if (index === 2) {
            return <span className="text-orange-400 text-lg">🥉</span>; // Bronze
        }
        return null;
    };

    return (
        <div className='mt-2 pr-6'>
            <div className='bg-[#1a1a1a] w-full rounded-lg'>
                <div className='flex justify-between items-center px-6 py-4'>
                    <h1 className='text-[#f5f5f5] text-lg font-semibold tracking-wide'>Popular Dishes</h1>
                    <a href='' className='text-[#025cca] text-sm font-semibold'>View All</a>
                </div>

                <div className='overflow-y-scroll h-[650px] pb-4 scrollbar-hide'>
                    {sortedDishes.map((dish, index) => {
                        return (
                            <div
                                key={dish.id}
                                className={`flex items-center gap-4 rounded-[15px] px-6 py-4 mt-4 mx-6 
                                    ${index === 0 ? 'bg-[#2a1f1f]' : index === 1 ? 'bg-[#1f2a1f]' : index === 2 ? 'bg-[#1f1f2a]' : 'bg-[#1f1f1f]'}`}
                            >
                                {/* Nomor urut */}
                                <h1 className='text-[#f5f5f5] font-bold text-xl mr-4'>
                                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                                </h1>

                                {/* Foto */}
                                <img
                                    src={dish.image}
                                    alt={dish.name}
                                    className='w-12 h-12 rounded-full object-cover'
                                />

                                {/* Nama + Orders */}
                                <div className='flex-1'>
                                    <div className="flex items-center gap-2">
                                        <h2 className='text-[#f5f5f5] font-medium'>{dish.name}</h2>
                                        {renderTrophy(index)}
                                    </div>
                                    <p className='text-sm text-gray-400'>{dish.numberOfOrders} Orders</p>
                                </div>

                                {/* Harga Total */}
                                <span className='text-sm text-gray-400'>
                                    {new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        minimumFractionDigits: 0,
                                    }).format(dish.priceItem * dish.numberOfOrders)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PopularDishes;

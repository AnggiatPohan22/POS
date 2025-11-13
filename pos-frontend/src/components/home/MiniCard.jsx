import React from 'react';

const MiniCard = ({title, icon, number, footerNum}) => {
    return (
        <div className='bg-[#1a1a1a] py-4 px-5 rounded-lg w-[50%] h-[200px]'>
            <div className='flex items-start justify-between'>
                <h1 className='text-[#f5f5f5] text-lg font-semibold tracking-wide'>{title}</h1>
                <button className={`${title === "Total Earnings" ? "bg-[#02ca3a]" : "bg-[#f6b100]"} p-3 rounded-lg text-[#f5f5f5] text-2xl`}>{icon}</button>
            </div>
            <div>
                <h1 className='text-[#f5f5f5] text-4xl font-bold mt-2'>{title === "Total Earnings" ? 
                `IDR${number}`: number}</h1>
                <h1 className='text-[#f5f5f5] text-lg mt-2'><span className='text-[#02ca3a]'>
                {footerNum}%</span> than Yesterday</h1>
            </div>
        </div>
    );
};

export default MiniCard;
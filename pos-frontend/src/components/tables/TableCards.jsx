import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaLongArrowAltRight } from 'react-icons/fa';
import { getAvatarName } from '../../utils';
import { updateTable } from "../../redux/slices/tableSlices";



const TableCards = ({key, name, status, initials, seat}) => {
    const dispatch = useDispatch(); // must redux ( store )
    const navigate = useNavigate ();
    const handleClick = (name) => { // Function untuk update data saat create order ( redux )
        if (status === "Booked") return;
        dispatch(updateTable({tableNo: name })); 
        navigate(`/menu`);
    };

    return (
        <div onClick={() => handleClick(name)} key={key} className='w-[260px] h-[165px] hover:bg-[#424141] bg-[#262626] p-4 rounded-lg cursor-pointer' >
            <div className='flex item-center justify-between px-1'>
                <h1 className='text-[#f5f5f5] text-xl font-semibold '>
                    {name} <FaLongArrowAltRight className='text-[#ababab] ml-2 inline' /></h1>
                <p className={`${status === "Booked" ? "text-green-600 bg-[#2e4a40]" :
                    "bg-[#664a04] text-white"} px-2 py-1 rounded-lg `}>
                    {status}
                </p>
            </div>
            <div className='flex item-center justify-center my-4'>
                <h1 className={`${status === "Booked" ? "text-green-600 bg-[#2e4a40]" :
                    "bg-[#664a04] text-white"} rounded-full p-4 text-xl`}>{getAvatarName(initials) || "N/A"}</h1>
            </div>
            <div className='flex item-center justify-between px-1'>
                <p className='text-[#ababab] text-xs'>Seats : {seat}</p>
            </div>
        </div>
    );
};

export default TableCards;
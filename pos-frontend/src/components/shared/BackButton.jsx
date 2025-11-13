import React from 'react';
import { IoArrowBackOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
    
    const naviagte = useNavigate();

    return (
        <button className='bg-[#025cca] p-3 text-xl font-bold rounded-full text-[#f5f5f5] text-2xl' onClick={() => naviagte(-1)}>
            <IoArrowBackOutline />
        </button>
    );
};

export default BackButton;
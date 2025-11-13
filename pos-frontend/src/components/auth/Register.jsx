import { combineSlices } from '@reduxjs/toolkit';
import React, { useState } from 'react';
import { CiLight } from 'react-icons/ci';
import { register } from '../../https';
import { useMutation } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';    

const Register = ({setRegister}) => {

    const[formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: ""
    });

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name] : e.target.value});
    }

    const handleRoleSelection = (selectedRole) => {
        setFormData({...formData, role: selectedRole});
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData); 
        registerMutation.mutate(formData);
    }

    const registerMutation = useMutation({ // function untuk mengembalikan form yang telah di isi menjadi kosong dan masuk ke login page
            mutationFn: (reqData) => register(reqData),
            onSuccess: (res) => {
                const { data } = res;
                enqueueSnackbar(data.message, {variant: "success"});
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    password: "",
                    role: ""
                });

                setTimeout(() => {
                    setRegister(false);
                }, 1500);
            },
            onError: (error) => {
                const { response } = error;
                enqueueSnackbar(response.data.message, {variant: "error"});
            }
    })

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label className='block text-[#ffffff] mb-2 text-sm font-medium'>
                        Employee Name
                    </label>
                    <div className='flex items-center rounded-[12px] p-3 px-4 bg-[#1f1f1f]'>
                        <input type="text" 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder='Enter employee name'
                            className='bg-transparent flex-1 text-white/50 focus:outline-none'
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className='block text-[#ffffff] mt-3 mb-2 text-sm font-medium'>
                        Employee Email
                    </label>
                    <div className='flex items-center rounded-[12px] p-3 px-4 bg-[#1f1f1f]'>
                        <input type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder='Enter employee email'
                            className='bg-transparent flex-1 text-white/50 focus:outline-none'
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className='block text-[#ffffff] mb-2 mt-3 text-sm font-medium'>
                        Employee Phone
                    </label>
                    <div className='flex items-center rounded-[12px] p-3 px-4 bg-[#1f1f1f]'>
                        <input type="number" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder='Enter employee phone'
                            className='bg-transparent flex-1 text-white/50 focus:outline-none'
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className='block text-[#ffffff] mb-2 mt-3 text-sm font-medium'>
                        Employee Password
                    </label>
                    <div className='flex items-center rounded-[12px] p-3 px-4 bg-[#1f1f1f]'>
                        <input type="password" 
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder='Enter password'
                            className='bg-transparent flex-1 text-white/50 focus:outline-none'
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className='block text-[#ffffff] mb-2 mt-4 text-sm font-medium'>
                        Choose your role
                    </label>

                    <div className="flex items-center gap-3 mt-3">
                    {["Waiter", "Cashier", "Admin"].map((role) => {
                        return (
                            <button
                            key={role}
                            type='button'
                            onClick={() => handleRoleSelection(role)}
                            className={`bg-[#1f1f1f] px-3 py-4 w-full rounded-lg text-[#ffffff] cursor-pointer ${formData.role === role ?
                            "bg-indigo-700" : ""}`}
                            >
                                {role}
                            </button>
                        );
                    })}
                    </div>
                </div>

                <button className='w-full rounded-lg mt-6 py-3 text-lg bg-yellow-300
                text-gray-900 font-bold cursor-pointer'>
                    Sign Up
                </button>
                
            </form>
        </div>
    );
};

export default Register;
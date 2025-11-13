import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { login } from "../../https/index"
import { enqueueSnackbar } from 'notistack';
import { useDispatch } from 'react-redux'; 
import { setUser } from '../../redux/slices/userSlice';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name] : e.target.value});
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        loginMutation.mutate(formData);
    }

    const loginMutation = useMutation({
        mutationFn: (reqData) => login(reqData),
        onSuccess: (res) => {
            const { data } = res;
            console.log("Login Success:", data);
            
            const { _id, name, email, phone, role } = data.data;
            
            // Dispatch user data ke Redux
            dispatch(setUser({ _id, name, email, phone, role }));
            
            // ✅ Simpan user info di localStorage untuk akses mudah
            localStorage.setItem('user', JSON.stringify({ _id, name, email, phone, role }));
            
            enqueueSnackbar("Login successful!", { variant: "success" });
            navigate("/");
        },
        onError: (error) => {
            const { response } = error;
            enqueueSnackbar(response?.data?.message || "Login failed", {variant: "error"});
        }
    });

    return (
        <div>
            <form onSubmit={handleSubmit}>
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
                
                <button 
                    type="submit"
                    disabled={loginMutation.isPending}
                    className={`w-full rounded-lg mt-6 py-3 text-lg bg-yellow-300 text-gray-900 font-bold cursor-pointer ${
                        loginMutation.isPending ? 'opacity-50' : ''
                    }`}
                >
                    {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
        </div>
    );
};

export default Login;
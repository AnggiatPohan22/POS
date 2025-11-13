import React, {useEffect, useState} from 'react';
import restaurant from "../assets/images/restaurant-img.jpg";
import logo from "../assets/logo-aruma.png";
import Register from '../components/auth/Register';
import Login from '../components/auth/Login';

const Auth = () => {
    // Title Page
    useEffect(() => {
    document.title = "Aruma Restaurant | Menu"
    }, [])

    const [isRegister, setRegister] = useState(false);

    return (
        <div className='flex h-screen w-full overflow-hidden'  style={{ height: "117.5dvh" }}>
            {/* LEFT SECTION */}
            <div className='w-[70%] relative flex items-center justify-center'>
                {/* BG IMAGE */}
                <img className='absolute w-full h-full object-cover' src={restaurant} alt="Restaurant Image" />

                {/* Black Overlay */}
                <div className='absolute inset-0 bg-[#1a1a1a64]'></div>

                {/* Quote at Bottom */}
                <blockquote className='absolute bottom-10 px-8 mb-4 text-2xl italic text-white'>
                    "Server customer the best food with prompt and friendly service in a welcoming atmosphere
                    , and they'll keep coming back."
                    <br />
                    <span className='block mt-4 text-yellow-300'>- Aruma Restaurant</span>
                </blockquote>
            </div>

            {/* Right Section */}
            <div className='w-[35%] bg-[#1a1a1a] p-10'>
                <div className='flex flex-col items-center gap-2'>
                    <img src={logo} alt="Aruma Restaurant Logo" className='h-40 w-40' />
                </div>

                <h2 className='text-2xl text-center font-semobold text-yellow-300 mb-5'>
                    {isRegister ? "Employee Registration" : "Employee Login"}
                </h2>

                {/* Components */}
                {isRegister ? <Register setRegister={setRegister} /> : <Login />}
                

                <div className='flex justify-center mt-6'>
                    <p className='text-sm text-[#ababab]'>
                        {isRegister ? "Already have an account?" : "Don't have an account?"}
                        <a onClick={() => setRegister(!isRegister)} className='text-yellow-300 font-semibold hover:underline' href="#">
                        {isRegister ? "Sign in" : "Sign up"}
                        </a>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Auth;
import React from "react"
import { FaSearch, FaUserCircle } from "react-icons/fa";   
import { FaBell } from "react-icons/fa";
import logo from "../../assets/logo-aruma.png";
import { useDispatch, useSelector } from "react-redux";
import { IoLogOut } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../../https";
import { removeUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";

const Header = () => {

    const dispatch = useDispatch();
    const userData = useSelector(state => state.user);
    const navigate = useNavigate();

    const logoutMutation = useMutation({
        mutationFn: () => logout(),
        onSuccess: (data) => {
            console.log(data);
            dispatch(removeUser());
            navigate("/auth");
        },
        onError: (error) => {
            console.log(error);
        } 
    })

    const handleLogout = () => {
        logoutMutation.mutate();
    }

    return (
        <header className="flex justify-between items-center py-2 px-8" style={{backgroundColor: '#1a1a1a'}} >
            {/* Logo  */}
            <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer" >   
                <img src={logo} alt="Logo" className="h-10 w-10"/>
                <h1 className="text-lg font-semibold text-[#f5f5f5]">Aruma Restaurant</h1>
            </div>

            {/* Search Bar  */}
            <div className="flex items-center gap-4 bg-[#1f1f1f] rounded-[20px] px-5 py-2 w-[500px]">
                <FaSearch className="text-[#f5f5f5]" />
                <input type="text" placeholder="Search..." className="bg-[#1f1f1f] outline-none text-[#f5f5f5]" />
            </div>
            
            {/* Logged User Detail  */}
            <div className="flex items-center gap-4">
                {userData.role === "admin" && ( // fungsi untuk menampilkan icon dashboard jika user yang login adalah admin
                    <div onClick={() => navigate('/Dashboard')} className="bg-[#1f1f1f] rounded-[15px] p-3 cursor-pointer">
                     <MdDashboard className="text-[#f5f5f5] text-2xl" />
                </div>
                )}
                <div className="bg-[#1f1f1f] rounded-[15px] p-3 cursor-pointer">
                     <FaBell className="text-[#f5f5f5] text-2xl" />
                </div>
                <div className="flex items-center gap-3 cursor-pointer">
                    <FaUserCircle className="text-[#f5f5f5] text-4xl" />    
                <div className="flex flex-col item-start">
                    <h1 className="text-md text-[#f5f5f5] font-semibold">{userData.name || "Name User"}</h1>
                    <p className="text-xs text-[#ababab] font-medium">{userData.role || "Role"}</p>
                </div>
                <IoLogOut onClick={handleLogout} className="text-[#f5f5f5] ml-2" size={30} />
                </div>
            </div>
           
        </header>
    );
};

export default Header
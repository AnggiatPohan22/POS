import React, {useEffect} from 'react'; 
import BottomNav from '../components/shared/BottomNav';
import Greetings from '../components/home/Greetings';
import MiniCard from '../components/home/MiniCard';
import { BsCashCoin } from 'react-icons/bs';
import { GrInProgress } from 'react-icons/gr'; 
import RecentOrders from '../components/home/RecentOrders';
import PopularDishes from '../components/home/PopularDishes';

const Home = () => {
    // Title Page
        useEffect(() => {
          document.title = "Aruma Restaurant | Menu"
        }, [])
        
    return (
        <section className="bg-[#1f1f1f] min-h-screen overflow-hidden flex gap-3">
            {/* Left Div */}
            <div className="flex-[3] ">
                <Greetings />
                <div className='flex item-center w-full px-8 mt-4 gap-3 px-8 mt-4'>
                    <MiniCard title="Total Earnings" icon={<BsCashCoin/>} number={512} footerNum={1.6} />
                    <MiniCard title="In Progress" icon={<GrInProgress />} number={16} footerNum={3.6} />
                </div>
                <RecentOrders />
            </div>
            {/* Right Div */}
            <div className="flex-[1.5]">
                <PopularDishes />
            </div>
            <BottomNav />
        </section>
    );
};

export default Home;
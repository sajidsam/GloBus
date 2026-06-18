
import Header from '../Components/Header';
import AdvBanner from '../Components/AdvBanner';
import Footer from '../Components/Footer';
import MenuItem from '../Components/MenuItem';
import PromotionCard from '../Components/PromotionCard';
import Timer from '../Components/Timer';
import ContactUs from '../Components/ContactUs';
import Products from '../Components/Products';
import Newsletter from '../Components/Newsletter';
const Home = () => {

    return (
        <>



            <div className='flex space-x-2 justify-center items-center mx-10'>
                <div className='flex flex-col '>
                    <MenuItem></MenuItem>
                    <Timer></Timer>
                </div>
                <AdvBanner></AdvBanner>
                <PromotionCard></PromotionCard>
            </div>
            <Products></Products>
            <Newsletter></Newsletter>



        </>
    );
};

export default Home;
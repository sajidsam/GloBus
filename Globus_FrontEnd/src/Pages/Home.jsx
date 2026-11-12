import React, { useState } from "react";
import Header from "../Components/Header";
import AdvBanner from "../Components/AdvBanner";
import Footer from "../Components/Footer";
import MenuItem from "../Components/MenuItem";
import PromotionCard from "../Components/PromotionCard";
import Timer from "../Components/Timer";
import ContactUs from "../Components/ContactUs";
import Products from "../Components/Products";
import Newsletter from "../Components/Newsletter";

const INITIAL_SECTION_COUNT = 4; // Up to Electronics
const TOTAL_SECTION_COUNT = 9;

const Home = () => {
  const [visibleSectionCount, setVisibleSectionCount] = useState(INITIAL_SECTION_COUNT);

  const isAllSectionsVisible = visibleSectionCount >= TOTAL_SECTION_COUNT;

  const handleToggleFeed = () => {
    if (!isAllSectionsVisible) {
      // Reveal 1 more section at a time
      setVisibleSectionCount((prev) => Math.min(TOTAL_SECTION_COUNT, prev + 1));
    } else {
      // Reset back to initial Electronics state and scroll smoothly to top
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setVisibleSectionCount(INITIAL_SECTION_COUNT);
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-3.5 lg:gap-4 xl:gap-6 justify-center items-center lg:items-start mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-14 2xl:mx-20 px-2 sm:px-3 md:px-4 lg:px-6 mt-4 lg:mt-6">
        <div className="hidden lg:flex flex-col flex-shrink-0 w-full lg:w-auto items-center lg:items-start">
          <MenuItem />
          <Timer />
        </div>
        <div className="flex-1 w-full min-w-0 flex justify-center">
          <AdvBanner />
        </div>
        <div className="hidden lg:flex flex-shrink-0 w-full lg:w-auto justify-center">
          <PromotionCard />
        </div>
      </div>
      <Products visibleSectionCount={visibleSectionCount} />
      <Newsletter
        isAllSectionsVisible={isAllSectionsVisible}
        onToggleFeed={handleToggleFeed}
      />
    </>
  );
};

export default Home;

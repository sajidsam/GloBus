import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

const menuData = [
  {
    name: "Food",
    icon: "/Images/ImageMenu/healthy-food.png",
    subMenu: ["Fruits", "Vegetables", "Snacks"],
  },
  {
    name: "Kitchen Utils",
    icon: "/Images/ImageMenu/kitchen.png",
    subMenu: ["Pots & Pans", "Cutlery", "Appliances"],
  },
  {
    name: "Fashion",
    icon: "/Images/ImageMenu/fashion.png",
    subMenu: ["Men", "Women", "Kids"],
  },
  {
    name: "Skin Care",
    icon: "/Images/ImageMenu/skin-care.png",
    subMenu: ["Creams", "Lotions", "Oils"],
  },
  {
    name: "Electronics",
    icon: "/Images/ImageMenu/device.png",
    subMenu: ["Mobiles", "Laptops", "Cameras"],
  },
  {
    name: "Stationary",
    icon: "/Images/ImageMenu/stationary.png",
    subMenu: ["Pens", "Notebooks", "Art Supplies"],
  },
  {
    name: "Toys",
    icon: "/Images/ImageMenu/teddy-bear.png",
    subMenu: ["Soft Toys", "Educational", "Action Figures"],
  },
];

const MenuItem = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleSubMenu = (index) => {
    if (openIndex === index) {
      setOpenIndex(null); 
    } else {
      setOpenIndex(index); 
    }
  };

  return (
    <div className="mt-10">
      <div className="bg-gray-100 rounded-xl w-80 h-100 p-4 ">
        {menuData.map((item, index) => (
          <div key={index} className="relative">
            
            {/* Main Menu  */}
            <div
              className="flex items-center justify-between space-x-2 cursor-pointer hover:bg-white/10 px-3 py-2 rounded transition"
              onClick={() => toggleSubMenu(index)}
            >
              <div className="flex items-center space-x-2">
                <img src={item.icon} alt={item.name} className="w-6 h-6" />
                <span className="font-medium">{item.name}</span>
              </div>
              {item.subMenu && (
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className={`text-gray-500 transition-transform ${
                    openIndex === index ? "rotate-90" : ""
                  }`}
                />
              )}
            </div>

            {/* Submenu */}
            {openIndex === index && item.subMenu && (
              <div className="absolute top-0 left-full ml-4 bg-gray-100 rounded-xl w-64 p-4 shadow-lg z-10">
                {item.subMenu.map((sub, subIndex) => (
                  <div
                    key={subIndex}
                    className="px-3 py-2 rounded cursor-pointer hover:bg-white/10 transition"
                  >
                    {sub}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuItem;

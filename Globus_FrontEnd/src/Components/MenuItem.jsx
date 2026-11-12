import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../Contexts/LanguageContext";

// Backend Api
const API_URL = import.meta.env.VITE_API_URL;

const menuData = [
  {
    name: "Food",
    icon: "/Images/ImageMenu/healthy-food.png",
    subMenu: ["Fruits", "Vegetables", "Snacks", "Beverages", "Dairy & Bakery"],
  },
  {
    name: "Kitchen Utils",
    icon: "/Images/ImageMenu/kitchen.png",
    subMenu: ["Pots & Pans", "Cutlery", "Appliances", "Cookware", "Storage"],
  },
  {
    name: "Fashion",
    icon: "/Images/ImageMenu/fashion.png",
    subMenu: ["Men", "Women", "Kids", "Footwear", "Watches & Jewelry", "Bags"],
  },
  {
    name: "Skin Care",
    icon: "/Images/ImageMenu/skin-care.png",
    subMenu: ["Creams", "Lotions", "Oils", "Cleansers & Serums", "Sunscreen"],
  },
  {
    name: "Electronics",
    icon: "/Images/ImageMenu/device.png",
    subMenu: [
      "Mobiles",
      "Laptops",
      "Audio & Headphones",
      "Smartwatches & Wearables",
      "Cameras",
      "Drones",
      "Accessories",
    ],
  },
  {
    name: "Stationary",
    icon: "/Images/ImageMenu/stationary.png",
    subMenu: ["Pens", "Notebooks", "Art Supplies", "Office Supplies"],
  },
  {
    name: "Toys",
    icon: "/Images/ImageMenu/teddy-bear.png",
    subMenu: ["Soft Toys", "Educational", "Action Figures", "Board Games"],
  },
];

const MenuItem = () => {
  const { tCategory, tSubCategory } = useLanguage();
  const [openIndex, setOpenIndex] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const leaveTimerRef = useRef(null);

  const handleMouseEnter = (index) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setOpenIndex(index);
  };

  const handleMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => {
      setOpenIndex(null);
    }, 250);
  };

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  // Fetch all products once
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/browseProduct`);
        if (!res.ok) return;
        const data = await res.json();
        setAllProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch all products error:", err);
      }
    };
    fetchAllProducts();
  }, []);

  // Close submenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Arrow click / hover → toggle submenu ONLY
  const handleArrowToggle = (e, index) => {
    e.stopPropagation();
    setOpenIndex(openIndex === index ? null : index);
  };

  // Category name click → redirect to search results
  const handleCategoryClick = (categoryName) => {
    setOpenIndex(null);
    const filtered = allProducts.filter((p) => p.category === categoryName);
    navigate(`/search?q=&category=${encodeURIComponent(categoryName)}`, {
      state: {
        searchResults: filtered,
        searchQuery: "",
        category: categoryName,
      },
    });
  };

  const matchField = (field, query) => {
    if (!field) return false;
    if (typeof field === "string") return field.toLowerCase().includes(query);
    if (Array.isArray(field)) {
      return field.some(
        (item) =>
          typeof item === "string" && item.toLowerCase().includes(query),
      );
    }
    return String(field).toLowerCase().includes(query);
  };

  // Subcategory click → redirect with subcategory match inside parent category
  const handleSubCategoryClick = (categoryName, subName) => {
    setOpenIndex(null);
    const query = subName.toLowerCase();
    const filtered = allProducts.filter((p) => {
      const matchesCategory = p.category === categoryName;
      const matchesSubCategory =
        (p.subCategory &&
          typeof p.subCategory === "string" &&
          p.subCategory.toLowerCase() === query) ||
        matchField(p.name, query);
      return matchesCategory && matchesSubCategory;
    });
    navigate(
      `/search?q=${encodeURIComponent(subName)}&category=${encodeURIComponent(categoryName)}`,
      {
        state: {
          searchResults: filtered,
          searchQuery: subName,
          category: categoryName,
        },
      },
    );
  };

  return (
    <div ref={containerRef} className="w-full">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl w-full lg:w-52 xl:w-64 2xl:w-80 p-2.5 lg:p-3 xl:p-3.5 2xl:p-4 border border-transparent dark:border-gray-700 shadow-sm">
        {menuData.map((item, index) => (
          <div
            key={index}
            className="relative"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Main Row */}
            <div className="flex items-center justify-between px-2 py-1 lg:py-1.5 xl:py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition group">
              {/* Left: icon + name → click to redirect */}
              <div
                className="flex items-center space-x-2 flex-1 cursor-pointer min-w-0"
                onClick={() => handleCategoryClick(item.name)}
              >
                <img
                  src={item.icon}
                  alt={item.name}
                  className="w-4 h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 dark:invert flex-shrink-0"
                />
                <span className="font-medium text-xs xl:text-sm 2xl:text-base text-gray-800 dark:text-gray-200 transition truncate">
                  {tCategory(item.name)}
                </span>
              </div>

              {/* Right: arrow → hover or click to open submenu */}
              {item.subMenu && (
                <div
                  className="p-1 rounded cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  onClick={(e) => handleArrowToggle(e, index)}
                >
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className={`text-gray-500 dark:text-gray-400 text-base transition-transform duration-200 ${
                      openIndex === index
                        ? "rotate-90 text-gray-700 dark:text-gray-200"
                        : ""
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Submenu — with seamless hover bridge */}
            {openIndex === index && item.subMenu && (
              <div
                className="absolute top-0 left-full pl-3 bg-transparent z-20"
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl w-52 py-2 shadow-xl border border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-4 pb-1 border-b border-gray-100 dark:border-gray-700 mb-1">
                    {tCategory(item.name)}
                  </p>
                  {item.subMenu.map((sub, subIndex) => (
                    <div
                      key={subIndex}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 text-gray-700 dark:text-gray-300 text-sm font-medium transition"
                      onClick={() => handleSubCategoryClick(item.name, sub)}
                    >
                      {tSubCategory(sub)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuItem;

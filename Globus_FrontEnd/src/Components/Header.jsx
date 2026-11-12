import React, { useState, useEffect, useRef } from "react";
import {
  faLocationDot,
  faSearch,
  faCartShopping,
  faUser,
  faChevronDown,
  faHeart,
  faMoon,
  faSun,
  faCreditCard,
  faBars,
  faTimes,
  faCamera,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase.config";
import { useTheme } from "../Contexts/ThemeContext";
import { useLanguage } from "../Contexts/LanguageContext";

// Backend Api
const API_URL = import.meta.env.VITE_API_URL;

const cats = [
  "All",
  "Food",
  "Kitchen Utils",
  "Fashion",
  "Skin Care",
  "Electronics",
  "Stationary",
  "Toys",
];

const Header = () => {
  const { lang, setLang, langs, t, tCategory } = useLanguage();
  const [cat, setCat] = useState(cats[0]);
  const [openLang, setOpenLang] = useState(false);
  const [openCat, setOpenCat] = useState(false);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loc, setLoc] = useState(null);
  const { isDarkMode, toggleTheme } = useTheme();
  const [openProfile, setOpenProfile] = useState(false);
  const [wishlistHover, setWishlistHover] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [menuOverflow, setMenuOverflow] = useState("hidden");
  const [isVisionSearching, setIsVisionSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef(null);
  const [wishlistCount, setWishlistCount] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wishlist") || "[]").length;
    } catch (e) {
      return 0;
    }
  });

  useEffect(() => {
    const updateCount = () => {
      try {
        setWishlistCount(
          JSON.parse(localStorage.getItem("wishlist") || "[]").length,
        );
      } catch (e) {
        setWishlistCount(0);
      }
    };
    window.addEventListener("wishlist-updated", updateCount);
    return () => window.removeEventListener("wishlist-updated", updateCount);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const langRef = useRef(null);
  const catRef = useRef(null);
  const profRef = useRef(null);

  const navigate = useNavigate();

  // Visual Search handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsVisionSearching(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Data = reader.result;
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/vision-search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64Data }),
        });
        const data = await response.json();
        setIsVisionSearching(false);
        if (response.ok) {
          setSearchQuery(data.query);
        } else {
          alert(
            "Failed to search by image: " + (data.error || "Unknown error"),
          );
        }
      } catch (err) {
        console.error(err);
        setIsVisionSearching(false);
        alert("Network error during visual search");
      }
    };
  };

  // Voice Search Handler
  const startVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support voice search.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = lang.code === "bd" ? "bn-BD" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
    };
    recognition.onerror = (event) => console.error(event.error);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // Fetch all products
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser((prev) => ({
          ...prev,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        }));
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    await signOut(auth);
    setOpenProfile(false);
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch("https://ipwho.is/");
        const data = await res.json();
        if (data && data.city && data.country) {
          setLoc({ city: data.city, country: data.country });
        }
      } catch (err) {
        console.error("Location fetch error:", err);
      }
    };
    fetchLocation();
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (langRef.current && !langRef.current.contains(e.target))
        setOpenLang(false);
      if (catRef.current && !catRef.current.contains(e.target))
        setOpenCat(false);
      if (profRef.current && !profRef.current.contains(e.target))
        setOpenProfile(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Handle mobile menu overflow timing for smooth animations
  useEffect(() => {
    if (mobileMenuOpen) {
      const timer = setTimeout(() => setMenuOverflow("visible"), 300);
      return () => clearTimeout(timer);
    } else {
      setMenuOverflow("hidden");
    }
  }, [mobileMenuOpen]);

  // Close mobile menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (mobileMenuOpen) setMobileMenuOpen(false);
      if (mobileSearchOpen) setMobileSearchOpen(false);
    };
    if (mobileMenuOpen || mobileSearchOpen) {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileMenuOpen, mobileSearchOpen]);

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

  // Filter Search suggestions
  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    const filtered = allProducts.filter((p) => {
      const query = searchQuery.toLowerCase();
      const matchesText =
        matchField(p.name, query) ||
        matchField(p.subCategory, query) ||
        matchField(p.brand, query) ||
        matchField(p.tags, query);
      const matchesCategory = cat === "All" || p.category === cat;
      return matchesText && matchesCategory;
    });

    setSuggestions(filtered.slice(0, 10));
    setActiveIndex(-1);
  }, [searchQuery, allProducts, cat]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const filtered = allProducts.filter((p) => {
        const query = searchQuery.toLowerCase();
        const matchesText =
          matchField(p.name, query) ||
          matchField(p.subCategory, query) ||
          matchField(p.brand, query) ||
          matchField(p.tags, query);
        const matchesCategory = cat === "All" || p.category === cat;
        return matchesText && matchesCategory;
      });

      navigate(
        `/search?q=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(cat)}`,
        {
          state: { searchResults: filtered, searchQuery, category: cat },
        },
      );
      setSearchQuery("");
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions.length > 0) {
        const selected = suggestions[activeIndex];
        navigate(`/productDetail/${selected._id}`, {
          state: { product: selected },
        });
        setSearchQuery("");
        setSuggestions([]);
      } else {
        handleSearch();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length,
      );
    }
  };

  const firstName =
    user?.name?.split(" ")[0] || user?.displayName?.split(" ")[0] || "";

  return (
    <>
      <header className="bg-gray-900 sticky z-50 top-0 shadow-lg border-b border-gray-700 w-full">
        <div className="flex items-center justify-between mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-14 2xl:mx-20 px-2 sm:px-3 md:px-4 lg:px-6 py-2.5 lg:py-3 gap-2 md:gap-4">

          {/* Logo */}
          <div
            className="flex items-center cursor-pointer flex-shrink-0"
            onClick={() => navigate("/")}
          >
            <h1 className="font-bold text-2xl lg:text-3xl text-green-600">
              Glo<span className="text-white">Bus</span>
            </h1>
          </div>

          {/* Location — hidden on mobile */}
          <div className="hidden sm:flex text-white items-center flex-shrink-0">
            <FontAwesomeIcon
              icon={faLocationDot}
              className="text-base lg:text-lg mr-1.5 lg:mr-2 text-gray-300"
            />
            <div className="font-semibold leading-tight">
              <h1 className="text-[11px] text-gray-400 font-normal">
                {t("deliverTo")}
              </h1>
              <h1 className="text-xs lg:text-sm font-bold truncate max-w-[130px] lg:max-w-[160px]">
                {loc ? `${loc.city}, ${loc.country}` : "Dhaka, Bangladesh"}
              </h1>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 min-w-0 max-w-xl lg:max-w-2xl 2xl:max-w-3xl mx-2 lg:mx-4">
            <div className="flex w-full relative">
              <div className="relative flex-shrink-0" ref={catRef}>
                <button
                  onClick={() => setOpenCat(!openCat)}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 lg:px-3.5 h-9 lg:h-10 rounded-l-md border-r border-gray-300 dark:border-gray-600 text-xs lg:text-sm font-medium flex items-center hover:bg-gray-200 dark:hover:bg-gray-600 transition whitespace-nowrap"
                >
                  <span className="truncate max-w-[65px] lg:max-w-[85px]">
                    {tCategory(cat)}
                  </span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`ml-1.5 text-[10px] transition-transform ${openCat ? "rotate-180" : ""}`}
                  />
                </button>
                {openCat && (
                  <div className="absolute top-full left-0 mt-1 w-44 lg:w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-50">
                    {cats.map((c) => (
                      <button
                        key={c}
                        className={`w-full px-4 py-2 text-xs lg:text-sm text-left hover:bg-blue-50 ${cat === c ? "bg-blue-100 text-blue-800" : "text-gray-800 dark:text-gray-200"}`}
                        onClick={() => { setCat(c); setOpenCat(false); }}
                      >
                        {tCategory(c)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative flex-1 min-w-0">
                <div className="flex items-center bg-white dark:bg-gray-800 border-t border-b border-gray-300 dark:border-gray-600 h-9 lg:h-10 w-full">
                  <input
                    type="text"
                    placeholder={`${t("searchPlaceholder")}...`}
                    className="flex-1 min-w-0 px-2.5 lg:px-3 h-full text-black dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none bg-transparent w-full text-xs lg:text-sm"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setActiveIndex(-1); }}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    className={`px-1.5 lg:px-2.5 h-full flex items-center justify-center transition ${isListening ? "text-red-500 animate-pulse" : "text-gray-500 hover:text-orange-500"}`}
                    onClick={startVoiceSearch}
                    title="Search by Voice"
                  >
                    <FontAwesomeIcon icon={faMicrophone} className="text-xs lg:text-sm" />
                  </button>
                  <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                  <button
                    className="px-1.5 lg:px-2.5 h-full flex items-center justify-center text-gray-500 hover:text-orange-500 transition"
                    onClick={() => fileInputRef.current?.click()}
                    title="Search by Image"
                    disabled={isVisionSearching}
                  >
                    {isVisionSearching ? (
                      <div className="w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FontAwesomeIcon icon={faCamera} className="text-sm lg:text-base" />
                    )}
                  </button>
                </div>
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 z-50 max-h-60 overflow-auto shadow-lg rounded-b-md">
                    {suggestions.map((s, idx) => (
                      <div
                        key={s._id}
                        onClick={() => { navigate(`/productDetail/${s._id}`, { state: { product: s } }); setSearchQuery(""); setSuggestions([]); }}
                        className={`flex items-center px-3 py-2 cursor-pointer ${activeIndex === idx ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                      >
                        <img src={s?.images[0] ? s?.images[0] : "/placeholder.png"} alt={s.name} className="w-7 h-7 lg:w-9 lg:h-9 object-cover rounded mr-2.5" />
                        <span className="text-gray-800 dark:text-gray-200 text-xs lg:text-sm truncate">{s.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="bg-orange-500 px-3.5 lg:px-4.5 h-9 lg:h-10 rounded-r-md flex items-center justify-center hover:bg-orange-600 transition flex-shrink-0"
                onClick={handleSearch}
              >
                <FontAwesomeIcon icon={faSearch} className="text-white text-xs lg:text-sm" />
              </button>
            </div>
          </div>

          {/* Desktop Right Nav */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3 xl:space-x-4 2xl:space-x-5 flex-shrink-0">
            <div className="flex items-center space-x-2 lg:space-x-3.5 xl:space-x-4 2xl:space-x-5">
              <div className="relative" ref={langRef}>
                <button
                  className="flex items-center text-white px-1.5 lg:px-2 py-1 rounded hover:bg-gray-800 transition"
                  onClick={() => setOpenLang(!openLang)}
                >
                  <span className="font-medium flex items-center text-xs lg:text-sm">
                    <img src={`https://flagcdn.com/${lang.code}.svg`} alt={lang.name} className="w-4 h-3 lg:w-5 lg:h-3.5 mr-1.5 object-cover rounded-[1px]" />
                    <span className="hidden xl:inline">{lang.name}</span>
                  </span>
                  <FontAwesomeIcon icon={faChevronDown} className={`ml-1 text-[10px] transition-transform ${openLang ? "rotate-180" : ""}`} />
                </button>
                {openLang && (
                  <div className="absolute top-full left-0 md:left-auto md:right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-50">
                    {langs.map((l) => (
                      <button
                        key={l.code}
                        className={`flex items-center w-full px-3 py-1.5 text-xs lg:text-sm text-left hover:bg-blue-50 ${lang.code === l.code ? "bg-blue-100 text-blue-800" : "text-gray-800 dark:text-gray-200"}`}
                        onClick={() => { setLang(l); setOpenLang(false); }}
                      >
                        <img src={`https://flagcdn.com/${l.code}.svg`} alt={l.name} className="w-4 h-3 mr-2 object-cover rounded-[1px]" />
                        <span>{l.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-white cursor-pointer flex items-center hover:text-gray-300 transition px-1.5 lg:px-2 py-1 rounded" onClick={() => navigate("/orderHistory")} title="Orders & Payments">
                <FontAwesomeIcon icon={faCreditCard} className="text-sm lg:text-base" />
                <h1 className="ml-1.5 font-medium text-xs lg:text-sm whitespace-nowrap">
                  <span className="hidden 2xl:inline">{t("ordersPayments")}</span>
                  <span className="2xl:hidden">{t("orders")}</span>
                </h1>
              </div>
              <div className="text-white cursor-pointer flex items-center hover:text-gray-300 transition px-1.5 lg:px-2 py-1 rounded" onClick={() => navigate("/cart")} title="Cart">
                <FontAwesomeIcon icon={faCartShopping} className="text-sm lg:text-base" />
                <h1 className="ml-1 font-medium text-xs lg:text-sm">{t("cart")}</h1>
              </div>
              <div className="text-white cursor-pointer flex items-center hover:text-gray-300 transition relative px-1.5 lg:px-2 py-1 rounded" onClick={() => navigate("/wishlist")} onMouseEnter={() => setWishlistHover(true)} onMouseLeave={() => setWishlistHover(false)} title="Wishlist">
                <div className="relative flex items-center">
                  <FontAwesomeIcon icon={faHeart} className="text-red-500 font-bold text-sm lg:text-base" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white font-bold text-[8px] lg:text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center border border-gray-900">{wishlistCount}</span>
                  )}
                </div>
                <h1 className="ml-1 font-medium text-xs lg:text-sm">{t("wishlist")}</h1>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-5 lg:h-6 w-10 lg:w-12 items-center rounded-full transition duration-200 ease-in-out ${isDarkMode ? "bg-gray-700 border border-gray-500" : "bg-gray-600"}`}
              >
                <span className={`inline-block h-3.5 w-3.5 lg:h-4 lg:w-4 transform rounded-full bg-white dark:bg-gray-800 transition-transform duration-200 ${isDarkMode ? "translate-x-5 lg:translate-x-7" : "translate-x-0.5 lg:translate-x-1"}`} />
                <FontAwesomeIcon icon={isDarkMode ? faMoon : faSun} className={`absolute text-[10px] lg:text-xs ${isDarkMode ? "left-1 text-gray-300" : "right-1 text-yellow-400"}`} />
              </button>
            </div>
            <div className="pl-2 lg:pl-3 border-l border-gray-700 flex items-center">
              {user ? (
                <div ref={profRef} className="relative">
                  <div className="flex items-center space-x-1.5 cursor-pointer hover:bg-gray-800 px-2 py-1 rounded transition" onClick={() => setOpenProfile(!openProfile)}>
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full overflow-hidden border border-white flex-shrink-0">
                      <img src={user?.avatar || user?.photoURL || "/placeholder.png"} alt={firstName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-white font-medium text-xs lg:text-sm truncate max-w-[70px] lg:max-w-[95px]">{firstName}</span>
                  </div>
                  {openProfile && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-50">
                      <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-xs lg:text-sm font-medium text-gray-900 dark:text-gray-100">{t("hello")}, {firstName}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setOpenProfile(false)} className="block w-full text-left px-4 py-2 text-xs lg:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">Profile</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs lg:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">{t("logout")}</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/SignIn">
                  <div className="text-white cursor-pointer flex items-center hover:text-gray-300 transition px-2 py-1">
                    <FontAwesomeIcon icon={faUser} className="text-sm lg:text-base" />
                    <h1 className="ml-1.5 font-medium text-xs lg:text-sm">{t("signIn")}</h1>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile: Search icon + Hamburger */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            <button
              className="text-white w-8 h-8 flex items-center justify-center outline-none"
              onClick={() => { setMobileSearchOpen((p) => !p); setMobileMenuOpen(false); }}
            >
              <FontAwesomeIcon
                icon={mobileSearchOpen ? faTimes : faSearch}
                className={`transition-all duration-200 text-base ${mobileSearchOpen ? "text-orange-400 rotate-90" : ""}`}
              />
            </button>
            <button
              className="text-white w-8 h-8 flex items-center justify-center outline-none"
              onClick={() => { setMobileMenuOpen((p) => !p); setMobileSearchOpen(false); }}
            >
              <FontAwesomeIcon
                icon={mobileMenuOpen ? faTimes : faBars}
                className={`transition-all duration-200 text-xl ${mobileMenuOpen ? "rotate-90 scale-110 text-orange-400" : "rotate-0 scale-100"}`}
              />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar — slides down */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileSearchOpen ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-3 pb-3 pt-1">
            <div className="flex w-full relative">
              <div className="relative flex-shrink-0" ref={catRef}>
                <button
                  onClick={() => setOpenCat(!openCat)}
                  className="bg-gray-100 text-gray-700 h-9 px-2.5 rounded-l-md border-r border-gray-300 text-xs font-medium flex items-center whitespace-nowrap"
                >
                  <span className="truncate max-w-[55px]">{tCategory(cat)}</span>
                  <FontAwesomeIcon icon={faChevronDown} className={`ml-1 text-[9px] transition-transform ${openCat ? "rotate-180" : ""}`} />
                </button>
                {openCat && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-50">
                    {cats.map((c) => (
                      <button
                        key={c}
                        className={`w-full px-3 py-2 text-xs text-left hover:bg-blue-50 ${cat === c ? "bg-blue-100 text-blue-800" : "text-gray-800 dark:text-gray-200"}`}
                        onClick={() => { setCat(c); setOpenCat(false); }}
                      >
                        {tCategory(c)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative flex-1 min-w-0">
                <div className="flex items-center bg-white border-t border-b border-gray-300 h-9 w-full">
                  <input
                    type="text"
                    placeholder={`${t("searchPlaceholder")}...`}
                    className="flex-1 min-w-0 px-2.5 h-full text-black placeholder-gray-500 outline-none bg-transparent text-xs"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setActiveIndex(-1); }}
                    onKeyDown={handleKeyDown}
                    autoFocus={mobileSearchOpen}
                  />
                  <button className={`px-2 h-full flex items-center justify-center transition ${isListening ? "text-red-500 animate-pulse" : "text-gray-500"}`} onClick={startVoiceSearch}>
                    <FontAwesomeIcon icon={faMicrophone} className="text-xs" />
                  </button>
                  <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                  <button className="px-2 h-full flex items-center justify-center text-gray-500" onClick={() => fileInputRef.current?.click()} disabled={isVisionSearching}>
                    {isVisionSearching ? <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div> : <FontAwesomeIcon icon={faCamera} className="text-xs" />}
                  </button>
                </div>
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 z-50 max-h-52 overflow-auto shadow-lg rounded-b-md">
                    {suggestions.map((s, idx) => (
                      <div
                        key={s._id}
                        onClick={() => { navigate(`/productDetail/${s._id}`, { state: { product: s } }); setSearchQuery(""); setSuggestions([]); setMobileSearchOpen(false); }}
                        className={`flex items-center px-3 py-2 cursor-pointer ${activeIndex === idx ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"}`}
                      >
                        <img src={s?.images[0] ? s?.images[0] : "/placeholder.png"} alt={s.name} className="w-7 h-7 object-cover rounded mr-2" />
                        <span className="text-gray-800 text-xs truncate">{s.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button className="bg-orange-500 px-3 h-9 rounded-r-md flex items-center justify-center hover:bg-orange-600 transition" onClick={() => { handleSearch(); setMobileSearchOpen(false); }}>
                <FontAwesomeIcon icon={faSearch} className="text-white text-xs" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu — slides from left */}
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          onClick={() => setMobileMenuOpen(false)}
        />
        {/* Drawer */}
        <div
          className={`fixed top-0 left-0 h-full w-72 bg-gray-900 z-50 md:hidden flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-700">
            <h1 className="font-bold text-xl text-green-600 cursor-pointer" onClick={() => { navigate("/"); setMobileMenuOpen(false); }}>
              Glo<span className="text-white">Bus</span>
            </h1>
            <button className="text-white text-xl" onClick={() => setMobileMenuOpen(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Drawer Nav Items */}
          <nav className="flex-1 overflow-y-auto py-2">
            {/* Profile / Sign In */}
            <div className="px-4 py-3 border-b border-gray-700 mb-1">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-white flex-shrink-0">
                    <img src={user?.avatar || user?.photoURL || "/placeholder.png"} alt={firstName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{firstName}</p>
                    <p className="text-gray-400 text-[11px] truncate max-w-[170px]">{user?.email}</p>
                  </div>
                </div>
              ) : (
                <Link to="/SignIn" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center gap-3 text-white">
                    <FontAwesomeIcon icon={faUser} className="text-base" />
                    <span className="font-medium text-sm">{t("signIn")}</span>
                  </div>
                </Link>
              )}
            </div>

            {/* Nav links */}
            {[
              { icon: faCartShopping, label: t("cart"), path: "/cart" },
              { icon: faHeart, label: t("wishlist"), path: "/wishlist", badge: wishlistCount },
              { icon: faCreditCard, label: t("ordersPayments"), path: "/orderHistory" },
            ].map(({ icon, label, path, badge }) => (
              <button
                key={path}
                className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 transition text-left border-b border-gray-800"
                onClick={() => { navigate(path); setMobileMenuOpen(false); }}
              >
                <div className="relative w-5 flex justify-center">
                  <FontAwesomeIcon icon={icon} className={`text-base ${icon === faHeart ? "text-red-500" : ""}`} />
                  {badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center">{badge}</span>
                  )}
                </div>
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}

            {user && (
              <>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <div className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 transition border-b border-gray-800">
                    <FontAwesomeIcon icon={faUser} className="text-base w-5" />
                    <span className="text-sm font-medium">Profile</span>
                  </div>
                </Link>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-800 transition border-b border-gray-800"
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                >
                  <span className="w-5 text-center text-base">✕</span>
                  <span className="text-sm font-medium">{t("logout")}</span>
                </button>
              </>
            )}

            {/* Language */}
            <div className="px-4 py-3 border-b border-gray-800">
              <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Language</p>
              <div className="flex flex-wrap gap-2">
                {langs.map((l) => (
                  <button
                    key={l.code}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition ${lang.code === l.code ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200 hover:bg-gray-600"}`}
                    onClick={() => { setLang(l); setMobileMenuOpen(false); }}
                  >
                    <img src={`https://flagcdn.com/${l.code}.svg`} alt={l.name} className="w-4 h-3 object-cover rounded-[1px]" />
                    {l.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Dark mode toggle */}
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-gray-300 text-sm">{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition duration-200 ease-in-out ${isDarkMode ? "bg-gray-700 border border-gray-500" : "bg-gray-600"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-800 transition-transform duration-200 ${isDarkMode ? "translate-x-7" : "translate-x-1"}`} />
                <FontAwesomeIcon icon={isDarkMode ? faMoon : faSun} className={`absolute text-xs ${isDarkMode ? "left-1 text-gray-300" : "right-1 text-yellow-400"}`} />
              </button>
            </div>
          </nav>
        </div>
      </>

      <section className="bg-orange-100 dark:bg-orange-900 border-b border-orange-200 dark:border-orange-800">
        <div className="mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-14 2xl:mx-20 px-2 sm:px-3 md:px-4 lg:px-6 py-1.5 lg:py-2">
          <marquee
            behavior="scroll"
            direction="left"
            scrollamount="6"
            className="text-xs lg:text-sm xl:text-base text-gray-800 dark:text-gray-200 dark:text-orange-50"
          >
            {t("marqueeNotice")}
          </marquee>
        </div>
      </section>
    </>
  );
};

export default Header;

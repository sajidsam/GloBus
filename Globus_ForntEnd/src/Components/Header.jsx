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
  faCreditCard
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const langs = [
  { code: "us", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "bd", name: "Bangla" },
];

const cats = [
  "All",
  "Food",
  "Kitchen Utils", 
  "Fashion",
  "Skin Care",
  "Electronics",
  "Stationary",
  "Toys"
];

const Header = () => {
  const [lang, setLang] = useState(langs[0]);
  const [cat, setCat] = useState(cats[0]);
  const [openLang, setOpenLang] = useState(false);
  const [openCat, setOpenCat] = useState(false);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loc, setLoc] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [wishlistHover, setWishlistHover] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const langRef = useRef(null);
  const catRef = useRef(null);
  const profRef = useRef(null);

  const auth = getAuth();
  const navigate = useNavigate();

  // Fetch all products 
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await fetch("https://glo-bus-backend.vercel.app/browseProduct");
        const data = await res.json();
        setAllProducts(data);
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
      if (langRef.current && !langRef.current.contains(e.target)) setOpenLang(false);
      if (catRef.current && !catRef.current.contains(e.target)) setOpenCat(false);
      if (profRef.current && !profRef.current.contains(e.target)) setOpenProfile(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Filter Search suggestions 
  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }
    
    const filtered = allProducts.filter((p) => {
      const matchesName = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = cat === "All" || p.category === cat;
      return matchesName && matchesCategory;
    });
    
    setSuggestions(filtered.slice(0, 10));
    setActiveIndex(-1);
  }, [searchQuery, allProducts, cat]); 

  const handleSearch = () => {
    if (searchQuery.trim()) {
      
      const filtered = allProducts.filter((p) => {
        const matchesName = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = cat === "All" || p.category === cat;
        return matchesName && matchesCategory;
      });
      
      if (filtered.length > 0) {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(cat)}`, {
          state: { searchResults: filtered, searchQuery, category: cat }
        });
        setSearchQuery("");
        setSuggestions([]);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions.length > 0) {
       
        const selected = suggestions[activeIndex];
        navigate(`/productDetail/${selected._id}`, { state: { product: selected } });
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
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    }
  };

  const firstName = user?.name?.split(" ")[0] || user?.displayName?.split(" ")[0] || "";

  // Language translations
  const translations = {
    us: {
      deliverTo: "Deliver to",
      searchPlaceholder: "Search in",
      cart: "Cart",
      wishlist: "Wishlist",
      ordersPayments: "Orders & Payments",
      signIn: "Sign In",
      hello: "Hello",
      logout: "Logout"
    },
    es: {
      deliverTo: "Entregar a",
      searchPlaceholder: "Buscar en",
      cart: "Carrito",
      wishlist: "Lista de deseos",
      ordersPayments: "Pedidos & Pagos",
      signIn: "Iniciar Sesión",
      hello: "Hola",
      logout: "Cerrar Sesión"
    },
    fr: {
      deliverTo: "Livrer à",
      searchPlaceholder: "Rechercher dans",
      cart: "Panier",
      wishlist: "Lista de souhaits",
      ordersPayments: "Commandes & Paiements",
      signIn: "Se Connecter",
      hello: "Bonjour",
      logout: "Se Déconnecter"
    },
    de: {
      deliverTo: "Liefern an",
      searchPlaceholder: "Suchen in",
      cart: "Warenkorb",
      wishlist: "Wunschliste",
      ordersPayments: "Bestellungen & Zahlungen",
      signIn: "Anmelden",
      hello: "Hallo",
      logout: "Abmelden"
    },
    bd: {
      deliverTo: "ডেলিভারি করুন",
      searchPlaceholder: "খুঁজুন",
      cart: "কার্ট",
      wishlist: "উইশলিস্ট",
      ordersPayments: "অর্ডার ও পেমেন্ট",
      signIn: "সাইন ইন",
      hello: "হ্যালো",
      logout: "লগআউট"
    }
  };

  const t = translations[lang.code];

  return (
    <>
      <section className="bg-gray-900 flex items-center justify-between px-20 py-3 sticky z-50 top-0 shadow-lg border-b border-gray-700">

        <div className="flex items-center space-x-6">

          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <h1 className="font-bold text-3xl text-green-600">
              Glo<span className="text-white">Bus</span>
            </h1>
          </div>

          {/* Location */}
          <div className="text-white flex items-center">
            <FontAwesomeIcon icon={faLocationDot} className="text-lg mr-2" />
            <div className="font-semibold leading-tight">
              <h1 className="text-sm">{t.deliverTo}</h1>
              <h1 className="text-base font-bold">{loc ? `${loc.city}, ${loc.country}` : "Fetching..."}</h1>
            </div>
          </div>
        </div>


        <div className="flex flex-1 max-w-xl mx-8">
          <div className="flex w-full relative">
            {/* Category Button */}
            <div className="relative" ref={catRef}>
              <button
                onClick={() => setOpenCat(!openCat)}
                className="bg-gray-100 text-gray-700 px-4 h-12 rounded-l-md border-r border-gray-300 text-base font-medium flex items-center hover:bg-gray-200 transition"
              >
                {cat}
                <FontAwesomeIcon icon={faChevronDown} className={`ml-2 text-sm transition-transform ${openCat ? "rotate-180" : ""}`} />
              </button>

              {openCat && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg py-2 z-50">
                  {cats.map((c) => (
                    <button
                      key={c}
                      className={`w-full px-4 py-2 text-base text-left hover:bg-blue-50 ${cat === c ? "bg-blue-100 text-blue-800" : "text-gray-800"}`}
                      onClick={() => {
                        setCat(c);
                        setOpenCat(false);
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={`${t.searchPlaceholder} ${cat}...`}
                className="flex-1 px-4 h-12 text-black outline-none bg-white border-t border-b border-gray-300 w-full text-base"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveIndex(-1);
                }}
                onKeyDown={handleKeyDown}
              />

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 z-50 max-h-60 overflow-auto">
                  {suggestions.map((s, idx) => (
                    <div
                      key={s._id}
                      onClick={() => {
                        navigate(`/productDetail/${s._id}`, { state: { product: s } });
                        setSearchQuery("");
                        setSuggestions([]);
                      }}
                      className={`flex items-center px-3 py-2 cursor-pointer ${activeIndex === idx ? "bg-blue-100" : "hover:bg-gray-100"}`}
                    >
                      <img
                        src={s?.images[0] ? s?.images[0] : "/placeholder.png"}
                        alt={s.name}
                        className="w-10 h-10 object-cover rounded mr-3"
                      />
                      <span className="text-gray-800 text-base">{s.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              className="bg-orange-500 px-5 h-12 rounded-r-md flex items-center justify-center hover:bg-orange-600 transition"
              onClick={handleSearch}
            >
              <FontAwesomeIcon icon={faSearch} className="text-white text-lg" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Language */}
          <div className="relative" ref={langRef}>
            <button
              className="flex items-center text-white px-3 py-2 rounded hover:bg-gray-800 transition"
              onClick={() => setOpenLang(!openLang)}
            >
              <span className="font-medium flex items-center text-base">
                <img src={`https://flagcdn.com/${lang.code}.svg`} alt={lang.name} className="w-6 h-4 mr-2 object-cover" />
                {lang.name}
              </span>
              <FontAwesomeIcon icon={faChevronDown} className={`ml-2 text-sm transition-transform ${openLang ? "rotate-180" : ""}`} />
            </button>

            {openLang && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-2 z-50">
                {langs.map((l) => (
                  <button
                    key={l.code}
                    className={`flex items-center w-full px-4 py-3 text-base text-left hover:bg-blue-50 ${lang.code === l.code ? "bg-blue-100 text-blue-800" : "text-gray-800"}`}
                    onClick={() => {
                      setLang(l);
                      setOpenLang(false);
                    }}
                  >
                    <img src={`https://flagcdn.com/${l.code}.svg`} alt={l.name} className="w-6 h-4 mr-3 object-cover" />
                    <span className="text-base">{l.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Orders & Payments*/}
          <div className="text-white cursor-pointer flex items-center hover:text-gray-300 transition " onClick={() => navigate("/orderHistory")}>

            <FontAwesomeIcon icon={faCreditCard} className="text-xl" />
            <h1 className="mx-2 font-medium text-base">{t.ordersPayments}</h1>
          </div>

          {/* Cart */}
          <div className="text-white cursor-pointer flex items-center hover:text-gray-300 transition" onClick={() => navigate("/cart")}>

            <FontAwesomeIcon icon={faCartShopping} className="text-xl" />
            <h1 className="mx-2 font-medium text-base">{t.cart}</h1>
          </div>

          {/* Wishlist */}
          <div
            className="text-white cursor-pointer flex items-center hover:text-gray-300 transition"
            onMouseEnter={() => setWishlistHover(true)}
            onMouseLeave={() => setWishlistHover(false)}
          >
            <FontAwesomeIcon
              icon={faHeart}
              className="text-red-600 font-bold text-xl"
            />
            <h1 className="mx-2 font-medium text-base">{t.wishlist}</h1>
          </div>

          {/* Dark/Light Mode Toggle */}
          <button
            onClick={() => {
              setDarkMode(!darkMode);
            }}
            className="relative inline-flex h-7 w-14 items-center rounded-full bg-gray-600 transition duration-200 ease-in-out"
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${darkMode ? "translate-x-8" : "translate-x-1"
              }`} />
            <FontAwesomeIcon
              icon={darkMode ? faMoon : faSun}
              className={`absolute text-sm ${darkMode ? "left-2 text-gray-300" : "right-2 text-yellow-400"
                }`}
            />
          </button>

          {/* Profile */}
          {user ? (
            <div ref={profRef} className="relative">
              <div
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 px-3 py-2 rounded transition"
                onClick={() => setOpenProfile(!openProfile)}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                  <img
                    src={user?.photoURL ? user.photoURL : "/placeholder.png"}
                    alt={firstName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-white font-medium text-base">{firstName}</span>
              </div>

              {openProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-base font-medium text-gray-900">{t.hello}, {firstName}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-base text-gray-700 hover:bg-gray-100 transition"
                  >
                    {t.logout}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/SignIn">
              <div className="text-white cursor-pointer flex items-center hover:text-gray-300 transition">
                <FontAwesomeIcon icon={faUser} className="text-xl" />
                <h1 className="mx-2 font-medium text-base">{t.signIn}</h1>
              </div>
            </Link>
          )}
        </div>
      </section>

      <section>
        <marquee behavior="scroll" direction="left" scrollamount="6" className="bg-orange-100 p-2 text-base text-gray-800">
          দ্রষ্টব্য: পণ্য গ্রহণ করার আগে প্যাকেট খুলে দেখুন—ড্যামেজ আছে কি না নিশ্চিত করুন।
          সমস্যা থাকলে অবিলম্বে রাইডারকে দেখান ও গ্রহণ বর্জন/রিপোর্ট করুন।
        </marquee>
      </section>
    </>
  );
};

export default Header;
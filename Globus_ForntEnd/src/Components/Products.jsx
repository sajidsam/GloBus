import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faFire, faRocket, faAppleAlt, faMobile, faEye } from '@fortawesome/free-solid-svg-icons';
import AddToCartButton from "./AddToCartButton"; 

const Products = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topDeals, setTopDeals] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Fetch products 
  useEffect(() => {
    fetch("https://glo-bus-backend.vercel.app/browseProduct")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        
        // Featured products 
        const featured = data.filter(product => product.isFeatured).slice(0, 10);
        setFeaturedProducts(featured);
        
        // Top deals 
        const deals = data
          .filter(product => product.discountPrice)
          .sort((a, b) => {
            const discountA = ((a.price - a.discountPrice) / a.price) * 100;
            const discountB = ((b.price - b.discountPrice) / b.price) * 100;
            return discountB - discountA;
          })
          .slice(0, 4);
        setTopDeals(deals);
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // slider for featured products
  useEffect(() => {
    if (featuredProducts.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [featuredProducts.length]);

  // View detail button
  const handleViewDetail = (product) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.email) {
        navigate("/productDetail", { state: { product } });
      } else {
        navigate("/signin");
      }
    } catch (err) {
      console.error("Error reading user from localStorage:", err);
      navigate("/signin");
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  // Filter products by category
  const getProductsByCategory = (category) => {
    return products.filter(product => product.category === category).slice(0, 8);
  };

  const getNewArrivals = () => {
    return products.slice(0, 8);
  };

  const ProductCard = ({ product }) => (
    <div
      key={product._id}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 cursor-pointer"
    >
      <div className="relative">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-56 object-cover rounded-t-xl"
        />
        {product.discountPrice && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
            {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 leading-tight line-clamp-2 min-h-[48px]">
          {product.name}
        </h3>
        <p className="text-gray-500 text-sm mt-1">{product.brand}</p>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold text-blue-600">
              ${product.discountPrice || product.price}
            </p>
            {product.discountPrice && (
              <p className="text-sm text-gray-500 line-through">${product.price}</p>
            )}
          </div>
          {product.ratings && (
            <div className="flex items-center gap-1">
              <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-sm" />
              <span className="text-sm text-gray-600">{product.ratings.average}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-4">
          <AddToCartButton product={product} />
          
          <button
            onClick={() => handleViewDetail(product)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-black transition flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faEye} />
            Details
          </button>
        </div>
      </div>
    </div>
  );

  const sections = [
    { 
      title: "Top Deals", 
      key: "top-deals",
      icon: faFire,
      products: topDeals,
      color: "text-red-600"
    },
    { 
      title: "New Arrivals", 
      key: "new-arrivals",
      icon: faRocket,
      products: getNewArrivals(),
      color: "text-green-600"
    },
    { 
      title: "Food - Feed Your Hunger", 
      key: "fruits",
      icon: faAppleAlt,
      products: getProductsByCategory("Food"),
      color: "text-green-600"
    },
    { 
      title: "Electronics", 
      key: "electronics",
      icon: faMobile,
      products: getProductsByCategory("Electronics"),
      color: "text-blue-600"
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-16 mx-20">

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
              Featured Products
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={prevSlide}
                className="bg-gray-800 text-white p-2 rounded-lg hover:bg-black transition"
              >
                ‹
              </button>
              <button 
                onClick={nextSlide}
                className="bg-gray-800 text-white p-2 rounded-lg hover:bg-black transition"
              >
                ›
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-white p-4">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {featuredProducts.map((product) => (
                <div key={product._id} className="w-full flex-shrink-0">
                  <div className="flex flex-col md:flex-row items-center gap-6 p-4">
                    <div className="flex-1">
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h3>
                      <p className="text-gray-600 mb-4">{product.description}</p>
                      <div className="flex items-center gap-4 mb-4">
                        <p className="text-3xl font-bold text-blue-600">
                          ${product.discountPrice || product.price}
                        </p>
                        {product.discountPrice && (
                          <p className="text-xl text-gray-500 line-through">${product.price}</p>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <AddToCartButton 
                          product={product} 
                          className="px-6 py-3 text-lg"
                        />
                        
                        <button
                          onClick={() => handleViewDetail(product)}
                          className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-black transition flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faEye} />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Slide Indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {featuredProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other Sections */}
      {sections.map((section) => {
        const sectionProducts = section.products;
        if (!sectionProducts.length) return null;

        return (
          <section key={section.key}>
            <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
              <FontAwesomeIcon icon={section.icon} className={section.color} />
              {section.title}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sectionProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default Products;
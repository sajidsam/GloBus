import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AddToCartButton from "../Components/AddToCartButton";

const ProductsDetail = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [productData, setProductData] = useState(state?.product || null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Load product dynamically on state or id change
  useEffect(() => {
    const loadProduct = async () => {
      if (state?.product) {
        setProductData(state.product);
      } else if (id) {
        try {
          const res = await fetch(`https://glo-bus-backend.vercel.app/productDetail/${id}`);
          const data = await res.json();
          if (data) setProductData(data);
          else navigate("/products");
        } catch (err) {
          console.error("Product fetch error:", err);
          navigate("/products");
        }
      } else {
        navigate("/products");
      }
    };
    loadProduct();
  }, [state, id, navigate]);

  // Load related products when productData changes
  useEffect(() => {
    if (productData) {
      loadRelatedProducts();
    }
  }, [productData]);

  // Initialize image and variant
  useEffect(() => {
    if (productData) {
      setSelectedImage(productData.images?.[0] || null);
      setSelectedVariant(productData.variants?.[0] || null);
      setQuantity(1);
    }
  }, [productData]);

  // Load related products based on category
  const loadRelatedProducts = async () => {
    if (!productData?.category) return;
    
    setLoadingRelated(true);
    try {
      const response = await fetch("https://glo-bus-backend.vercel.app/browseProduct");
      const allProducts = await response.json();
      
      // Filter products by same category, exclude current product, and limit to 3
      const related = allProducts
        .filter(product => 
          product.category === productData.category && 
          product._id !== productData._id
        )
        .slice(0, 3);
      
      setRelatedProducts(related);
    } catch (error) {
      console.error("Error loading related products:", error);
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    alert(
      `Added ${quantity} of ${productData.name}${selectedVariant ? ` (${selectedVariant.color}, ${selectedVariant.size})` : ""
      } to cart!`
    );
  };

  // Buy Now Function
  const handleBuyNow = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    // User logged in check
    if (!user) {
      alert('Please login first to buy this product!');
      navigate('/signin');
      return;
    }

    // Product out of stock check
    if (productData.stock === 0) {
      alert('This product is out of stock!');
      return;
    }

    // Check variant stock if selected
    if (selectedVariant && selectedVariant.stock === 0) {
      alert('Selected variant is out of stock!');
      return;
    }

    // Prepare product data for checkout
    const buyNowProduct = {
      _id: productData._id,
      name: productData.name,
      productName: productData.name,
      brand: productData.brand,
      price: productData.price,
      discountPrice: productData.discountPrice,
      flashSale: productData.flashSale,
      images: productData.images,
      quantity: quantity,
      selectedVariant: selectedVariant,
      productImage: productData.images?.[0] || '/placeholder.png',
      stock: selectedVariant ? selectedVariant.stock : productData.stock,
      category: productData.category,
      description: productData.description
    };

    console.log("Buy Now Product:", buyNowProduct);

    
    navigate('/checkout', {
      state: {
        directBuyProduct: buyNowProduct,
        from: 'buyNow'
      }
    });
  };

  // Handle related product click
  const handleRelatedProductClick = (product) => {
    navigate("/productDetail", { state: { product } });
    window.scrollTo(0, 0);
  };

  if (!productData) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const discountPercentage = productData.discountPrice 
    ? Math.round(((productData.price - productData.discountPrice) / productData.price) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white min-h-screen">
      {/* Breadcrumb */}
      <nav className="flex mb-6 text-sm text-gray-600">
        <button onClick={() => navigate("/")} className="hover:text-blue-600">Home</button>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{productData.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Images Section */}
        <div className="flex-1">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Thumbnail Images */}
              <div className="flex lg:flex-col gap-2 order-2 lg:order-1">
                {productData.images?.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`thumbnail-${idx}`}
                    className={`w-16 h-16 lg:w-20 lg:h-20 object-cover rounded-lg cursor-pointer border-2 transition-all ${selectedImage === img
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-400"
                      }`}
                    onClick={() => setSelectedImage(img)}
                  />
                ))}
              </div>
              
              {/* Main Image */}
              <div className="flex-1 order-1 lg:order-2">
                <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedImage}
                    alt={productData.name}
                    className="w-full h-96 object-contain"
                  />
                  {productData.flashSale?.isActive && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Flash Sale
                    </div>
                  )}
                  {discountPercentage > 0 && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-sm font-semibold">
                      {discountPercentage}% OFF
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Actions */}
          <div className="flex gap-3 mt-6">
            <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Add to Wishlist
            </button>
            <button className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition font-semibold flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Compare
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            {/* Brand and Category */}
            <div className="flex items-center gap-4 mb-3">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {productData.brand}
              </span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                {productData.category}
              </span>
              {productData.isFeatured && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  Featured
                </span>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{productData.name}</h1>

            {/* Ratings */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < Math.floor(productData.ratings?.average || 0) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <span className="text-gray-600 text-sm">
                ({productData.ratings?.count || 0} reviews)
              </span>
            </div>

            {/* Pricing */}
            <div className="flex items-center gap-4 mb-6">
              <p className="text-3xl font-bold text-gray-900">
                ${productData.flashSale?.isActive ? productData.flashSale.flashPrice : (productData.discountPrice || productData.price)}
              </p>
              {productData.discountPrice && (
                <p className="text-xl text-gray-500 line-through">${productData.price}</p>
              )}
              {productData.offerText && (
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {productData.offerText}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium mb-6 ${productData.stock > 0 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"}`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${productData.stock > 0 ? "bg-green-500" : "bg-red-500"}`}></span>
              {productData.stock > 0 ? `In Stock (${productData.stock} available)` : "Out of Stock"}
            </div>

            {/* Variants */}
            {productData.variants && productData.variants.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Available Variants:</h4>
                <div className="flex flex-wrap gap-2">
                  {productData.variants.map((v, idx) => (
                    <button
                      key={idx}
                      className={`px-4 py-2 border-2 rounded-lg transition-all ${selectedVariant === v 
                        ? "border-blue-500 bg-blue-50 text-blue-700" 
                        : "border-gray-300 hover:border-gray-400 text-gray-700"}`}
                      onClick={() => handleVariantChange(v)}
                    >
                      <div className="font-medium">{v.color}</div>
                      <div className="text-sm text-gray-600">{v.size}</div>
                      <div className="text-sm font-semibold">Stock: {v.stock}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <label className="font-semibold text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button 
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="px-3 py-2 hover:bg-gray-100 transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={selectedVariant?.stock || productData.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-16 text-center border-0 focus:ring-0"
                  />
                  <button 
                    onClick={() => quantity < (selectedVariant?.stock || productData.stock) && setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <AddToCartButton
                product={productData}
                variant={selectedVariant}
                quantity={quantity}
                onAddToCart={handleAddToCart}
                disabled={productData.stock === 0}
              />
              <button
                className="flex-1 bg-orange-500 text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition font-semibold text-lg"
                onClick={handleBuyNow}
                disabled={productData.stock === 0}
              >
                Buy Now
              </button>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Free Shipping
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                30-Day Return
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Secure Payment
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Warranty Included
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200">
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {[
              { id: "description", label: "Description" },
              { id: "specifications", label: "Specifications" },
              { id: "shipping", label: "Shipping Info" },
              { id: "reviews", label: "Reviews" },
              { id: "faq", label: "FAQ" }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === tab.id 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === "description" && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Product Description</h3>
              <p className="text-gray-700 leading-relaxed">{productData.description}</p>
            </div>
          )}

          {activeTab === "specifications" && productData.specifications && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-lg mb-4">Product Specifications</h4>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Material</span>
                  <span className="font-medium">{productData.specifications.material || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Weight</span>
                  <span className="font-medium">{productData.specifications.weight || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Dimensions</span>
                  <span className="font-medium">{productData.specifications.dimensions || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Origin</span>
                  <span className="font-medium">{productData.specifications.origin || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Washable</span>
                  <span className="font-medium">{productData.specifications.washable || "N/A"}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "shipping" && productData.shipping && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Shipping Information</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">Package Details</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Weight:</span>
                      <span>{productData.shipping.weight || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimensions:</span>
                      <span>{productData.shipping.height} x {productData.shipping.width}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">Delivery Info</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Delivery Time:</span>
                      <span>{productData.shipping.deliveryTime || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Free Shipping:</span>
                      <span className="text-green-600">Yes</span>
                    </div>
                  </div>
                </div>
              </div>
              {productData.returnPolicy && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2 text-blue-800">Return Policy</h5>
                  <p className="text-blue-700">{productData.returnPolicy}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">{productData.ratings?.average || 0}</div>
                  <div className="flex text-yellow-400 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < Math.floor(productData.ratings?.average || 0) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Based on {productData.ratings?.count || 0} reviews</div>
                </div>
              </div>

              {productData.reviews?.length > 0 ? (
                <div className="space-y-4">
                  {productData.reviews.map((review, idx) => (
                    <div key={idx} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          ))}
                        </div>
                        <span className="font-semibold text-gray-900">User {review.user}</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
              )}
            </div>
          )}

          {activeTab === "faq" && (
            <div>
              <h4 className="font-semibold text-lg mb-4">Frequently Asked Questions</h4>
              {productData.faq?.length > 0 ? (
                <div className="space-y-4">
                  {productData.faq.map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg">
                      <div className="p-4 bg-gray-50">
                        <p className="font-semibold text-gray-900">Q: {item.question}</p>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-700">A: {item.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No FAQs available for this product.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h3>
        
        {loadingRelated ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : relatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((product) => (
              <div 
                key={product._id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => handleRelatedProductClick(product)}
              >
                <div className="relative">
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {product.discountPrice && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                      {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h4>
                  <div className="flex items-center justify-between">
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
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-3 h-3 ${i < Math.floor(product.ratings.average || 0) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">{product.ratings.average}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No related products found.</p>
        )}
      </div>
    </div>
  );
};

export default ProductsDetail;
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash, 
  faPlus, 
  faMinus, 
  faShoppingBag, 
  faArrowLeft,
  faCreditCard,
  faShield,
  faTruck,
  faLock,
  faTag,
  faStore,
  faHeart,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(false);
  const navigate = useNavigate();

  // Number conversion for price
  const formatPrice = (price) => {
    if (price === null || price === undefined) return '0.00';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  // Calculate price function
  const getItemPrice = (item) => {
    const price = item.discountPrice || item.price;
    if (price === null || price === undefined) return 0;
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(num) ? 0 : num;
  };

  // Load cart from backend
  const loadCartFromBackend = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      console.log("Loading cart for user:", user?.email);
      
      if (user && user.email) {
        const response = await fetch(`https://glo-bus-backend.vercel.app/cart/${user.email}`);
        
        if (response.ok) {
          const backendCart = await response.json();
          console.log("Backend cart loaded:", backendCart);
          setCartItems(backendCart);
          localStorage.setItem('cart', JSON.stringify(backendCart));
          return;
        } else {
          console.error("Backend responded with error:", response.status);
        }
      }
    } catch (error) {
      console.error("Error loading cart from backend:", error);
    }
    
    console.log("Falling back to localStorage");
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error(' Error parsing cart data:', error);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  };

  useEffect(() => {
    loadCartFromBackend().finally(() => setLoading(false));
  }, []);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = getItemPrice(item);
    return sum + (price * (item.quantity || 1));
  }, 0);

  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const discount = appliedPromo ? subtotal * 0.1 : 0;
  const total = subtotal + shipping + tax - discount;

  // Update quantity 
  const updateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return;

    console.log(`Updating quantity for:`, item);
    console.log(`New quantity: ${newQuantity}`);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.email && item._id) {
        console.log(` Calling: PUT https://glo-bus-backend.vercel.app/cart/update/${item._id}`);
        
        const updateResponse = await fetch(`https://glo-bus-backend.vercel.app/cart/update/${item._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity: newQuantity })
        });
        
        console.log("Update response status:", updateResponse.status);
        
        if (updateResponse.ok) {
          const result = await updateResponse.json();
          console.log(" Backend quantity updated successfully:", result);
          
          await loadCartFromBackend();
        } else {
          const errorText = await updateResponse.text();
          console.error(" Backend update failed:", errorText);
        }
      } else {
        console.log("No user or cartItemId, updating locally only");
      }
    } catch (error) {
      console.error("Error updating quantity in backend:", error);
    }

    const updatedCart = cartItems.map(cartItem =>
      cartItem._id === item._id ? { ...cartItem, quantity: newQuantity } : cartItem
    );
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    const totalCount = updatedCart.reduce((sum, cartItem) => sum + (cartItem.quantity || 1), 0);
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: totalCount } }));
  };

  // Remove item from backend 
  const removeItem = async (item) => {
    console.log(` Removing item:`, item);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.email && item._id) {
        console.log(`Calling: DELETE https://glo-bus-backend.vercel.app/cart/remove/${item._id}`);
        
        const deleteResponse = await fetch(`https://glo-bus-backend.vercel.app/cart/remove/${item._id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        console.log("Delete response status:", deleteResponse.status);
        
        if (deleteResponse.ok) {
          const result = await deleteResponse.json();
          console.log("Backend item removed successfully:", result);
          
          // Reload cart from backend
          await loadCartFromBackend();
        } else {
          const errorText = await deleteResponse.text();
          console.error(" Backend delete failed:", errorText);
        }
      } else {
        console.log(" No user or cartItemId, removing locally only");
      }
    } catch (error) {
      console.error(" Error removing item from backend:", error);
    }

    const updatedCart = cartItems.filter(cartItem => cartItem._id !== item._id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    const totalCount = updatedCart.reduce((sum, cartItem) => sum + (cartItem.quantity || 1), 0);
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: totalCount } }));
  };

  // Clear user's cart
  const clearCart = async () => {
    console.log("Clearing entire cart");

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.email) {
        console.log(`Calling: DELETE https://glo-bus-backend.vercel.app/cart/clear/${user.email}`);
        
        const response = await fetch(`https://glo-bus-backend.vercel.app/cart/clear/${user.email}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        console.log(" Clear response status:", response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log("Backend cart cleared successfully:", result);
        } else {
          const errorText = await response.text();
          console.error(" Backend clear failed:", errorText);
        }
      }
    } catch (error) {
      console.error("Error clearing cart from backend:", error);
    }

    setCartItems([]);
    localStorage.removeItem('cart');
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: 0 } }));
  };

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'GLOBUS10') {
      setAppliedPromo(true);
      alert('Promo code applied! 10% discount added.');
    } else {
      alert('Invalid promo code. Try "GLOBUS10"');
    }
    setPromoCode('');
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    navigate('/checkout');
  };

  const continueShopping = () => {
    navigate('/');
  };

  const saveForLater = (item) => {
    alert(`${item.productName || item.name} saved for later!`);
    removeItem(item);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center bg-white rounded-3xl shadow-xl p-12 transform hover:scale-[1.01] transition-all duration-300">
            <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <FontAwesomeIcon icon={faShoppingBag} className="text-orange-500 text-5xl" />
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Your cart feels lonely</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
              Looks like you haven't added any items to your cart yet. Let's find something amazing for you!
            </p>
            <button
              onClick={continueShopping}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-10 py-4 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Start Shopping Adventure
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={continueShopping}
              className="flex items-center gap-3 text-gray-600 hover:text-gray-800 transition-all duration-300 bg-white px-4 py-3 rounded-2xl shadow-sm hover:shadow-md border border-gray-200"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span className="font-medium">Continue Shopping</span>
            </button>
            <div className="min-h-[80px] flex items-center">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text ">
                Shopping Cart
              </h1>
            </div>
          </div>
          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-700 transition font-medium bg-white px-4 py-2 rounded-xl border border-red-200 hover:border-red-300"
          >
            Clear Entire Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 border border-gray-100">
              {/* Header - Adjusted grid columns */}
              <div className="grid grid-cols-12 gap-2 sm:gap-3 text-sm font-semibold text-gray-600 pb-4 border-b border-gray-200">
                <div className="col-span-5 lg:col-span-5">PRODUCT</div>
                <div className="col-span-2 text-center">PRICE</div>
                <div className="col-span-3 text-center">QUANTITY</div>
                <div className="col-span-2 text-center">TOTAL</div>
              </div>

              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => {
                  const itemPrice = getItemPrice(item);
                  const itemTotal = itemPrice * (item.quantity || 1);
                  const hasDiscount = item.discountPrice && item.discountPrice < item.price;
                  
                  return (
                    <div key={item._id} className="py-4 sm:py-6 group hover:bg-gray-50 transition-all duration-300 rounded-lg px-1">
                      {/* Adjusted grid columns for better spacing */}
                      <div className="grid grid-cols-12 gap-2 sm:gap-3 items-center">
                        {/* Product Info - Reduced width */}
                        <div className="col-span-5 flex items-center gap-2 sm:gap-3">
                          <div className="relative flex-shrink-0">
                            <img
                              src={item.productImage || item.images?.[0] || '/placeholder.png'}
                              alt={item.productName || item.name}
                              className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-all"
                            />
                            {hasDiscount && (
                              <div className="absolute -top-1 -left-1 sm:-top-1 sm:-left-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold shadow-lg">
                                {Math.round(((item.price - item.discountPrice) / item.price) * 100)}% OFF
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 line-clamp-2 leading-tight">
                              {item.productName || item.name}
                            </h3>
                            <p className="text-gray-500 text-xs mb-1">{item.brand}</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveForLater(item)}
                                className="text-blue-500 hover:text-blue-700 text-xs font-medium flex items-center gap-1 transition"
                              >
                                <FontAwesomeIcon icon={faHeart} className="text-xs" />
                                Save
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Price - Centered */}
                        <div className="col-span-2">
                          <div className="flex flex-col items-center space-y-1">
                            <span className="font-bold text-gray-800 text-sm sm:text-base">
                              ${formatPrice(itemPrice)}
                            </span>
                            {hasDiscount && (
                              <span className="text-xs text-gray-500 line-through">
                                ${formatPrice(item.price)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls - Better spacing */}
                        <div className="col-span-3">
                          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                            <button
                              onClick={() => updateQuantity(item, (item.quantity || 1) - 1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 shadow-sm"
                            >
                              <FontAwesomeIcon icon={faMinus} className="text-gray-600 text-xs" />
                            </button>
                            <span className="font-bold text-gray-800 text-sm sm:text-base min-w-6 text-center bg-gray-50 py-1 px-2 rounded-lg border border-gray-200">
                              {item.quantity || 1}
                            </span>
                            <button
                              onClick={() => updateQuantity(item, (item.quantity || 1) + 1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 shadow-sm"
                            >
                              <FontAwesomeIcon icon={faPlus} className="text-gray-600 text-xs" />
                            </button>
                          </div>
                        </div>

                        {/* Total & Actions - Better alignment */}
                        <div className="col-span-2 flex flex-col items-center gap-1 sm:gap-2">
                          <span className="font-bold text-gray-800 text-sm sm:text-base text-center">
                            ${formatPrice(itemTotal)}
                          </span>
                          <button
                            onClick={() => removeItem(item)}
                            className="text-red-400 hover:text-red-600 transition-all duration-300 p-1 hover:bg-red-50 rounded-lg"
                            title="Remove item"
                          >
                            <FontAwesomeIcon icon={faTrash} className="text-xs sm:text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 sm:p-6 text-center border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FontAwesomeIcon icon={faShieldAlt} className="text-green-600 text-lg sm:text-xl" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">Secure Payment</h4>
                <p className="text-xs sm:text-sm text-gray-600">256-bit SSL encryption</p>
              </div>
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 sm:p-6 text-center border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FontAwesomeIcon icon={faTruck} className="text-blue-600 text-lg sm:text-xl" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">Free Shipping</h4>
                <p className="text-xs sm:text-sm text-gray-600">On orders over $50</p>
              </div>
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 sm:p-6 text-center border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FontAwesomeIcon icon={faStore} className="text-purple-600 text-lg sm:text-xl" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">Easy Returns</h4>
                <p className="text-xs sm:text-sm text-gray-600">30-day return policy</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 sticky top-6 border border-gray-100">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text ">
                Order Summary
              </h3>
              
              {/* Pricing Breakdown */}
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>Subtotal ({cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} items)</span>
                  <span className="font-semibold">${formatPrice(subtotal)}</span>
                </div>
                
                {appliedPromo && (
                  <div className="flex justify-between text-green-600 text-sm sm:text-base">
                    <span className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faTag} />
                      Discount (10%)
                    </span>
                    <span className="font-semibold">-${formatPrice(discount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>Shipping</span>
                  <span className="font-semibold">{shipping === 0 ? 'FREE' : `$${formatPrice(shipping)}`}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>Tax</span>
                  <span className="font-semibold">${formatPrice(tax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 sm:pt-4">
                  <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-xl sm:text-2xl">${formatPrice(total)}</span>
                  </div>
                  {shipping === 0 && (
                    <p className="text-green-600 text-xs sm:text-sm mt-2 text-right">You saved $5.99 on shipping!</p>
                  )}
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                  <FontAwesomeIcon icon={faTag} className="mr-2 text-orange-500" />
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter GLOBUS10"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm sm:text-base"
                  />
                  <button 
                    onClick={applyPromoCode}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-800 text-white rounded-xl hover:bg-black transition-all duration-300 font-semibold shadow-md hover:shadow-lg text-sm sm:text-base"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Try code: GLOBUS10 for 10% off</p>
              </div>

              {/* Checkout Button */}
              <button
                onClick={proceedToCheckout}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 sm:py-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FontAwesomeIcon icon={faCreditCard} />
                Proceed to Checkout
              </button>

              {/* Security Message */}
              <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-600 flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faLock} className="text-green-500" />
                  Secure checkout • Your data is protected
                </p>
              </div>

              {/* Estimated Delivery */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-1 flex items-center gap-2 text-sm sm:text-base">
                  <FontAwesomeIcon icon={faTruck} />
                  Estimated Delivery
                </h4>
                <p className="text-xs sm:text-sm text-blue-600">2-4 business days • Free returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
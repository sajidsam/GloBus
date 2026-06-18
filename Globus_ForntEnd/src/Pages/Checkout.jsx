import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft,
  faCreditCard,
  faLock,
  faShieldAlt,
  faTruck,
  faCheckCircle,
  faMapMarkerAlt,
  faUser,
  faEnvelope,
  faPhone,
  faAward,
  faRocket
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import SSLpayBtn from '../Components/SSLpayBtn';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [directBuyProduct, setDirectBuyProduct] = useState(null);
  const [checkoutSource, setCheckoutSource] = useState('cart');

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Bangladesh'
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        fullName: user.name || user.fullName || '',
        email: user.email || '',
        phone: user.phone || user.mobile || ''
      }));
    }
  }, []);

  useEffect(() => {
    const loadCheckoutData = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      
      if (!user) {
        alert('Please login first!');
        navigate('/signin');
        return;
      }

      if (location.state?.directBuyProduct) {
        setDirectBuyProduct(location.state.directBuyProduct);
        setCheckoutSource('buyNow');
        setCartItems([location.state.directBuyProduct]);
        setLoading(false);
        return;
      }

      setCheckoutSource('cart');
      await loadCartData();
    };

    loadCheckoutData();
  }, [navigate, location]);

  const loadCartData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      let cartData = [];

      if (user?.email) {
        const response = await fetch(`https://glo-bus-backend.vercel.app/cart/${user.email}`);
        if (response.ok) {
          cartData = await response.json();
        }
      }

      if (cartData.length === 0) {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          cartData = JSON.parse(savedCart);
        }
      }

      if (cartData.length === 0) {
        alert('Your cart is empty! Please add items first.');
        navigate('/');
        return;
      }

      setCartItems(cartData);
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '0.00';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const getItemPrice = (item) => {
    const price = item.discountPrice || item.price;
    if (price === null || price === undefined) return 0;
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(num) ? 0 : num;
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = getItemPrice(item);
    return sum + (price * (item.quantity || 1));
  }, 0);

  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const discount = appliedPromo ? subtotal * 0.1 : 0;
  const total = subtotal + shipping + tax - discount;

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'GLOBUS10') {
      setAppliedPromo(true);
    }
    setPromoCode('');
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setActiveStep(2);
  };

  const handlePaymentStart = () => {
    console.log('Payment process starting...');
  };

  const handlePaymentSuccess = (data) => {
    console.log('Payment initiated successfully:', data);
  };

  const handlePaymentError = (error) => {
    alert(error);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && activeStep !== 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-xl p-12 max-w-md mx-4">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon icon={faCreditCard} className="text-orange-500 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart before checkout.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => checkoutSource === 'buyNow' ? navigate('/products') : navigate('/cart')}
            className="flex items-center gap-3 text-gray-600 hover:text-gray-800 transition-all duration-300 bg-white px-4 py-3 rounded-2xl shadow-sm hover:shadow-md border border-gray-200"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span className="font-medium">
              {checkoutSource === 'buyNow' ? 'Back to Products' : 'Back to Cart'}
            </span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text ">
              Secure Checkout
            </h1>
          </div>
          
          <div className="w-32"></div>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex flex-col items-center ${step <= activeStep ? 'text-orange-500' : 'text-gray-400'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    step <= activeStep 
                      ? 'bg-orange-500 border-orange-500 text-white' 
                      : 'border-gray-300 bg-white'
                  } font-semibold text-lg`}>
                    {step < activeStep ? <FontAwesomeIcon icon={faCheckCircle} /> : step}
                  </div>
                  <span className="text-sm mt-2 font-medium">
                    {step === 1 && 'Shipping'}
                    {step === 2 && 'Review'}
                    {step === 3 && 'Payment'}
                  </span>
                </div>
                {step < 3 && (
                  <div className={`w-24 h-1 mx-4 ${step < activeStep ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Information */}
            {activeStep === 1 && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Shipping Information</h2>
                </div>
                
                <form onSubmit={handleShippingSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-500" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-500" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FontAwesomeIcon icon={faPhone} className="mr-2 text-gray-500" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="+8801XXXXXXXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-500" />
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="House #, Road #, Area"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State/Division *</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="Division"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.zipCode}
                        onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="1200"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-12 py-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Review Order
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Order Review - Step 2 */}
            {activeStep === 2 && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Order Review</h2>
                </div>

                {/* Source Info */}
                <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                    Order Source: {checkoutSource === 'buyNow' ? '🛒 Direct Purchase' : '🛍️ Cart'}
                  </h3>
                  <p className="text-blue-600 text-sm mt-1">
                    {checkoutSource === 'buyNow' 
                      ? 'You are purchasing this item directly from product page' 
                      : 'You are purchasing items from your shopping cart'}
                  </p>
                </div>

                {/* Shipping Info Review */}
                <div className="mb-8 p-6 bg-gray-50 rounded-2xl">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faTruck} className="text-blue-500" />
                    Shipping Address
                  </h3>
                  <p className="text-gray-700">
                    {shippingInfo.fullName}<br />
                    {shippingInfo.address}<br />
                    {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}<br />
                    {shippingInfo.country}
                  </p>
                  <p className="text-gray-600 mt-2">
                    <FontAwesomeIcon icon={faPhone} className="mr-2" />
                    {shippingInfo.phone}
                  </p>
                  <p className="text-gray-600">
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                    {shippingInfo.email}
                  </p>
                </div>

                {/* Order Items */}
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Order Items {checkoutSource === 'buyNow' ? '(Direct Purchase)' : `(${cartItems.length} items)`}
                  </h3>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item._id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl">
                        <img
                          src={item.productImage || item.images?.[0] || '/placeholder.png'}
                          alt={item.productName || item.name}
                          className="w-16 h-16 object-cover rounded-xl"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{item.productName || item.name}</h4>
                          <p className="text-gray-600 text-sm">Quantity: {item.quantity || 1}</p>
                          {item.selectedVariant && (
                            <p className="text-gray-600 text-sm">
                              Variant: {item.selectedVariant.color}, {item.selectedVariant.size}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">
                            ${formatPrice(getItemPrice(item) * (item.quantity || 1))}
                          </p>
                          <p className="text-sm text-gray-600">
                            ${formatPrice(getItemPrice(item))} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    onClick={() => setActiveStep(1)}
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-all duration-300 font-semibold"
                  >
                    Back to Shipping
                  </button>
                  <button
                    onClick={() => setActiveStep(3)}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-12 py-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Payment - Step 3 - SSL Commerz */}
            {activeStep === 3 && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faCreditCard} className="text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Secure Payment</h2>
                </div>

                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faLock} className="text-green-500 text-3xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">SSL Commerz Secure Payment</h3>
                  <p className="text-gray-600 mb-6">
                    You will be redirected to SSL Commerz secure payment gateway to complete your transaction.
                  </p>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
                    <h4 className="font-semibold text-yellow-800 mb-3">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-bold text-lg">${formatPrice(total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Items:</span>
                        <span>{cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <SSLpayBtn
                    total={total}
                    shippingInfo={shippingInfo}
                    cartItems={cartItems}
                    checkoutSource={checkoutSource}
                    onPaymentStart={handlePaymentStart}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    className="w-full"
                  />
                  
                  <button
                    onClick={() => setActiveStep(2)}
                    className="w-full px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-all duration-300 font-semibold"
                  >
                    Back to Review
                  </button>
                </div>

                {/* Security Badges */}
                <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-4 text-center">100% Secure Payment</h4>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <FontAwesomeIcon icon={faShieldAlt} className="text-green-500" />
                      <span className="text-sm">SSL Secured</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <FontAwesomeIcon icon={faAward} className="text-blue-500" />
                      <span className="text-sm">PCI DSS Compliant</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h3>
              
              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <img
                      src={item.productImage || item.images?.[0] || '/placeholder.png'}
                      alt={item.productName || item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 text-sm truncate">
                        {item.productName || item.name}
                      </h4>
                      <p className="text-gray-600 text-xs">Qty: {item.quantity || 1}</p>
                      {item.selectedVariant && (
                        <p className="text-gray-600 text-xs">
                          {item.selectedVariant.color}, {item.selectedVariant.size}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold text-gray-800 text-sm">
                      ${formatPrice(getItemPrice(item) * (item.quantity || 1))}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} items)</span>
                  <span className="font-semibold">${formatPrice(subtotal)}</span>
                </div>
                
                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount (10%)</span>
                    <span className="font-semibold">-${formatPrice(discount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold">{shipping === 0 ? 'FREE' : `$${formatPrice(shipping)}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="font-semibold">${formatPrice(tax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span>${formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              {activeStep === 1 && (
                <div className="mt-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter GLOBUS10"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
                    />
                    <button 
                      onClick={applyPromoCode}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition-all duration-300 font-semibold text-sm"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <FontAwesomeIcon icon={faShieldAlt} className="text-green-500" />
                  <span>Secure SSL Encryption</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <FontAwesomeIcon icon={faAward} className="text-blue-500" />
                  <span>Money Back Guarantee</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <FontAwesomeIcon icon={faRocket} className="text-purple-500" />
                  <span>Fast Worldwide Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
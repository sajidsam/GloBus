import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faSpinner, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

const SSLpayBtn = ({ 
  total, 
  shippingInfo, 
  cartItems, 
  checkoutSource,
  onPaymentStart,
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
  className = ""
}) => {
  const [processing, setProcessing] = useState(false);

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '0.00';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const initiateSSLCommerzPayment = async () => {
    // Validation check
    if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.phone || !shippingInfo.address) {
      onPaymentError?.('Please complete all shipping information before payment');
      return;
    }

    if (cartItems.length === 0) {
      onPaymentError?.('No items in cart');
      return;
    }

    try {
      setProcessing(true);
      onPaymentStart?.(); 

      const user = JSON.parse(localStorage.getItem("user"));
      
      // Payment Data
      const paymentData = {
        total_amount: total,
        currency: 'BDT',
        success_url: `${window.location.origin}/payment-success`,
        fail_url: `${window.location.origin}/payment-failed`,
        cancel_url: `${window.location.origin}/cart`,
        customer_name: shippingInfo.fullName,
        customer_email: shippingInfo.email,
        customer_phone: shippingInfo.phone,
        customer_address: shippingInfo.address,
        customer_city: shippingInfo.city,
        customer_country: shippingInfo.country || 'Bangladesh',
        shipping_info: shippingInfo,
        cart_items: cartItems.map(item => ({
          productId: item._id || item.productId,
          name: item.productName || item.name,
          price: item.discountPrice || item.price,
          quantity: item.quantity || 1,
          image: item.productImage || item.images?.[0],
          size: item.selectedVariant?.size,
          color: item.selectedVariant?.color,
          variant: item.selectedVariant
        })),
        source: checkoutSource,
        user_email: user?.email,
        user_id: user?._id
      };

      console.log('Sending payment data to backend:', paymentData);

      // SSL Commerz 
      const response = await fetch('https://glo-bus-backend.vercel.app/api/sslcommerz/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();
      
      if (data.GatewayPageURL) {
        onPaymentSuccess?.(data);
        window.location.href = data.GatewayPageURL;
      } else {
        const errorMsg = data.error || data.message || 'Payment initialization failed!';
        onPaymentError?.(errorMsg);
      }
    } catch (error) {
      console.error('SSL Commerz error:', error);
      const errorMsg = error.message || 'Payment processing error!';
      onPaymentError?.(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentClick = () => {
    initiateSSLCommerzPayment();
  };

  return (
    <button
      onClick={handlePaymentClick}
      disabled={processing || disabled || total <= 0}
      className={`
        w-full bg-gradient-to-r from-green-500 to-emerald-600 
        text-white py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 
        transition-all duration-300 font-semibold text-lg shadow-lg 
        hover:shadow-xl transform hover:-translate-y-0.5 
        flex items-center justify-center gap-3
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        disabled:hover:shadow-lg
        ${className}
      `}
    >
      {processing ? (
        <>
          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <FontAwesomeIcon icon={faLock} />
          Pay ${formatPrice(total)} with SSL Commerz
        </>
      )}
    </button>
  );
};

export default SSLpayBtn;
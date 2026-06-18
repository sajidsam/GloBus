import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const AddToCartButton = ({ product, className = "", showIcon = true, showText = true }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    console.log('Add to Cart clicked for:', product.name);
    
    // Check authentication
    let user;
    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        navigate("/signin");
        return;
      }
      user = JSON.parse(userData);
      
      if (!user.email) {
        navigate("/signin");
        return;
      }
    } catch (err) {
      console.error('Error reading user data:', err);
      navigate("/signin");
      return;
    }

    setLoading(true);

    try {
      
      const cartData = {
        userId: user.email,
        productId: product._id,
        productName: product.name,
        productImage: product.images?.[0] || '/placeholder.png',
        price: product.discountPrice || product.price,
        originalPrice: product.price,
        discountPrice: product.discountPrice,
        brand: product.brand || 'Unknown Brand',
        category: product.category || 'General',
        quantity: 1
      };

      console.log('Sending cart data:', cartData);

      const response = await fetch('https://glo-bus-backend.vercel.app/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartData)
      });

      console.log('Response status:', response.status);

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error(' Error parsing response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (response.ok) {
        console.log('Added to cart successfully:', result);
        
        const existingCart = localStorage.getItem('cart');
        let cartItems = existingCart ? JSON.parse(existingCart) : [];
        
        const existingItemIndex = cartItems.findIndex(item => item._id === product._id);
        
        // Add product & Update quantity 
        if (existingItemIndex >= 0) {
          cartItems[existingItemIndex].quantity += 1;
          console.log(' Updated existing item quantity');
        } else {
          cartItems.push({
            _id: product._id,
            name: product.name,
            price: product.price,
            discountPrice: product.discountPrice,
            images: product.images,
            brand: product.brand,
            quantity: 1,
            addedAt: new Date().toISOString()
          });
          console.log('Added new item to cart');
        }
        
        localStorage.setItem('cart', JSON.stringify(cartItems));
        console.log('💾 Updated localStorage with cart items');
        
        // Update header cart count
        const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { count: totalCount } 
        }));
        
        console.log('Dispatched cart update event, count:', totalCount);

        alert(` Added ${product.name} to cart!`);
      } else {
        console.error('Backend error:', result.message);
        alert(`Failed to add item to cart: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Network error adding to cart:', error);
      alert('Failed to add item to cart. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleAddToCart}
      disabled={loading}
      className={`
        bg-orange-500 
        text-white 
        px-4 py-2 
        rounded-lg 
        hover:bg-orange-600 
        transition-all 
        duration-200 
        flex 
        items-center 
        gap-2 
        disabled:opacity-50 
        disabled:cursor-not-allowed
        disabled:transform
        disabled:scale-95
        ${className}
      `}
    >
      {loading ? (
        <>
          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
          {showText && "Adding..."}
        </>
      ) : (
        <>
          {showIcon && <FontAwesomeIcon icon={faCartPlus} />}
          {showText && "Add to Cart"}
        </>
      )}
    </button>
  );
};

export default AddToCartButton;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingBag, 
  faBox, 
  faShippingFast, 
  faCheckCircle,
  faClock,
  faTimesCircle,
  faUndo,
  faReceipt,
  faEye,
  faDownload,
  faStar,
  faCalendarAlt,
  faMoneyBillWave,
  faCreditCard,
  faMapMarkerAlt,
  faPhone,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';

const OrderAndPayment = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate('/signin', { replace: true });
      return;
    }
    fetchUserOrders();
  }, [navigate]);

  const fetchUserOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      
      if (!user) {
        navigate('/signin', { replace: true });
        return;
      }
      
      const response = await fetch(`https://glo-bus-backend.vercel.app/api/orders?userEmail=${user.email}`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing': return faClock;
      case 'shipped': return faShippingFast;
      case 'delivered': return faCheckCircle;
      case 'cancelled': return faTimesCircle;
      default: return faBox;
    }
  };

  // Improved image URL getter function
  const getImageUrl = (item) => {
    return (
      item.image || 
      item.productImage || 
      item.images?.[0] || 
      '/placeholder.png'
    );
  };

  // Improved product name getter function
  const getProductName = (item) => {
    return item.name || item.productName || 'Product';
  };

  const handleStartShopping = () => {
    navigate('/products');
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    console.log('View details for order:', order);
  };

  const handleDownloadInvoice = (order) => {
    console.log('Download invoice for order:', order);
  };

  const handleRateReview = (order) => {
    console.log('Rate and review order:', order);
  };

  const handleTrackOrder = (order) => {
    console.log('Track order:', order);
  };

  const handleNeedHelp = (order) => {
    console.log('Need help with order:', order);
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.orderStatus === activeTab;
  });

  const stats = {
    total: orders.length,
    processing: orders.filter(o => o.orderStatus === 'processing').length,
    shipped: orders.filter(o => o.orderStatus === 'shipped').length,
    delivered: orders.filter(o => o.orderStatus === 'delivered').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon icon={faShoppingBag} className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Order History</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Track your orders, view order details, and manage your purchases all in one place.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <FontAwesomeIcon icon={faShoppingBag} className="text-blue-500 text-2xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Processing</p>
                <p className="text-3xl font-bold text-gray-800">{stats.processing}</p>
              </div>
              <FontAwesomeIcon icon={faClock} className="text-yellow-500 text-2xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Shipped</p>
                <p className="text-3xl font-bold text-gray-800">{stats.shipped}</p>
              </div>
              <FontAwesomeIcon icon={faShippingFast} className="text-purple-500 text-2xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Delivered</p>
                <p className="text-3xl font-bold text-gray-800">{stats.delivered}</p>
              </div>
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-2xl" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'all' 
                  ? 'bg-orange-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('processing')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'processing' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Processing ({stats.processing})
            </button>
            <button
              onClick={() => setActiveTab('shipped')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'shipped' 
                  ? 'bg-purple-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Shipped ({stats.shipped})
            </button>
            <button
              onClick={() => setActiveTab('delivered')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'delivered' 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Delivered ({stats.delivered})
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FontAwesomeIcon icon={faBox} className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No orders found</h3>
              <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
              <button 
                onClick={handleStartShopping}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        Order #{order.orderNumber}
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.orderStatus)}`}>
                          <FontAwesomeIcon icon={getStatusIcon(order.orderStatus)} className="mr-2" />
                          {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                        </span>
                      </h3>
                      <p className="text-gray-600 mt-1 flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        Ordered on {new Date(order.timestamps?.created).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">${order.orderSummary?.totalAmount}</p>
                      <p className="text-gray-600">{order.orderSummary?.itemsCount} items</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Products */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FontAwesomeIcon icon={faBox} className="text-blue-500" />
                        Order Items
                      </h4>
                      <div className="space-y-4">
                        {order.items?.map((item, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                            <img
                              src={getImageUrl(item)}
                              alt={getProductName(item)}
                              className="w-16 h-16 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.src = '/placeholder.png';
                              }}
                            />
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-800">{getProductName(item)}</h5>
                              <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                              {item.variant && (
                                <p className="text-gray-600 text-sm">
                                  {item.variant.color} • {item.variant.size}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                              <p className="text-gray-600 text-sm">${item.price} each</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping & Actions */}
                    <div>
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-500" />
                          Shipping Address
                        </h4>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="font-semibold">{order.shippingInfo?.fullName}</p>
                          <p className="text-gray-600">{order.shippingInfo?.address}</p>
                          <p className="text-gray-600">
                            {order.shippingInfo?.city}, {order.shippingInfo?.state} {order.shippingInfo?.zipCode}
                          </p>
                          <p className="text-gray-600">{order.shippingInfo?.country}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-gray-600 text-sm flex items-center gap-2">
                              <FontAwesomeIcon icon={faPhone} />
                              {order.shippingInfo?.phone}
                            </p>
                            <p className="text-gray-600 text-sm flex items-center gap-2">
                              <FontAwesomeIcon icon={faEnvelope} />
                              {order.shippingInfo?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <button 
                          onClick={() => handleViewDetails(order)}
                          className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-xl hover:bg-blue-600 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                        >
                          <FontAwesomeIcon icon={faEye} />
                          View Details
                        </button>
                        <button 
                          onClick={() => handleDownloadInvoice(order)}
                          className="flex-1 bg-green-500 text-white px-4 py-3 rounded-xl hover:bg-green-600 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                        >
                          <FontAwesomeIcon icon={faReceipt} />
                          Invoice
                        </button>
                        {order.orderStatus === 'delivered' && (
                          <button 
                            onClick={() => handleRateReview(order)}
                            className="flex-1 bg-orange-500 text-white px-4 py-3 rounded-xl hover:bg-orange-600 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                          >
                            <FontAwesomeIcon icon={faStar} />
                            Rate & Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCreditCard} />
                        Paid with SSL Commerz
                      </span>
                      <span className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faMoneyBillWave} />
                        Total: ${order.orderSummary?.totalAmount}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleTrackOrder(order)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-all duration-300 font-semibold text-sm"
                      >
                        Track Order
                      </button>
                      <button 
                        onClick={() => handleNeedHelp(order)}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition-all duration-300 font-semibold text-sm"
                      >
                        Need Help?
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderAndPayment;
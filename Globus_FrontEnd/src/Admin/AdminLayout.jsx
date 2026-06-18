import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaSearch, FaShoppingBag, FaUsers, FaChartLine } from "react-icons/fa";

import { useAuth } from "../Hooks/AuthContext";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Automatically redirect to orders when admin path is accessed
  useEffect(() => {
    if (location.pathname === "/admin") {
      navigate("/admin/orders", { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  // Active style function
  const getNavLinkClass = (isActive) => {
    return `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
      isActive 
        ? "bg-green-600 text-white shadow-lg" 
        : "hover:bg-gray-700 text-gray-300"
    }`;
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-200">

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 p-6 flex flex-col transition-transform z-20
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex pb-4">
          <h1 className="font-bold text-3xl text-green-600">
            Glo<span className="text-white">Bus</span>
          </h1>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-3">
          <NavLink 
            to="/admin/orders" 
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <FaShoppingBag /> Orders
          </NavLink>

          <NavLink 
            to="/admin/products" 
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <FaChartLine /> Products
          </NavLink>

          <NavLink 
            to="/admin/customers" 
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <FaUsers /> Customers
          </NavLink>
        </nav>

        <p className="opacity-70 text-sm mt-6">
          GloBus <br /> All rights reserved
        </p>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-64 p-6 overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg mb-6 shadow">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-gray-200 text-2xl" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FaBars />
            </button>
            <h2 className="text-xl font-semibold">Admin Panel</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-700 rounded-lg py-2 pl-10 pr-4 text-gray-200 w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <span className="capitalize">{user?.role}</span>
              
              <button
                onClick={() => setShowLogoutModal(true)} 
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <Outlet />

      </main>

      {/* Logout Modal */}
      {showLogoutModal &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg p-6 w-80 shadow-lg z-[10000]">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Confirm Logout</h2>
              <p className="mb-6 text-gray-600">Are you sure you want to logout?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </div>
  );
};

export default AdminLayout;
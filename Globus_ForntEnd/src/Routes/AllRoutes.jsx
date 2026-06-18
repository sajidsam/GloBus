import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../Pages/Home";
import SignIn from "../Pages/SignIn";
import SignUp from "../Pages/SignUp";
import Error from "../Pages/Error";
import ProductsDetail from "../Pages/ProductsDetail";
import Checkout from '../Pages/Checkout';

import AdminLayout from "../Admin/AdminLayout";
import AdminDashboard from "../Admin/AdminDashboard";
import AdminUser from "../Admin/AdminUser";
import AdminProducts from "../Admin/AdminProducts";
import AdminOrder from "../Admin/AdminOrder";
import PrivateRoute from "../Admin/PrivateRoute";
import HeaderFooterWrap from "../Components/HeaderFooterWrap";
import Cart from "../Pages/Cart";
import OrderAndPayment from "../Pages/OrderAndPayment";

const AllRoutes = () => {
  return (
    <Routes>

      {/* Signin/Signup Routes */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* General Routes */}
      <Route element={<HeaderFooterWrap />}>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/productDetail" element={<ProductsDetail />} />
        <Route path="/productDetail/:id" element={<ProductsDetail />} />
        <Route path="/checkout" element={<Checkout/>} />
        <Route path="/orderHistory" element={<OrderAndPayment/>}/>
      </Route>

      {/* Private Admin Routes */}
      <Route
        path="/admin"
        element={
          <PrivateRoute role="admin">
            <AdminLayout />
          </PrivateRoute>
        }
      >
        {/* Default admin route - automatically redirect to orders */}
        <Route index element={<Navigate to="orders" replace />} />
        <Route path="orders" element={<AdminOrder />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="customers" element={<AdminUser />} />
      </Route>

      {/* Error Route*/}
      <Route path="*" element={<Error />} />
    </Routes>
  );
};

export default AllRoutes;
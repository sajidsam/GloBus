import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Hooks/AuthContext";

const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth(); 

  if (!user) return <Navigate to="/signin" />; 

  if (role && user.role !== role) return <Navigate to="/" />; 

  return children;
};

export default PrivateRoute;

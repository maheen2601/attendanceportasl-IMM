// src/routes/guards.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const authed = () => !!localStorage.getItem("access");
const getRole = () => localStorage.getItem("role");

export function RequireRole({ allow, children }) {
  if (!authed()) return <Navigate to="/login" replace />;
  const role = getRole();
  if (allow.includes(role)) return children;

  // redirect to the correct home for whoever is logged in
  if (role === "admin") return <Navigate to="/admin-dashboard" replace />;
  if (role === "lead")  return <Navigate to="/lead-dashboard" replace />;
  return <Navigate to="/employee-dashboard" replace />;
}

// src/App.js
import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

// Pages & components
import Login from "./components/login";
import BubbleBackground from "./components/BubbleBackground";
import Sidebar from "./components/Sidebar";               // Admin sidebar
import EmployeeSidebar from "./components/EmployeeSidebar"; // Employee sidebar
import EarlyOff from "./pages/EarlyOff";
// import Settings from "./pages/Settings";

import AdminDashboard from "./pages/AdminDashboard";
import EmployeeList from "./pages/Employees";
import AddEmployee from "./pages/AddEmployee";
import Attendance from "./pages/Attendance";
import LeaveRequests from "./pages/LeaveRequests";
import Settings from "./pages/Settings";
import AdminTimeCorrections from "./pages/AdminTimeCorrections";

import EmployeeDashboard from "./pages/EmployeeDashboard";
import MarkAttendance from "./pages/MarkAttendance";
import MyAttendance from "./pages/MyAttendance";
import EmployeeLeaves from "./pages/EmployeeLeaves";
import AdminEarlyOff from "./pages/AdminEarlyOff";
// Toasts
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ---------- Footer ----------
function Footer() {
  return (
    <footer className="mt-8 border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
      © {new Date().getFullYear()} All Rights Reserved —{"  "}
      <span className="font-semibold text-gray-700">Data Analyst Team</span>
      {/* or: Repaired & Enhanced by Your Name */}
    </footer>
  );
}

// ---------- Layouts ----------
const AdminLayout = ({ children }) => (
  <div className="flex">
    <Sidebar />
    <div className="flex-1 ml-64 bg-gray-100 min-h-screen p-6">
      {children}
      <Footer />
    </div>
  </div>
);

const EmployeeLayout = ({ children }) => (
  <div className="flex">
    <EmployeeSidebar />
    <div className="flex-1 ml-64 bg-gray-100 min-h-screen p-6">
      {children}
      <Footer />
    </div>
  </div>
);

// ---------- App Wrapper with routing guards ----------
function AppWrapper() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("access"))
  );
  const [role, setRole] = useState(localStorage.getItem("role") || null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    setIsLoggedIn(Boolean(token));
    setRole(token ? localStorage.getItem("role") : null);
  }, []);

  // Redirect this tab if user logs out in another tab + show toast
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "access" && !e.newValue) {
        toast.info("You’ve been logged out.");
        navigate("/login", { replace: true });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [navigate]);

  // Guarded route
  const ProtectedRoute = ({ element, roleRequired }) => {
    const token = localStorage.getItem("access");
    const currentRole = localStorage.getItem("role");

    if (!token) return <Navigate to="/login" replace />;

    if (roleRequired && currentRole !== roleRequired) {
      if (currentRole === "admin") return <Navigate to="/admin-dashboard" replace />;
      if (currentRole === "employee") return <Navigate to="/employee-dashboard" replace />;
      return <Navigate to="/login" replace />;
    }

    return element;
  };

  const showBubbles = location.pathname === "/login";

  return (
    <>
      {showBubbles && <BubbleBackground />}

      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login */}
        <Route
          path="/login"
          element={
            <Login
              onLogin={() => {
                const r = localStorage.getItem("role");
                setIsLoggedIn(true);
                setRole(r);
                if (r === "admin") navigate("/admin-dashboard", { replace: true });
                else if (r === "employee") navigate("/employee-dashboard", { replace: true });
                else navigate("/login", { replace: true });
              }}
            />
          }
        />

        {/* ---------- Admin routes ---------- */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute
              roleRequired="admin"
              element={
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              }
            />
          }
        />
        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute
              roleRequired="admin"
              element={
                <AdminLayout>
                  <EmployeeList />
                </AdminLayout>
              }
            />
          }
        />
        <Route path="/me/early-off" element={<EarlyOff />} />
        <Route
          path="/admin/add-employee"
          element={
            <ProtectedRoute
              roleRequired="admin"
              element={
                <AdminLayout>
                  <AddEmployee />
                </AdminLayout>
              }
            />
          }
        />
        <Route 
          path="/admin/earlyoff" 
          element={
            <ProtectedRoute
              roleRequired="admin"
              element={
                <AdminLayout>
                  <AdminEarlyOff />
                </AdminLayout>
              }
            />
          } 
        />
        <Route path="/admin/earlyoff" element={
            <AdminEarlyOff />} />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute
              roleRequired="admin"
              element={
                <AdminLayout>
                  <Attendance />
                </AdminLayout>
              }
            />
          }
        />
        <Route 
          path="/admin/time-corrections" 
          element={
            <ProtectedRoute
                roleRequired="admin"
                element={
                  <AdminLayout>
                    <AdminTimeCorrections />
                  </AdminLayout>
                }
              />
                }
        />
        <Route
          path="/admin/leave-requests"
          element={
            <ProtectedRoute
              roleRequired="admin"
              element={
                <AdminLayout>
                  <LeaveRequests />
                </AdminLayout>
              }
            />
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute
              roleRequired="admin"
              element={
                <AdminLayout>
                  <Settings />
                </AdminLayout>
              }
            />
          }
        />

        {/* ---------- Employee routes ---------- */}
        <Route
          path="/employee-dashboard"
          element={
            <ProtectedRoute
              roleRequired="employee"
              element={
                <EmployeeLayout>
                  <EmployeeDashboard />
                </EmployeeLayout>
              }
            />
          }
        />
        <Route
          path="/employee/mark"
          element={
            <ProtectedRoute
              roleRequired="employee"
              element={
                <EmployeeLayout>
                  <MarkAttendance />
                </EmployeeLayout>
              }
            />
          }
        />
        <Route
          path="/employee/attendance"
          element={
            <ProtectedRoute
              roleRequired="employee"
              element={
                <EmployeeLayout>
                  <MyAttendance />
                </EmployeeLayout>
              }
            />
          }
        />
        <Route
          path="/employee/leaves"
          element={
            <ProtectedRoute
              roleRequired="employee"
              element={
                <EmployeeLayout>
                  <EmployeeLeaves />
                </EmployeeLayout>
              }
            />
          }
        />
        <Route
          path="/policy"
          element={
            <ProtectedRoute
              roleRequired="employee"
              element={
                <EmployeeLayout>
                  <Settings />
                </EmployeeLayout>
              }
            />
          }
        />
  
        <Route
          path="/employee/early-off"
          element={
            <ProtectedRoute
              roleRequired="employee"
              element={
                <EmployeeLayout>
                  <EarlyOff />
                </EmployeeLayout>
              }
            />
          }
        />        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

// ---------- App Root ----------
export default function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
      {/* ✅ Global toast portal */}
      <ToastContainer position="top-right" theme="colored" newestOnTop />
    </BrowserRouter>
  );
}

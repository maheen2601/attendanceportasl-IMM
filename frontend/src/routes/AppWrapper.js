// import React, { useState, useEffect } from 'react';
// import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// import Login from '../components/login';
// import BubbleBackground from '../components/BubbleBackground';
// import AdminDashboard from '../pages/AdminDashboard';
// import EmployeeList from '../pages/Employees';
// import AddEmployee from '../pages/AddEmployee';
// import Attendance from '../pages/Attendance';
// import Reports from '../pages/Reports';
// import Settings from '../pages/Settings';
// import EmployeeDashboard from '../pages/EmployeeDashboard';
// import Sidebar from '../components/Sidebar';

// const AdminLayout = ({ children }) => (
//   <div className="flex">
//     <Sidebar />
//     <div className="flex-1 ml-64 bg-gray-100 min-h-screen p-6">{children}</div>
//   </div>
// );

// const ProtectedRoute = ({ element, roleRequired }) => {
//   const token = localStorage.getItem('access');
//   const currentRole = localStorage.getItem('role');

//   if (!token) {
//     toast.error("🚫 Please log in to continue.");
//     return <Navigate to="/login" />;
//   }

//   if (roleRequired && currentRole !== roleRequired) {
//     toast.error("🚫 Unauthorized access.");
//     return <Navigate to="/login" />;
//   }

//   return element;
// };

// function AppWrapper() {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access'));
//   const [role, setRole] = useState(localStorage.getItem('role') || null);

//   useEffect(() => {
//     const token = localStorage.getItem('access');
//     setIsLoggedIn(!!token);
//     setRole(token ? localStorage.getItem('role') : null);
//   }, []);

//   useEffect(() => {
//     const handleStorageChange = () => {
//       const token = localStorage.getItem('access');
//       if (!token) {
//         setIsLoggedIn(false);
//         setRole(null);
//         toast.warn("⚠️ Session expired. Please log in again.");
//         navigate('/login');
//       }
//     };

//     window.addEventListener("storage", handleStorageChange);
//     return () => window.removeEventListener("storage", handleStorageChange);
//   }, [navigate]);

//   const showBubbles = location.pathname === '/login';

//   return (
//     <>
//       <ToastContainer />
//       {showBubbles && <BubbleBackground />}

//       <Routes>
//         <Route
//           path="/login"
//           element={
//             <Login
//               onLogin={() => {
//                 const loggedInRole = localStorage.getItem('role');
//                 setIsLoggedIn(true);
//                 setRole(loggedInRole);
//                 toast.success("🎉 Logged in successfully");

//                 if (loggedInRole === 'admin') navigate('/admin-dashboard');
//                 else if (loggedInRole === 'employee') navigate('/employee-dashboard');
//               }}
//             />
//           }
//         />
//         <Route path="/" element={<Navigate to="/login" />} />
//         <Route path="/admin-dashboard" element={<ProtectedRoute element={<AdminLayout><AdminDashboard /></AdminLayout>} roleRequired="admin" />} />
//         <Route path="/admin/employees" element={<ProtectedRoute element={<AdminLayout><EmployeeList /></AdminLayout>} roleRequired="admin" />} />
//         <Route path="/admin/add-employee" element={<ProtectedRoute element={<AdminLayout><AddEmployee /></AdminLayout>} roleRequired="admin" />} />
//         <Route path="/admin/attendance" element={<ProtectedRoute element={<AdminLayout><Attendance /></AdminLayout>} roleRequired="admin" />} />
//         <Route path="/admin/reports" element={<ProtectedRoute element={<AdminLayout><Reports /></AdminLayout>} roleRequired="admin" />} />
//         <Route path="/admin/settings" element={<ProtectedRoute element={<AdminLayout><Settings /></AdminLayout>} roleRequired="admin" />} />
//         <Route path="/employee-dashboard" element={<ProtectedRoute element={<EmployeeDashboard />} roleRequired="employee" />} />
//       </Routes>
//     </>
//   );
// }

// export default AppWrapper;

// src/routes/AppWrapper.js
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- Auth / shared
import Login from "../components/login";
import BubbleBackground from "../components/BubbleBackground";

// --- Admin pages
import AdminDashboard from "../pages/AdminDashboard";
import EmployeeList from "../pages/Employees";
import AddEmployee from "../pages/AddEmployee";
import Attendance from "../pages/Attendance";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";

// --- Employee pages
import EmployeeDashboard from "../pages/EmployeeDashboard";

// --- Lead pages
import LeadDashboard from "../pages/LeadDashboard";
import LeadEmployeeList from "../pages/LeadEmployeeList";
import LeadAddEmployee from "../pages/LeadAddEmployee";
import LeadEarlyOff from "../pages/LeadEarlyOff";
import LeadLeaveRequest from "../pages/LeadLeaveRequest";
import LeadTimeCorrections from "../pages/LeadTimeCorrections";

// --- Layout (reuse your admin sidebar layout; swap if you have a LeadSidebar)
import Sidebar from "../components/Sidebar";

const Shell = ({ children }) => (
  <div className="flex">
    <Sidebar />
    <div className="flex-1 ml-64 bg-gray-100 min-h-screen p-6">{children}</div>
  </div>
);

// Generic guard: pass allow={['admin']} or ['employee'] or ['lead']
const ProtectedRoute = ({ element, allow }) => {
  const token = localStorage.getItem("access");
  const role = localStorage.getItem("role");

  if (!token) {
    toast.error("🚫 Please log in to continue.");
    return <Navigate to="/login" replace />;
  }

  if (allow && !allow.includes(role)) {
    toast.error("🚫 Unauthorized access.");
    // If logged in but wrong role, push them to their own home
    const home =
      role === "admin" ? "/admin-dashboard" :
      role === "lead"  ? "/lead-dashboard"  :
      "/employee-dashboard";
    return <Navigate to={home} replace />;
  }

  return element;
};

// Helper for default landing
const homeFor = (role) =>
  role === "admin" ? "/admin-dashboard" :
  role === "lead"  ? "/lead-dashboard"  :
  role === "employee" ? "/employee-dashboard" :
  "/login";


function AppWrapper() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  // On mount, sync state from storage
  useEffect(() => {
    const token = localStorage.getItem("access");
    setIsLoggedIn(!!token);
    setRole(token ? localStorage.getItem("role") : null);
  }, []);

  // If token is removed (e.g., in another tab), kick back to login
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("access");
      if (!token) {
        setIsLoggedIn(false);
        setRole(null);
        toast.warn("⚠️ Session expired. Please log in again.");
        navigate("/login", { replace: true });
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);

  const showBubbles = location.pathname === "/login";

  return (
    <>
      <ToastContainer />
      {showBubbles && <BubbleBackground />}

      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to={homeFor(localStorage.getItem("role"))} replace />} />

        {/* Admin */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute
              allow={["admin"]}
              element={<Shell><AdminDashboard /></Shell>}
            />
          }
        />
        <Route
          path="/admin/employees"
          element={<ProtectedRoute allow={["admin"]} element={<Shell><EmployeeList /></Shell>} />}
        />
        <Route
          path="/admin/add-employee"
          element={<ProtectedRoute allow={["admin"]} element={<Shell><AddEmployee /></Shell>} />}
        />
        <Route
          path="/admin/attendance"
          element={<ProtectedRoute allow={["admin"]} element={<Shell><Attendance /></Shell>} />}
        />
        <Route
          path="/admin/reports"
          element={<ProtectedRoute allow={["admin"]} element={<Shell><Reports /></Shell>} />}
        />
        <Route
          path="/admin/settings"
          element={<ProtectedRoute allow={["admin"]} element={<Shell><Settings /></Shell>} />}
        />

        {/* Employee */}
        <Route
          path="/employee-dashboard"
          element={<ProtectedRoute allow={["employee"]} element={<EmployeeDashboard />} />}
        />

        {/* Lead */}
        <Route
          path="/lead-dashboard"
          element={<ProtectedRoute allow={["lead"]} element={<Shell><LeadDashboard /></Shell>} />}
        />
        <Route
          path="/lead/employees"
          element={<ProtectedRoute allow={["lead"]} element={<Shell><LeadEmployeeList /></Shell>} />}
        />
        <Route
          path="/lead/add-employee"
          element={<ProtectedRoute allow={["lead"]} element={<Shell><LeadAddEmployee /></Shell>} />}
        />
        <Route
          path="/lead/early-off"
          element={<ProtectedRoute allow={["lead"]} element={<Shell><LeadEarlyOff /></Shell>} />}
        />
        <Route
          path="/lead/leave-requests"
          element={<ProtectedRoute allow={["lead"]} element={<Shell><LeadLeaveRequest /></Shell>} />}
        />
        <Route
          path="/lead/time-corrections"
          element={<ProtectedRoute allow={["lead"]} element={<Shell><LeadTimeCorrections /></Shell>} />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={homeFor(localStorage.getItem("role"))} replace />} />
      </Routes>
    </>
  );
}

export default AppWrapper;

import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from '../components/login';
import BubbleBackground from '../components/BubbleBackground';
import AdminDashboard from '../pages/AdminDashboard';
import EmployeeList from '../pages/Employees';
import AddEmployee from '../pages/AddEmployee';
import Attendance from '../pages/Attendance';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import Sidebar from '../components/Sidebar';

const AdminLayout = ({ children }) => (
  <div className="flex">
    <Sidebar />
    <div className="flex-1 ml-64 bg-gray-100 min-h-screen p-6">{children}</div>
  </div>
);

const ProtectedRoute = ({ element, roleRequired }) => {
  const token = localStorage.getItem('access');
  const currentRole = localStorage.getItem('role');

  if (!token) {
    toast.error("🚫 Please log in to continue.");
    return <Navigate to="/login" />;
  }

  if (roleRequired && currentRole !== roleRequired) {
    toast.error("🚫 Unauthorized access.");
    return <Navigate to="/login" />;
  }

  return element;
};

function AppWrapper() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access'));
  const [role, setRole] = useState(localStorage.getItem('role') || null);

  useEffect(() => {
    const token = localStorage.getItem('access');
    setIsLoggedIn(!!token);
    setRole(token ? localStorage.getItem('role') : null);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('access');
      if (!token) {
        setIsLoggedIn(false);
        setRole(null);
        toast.warn("⚠️ Session expired. Please log in again.");
        navigate('/login');
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);

  const showBubbles = location.pathname === '/login';

  return (
    <>
      <ToastContainer />
      {showBubbles && <BubbleBackground />}

      <Routes>
        <Route
          path="/login"
          element={
            <Login
              onLogin={() => {
                const loggedInRole = localStorage.getItem('role');
                setIsLoggedIn(true);
                setRole(loggedInRole);
                toast.success("🎉 Logged in successfully");

                if (loggedInRole === 'admin') navigate('/admin-dashboard');
                else if (loggedInRole === 'employee') navigate('/employee-dashboard');
              }}
            />
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/admin-dashboard" element={<ProtectedRoute element={<AdminLayout><AdminDashboard /></AdminLayout>} roleRequired="admin" />} />
        <Route path="/admin/employees" element={<ProtectedRoute element={<AdminLayout><EmployeeList /></AdminLayout>} roleRequired="admin" />} />
        <Route path="/admin/add-employee" element={<ProtectedRoute element={<AdminLayout><AddEmployee /></AdminLayout>} roleRequired="admin" />} />
        <Route path="/admin/attendance" element={<ProtectedRoute element={<AdminLayout><Attendance /></AdminLayout>} roleRequired="admin" />} />
        <Route path="/admin/reports" element={<ProtectedRoute element={<AdminLayout><Reports /></AdminLayout>} roleRequired="admin" />} />
        <Route path="/admin/settings" element={<ProtectedRoute element={<AdminLayout><Settings /></AdminLayout>} roleRequired="admin" />} />
        <Route path="/employee-dashboard" element={<ProtectedRoute element={<EmployeeDashboard />} roleRequired="employee" />} />
      </Routes>
    </>
  );
}

export default AppWrapper;

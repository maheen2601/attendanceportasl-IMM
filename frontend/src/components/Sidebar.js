// src/components/admin/Sidebar.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  UserPlusIcon,
  ChartBarIcon,
  ClockIcon,      
  CalendarDaysIcon,             // 👈 new
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import ConfirmDialog from "./ConfirmDialog";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

    const links = [
    { to: "/admin-dashboard",      label: "Dashboard",       icon: <HomeIcon className="w-5 h-5" /> },
    { to: "/admin/employees",      label: "Employees",       icon: <UsersIcon className="w-5 h-5" /> },
    { to: "/admin/add-employee",   label: "Add Employee",    icon: <UserPlusIcon className="w-5 h-5" /> },
    { to: "/admin/leave-requests", label: "Leave Requests",  icon: <ChartBarIcon className="w-5 h-5" /> },

    // NEW: admin’s own attendance + leaves (reusing employee self APIs)
    { to: "/admin/my-attendance",  label: "My Attendance",   icon: <ClockIcon className="w-5 h-5" /> },
    { to: "/admin/my-leaves",      label: "My Leaves",       icon: <CalendarDaysIcon className="w-5 h-5" /> },

    // (optional) future items:
    // { to: "/admin/time-corrections", label: "Time Change Requests", icon: <ClockIcon className="w-5 h-5" /> },
    // { to: "/admin/earlyoff",         label: "Early-off Requests",   icon: <ArrowRightOnRectangleIcon className="w-5 h-5" /> },
  ];


  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    navigate("/login", { replace: true });
  };

  return (
    <div className="h-screen w-64 bg-gray-900 text-white fixed top-0 left-0 flex flex-col shadow-lg">
      <div className="px-6 py-5 text-xl font-extrabold tracking-wide border-b border-gray-800">
        AdminHub
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map(({ to, label, icon }) => {
          const isActive = location.pathname.startsWith(to); // 👈 more robust active state
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? "bg-gray-800 text-yellow-300"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-5">
        <button
          onClick={() => setShowLogout(true)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span>Log out</span>
        </button>
      </div>

      <ConfirmDialog
        open={showLogout}
        title="Log out from AdminHub?"
        message="You’ll be signed out and redirected to the login page."
        confirmText="Log out"
        cancelText="Cancel"
        tone="danger"
        onCancel={() => setShowLogout(false)}
        onConfirm={() => {
          setShowLogout(false);
          handleLogout();
        }}
      />
       
    </div>
  );
};



export default Sidebar;



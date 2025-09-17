// src/components/EmployeeSidebar.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import ConfirmDialog from "./ConfirmDialog";

const links = [
  { to: "/employee-dashboard",   label: "Overview",        icon: HomeIcon },
  { to: "/employee/mark",        label: "Mark Attendance", icon: CheckCircleIcon },
  { to: "/employee/attendance",  label: "My Attendance",   icon: CalendarDaysIcon },
  { to: "/employee/leaves",      label: "Leave Requests",  icon: ClipboardDocumentListIcon },
  // NEW
  { to: "/employee/early-off",   label: "Early-off",       icon: ClockIcon },
  { to: "/policy",               label: "Policy",          icon: Cog6ToothIcon },
];

export default function EmployeeSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const isActive = (to) => pathname === to || pathname.startsWith(`${to}/`);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    toast.info("You’ve been logged out.");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="h-screen w-64 bg-gray-900 text-white fixed top-0 left-0 flex flex-col shadow-lg">
      {/* Brand */}
      <div className="px-6 py-5 text-xl font-extrabold tracking-wide border-b border-gray-800">
        Employee
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
              isActive(to)
                ? "bg-gray-800 text-yellow-300"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 pb-5">
        <button
          onClick={() => setShowLogout(true)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span>Log out</span>
        </button>
      </div>

      <ConfirmDialog
        open={showLogout}
        title="Log out?"
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
    </aside>
  );
}

// src/components/LeadSidebar.js
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
  ClockIcon,
  DocumentCheckIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import ConfirmDialog from "./ConfirmDialog";

export default function LeadSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);

  const links = [
    { to: "/lead-dashboard",       label: "Dashboard",          icon: <HomeIcon className="w-5 h-5" /> },
    { to: "/lead/employees",       label: "Employees",          icon: <UsersIcon className="w-5 h-5" /> },
    { to: "/lead/add-employee",    label: "Add Employee",       icon: <UserPlusIcon className="w-5 h-5" /> },
    { to: "/lead/leave-requests",  label: "Leave Requests",     icon: <DocumentCheckIcon className="w-5 h-5" /> },
    { to: "/lead/time-corrections",label: "Time Corrections",   icon: <ClockIcon className="w-5 h-5" /> },
    { to: "/lead/early-off",       label: "Early-off Requests", icon: <ArrowRightOnRectangleIcon className="w-5 h-5" /> },
  ];

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="h-screen w-64 bg-gray-900 text-white fixed top-0 left-0 flex flex-col shadow-lg">
      <div className="px-6 py-5 text-xl font-extrabold tracking-wide border-b border-gray-800">
        LeadHub
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map(({ to, label, icon }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                active ? "bg-gray-800 text-yellow-300"
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
          onClick={() => setConfirm(true)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span>Log out</span>
        </button>
      </div>

      <ConfirmDialog
        open={confirm}
        title="Log out?"
        message="You’ll be signed out and redirected to the login page."
        confirmText="Log out"
        cancelText="Cancel"
        tone="danger"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          logout();
        }}
      />
    </aside>
  );
}

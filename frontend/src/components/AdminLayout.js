// ---------- src/components/AdminLayout.js ----------
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import "./AdminLayout.css";

const AdminLayout = () => {
  return (
    <div className="admin-shell">
      <Sidebar />
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="brand">AdminHub</div>
          <div className="spacer" />
          <ThemeToggle compact />
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;


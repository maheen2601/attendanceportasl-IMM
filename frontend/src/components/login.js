// src/pages/Login.jsx
import React, { useState } from "react";
import api from "../utils/axiosInstance";            // ✅ use shared client
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Player } from "@lottiefiles/react-lottie-player";
import { toast } from "react-toastify";
import BubbleBackground from "../components/BubbleBackground";
import "./Login.css";

// Normalize DRF/SimpleJWT error shapes
function extractApiError(err) {
  if (!err?.response) return "Network error. Couldn’t reach the API.";
  const { status, data, config } = err.response;
  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;
  if (data?.message) return data.message;
  if (Array.isArray(data?.non_field_errors) && data.non_field_errors.length) {
    return data.non_field_errors[0];
  }
  const parts = [];
  for (const [k, v] of Object.entries(data || {})) {
    if (Array.isArray(v)) parts.push(`${k}: ${v.join(" ")}`);
    else if (typeof v === "string") parts.push(`${k}: ${v}`);
  }
  return parts.length ? parts.join(" | ") : `Request failed (${status}).`;
}

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin"); // 'admin' | 'employee'
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotMessage, setShowForgotMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErrorMessage("");
    setLoading(true);

    // Clear any stale tokens before a new attempt
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");

    try {
      // ✅ uses baseURL from env: https://<backend>/api/
      const res = await api.post("login/", { username, password, role });

      // Trust server’s role if it sends one
      const serverRole = res.data?.role ?? (res.data?.is_staff ? "admin" : "employee");
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("role", serverRole);

      onLogin?.();

      navigate(serverRole === "admin" ? "/admin-dashboard" : "/employee-dashboard", {
        replace: true,
      });
      toast.success("Logged in ✅");
    } catch (error) {
      const raw = extractApiError(error);
      const msg =
        /invalid/i.test(raw) || /no active account/i.test(raw)
          ? "Invalid username or password."
          : /admin access/i.test(raw)
          ? "This account must log in as Admin."
          : /employee access/i.test(raw)
          ? "This account must log in as Employee."
          : raw;

      setErrorMessage(msg);
      toast.error(msg);
      console.warn("Login failed:", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BubbleBackground />

      <nav className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white shadow-lg p-4 flex justify-between items-center fixed top-0 left-0 z-40">
        <div className="flex items-center gap-4">
          <img src="/IMM.png" alt="IMM Logo" className="h-14 w-auto" />
          <span className="text-lg md:text-xl font-semibold tracking-wide">
            Interlink <span className="font-bold">Multi Media</span>
          </span>
        </div>
      </nav>

      <div className="relative min-h-screen flex items-center justify-center p-6 pt-24 z-10">
        <div className="bg-white/85 backdrop-blur rounded-xl shadow-xl overflow-hidden w-full max-w-5xl border border-white/40">
          <div className="w-full md:flex">
            {/* Left: Login Form */}
            <div className="w-full md:w-1/2 p-8">
              <h2 className="text-2xl font-bold text-center mb-2">Login</h2>

              {/* Role Toggle */}
              <div className="flex justify-center gap-4 mb-6">
                <button
                  type="button"
                  aria-pressed={role === "admin"}
                  className={`px-4 py-1 rounded-lg border transition ${
                    role === "admin"
                      ? "bg-purple-600 text-white border-purple-600"
                      : "border-purple-500 text-purple-600 hover:bg-purple-50"
                  }`}
                  onClick={() => setRole("admin")}
                  disabled={loading}
                >
                  Login as Admin
                </button>
                <button
                  type="button"
                  aria-pressed={role === "employee"}
                  className={`px-4 py-1 rounded-lg border transition ${
                    role === "employee"
                      ? "bg-pink-600 text-white border-pink-600"
                      : "border-pink-500 text-pink-600 hover:bg-pink-50"
                  }`}
                  onClick={() => setRole("employee")}
                  disabled={loading}
                >
                  Login as Employee
                </button>
              </div>

              {/* Error banner */}
              {errorMessage && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm flex justify-between items-start">
                  <div>{errorMessage}</div>
                  <button
                    onClick={() => setErrorMessage("")}
                    className="ml-3 text-red-600 hover:text-red-800 font-semibold"
                  >
                    ✖
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Username */}
                <div className="relative mb-4">
                  <FaUser className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    placeholder="Username"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                    disabled={loading}
                  />
                </div>

                {/* Password */}
                <div className="relative mb-4">
                  <FaLock className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    placeholder="Password"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <div
                  className="text-right text-sm mb-4 text-blue-600 hover:underline cursor-pointer"
                  onClick={() => setShowForgotMessage(true)}
                >
                  Forgot password?
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2 rounded-lg text-white font-semibold transition ${
                    loading
                      ? "bg-purple-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95"
                  }`}
                >
                  {loading ? "Logging in…" : "LOGIN"}
                </button>

                {/* Forgot Password Info */}
                {showForgotMessage && (
                  <div className="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded text-sm relative">
                    <button
                      onClick={() => setShowForgotMessage(false)}
                      className="absolute top-2 right-3 text-yellow-700 hover:text-yellow-900 font-bold"
                    >
                      ✖
                    </button>
                    Please contact the <strong>Data Team</strong> or{" "}
                    <strong>Admin</strong> to reset your password.
                  </div>
                )}
              </form>
            </div>

            {/* Right: Lottie Illustration */}
            <div className="hidden md:flex items-center justify-center md:w-1/2 bg-gray-50">
              <Player
                autoplay
                loop
                src="https://assets6.lottiefiles.com/packages/lf20_jcikwtux.json"
                style={{ height: 360, width: 360 }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;

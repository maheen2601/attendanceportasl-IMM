// // src/pages/Login.jsx
// import React, { useEffect, useState } from "react";
// import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
// import { useNavigate, useLocation } from "react-router-dom";
// import { Player } from "@lottiefiles/react-lottie-player";
// import { toast } from "react-toastify";
// import api, { API_BASE, setAuthTokens, clearAuthTokens } from "../lib/api";
// import BubbleBackground from "../components/BubbleBackground";
// import "./Login.css";

// // -------- helpers --------
// function extractApiError(err) {
//   if (!err?.response) return `Network error. Is the API running at ${API_BASE}?`;
//   const { status, data } = err.response || {};
//   if (typeof data === "string") return data;
//   if (data?.detail) return data.detail;
//   if (data?.message) return data.message;
//   if (Array.isArray(data?.non_field_errors) && data.non_field_errors.length) return data.non_field_errors[0];
//   const parts = [];
//   for (const [k, v] of Object.entries(data || {})) {
//     if (Array.isArray(v)) parts.push(`${k}: ${v.join(" ")}`);
//     else if (typeof v === "string") parts.push(`${k}: ${v}`);
//   }
//   if (parts.length) return parts.join(" | ");
//   return `Request failed (${status ?? "unknown"}).`;
// }

// async function fetchCurrentUser() {
//   try {
//     // ✅ base already has /api → use short path
//     const r = await api.get("/me/profile/");
//     const u = r?.data || {};
//     localStorage.setItem("user", JSON.stringify(u));
//     return u;
//   } catch {
//     localStorage.setItem("user", JSON.stringify({}));
//     return {};
//   }
// }

// // -------- component --------
// export default function Login({ onLogin }) {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("employee"); // 'admin' | 'employee'
//   const [errorMessage, setErrorMessage] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [showForgotMessage, setShowForgotMessage] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const access = localStorage.getItem("access");
//     const savedRole = localStorage.getItem("role");
//     if (access && savedRole) {
//       navigate(savedRole === "admin" ? "/admin-dashboard" : "/employee-dashboard", { replace: true });
//     }
//   }, [navigate]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (loading) return;

//     setErrorMessage("");
//     setLoading(true);

//     clearAuthTokens();
//     localStorage.removeItem("role");
//     localStorage.removeItem("user");

//     try {
//       // ✅ use your JWT login view at /login/ (short path)
//       const res = await api.post("/login/", { username, password, role });

//       const serverRole = res.data?.role ?? (res.data?.is_staff ? "admin" : "employee");
//       const access = res.data?.access;
//       const refresh = res.data?.refresh;
//       if (!access || !refresh) throw new Error("Login response missing tokens.");

//       setAuthTokens({ access, refresh });
//       localStorage.setItem("role", serverRole);

//       const user = res.data?.user || (await fetchCurrentUser());
//       localStorage.setItem("user", JSON.stringify(user || {}));

//       onLogin?.();

//       const next = new URLSearchParams(location.search).get("next");
//       navigate(next || (serverRole === "admin" ? "/admin-dashboard" : "/employee-dashboard"), { replace: true });
//       toast.success("Logged in ✅");
//     } catch (error) {
//       const raw = extractApiError(error);
//       const msg =
//         /invalid/i.test(raw) || /no active account/i.test(raw)
//           ? "Invalid username or password."
//           : /admin access/i.test(raw)
//           ? "This account must log in as Admin."
//           : /employee access/i.test(raw)
//           ? "This account must log in as Employee."
//           : raw || "Login failed.";
//       setErrorMessage(msg);
//       toast.error(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <BubbleBackground />
//       <nav className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white shadow-lg p-4 flex justify-between items-center fixed top-0 left-0 z-40">
//         <div className="flex items-center gap-4">
//           <img src={process.env.PUBLIC_URL + "/IMM.png"} alt="IMM Logo" className="h-14 w-auto" />
//           <span className="text-lg md:text-xl font-semibold tracking-wide">
//             Interlink <span className="font-bold">Multi Media</span>
//           </span>
//         </div>
//       </nav>

//       <div className="relative min-h-screen flex items-center justify-center p-6 pt-24 z-10">
//         <div className="bg-white/85 backdrop-blur rounded-xl shadow-xl overflow-hidden w-full max-w-5xl border border-white/40">
//           <div className="w-full md:flex">
//             <div className="w-full md:w-1/2 p-8">
//               <h2 className="text-2xl font-bold text-center mb-2">Login</h2>

//               <div className="flex justify-center gap-4 mb-6">
//                 <button
//                   type="button"
//                   aria-pressed={role === "admin"}
//                   className={`px-4 py-1 rounded-lg border transition ${
//                     role === "admin" ? "bg-purple-600 text-white border-purple-600" : "border-purple-500 text-purple-600 hover:bg-purple-50"
//                   }`}
//                   onClick={() => setRole("admin")}
//                   disabled={loading}
//                 >
//                   Login as Admin
//                 </button>

//                 <button
//                   type="button"
//                   aria-pressed={role === "employee"}
//                   className={`px-4 py-1 rounded-lg border transition ${
//                     role === "employee" ? "bg-pink-600 text-white border-pink-600" : "border-pink-500 text-pink-600 hover:bg-pink-50"
//                   }`}
//                   onClick={() => setRole("employee")}
//                   disabled={loading}
//                 >
//                   Login as Employee
//                 </button>
//               </div>

//               {errorMessage && (
//                 <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm flex justify-between items-start">
//                   <div>{errorMessage}</div>
//                   <button onClick={() => setErrorMessage("")} className="ml-3 text-red-600 hover:text-red-800 font-semibold" aria-label="Dismiss error">
//                     ✖
//                   </button>
//                 </div>
//               )}

//               <form onSubmit={handleSubmit} noValidate>
//                 <div className="relative mb-4">
//                   <FaUser className="absolute left-3 top-3 text-gray-400" aria-hidden />
//                   <input
//                     type="text"
//                     value={username}
//                     placeholder="Username"
//                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
//                     onChange={(e) => setUsername(e.target.value)}
//                     required
//                     autoFocus
//                     autoComplete="username"
//                     disabled={loading}
//                     aria-label="Username"
//                   />
//                 </div>

//                 <div className="relative mb-2">
//                   <FaLock className="absolute left-3 top-3 text-gray-400" aria-hidden />
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={password}
//                     placeholder="Password"
//                     className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                     disabled={loading}
//                     autoComplete="current-password"
//                     aria-label="Password"
//                   />
//                   <button
//                     type="button"
//                     className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
//                     onClick={() => setShowPassword((v) => !v)}
//                     aria-label={showPassword ? "Hide password" : "Show password"}
//                     disabled={loading}
//                   >
//                     {showPassword ? <FaEyeSlash /> : <FaEye />}
//                   </button>
//                 </div>

//                 <div
//                   className="text-right text-sm mb-4 text-blue-600 hover:underline cursor-pointer"
//                   onClick={() => setShowForgotMessage(true)}
//                 >
//                   Forgot password?
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className={`w-full py-2 rounded-lg text-white font-semibold transition ${
//                     loading ? "bg-purple-400 cursor-not-allowed" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95"
//                   }`}
//                 >
//                   {loading ? "Logging in…" : "LOGIN"}
//                 </button>

//                 {showForgotMessage && (
//                   <div className="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded text-sm relative">
//                     <button
//                       onClick={() => setShowForgotMessage(false)}
//                       className="absolute top-2 right-3 text-yellow-700 hover:text-yellow-900 font-bold"
//                       aria-label="Dismiss message"
//                     >
//                       ✖
//                     </button>
//                     Please contact the <strong>Data Team</strong> or <strong>Admin</strong> to reset your password.
//                   </div>
//                 )}
//               </form>
//             </div>

//             <div className="hidden md:flex items-center justify-center md:w-1/2 bg-gray-50">
//               <Player autoplay loop src="https://assets6.lottiefiles.com/packages/lf20_jcikwtux.json" style={{ height: 360, width: 360 }} />
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }



// export default Login;

import React, { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Player } from "@lottiefiles/react-lottie-player";
import { toast } from "react-toastify";
import BubbleBackground from "../components/BubbleBackground";
import api, { API_BASE, setAuthTokens, clearAuthTokens } from "../lib/api";
import "./Login.css";

function extractApiError(err) {
  if (!err?.response) return `Network error. Can’t reach API at ${API_BASE}.`;
  const { status, data } = err.response;
  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;
  if (data?.message) return data.message;
  if (Array.isArray(data?.non_field_errors) && data.non_field_errors.length) return data.non_field_errors[0];
  const parts = [];
  for (const [k, v] of Object.entries(data || {})) {
    if (Array.isArray(v)) parts.push(`${k}: ${v.join(" ")}`);
    else if (typeof v === "string") parts.push(`${k}: ${v}`);
  }
  return parts.length ? parts.join(" | ") : `Request failed (${status ?? "unknown"}).`;
}

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin"); // admin | lead | employee
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
    clearAuthTokens(); // wipe stale tokens
    localStorage.removeItem("role");

    try {
      // IMPORTANT: relative path – api baseURL decides domain
      const res = await api.post("/login/", { username, password, role });

      const access  = res.data?.access;
      const refresh = res.data?.refresh;
      if (!access || !refresh) throw new Error("Login response missing tokens.");
      setAuthTokens({ access, refresh });

      const serverRole =
        res.data?.role ?? (res.data?.is_staff ? "admin" : res.data?.is_team_lead ? "lead" : "employee");
      localStorage.setItem("role", serverRole);

      if (typeof res.data?.is_team_lead !== "undefined") {
        localStorage.setItem("is_team_lead", String(res.data.is_team_lead));
      }
      if (Array.isArray(res.data?.lead_teams)) {
        localStorage.setItem("lead_teams", JSON.stringify(res.data.lead_teams));
      }

      onLogin?.(serverRole);
      navigate(
        serverRole === "admin"
          ? "/admin-dashboard"
          : serverRole === "lead"
          ? "/lead-dashboard"
          : "/employee-dashboard",
        { replace: true }
      );
      toast.success("Logged in ✅");
    } catch (error) {
      const raw = extractApiError(error);
      const msg =
        /invalid/i.test(raw) || /no active account/i.test(raw)
          ? "Invalid username or password."
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
          <img src={process.env.PUBLIC_URL + "/IMM.png"} alt="IMM Logo" className="h-14 w-auto" />
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
              <div className="flex flex-wrap justify-center gap-3 mb-6">
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
                  Admin
                </button>

                

                <button
                  type="button"
                  aria-pressed={role === "lead"}
                  className={`px-4 py-1 rounded-lg border transition ${
                    role === "lead"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                  }`}
                  onClick={() => setRole("lead")}
                  disabled={loading}
                >
                  Team Lead
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
                  Employee
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
                    loading ? "bg-purple-400 cursor-not-allowed" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95"
                  }`}
                >
                  {loading ? "Logging in…" : "LOGIN"}
                </button>

                {showForgotMessage && (
                  <div className="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded text-sm relative">
                    <button
                      onClick={() => setShowForgotMessage(false)}
                      className="absolute top-2 right-3 text-yellow-700 hover:text-yellow-900 font-bold"
                    >
                      ✖
                    </button>
                    Please contact the <strong>Data Team</strong> or <strong>Admin</strong> to reset your password.
                  </div>
                )}
              </form>
            </div>

            {/* Right: Illustration */}
            <div className="hidden md:flex items-center justify-center md:w-1/2 bg-gray-50">
              <Player autoplay loop src="https://assets6.lottiefiles.com/packages/lf20_jcikwtux.json" style={{ height: 360, width: 360 }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;


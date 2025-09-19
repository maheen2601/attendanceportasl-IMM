// src/lib/api.js
import axios from "axios";

// 1) Primary source: injected at build time (Create React App)
const fromCRA = process.env.REACT_APP_API_BASE_URL;

// 2) Optional runtime override (only if you later add /public/runtime-env.js)
const fromRuntime = window?.__RUNTIME_API_BASE__;

// 3) Last resort: localhost for local dev
const fallbackLocal = "http://127.0.0.1:8000";

// Choose the first non-empty value and strip trailing slash
export const API_BASE = (fromCRA || fromRuntime || fallbackLocal).replace(/\/$/, "");

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// Helpful console hint so you can verify in prod
if (typeof window !== "undefined") {
  console.log("[api] baseURL =", api.defaults.baseURL);
}

export default api;




// // src/lib/api.js
// import axios from "axios";

// // 1) Base URL (CRA env → optional runtime → localhost)
// const fromCRA = process.env.REACT_APP_API_BASE_URL;
// const fromRuntime = typeof window !== "undefined" ? window.__RUNTIME_API_BASE__ : undefined;
// const fallbackLocal = "http://127.0.0.1:8000";

// // Exported so components can show helpful messages
// export const API_BASE = (fromCRA || fromRuntime || fallbackLocal).replace(/\/$/, "");

// // --- Tiny auth utils (single source of truth) ---
// export function getAccess()  { return localStorage.getItem("access"); }
// export function getRefresh() { return localStorage.getItem("refresh"); }
// export function setAuthTokens({ access, refresh }) {
//   if (access)  localStorage.setItem("access", access);
//   if (refresh) localStorage.setItem("refresh", refresh);
// }
// export function clearAuthTokens() {
//   localStorage.removeItem("access");
//   localStorage.removeItem("refresh");
//   localStorage.removeItem("role");
// }
// export function logoutToLogin() {
//   clearAuthTokens();
//   if (typeof window !== "undefined") {
//     const here = window.location.pathname + window.location.search;
//     if (!here.includes("/login")) window.location.assign(`/login?next=${encodeURIComponent(here)}`);
//   }
// }

// // --- Axios instance ---
// const api = axios.create({
//   baseURL: API_BASE,
//   headers: { "Content-Type": "application/json" },
//   withCredentials: false,
// });

// // Helpful console hint to confirm in prod
// if (typeof window !== "undefined") {
//   console.log("[api] baseURL =", api.defaults.baseURL);
// }

// // --- Attach JWT on every request ---
// api.interceptors.request.use((config) => {
//   const token = getAccess();
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // --- Auto-refresh on 401 (SimpleJWT) ---
// let isRefreshing = false;
// let queue = [];

// function processQueue(error, token = null) {
//   queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
//   queue = [];
// }

// api.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const original = error.config;

//     // Only try refresh for 401s once per request
//     if (error?.response?.status === 401 && !original?._retry) {
//       const refresh = getRefresh();
//       if (!refresh) {
//         logoutToLogin();
//         return Promise.reject(error);
//       }

//       // De-duplicate concurrent refreshes
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           queue.push({
//             resolve: (newToken) => {
//               original.headers.Authorization = `Bearer ${newToken}`;
//               resolve(api(original));
//             },
//             reject,
//           });
//         });
//       }

//       original._retry = true;
//       isRefreshing = true;

//       try {
//         const { data } = await axios.post(`${API_BASE}/api/token/refresh/`, { refresh });
//         setAuthTokens({ access: data.access });
//         isRefreshing = false;
//         processQueue(null, data.access);

//         // replay original with fresh token
//         original.headers.Authorization = `Bearer ${data.access}`;
//         return api(original);
//       } catch (refreshErr) {
//         isRefreshing = false;
//         processQueue(refreshErr, null);
//         logoutToLogin();
//         return Promise.reject(refreshErr);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;

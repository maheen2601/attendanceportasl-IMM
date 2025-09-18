// // utils/axiosInstance.js
// import axios from 'axios';

// const baseURL = 'http://localhost:8000';

// const axiosInstance = axios.create({
//   baseURL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Interceptor for request – adds Authorization header
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('access');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Interceptor for response – refreshes token if expired
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refresh = localStorage.getItem('refresh');
//         const response = await axios.post(`${baseURL}/api/token/refresh/`, {
//           refresh,
//         });

//         const newAccessToken = response.data.access;
//         localStorage.setItem('access', newAccessToken);

//         // Update the header and retry the original request
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         console.error('Token refresh failed:', refreshError);
//         window.location.href = '/login'; // Redirect to login if refresh fails
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;


// import axios from "axios";

// // ✅ include /api/ and end with a slash
// const baseURL = "http://localhost:8000/api/";

// const axiosInstance = axios.create({
//   baseURL,
//   headers: { "Content-Type": "application/json" },
// });

// // Attach JWT
// axiosInstance.interceptors.request.use((config) => {
//   const token = localStorage.getItem("access");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // Auto-refresh on 401 using your /api/refresh/ endpoint
// axiosInstance.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const original = error.config;
//     if (error.response?.status === 401 && !original._retry) {
//       original._retry = true;
//       try {
//         const refresh = localStorage.getItem("refresh");
//         const r = await axios.post(`${baseURL}refresh/`, { refresh }); // ✅ matches app urls
//         const newAccess = r.data.access;
//         localStorage.setItem("access", newAccess);
//         original.headers.Authorization = `Bearer ${newAccess}`;
//         return axiosInstance(original);
//       } catch (e) {
//         window.location.href = "/login"; // back to login if refresh fails
//         return Promise.reject(e);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;

import axios from "axios";

/**
 * API base URL resolution order (first match wins):
 * 1) window.__ENV__.API_BASE_URL      ← runtime override (no rebuild)
 * 2) process.env.REACT_APP_API_BASE_URL  ← CRA build-time env
 * 3) Fallback to local dev
 *
 * IMPORTANT: Value should be a FULL URL and usually include "/api/".
 */
const RAW_BASE =
  (typeof window !== "undefined" && window.__ENV__?.API_BASE_URL) ||
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:8000/api/";

// ensure trailing slash
const baseURL = RAW_BASE.endsWith("/") ? RAW_BASE : RAW_BASE + "/";

// Login redirect path (PUBLIC_URL is set by CRA/GH Pages; on Render it’s empty)
const LOGIN_PATH = `${process.env.PUBLIC_URL || ""}/login`;

// If your backend uses SimpleJWT defaults, this is "token/refresh/"
// If you created /api/refresh/, set env REACT_APP_JWT_REFRESH_PATH=refresh/
const REFRESH_PATH = process.env.REACT_APP_JWT_REFRESH_PATH || "token/refresh/";
const REFRESH_URL = new URL(REFRESH_PATH, baseURL).toString();

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT (access) on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401 and retry once
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // network error -> bubble up
    if (!error.response) return Promise.reject(error);

    if (error.response.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem("refresh");
        if (!refresh) throw new Error("No refresh token");

        const r = await axios.post(REFRESH_URL, { refresh });
        const newAccess = r.data.access;
        if (!newAccess) throw new Error("No access token in refresh response");

        localStorage.setItem("access", newAccess);
        api.defaults.headers.Authorization = `Bearer ${newAccess}`;
        original.headers.Authorization = `Bearer ${newAccess}`;

        return api(original);
      } catch (e) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = LOGIN_PATH; // sends to /login
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

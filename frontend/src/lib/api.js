// src/lib/api.js
import axios from "axios";

// --- Base URL (CRA env → optional runtime → localhost) ---
const fromCRA = process.env.REACT_APP_API_BASE_URL;
const fromRuntime =
  typeof window !== "undefined" ? window.__RUNTIME_API_BASE__ : undefined;
const fallbackLocal = "http://127.0.0.1:8000";

export const API_BASE = (fromCRA || fromRuntime || fallbackLocal).replace(/\/$/, "");

// --- Auth helpers (single source of truth) ---
export function getAccess()  { return localStorage.getItem("access"); }
export function getRefresh() { return localStorage.getItem("refresh"); }

export function setAuthTokens({ access, refresh }) {
  if (access)  localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);
}

export function clearAuthTokens() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("role");
  // keep 'user' if you want to persist UI name; remove if you prefer:
  // localStorage.removeItem("user");
}

export function logoutToLogin() {
  clearAuthTokens();
  if (typeof window !== "undefined") {
    const here = window.location.pathname + window.location.search;
    if (!here.includes("/login")) {
      window.location.assign(`/login?next=${encodeURIComponent(here)}`);
    }
  }
}

// --- Axios instance ---
const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// Helpful check in browser console
if (typeof window !== "undefined") {
  console.log("[api] baseURL =", api.defaults.baseURL);
}

// --- Attach JWT on every request ---
api.interceptors.request.use((config) => {
  const token = getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Auto-refresh on 401 (SimpleJWT) ---
let isRefreshing = false;
let queue = [];

function processQueue(error, token = null) {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error?.response?.status === 401 && !original?._retry) {
      const refresh = getRefresh();
      if (!refresh) {
        logoutToLogin();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (newToken) => {
              original.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(original));
            },
            reject,
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE}/api/token/refresh/`, { refresh });
        setAuthTokens({ access: data.access });
        isRefreshing = false;
        processQueue(null, data.access);

        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch (refreshErr) {
        isRefreshing = false;
        processQueue(refreshErr, null);
        logoutToLogin();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

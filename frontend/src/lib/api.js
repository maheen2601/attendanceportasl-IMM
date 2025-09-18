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

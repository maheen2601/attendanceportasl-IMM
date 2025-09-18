import axios from "axios";

// Works for both Vite (VITE_*) and CRA (REACT_APP_*)
const API_BASE =
  (import.meta?.env?.VITE_API_BASE ||
    process.env.REACT_APP_API_BASE ||
    "http://127.0.0.1:8000"
  ).replace(/\/+$/, ""); // trim trailing slash

const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

export { API_BASE };
export default api;

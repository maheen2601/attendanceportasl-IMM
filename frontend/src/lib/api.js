// works with Vite (VITE_*) and CRA (REACT_APP_*)
const API_BASE =
  (import.meta?.env?.VITE_API_BASE || process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000")
    .replace(/\/+$/, ""); // trim trailing slash

console.log("API_BASE =", API_BASE); // keep for sanity check once

import axios from "axios";
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});
export default api;

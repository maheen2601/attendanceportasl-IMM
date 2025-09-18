import { useState } from "react";
import api from "../utils/axiosInstance";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      // DRF SimpleJWT login
      const { data } = await api.post("login/", { username, password }); // -> {access, refresh}
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      // go to dashboard…
      window.location.href = "/dashboard";
    } catch (error) {
      const msg =
        error.response?.data?.detail ||
        error.message ||
        "Login failed. Check credentials and server URL.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "4rem auto" }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
          style={{ display: "block", width: "100%", marginBottom: 8 }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          style={{ display: "block", width: "100%", marginBottom: 8 }}
        />
        <button disabled={loading} style={{ width: "100%" }}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
    </div>
  );
}

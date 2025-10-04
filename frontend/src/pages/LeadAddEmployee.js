import React, { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import TeamSelect from "../components/TeamSelect"; // single-select dropdown

export default function AddEmployee() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    designation: "",
    leave_balance: 15,
    team: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ ok: "", err: "" });

  // teams fetched from backend (already restricted by role on the API)
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamsErr, setTeamsErr] = useState("");

  const ADD_EMP_ENDPOINT = "admin/employees/create/"; // POST
  const TEAM_LIST_ENDPOINT = "admin/teams/";           // GET -> [{id,name}, …]

  // Fetch teams once; backend enforces IsAdminOrTeamLead scoping
  useEffect(() => {
    let ignore = false;
    (async () => {
      setTeamsLoading(true);
      setTeamsErr("");
      try {
        const res = await api.get(TEAM_LIST_ENDPOINT);
        const names = (res.data || [])
          .map((t) => t?.name)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));
        if (!ignore) setTeams(names);
      } catch (e) {
        if (!ignore) {
          setTeams([]);
          setTeamsErr("Could not load teams");
        }
      } finally {
        if (!ignore) setTeamsLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const onChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg({ ok: "", err: "" });

    if (!formData.team) {
      setMsg({ ok: "", err: "Please choose a primary team." });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        designation: formData.designation.trim(),
        leave_balance: Number(formData.leave_balance) || 15,
        team: formData.team.trim(),
      };

      await api.post(ADD_EMP_ENDPOINT, payload);
      setMsg({ ok: "✅ Employee added successfully!", err: "" });
      setFormData({
        username: "",
        email: "",
        password: "",
        designation: "",
        leave_balance: 15,
        team: "",
      });
    } catch (err) {
      const data = err?.response?.data;
      let detail = err?.message || "Failed";
      if (data && typeof data === "object") {
        const bits = [];
        for (const [k, v] of Object.entries(data)) {
          bits.push(`${k}: ${Array.isArray(v) ? v.join(" ") : v}`);
        }
        detail = bits.join(" | ") || detail;
      }
      setMsg({ ok: "", err: `❌ ${detail}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-100">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
          Add New Employee
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              name="username"
              value={formData.username}
              onChange={onChange}
              className="w-full border rounded-lg px-4 py-2"
              required
              autoComplete="off"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              className="w-full border rounded-lg px-4 py-2"
              required
              placeholder="employee@gmail.com"
              autoComplete="off"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={onChange}
                className="w-full border rounded-lg px-4 py-2 pr-16"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-2.5 text-sm text-gray-600"
              >
                {showPassword ? "🙈 Hide" : "👁 Show"}
              </button>
            </div>
          </div>

          {/* Designation */}
          <div>
            <label className="block text-sm font-medium mb-1">Designation</label>
            <input
              name="designation"
              value={formData.designation}
              onChange={onChange}
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>

          {/* Primary Team (server-scoped) */}
          <div>
            <label className="block text-sm font-medium mb-1">Primary Team</label>
            <TeamSelect
              options={teams}
              loading={teamsLoading}
              error={teamsErr}
              value={formData.team}
              onChange={(team) => setFormData((p) => ({ ...p, team }))}
              placeholder="Select a team…"
            />
            {teamsErr && (
              <p className="mt-1 text-xs text-red-600">{teamsErr}</p>
            )}
          </div>

          <button
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg"
          >
            {saving ? "Adding…" : "Add Employee"}
          </button>
        </form>

        {msg.ok && <p className="mt-4 text-green-600">{msg.ok}</p>}
        {msg.err && <p className="mt-4 text-red-600 break-words">{msg.err}</p>}
      </div>
    </div>
  );
}

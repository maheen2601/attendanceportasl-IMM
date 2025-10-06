// src/pages/AddEmployee.js
import React, { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import TeamSelect from "../components/TeamSelect"; // your single-select

const TEAM_OPTIONS = [
  "TCP","The News","Hungama","Jang",
  "Celeb In Box","Gad Insider","Gossip Herald",
  "Geo","SEO","Data","Social",
];

export default function AddEmployee() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    designation: "",
    leave_balance: 15,
    team: "",
    is_team_lead: false,
    lead_teams: [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ ok: "", err: "" });
  const [teams, setTeams] = useState(TEAM_OPTIONS);

  const ADD_EMP_ENDPOINT = "admin/employees/create/";

  // Merge backend teams (if any) with the local list
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("admin/teams/");
        const names = (res.data || []).map((t) => t.name).filter(Boolean);
        if (names.length) {
          setTeams((prev) =>
            Array.from(new Set([...prev, ...names])).sort((a, b) =>
              a.localeCompare(b)
            )
          );
        }
      } catch {/* ignore */}
    })();
  }, []);

  // keep primary team included in lead_teams when lead mode is on
  useEffect(() => {
    if (!formData.is_team_lead) return;
    if (!formData.team) return;
    if (!formData.lead_teams.includes(formData.team)) {
      setFormData((p) => ({ ...p, lead_teams: [...p.lead_teams, p.team] }));
    }
  }, [formData.is_team_lead, formData.team]); // eslint-disable-line

  const onChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg({ ok: "", err: "" });

    // validation for lead mode
    if (formData.is_team_lead && formData.lead_teams.length === 0) {
      setMsg({ ok: "", err: "Please select at least one team to lead." });
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
        is_team_lead: !!formData.is_team_lead,
        lead_teams: formData.is_team_lead
          ? Array.from(new Set(formData.lead_teams)).filter(Boolean)
          : [], // empty if not a lead
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
        is_team_lead: false,
        lead_teams: [],
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

          {/* Primary Team */}
          <div>
            <label className="block text-sm font-medium mb-1">Primary Team</label>
            <TeamSelect
              options={teams}
              value={formData.team}
              onChange={(team) => setFormData((p) => ({ ...p, team }))}
              placeholder="Select a team…"
            />
          </div>

          {/* Team Lead toggle */}
          <div className="mt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_team_lead}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    is_team_lead: e.target.checked,
                    // if turning off, drop all lead_teams
                    lead_teams: e.target.checked ? p.lead_teams : [],
                  }))
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-800 font-medium">
                Is Team Lead?
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              When checked, you can assign one or more teams they will lead.
            </p>
          </div>

          {/* Lead Teams (only when checkbox is checked) */}
          {formData.is_team_lead && (
            <div>
              <label className="block text-sm font-medium mb-1">Lead Teams</label>
              <TeamMultiSelect
                options={teams}
                value={formData.lead_teams}
                onChange={(vals) =>
                  setFormData((p) => ({ ...p, lead_teams: vals }))
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Tip: include the primary team if they lead it, too.
              </p>
            </div>
          )}

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

/* --------- Simple Multi-select with chips --------- */
function TeamMultiSelect({ options = [], value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = React.useRef(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
  }, [options, query]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const toggleVal = (t) => {
    if (value.includes(t)) onChange(value.filter((v) => v !== t));
    else onChange([...value, t]);
  };
  
  const clearAll = () => onChange([]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full inline-flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-left shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <div className="min-w-0 flex-1">
          <div className="text-sm text-gray-700">
            {value.length === 0 ? "Select lead teams…" : `${value.length} selected`}
          </div>
          {value.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {value.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
                >
                  {t}
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVal(t);
                    }}
                    title="Remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <svg
          className={`h-4 w-4 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="p-2 border-b border-gray-100 flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border px-2 py-1.5 flex-1">
              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l4.25 4.25 1.49-1.49L15.5 14zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <input
                className="flex-1 text-sm outline-none"
                placeholder="Search teams…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
            {value.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>

          <ul className="max-h-64 overflow-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-400">No matches</li>
            )}
            {filtered.map((opt) => {
              const selected = value.includes(opt);
              return (
                <li key={opt}>
                  <button
                    type="button"
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                      selected ? "bg-indigo-50 text-indigo-700" : "text-gray-800"
                    }`}
                    onClick={() => toggleVal(opt)}
                  >
                    <span className="truncate">{opt}</span>
                    {selected && (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

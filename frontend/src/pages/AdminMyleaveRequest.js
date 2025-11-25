// src/pages/AdminMyLeaves.js
import React, { useEffect, useMemo, useState } from "react";
import api from "../utils/axiosInstance";
import { toast } from "react-toastify";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* Small helper so errors are readable */
function extractApiError(err) {
  if (!err?.response) return "Network error. Is the API running?";
  const { status, data, config } = err.response;

  if (typeof data === "string") {
    if (data.startsWith("<!DOCTYPE") || data.includes("<html")) {
      return `Not Found (404): ${config?.url || ""}`;
    }
    return data;
  }

  if (data?.detail) return data.detail;
  if (Array.isArray(data?.non_field_errors) && data.non_field_errors.length) {
    return data.non_field_errors[0];
  }

  const parts = [];
  for (const [k, v] of Object.entries(data || {})) {
    if (Array.isArray(v)) parts.push(`${k}: ${v.join(" ")}`);
    else if (typeof v === "string") parts.push(`${k}: ${v}`);
  }
  return parts.length ? parts.join(" | ") : `Request failed (${status}).`;
}

export default function AdminMyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [profile, setProfile] = useState({ leave_balance: 0 });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
    leave_type: "casual",
    reason: "",
    peer_note: "",
  });

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  async function fetchData() {
    setLoading(true);
    setErr("");
    try {
      // we can reuse the same endpoints that employees use
      const [lr, me] = await Promise.all([
        api.get("me/leaves/"),
        api.get("me/profile/"),
      ]);
      setLeaves(Array.isArray(lr.data) ? lr.data : []);
      setProfile(me.data || { leave_balance: 0 });
    } catch (e) {
      const msg = extractApiError(e) || "Failed to load leaves.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Count approved days (like employee screen)
  const usedDays = useMemo(() => {
    const TYPES = new Set(["sick", "casual", "annual", "comp"]);
    let sum = 0;
    for (const r of leaves) {
      if (r.status === "approved" && TYPES.has(r.leave_type)) {
        const s = new Date(r.start_date);
        const e = new Date(r.end_date);
        const days = Math.floor((e - s) / 86400000) + 1; // inclusive
        if (days > 0) sum += days;
      }
    }
    return sum;
  }, [leaves]);

  // Donut chart: Remaining vs Used
  const chartData = useMemo(() => {
    const remaining = Number(profile.leave_balance || 0);
    const used = Math.max(0, Number(usedDays || 0));
    const total = remaining + used;
    if (total <= 0) return [];
    return [
      { name: "Remaining", value: remaining },
      { name: "Used", value: used },
    ];
  }, [profile.leave_balance, usedDays]);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.start_date || !form.end_date) {
      const msg = "Start and end dates are required.";
      setErr(msg);
      toast.error(msg);
      return;
    }
    if (form.end_date < form.start_date) {
      const msg = "End date cannot be before start date.";
      setErr(msg);
      toast.error(msg);
      return;
    }

    if (submitting) return;
    setSubmitting(true);
    try {
      // SIMPLE: just create a leave entry for this admin user
      await api.post("me/leaves/", {
        start_date: form.start_date,
        end_date: form.end_date,
        leave_type: form.leave_type,
        reason: form.reason,
        peer_note: form.peer_note,
      });
      setForm({
        start_date: "",
        end_date: "",
        leave_type: "casual",
        reason: "",
        peer_note: "",
      });
      toast.success("Leave saved ✅");
      await fetchData();
    } catch (e) {
      const msg = extractApiError(e);
      setErr(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">My Leaves (Admin)</h1>

      {/* Top row: form + chart */}
      <div className="flex flex-col lg:flex-row gap-6 items-start mb-6">
        {/* ---- Form ---- */}
        <div className="bg-white rounded-xl border p-4 flex-1 max-w-3xl">
          <form
            onSubmit={submit}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Leave Type
              </label>
              <select
                name="leave_type"
                value={form.leave_type}
                onChange={onChange}
                className="border rounded-lg px-3 py-2 w-full"
              >
                <option value="sick">Sick / Emergency</option>
                <option value="casual">Casual</option>
                <option value="annual">Annual</option>
                <option value="comp">Compensatory</option>
                <option value="wfh">WFH</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={onChange}
                className="border rounded-lg px-3 py-2 w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={onChange}
                className="border rounded-lg px-3 py-2 w-full"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm text-gray-600 mb-1">
                Reason
              </label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={onChange}
                className="border rounded-lg px-3 py-2 w-full"
                rows={3}
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm text-gray-600 mb-1">
                Note (optional)
              </label>
              <input
                name="peer_note"
                value={form.peer_note}
                onChange={onChange}
                className="border rounded-lg px-3 py-2 w-full"
                placeholder="Any internal note for yourself"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? "Saving…" : "Save Leave"}
              </button>
            </div>
          </form>

          <p className="text-xs text-gray-500 mt-2">
            This screen is only for <b>your own</b> leaves as admin. No lead
            approval flow — entries are just stored for your record and
            reporting.
          </p>
        </div>

        {/* ---- Pie chart ---- */}
        <div className="bg-white rounded-xl border p-4 w-full lg:w-80">
          <h2 className="text-lg font-semibold mb-4">Leave Overview</h2>
          {chartData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {chartData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={["#22c55e", "#ef4444"][i % 2]} // green, red
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-sm text-gray-500 h-[260px] grid place-items-center">
              No leave data yet
            </div>
          )}

          <div className="mt-3 text-xs text-gray-600">
            Remaining: <b>{profile.leave_balance ?? 0}</b> days
            {usedDays > 0 && (
              <>
                {" "}
                · Used: <b>{usedDays}</b> days
              </>
            )}
          </div>
        </div>
      </div>

      {loading && <div className="mb-3 text-sm text-gray-500">Loading…</div>}
      {err && !loading && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
          {err}
        </div>
      )}

      {/* ---- Table ---- */}
      <div className="overflow-x-auto bg-white rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Start</th>
              <th className="px-4 py-2 text-left">End</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Reason</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((r) => (
              <tr
                key={r.id ?? `req-${r.start_date}-${r.end_date}`}
                className="border-t"
              >
                <td className="px-4 py-2">{r.start_date}</td>
                <td className="px-4 py-2">{r.end_date}</td>
                <td className="px-4 py-2 uppercase">
                  {r.leave_type || "—"}
                </td>
                <td className="px-4 py-2">{r.reason}</td>
                <td className="px-4 py-2 capitalize">
                  {r.status || "saved"}
                </td>
              </tr>
            ))}

            {leaves.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-gray-500">
                  No leave records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

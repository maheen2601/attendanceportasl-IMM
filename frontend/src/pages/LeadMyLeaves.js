import React, { useEffect, useMemo, useState } from "react";
import api from "../utils/axiosInstance";
import { toast } from "react-toastify";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Nicer error extraction (won’t dump the whole HTML 404 page)
function extractApiError(err) {
  if (!err?.response) return "Network error. Is the API running?";
  const { status, data, config } = err.response;
  if (typeof data === "string") {
    if (data.startsWith("<!DOCTYPE") || data.includes("<html"))
      return `Not Found (404): ${config?.url || ""}`;
    return data;
  }
  
  if (data?.detail) return data.detail;
  if (Array.isArray(data?.non_field_errors) && data.non_field_errors.length)
    return data.non_field_errors[0];
  const parts = [];
  for (const [k, v] of Object.entries(data || {})) {
    if (Array.isArray(v)) parts.push(`${k}: ${v.join(" ")}`);
    else if (typeof v === "string") parts.push(`${k}: ${v}`);
  }
  return parts.length ? parts.join(" | ") : `Request failed (${status}).`;
}

export default function EmployeeLeaves() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  // profile for remaining balance
  const [profile, setProfile] = useState({ leave_balance: 0 });

  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
    leave_type: "casual",
    reason: "",
    peer_note: "",
  });
  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  async function fetchAll() {
    setLoading(true);
    setErr("");
    try {
      // ✅ Correct endpoints that exist in your backend
      const [lr, me] = await Promise.all([
        api.get("me/leaves/"),
        api.get("me/profile/"),
      ]);
      setList(Array.isArray(lr.data) ? lr.data : []);
      setProfile(me.data || { leave_balance: 0 });
    } catch (e) {
      setErr(extractApiError(e) || "Failed to load leave data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  const usedDays = useMemo(() => {
    const TYPES = new Set(["sick", "casual", "annual", "comp"]);
    let sum = 0;
    for (const r of list) {
      if (r.status === "approved" && TYPES.has(r.leave_type)) {
        const s = new Date(r.start_date);
        const e = new Date(r.end_date);
        const days = Math.floor((e - s) / 86400000) + 1; // inclusive
        if (days > 0) sum += days;
      }
    }
    return sum;
  }, [list]);

  const chartData = useMemo(() => {
    const remaining = Number(profile.leave_balance || 0);
    const used = Math.max(0, Number(usedDays || 0));
    const total = used + remaining;
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
      const msg = "Start and End dates are required.";
      setErr(msg); toast.error(msg); return;
    }
    if (form.end_date < form.start_date) {
      const msg = "End date cannot be before start date.";
      setErr(msg); toast.error(msg); return;
    }

    if (submitting) return;
    setSubmitting(true);
    try {
      // ✅ Correct endpoint for create
      await api.post("me/leaves/", {
        start_date: form.start_date,
        end_date: form.end_date,
        leave_type: form.leave_type,
        reason: form.reason,
        peer_note: form.peer_note,
      });
      setForm({ start_date: "", end_date: "", leave_type: "casual", reason: "", peer_note: "" });
      await fetchAll();
      toast.success("Leave request submitted ✅");
    } catch (e) {
      const msg = extractApiError(e);
      setErr(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const cancelRequest = async (id) => {
    try {
      // ✅ Correct endpoint for delete
      await api.delete(`me/leaves/${id}/`);
      toast.success("Request cancelled");
      fetchAll();
    } catch (e) {
      toast.error(extractApiError(e) || "Could not cancel request.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">My Leave Requests</h1>

      {/* form + chart side-by-side */}
      <div className="flex gap-6 items-start">
        {/* form */}
        <div className="bg-white rounded-xl border p-4 mb-6 flex-1 max-w-3xl">
          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Type</label>
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
              <label className="block text-sm text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={onChange}
                required
                className="border rounded-lg px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={onChange}
                required
                className="border rounded-lg px-3 py-2 w-full"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm text-gray-600 mb-1">Reason</label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={onChange}
                required
                className="border rounded-lg px-3 py-2 w-full"
                rows={3}
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm text-gray-600 mb-1">Peer note (optional)</label>
              <input
                name="peer_note"
                value={form.peer_note}
                onChange={onChange}
                className="border rounded-lg px-3 py-2 w-full"
                placeholder="Coverage / context for the desk"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <button
                className="px-4 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? "Submitting…" : "Submit Request"}
              </button>
            </div>
          </form>

          <p className="text-xs text-gray-500 mt-2">
            Types: <b>Sick</b> (≥ policy hours), <b>Casual</b> (≥ 24h), <b>Annual</b> (≤10d: ≥20d, &gt;10d: ≥30d),
            <b> Comp</b> (≥2d), <b>WFH</b> (prior approval). Short notice will be flagged to admin.
          </p>
        </div>

        {/* chart */}
        <div className="bg-white rounded-xl border p-4 mb-6 w-80">
          <h2 className="text-xl font-semibold mb-4">Leave Distribution</h2>
          {chartData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={["#22c55e", "#ef4444"][i % 2]} />
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
            {usedDays > 0 && <> · Used: <b>{usedDays}</b> days</>}
          </div>
        </div>
      </div>

      {loading && <div>Loading…</div>}
      {err && !loading && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{err}</div>
      )}

      <div className="overflow-x-auto bg-white rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Start</th>
              <th className="px-4 py-2 text-left">End</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Reason</th>
              <th className="px-4 py-2 text-left">Notice</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id ?? `req-${r.start_date}-${r.end_date}`} className="border-t">
                <td className="px-4 py-2">{r.start_date}</td>
                <td className="px-4 py-2">{r.end_date}</td>
                <td className="px-4 py-2 uppercase">{r.leave_type || "—"}</td>
                <td className="px-4 py-2">{r.reason}</td>
                <td className="px-4 py-2">
                  {r.notice_met
                    ? <span className="px-2 py-0.5 text-xs rounded bg-emerald-100 text-emerald-700">Met</span>
                    : <span className="px-2 py-0.5 text-xs rounded bg-rose-100 text-rose-700">Short</span>}
                </td>
                <td className="px-4 py-2 capitalize">{r.status}</td>
                <td className="px-4 py-2">
                  {r.status === "pending"
                    ? <button onClick={() => cancelRequest(r.id)} className="text-rose-600 hover:underline">Cancel</button>
                    : <span className="text-gray-400">—</span>}
                </td>
              </tr>
            ))}
            {list.length === 0 && !loading && (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={7}>
                  No leave requests
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

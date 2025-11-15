import React, { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import { toast } from "react-toastify";

// Nice error extraction (also hides HTML 404 pages)
function extractApiError(err) {
  if (!err?.response) return "Network error. Is the API running?";
  const { status, data, config } = err.response;
  if (typeof data === "string") {
    if (data.startsWith("<!DOCTYPE") || data.includes("<html"))
      return `Not Found (404): ${config?.url || ""}`;
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

function StatusChip({ status }) {
  const s = (status || "").toLowerCase();
  const map = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
  };
  const cls = map[s] || "bg-gray-100 text-gray-700";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{status || "—"}</span>;
}

export default function EarlyOff() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ for_date: "", reason: "" });
  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const fetchList = async () => {
    setLoading(true); setErr("");
    try {
      // ✅ Correct backend route (NO hyphen)
      const res = await api.get("me/earlyoff/");
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(extractApiError(e));
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.for_date || !form.reason) {
      toast.error("Date and reason are required.");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      // ✅ Correct backend route (NO hyphen)
      await api.post("me/earlyoff/", {
        for_date: form.for_date,
        reason: form.reason,
      });
      toast.success("Early-off request submitted ✅");
      setForm({ for_date: "", reason: "" });
      fetchList();
    } catch (e) {
      toast.error(extractApiError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Early-off Requests</h1>

      <div className="bg-white rounded-xl border p-4 mb-6 max-w-2xl">
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Date</label>
            <input
              type="date"
              name="for_date"
              value={form.for_date}
              onChange={onChange}
              required
              className="border rounded-lg px-3 py-2 w-full"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Reason</label>
            <input
              name="reason"
              value={form.reason}
              onChange={onChange}
              placeholder="Why do you need to leave early?"
              required
              className="border rounded-lg px-3 py-2 w-full"
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
          Note: If total hours fall below the policy minimum and this is not approved,
          the day will be tagged as <b>Short hours</b>.
        </p>
      </div>

      {loading && <div>Loading…</div>}
      {err && !loading && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{err}</div>
      )}

      <div className="overflow-x-auto bg-white rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Reason</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Decided At</th>
              <th className="px-4 py-2 text-left">Note</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id ?? `${r.for_date}-${r.reason}`} className="border-t">
                <td className="px-4 py-2">{r.for_date}</td>
                <td className="px-4 py-2">{r.reason}</td>
                <td className="px-4 py-2"><StatusChip status={r.status} /></td>
                <td className="px-4 py-2">{r.decided_at ? new Date(r.decided_at).toLocaleString() : "—"}</td>
                <td className="px-4 py-2">{r.note || "—"}</td>
              </tr>
            ))}
            {list.length === 0 && !loading && (
              <tr><td className="px-4 py-4 text-gray-500" colSpan={5}>No early-off requests</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

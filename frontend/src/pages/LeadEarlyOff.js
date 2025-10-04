// src/pages/AdminEarlyOff.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../utils/axiosInstance";
import { toast } from "react-toastify";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";

const fmtDate = (d) => {
  try { return new Date(d).toLocaleDateString(); } catch { return d || "—"; }
};
const statusChip = (s) => {
  const v = (s || "").toLowerCase();
  const cls =
    v === "approved" ? "bg-emerald-100 text-emerald-700" :
    v === "rejected" ? "bg-rose-100 text-rose-700" :
                       "bg-amber-100 text-amber-700";
  const label = v ? v[0].toUpperCase() + v.slice(1) : "Pending";
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>{label}</span>;
};

export default function AdminEarlyOff() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // filters (server accepts these; if not, we still filter client-side)
  const [statusF, setStatusF] = useState("pending");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [q, setQ] = useState("");

  // modal
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [actionType, setActionType] = useState("approved");
  const [adminNote, setAdminNote] = useState("");
  const [acting, setActing] = useState(false);

  const fetchAll = async () => {
    setLoading(true); setErr("");
    try {
      const params = {};
      if (statusF && statusF !== "all") params.status = statusF;
      if (from) params.from = from;
      if (to) params.to = to;
      if (q.trim()) params.q = q.trim();

      const res = await api.get("admin/earlyoff/", { params });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to load early-off requests.");
      setRows([]);
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const applyFilters = (e) => { e?.preventDefault?.(); fetchAll(); };
  const resetFilters = () => { setStatusF("pending"); setFrom(""); setTo(""); setQ(""); fetchAll(); };

  const summary = useMemo(() => {
    const total = rows.length;
    const pending  = rows.filter(r => r.status === "pending").length;
    const approved = rows.filter(r => r.status === "approved").length;
    const rejected = rows.filter(r => r.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [rows]);

  const openApprove = (row) => { setCurrent(row); setActionType("approved"); setAdminNote(""); setOpen(true); };
  const openReject  = (row) => { setCurrent(row); setActionType("rejected"); setAdminNote(""); setOpen(true); };

  const decide = async (e) => {
    e.preventDefault();
    if (!current) return;
    setActing(true);
    try {
      // send both note & admin_note for compatibility with your backend variants
      await api.patch(`admin/earlyoff/${current.id}/`, {
        status: actionType,
        note: adminNote || "",
        admin_note: adminNote || "",
      });
      toast.success(actionType === "approved" ? "Approved ✅" : "Rejected.");
      setOpen(false);
      setRows(prev => prev.map(r => (r.id === current.id ? { ...r, status: actionType, admin_note: adminNote } : r)));
    } catch (e) {
      const payload = e?.response?.data || {};
      const msg =
        payload.detail ||
        Object.entries(payload).map(([k,v]) => (Array.isArray(v) ? `${k}: ${v.join(" ")}` : `${k}: ${v}`)).join(" | ") ||
        "Action failed.";
      toast.error(msg);
    } finally { setActing(false); }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 px-6 py-10">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-semibold">Early-off Requests</h1>
        <button
          onClick={fetchAll}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          <ArrowPathIcon className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* summary */}
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <div className="rounded-full bg-white border px-3 py-1">Total: <b>{summary.total}</b></div>
        <div className="rounded-full bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1">Pending: <b>{summary.pending}</b></div>
        <div className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1">Approved: <b>{summary.approved}</b></div>
        <div className="rounded-full bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1">Rejected: <b>{summary.rejected}</b></div>
      </div>

      {/* filters */}
      <form onSubmit={applyFilters} className="bg-white rounded-xl border p-4 mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6 items-end">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Status</label>
          <select value={statusF} onChange={(e)=>setStatusF(e.target.value)} className="w-full border rounded-lg px-3 py-2">
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">From date</label>
          <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">To date</label>
          <input type="date" value={to} onChange={(e)=>setTo(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div className="lg:col-span-2">
          <label className="block text-xs text-gray-600 mb-1">Search</label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder="name / reason / note"
              className="w-full border rounded-lg pl-8 pr-3 py-2"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gray-900 text-white px-3 py-2">
            <FunnelIcon className="h-4 w-4" /> Apply
          </button>
          <button type="button" onClick={resetFilters} className="flex-1 rounded-lg border px-3 py-2 bg-white">Reset</button>
        </div>
      </form>

      {loading && <div className="mb-4 p-3 rounded bg-gray-50 text-gray-700 border">Loading…</div>}
      {err && !loading && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border">{err}</div>}

      {/* table */}
      <div className="overflow-x-auto bg-white rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Employee</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Reason</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Decided At</th>
              <th className="px-4 py-2 text-left">Admin note</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2">{r.employee_name || r.employee || "—"}</td>
                <td className="px-4 py-2">{fmtDate(r.for_date)}</td>
                <td className="px-4 py-2 max-w-md truncate" title={r.reason}>{r.reason || "—"}</td>
                <td className="px-4 py-2">{statusChip(r.status)}</td>
                <td className="px-4 py-2">{fmtDate(r.decided_at || r.updated_at)}</td>
                <td className="px-4 py-2">{r.admin_note || r.note || "—"}</td>
                <td className="px-4 py-2">
                  {r.status === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openApprove(r)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        <CheckCircleIcon className="h-4 w-4" /> Approve
                      </button>
                      <button
                        onClick={() => openReject(r)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 font-medium text-rose-700 hover:bg-rose-100"
                      >
                        <XCircleIcon className="h-4 w-4" /> Reject
                      </button>
                    </div>
                  ) : <span className="text-gray-400">—</span>}
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={7}>No requests match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* modal */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl border">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold">{actionType === "approved" ? "Approve early-off" : "Reject early-off"}</h3>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={decide} className="p-4 grid gap-4">
              <div className="text-sm text-gray-600">
                <b>{current?.employee_name}</b> — {fmtDate(current?.for_date)}
                <div className="mt-1 line-clamp-2"><span className="text-gray-500">Reason:</span> {current?.reason || "—"}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Admin note (optional)</label>
                <textarea
                  value={adminNote}
                  onChange={(e)=>setAdminNote(e.target.value)}
                  rows={3}
                  className="border rounded-lg px-3 py-2 w-full"
                  placeholder={actionType === "rejected" ? "Reason for rejection…" : "Optional note…"}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={()=>setOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800">Cancel</button>
                <button disabled={acting}
                  className={`px-4 py-2 rounded-lg text-white ${actionType === "approved" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"} disabled:opacity-60`}>
                  {acting ? "Saving…" : actionType === "approved" ? "Approve" : "Reject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// src/pages/AdminLeaveRequests.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../utils/axiosInstance";
import { toast } from "react-toastify";
import {
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

const fmt = (d) => {
  try { return new Date(d).toLocaleDateString(); } catch { return d || "—"; }
};
const daysBetween = (s, e) => {
  if (!s || !e) return "—";
  const a = new Date(s), b = new Date(e);
  if (isNaN(+a) || isNaN(+b)) return "—";
  const diff = Math.round((b - a) / 86400000) + 1;
  return diff > 0 ? diff : "—";
};
const chip = (label, cls) => (
  <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{label}</span>
);
const statusChip = (s) => {
  const v = (s || "").toLowerCase();
  if (v === "approved") return chip("Approved", "bg-emerald-100 text-emerald-700");
  if (v === "rejected") return chip("Rejected", "bg-rose-100 text-rose-700");
  return chip("Pending", "bg-amber-100 text-amber-700");
};

export default function AdminLeaveRequests() {
  // filters
  const [stage, setStage] = useState("admin"); // admin | lead | done | all
  const [statusF, setStatusF] = useState("pending"); // pending|approved|rejected|all
  const [typeF, setTypeF] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [q, setQ] = useState("");

  // data/ui
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // decision modal
  const [open, setOpen] = useState(false);
  const [acting, setActing] = useState(false);
  const [cur, setCur] = useState(null);
  const [actionType, setActionType] = useState("approved");
  const [adminNote, setAdminNote] = useState("");

  // fetch
  const fetchAll = async () => {
    setLoading(true);
    setErr("");
    try {
      const params = { stage }; // <-- IMPORTANT
      if (statusF && statusF !== "all") params.status = statusF;
      if (typeF && typeF !== "all") params.type = typeF;
      if (from) params.from = from;
      if (to) params.to = to;
      if (q.trim()) params.q = q.trim();

      const res = await api.get("leave-requests/", { params });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to load leave requests.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchAll(); }, []); // initial

  const applyFilters = (e) => {
    e?.preventDefault?.();
    // Small UX tweak: when stage changes to "done", default status to "all"
    if (stage === "done" && statusF !== "all") setStatusF("all");
    fetchAll();
  };
  const resetFilters = () => {
    setStage("admin");
    setStatusF("pending");
    setTypeF("all");
    setFrom("");
    setTo("");
    setQ("");
    fetchAll();
  };

  const summary = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter(r => r.status === "pending").length;
    const approved = rows.filter(r => r.status === "approved").length;
    const rejected = rows.filter(r => r.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [rows]);

  const openApprove = (row) => { setCur(row); setActionType("approved"); setAdminNote(""); setOpen(true); };
  const openReject  = (row) => { setCur(row); setActionType("rejected"); setAdminNote(""); setOpen(true); };

  const decide = async (e) => {
    e.preventDefault();
    if (!cur) return;
    setActing(true);
    try {
      await api.patch(`leave-requests/${cur.id}/`, {
        status: actionType,
        admin_note: adminNote || null,
      });
      toast.success(actionType === "approved" ? "Request approved ✅" : "Request rejected.");
      setOpen(false);
      // refresh (stage likely becomes "done" after finalization)
      fetchAll();
    } catch (e) {
      const data = e?.response?.data || {};
      const msg =
        data.detail ||
        Object.entries(data).map(([k, v]) => (Array.isArray(v) ? `${k}: ${v.join(" ")}` : `${k}: ${v}`)).join(" | ") ||
        "Action failed.";
      toast.error(msg);
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 px-6 py-10">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-semibold">Leave Requests</h1>
        <button
          onClick={fetchAll}
          title="Refresh"
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          <ArrowPathIcon className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* summary pills */}
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <div className="rounded-full bg-white border px-3 py-1">Total: <b>{summary.total}</b></div>
        <div className="rounded-full bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1">
          Pending: <b>{summary.pending}</b>
        </div>
        <div className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1">
          Approved: <b>{summary.approved}</b>
        </div>
        <div className="rounded-full bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1">
          Rejected: <b>{summary.rejected}</b>
        </div>
      </div>

      {/* Filters */}
      <form
        onSubmit={applyFilters}
        className="bg-white rounded-xl border p-4 mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-7 items-end"
      >
        <div>
          <label className="block text-xs text-gray-600 mb-1">Stage</label>
          <select value={stage} onChange={(e)=>setStage(e.target.value)} className="w-full border rounded-lg px-3 py-2">
            <option value="all">All</option>
            <option value="admin">Awaiting Admin</option>
            <option value="lead">Awaiting Lead</option>
            <option value="done">Done</option>
            
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Status</label>
          <select value={statusF} onChange={(e)=>setStatusF(e.target.value)} className="w-full border rounded-lg px-3 py-2">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Type</label>
          <select value={typeF} onChange={(e)=>setTypeF(e.target.value)} className="w-full border rounded-lg px-3 py-2">
            <option value="all">All</option>
            <option value="sick">Sick</option>
            <option value="casual">Casual</option>
            <option value="annual">Annual</option>
            <option value="comp">Comp</option>
            <option value="wfh">WFH</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">From</label>
          <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">To</label>
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
        <div className="lg:col-span-7 flex gap-2">
          <button className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gray-900 text-white px-3 py-2">
            <FunnelIcon className="h-4 w-4" /> Apply
          </button>
          <button type="button" onClick={resetFilters} className="rounded-lg border px-3 py-2 bg-white">
            Reset
          </button>
        </div>
      </form>

      {loading && <div className="mb-4 p-3 rounded bg-gray-50 text-gray-700 border">Loading…</div>}
      {err && !loading && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border">{err}</div>}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Employee</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Start</th>
              <th className="px-4 py-2 text-left">End</th>
              <th className="px-4 py-2 text-left">Days</th>
              <th className="px-4 py-2 text-left">Reason</th>
              <th className="px-4 py-2 text-left">Peer note</th>
              <th className="px-4 py-2 text-left">Notice</th>
              <th className="px-4 py-2 text-left">Submitted</th>
              <th className="px-4 py-2 text-left">Step</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const noticeOk = r.notice_met === true || r.notice_met === "Met";
              return (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-2">{r.employee_name || r.employee || "—"}</td>
                  <td className="px-4 py-2 uppercase">{r.leave_type || "—"}</td>
                  <td className="px-4 py-2">{fmt(r.start_date)}</td>
                  <td className="px-4 py-2">{fmt(r.end_date)}</td>
                  <td className="px-4 py-2">{daysBetween(r.start_date, r.end_date)}</td>
                  <td className="px-4 py-2 max-w-xs truncate" title={r.reason}>{r.reason || "—"}</td>
                  <td className="px-4 py-2 max-w-xs truncate" title={r.peer_note}>{r.peer_note || "—"}</td>
                  <td className="px-4 py-2">{noticeOk ? chip("Met","bg-emerald-100 text-emerald-700") : chip("Short","bg-rose-100 text-rose-700")}</td>
                  <td className="px-4 py-2">{fmt(r.created_at)}</td>
                  <td className="px-4 py-2">{(r.step || "").toUpperCase()}</td>
                  <td className="px-4 py-2">{statusChip(r.status)}</td>
                  <td className="px-4 py-2">
                    {r.step === "admin" && r.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setCur(r); setActionType("approved"); setAdminNote(""); setOpen(true); }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700 hover:bg-emerald-100"
                        >
                          <CheckCircleIcon className="h-4 w-4" /> Approve
                        </button>
                        <button
                          onClick={() => { setCur(r); setActionType("rejected"); setAdminNote(""); setOpen(true); }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 font-medium text-rose-700 hover:bg-rose-100"
                        >
                          <XCircleIcon className="h-4 w-4" /> Reject
                        </button>
                      </div>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && !loading && (
              <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={12}>
                No leave requests match your filters.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* decision modal */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl border">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold">
                {actionType === "approved" ? "Approve request" : "Reject request"}
              </h3>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={decide} className="p-4 grid gap-4">
              <div className="text-sm text-gray-600">
                <div>
                  <b>{cur?.employee_name || cur?.employee}</b> — {cur?.leave_type?.toUpperCase()} • {fmt(cur?.start_date)} → {fmt(cur?.end_date)} ({daysBetween(cur?.start_date, cur?.end_date)} days)
                </div>
                <div className="mt-1 line-clamp-2">
                  <span className="text-gray-500">Reason:</span> {cur?.reason || "—"}
                </div>
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
                <button disabled={acting} className={`px-4 py-2 rounded-lg text-white ${actionType === "approved" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"} disabled:opacity-60`}>
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

// src/pages/LeadLeaveRequests.js
import React, { useEffect, useMemo, useState } from "react";
import api from "../utils/axiosInstance";
import { toast } from "react-toastify";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";

const fmt = (d) => { try { return new Date(d).toLocaleDateString(); } catch { return d || "—"; } };
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

export default function LeadLeaveRequests() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  // which set to show
  // 'lead' => use lead endpoint; others use admin endpoint with ?stage=
  const [stage, setStage] = useState("lead"); // lead|admin|done|all

  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState("approved");
  const [acting, setActing] = useState(false);
  const [cur, setCur] = useState(null);
  const [leadNote, setLeadNote] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    setErr("");
    try {
      let res;
      if (stage === "lead") {
        // Backend auto-limits to current lead’s teams & step=lead
        const params = q ? { q } : undefined;
        res = await api.get("lead/leave-requests/", { params });
      } else {
        // Use the admin list endpoint; it scopes by lead’s teams server-side.
        const params = { stage }; // admin|done|all
        if (q) params.q = q;
        // show all statuses/types in this view
        params.status = "all";
        params.type = "all";
        res = await api.get("leave-requests/", { params });
      }
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to load requests.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);           // initial
  useEffect(() => { fetchAll(); }, [stage]);      // when stage changes
  useEffect(() => {                               // small debounce for search
    const t = setTimeout(fetchAll, 300);
    return () => clearTimeout(t);
  }, [q]);

  const summary = useMemo(() => {
    const total = rows.length;
    const pendingLead = rows.filter(r => r.step === "lead" && r.status === "pending").length;
    return { total, pendingLead };
  }, [rows]);

  const openApprove = (row) => { setCur(row); setActionType("approved"); setLeadNote(""); setOpen(true); };
  const openReject  = (row) => { setCur(row); setActionType("rejected"); setLeadNote(""); setOpen(true); };

  const decide = async (e) => {
    e.preventDefault();
    if (!cur) return;
    setActing(true);
    try {
      // ✅ Only include lead_note if non-empty to avoid NULL validation errors
      const payload = { lead_decision: actionType };
      const noteTrim = (leadNote || "").trim();
      if (noteTrim) payload.lead_note = noteTrim;

      await api.patch(`lead/leave-requests/${cur.id}/`, payload);

      toast.success(actionType === "approved" ? "Forwarded to admin ✅" : "Request rejected.");
      setOpen(false);
      // Remove from view if we’re in the lead queue; otherwise just refresh
      if (stage === "lead") {
        setRows(prev => prev.filter(r => r.id !== cur.id));
      } else {
        fetchAll();
      }
    } catch (e) {
      const data = e?.response?.data || {};
      const msg =
        data.detail ||
        Object.entries(data)
          .map(([k, v]) =>
            Array.isArray(v) ? `${k}: ${v.join(" ")}` : `${k}: ${v}`
          )
          .join(" | ") ||
        "Action failed.";
      toast.error(msg);
    } finally {
      setActing(false);
    }
  };

  const resetFilters = () => { setStage("lead"); setQ(""); fetchAll(); };

  return (
    <div className="w-full min-h-screen bg-gray-100 px-6 py-10">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-semibold">Lead — Leave Approvals</h1>

        {/* Stage picker */}
        <div className="ml-auto flex items-center gap-2">
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="border rounded-lg px-3 py-2 bg-white"
            title="Which set to show"
          >
            <option value="lead">Awaiting Lead</option>
            <option value="admin">Awaiting Admin</option>
            <option value="done">Done</option>
            <option value="all">All</option>
          </select>

          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder="search…"
              className="border rounded-lg pl-8 pr-3 py-2 bg-white"
            />
          </div>

          <button
            onClick={fetchAll}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4" /> Refresh
          </button>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <div className="rounded-full bg-white border px-3 py-1">
          Total: <b>{summary.total}</b>
        </div>
        <div className="rounded-full bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1">
          Awaiting my review: <b>{summary.pendingLead}</b>
        </div>
      </div>

      {loading && <div className="mb-4 p-3 rounded bg-gray-50 text-gray-700 border border-gray-200">Loading…</div>}
      {err && !loading && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{err}</div>}

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
              <th className="px-4 py-2 text-left">Submitted</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2">{r.employee_name || r.employee || "—"}</td>
                <td className="px-4 py-2 uppercase">{r.leave_type || "—"}</td>
                <td className="px-4 py-2">{fmt(r.start_date)}</td>
                <td className="px-4 py-2">{fmt(r.end_date)}</td>
                <td className="px-4 py-2">{daysBetween(r.start_date, r.end_date)}</td>
                <td className="px-4 py-2 max-w-xs truncate" title={r.reason}>{r.reason || "—"}</td>
                <td className="px-4 py-2 max-w-xs truncate" title={r.peer_note}>{r.peer_note || "—"}</td>
                <td className="px-4 py-2">{fmt(r.created_at)}</td>
                <td className="px-4 py-2">
                  {r.step === "lead" && r.status === "pending"
                    ? chip("Awaiting Lead", "bg-amber-100 text-amber-700")
                    : r.step === "admin" && r.status === "pending"
                    ? chip("Sent to Admin", "bg-blue-100 text-blue-700")
                    : r.status === "approved"
                    ? chip("APPROVED", "bg-emerald-100 text-emerald-700")
                    : r.status === "rejected"
                    ? chip("REJECTED", "bg-rose-100 text-rose-700")
                    : chip((r.status || "—").toUpperCase(), "bg-gray-100 text-gray-700")}
                </td>
                <td className="px-4 py-2">
                  {r.step === "lead" && r.status === "pending" ? (
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
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={10}>No requests.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl border">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold">
                {actionType === "approved" ? "Approve & Send to Admin" : "Reject request"}
              </h3>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={decide} className="p-4 grid gap-4">
              <div className="text-sm text-gray-600">
                <div>
                  <b>{cur?.employee_name}</b> — {cur?.leave_type?.toUpperCase()} • {fmt(cur?.start_date)} → {fmt(cur?.end_date)} ({daysBetween(cur?.start_date, cur?.end_date)} days)
                </div>
                <div className="mt-1 line-clamp-2">
                  <span className="text-gray-500">Reason:</span> {cur?.reason || "—"}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Lead note (optional)</label>
                <textarea
                  value={leadNote}
                  onChange={(e)=>setLeadNote(e.target.value)}
                  rows={3}
                  className="border rounded-lg px-3 py-2 w-full"
                  placeholder={actionType === "rejected" ? "Reason for rejection…" : "Optional note…"}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={()=>setOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800">Cancel</button>
                <button
                  disabled={acting}
                  className={`px-4 py-2 rounded-lg text-white ${actionType === "approved" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"} disabled:opacity-60`}
                >
                  {acting ? "Saving…" : actionType === "approved" ? "Approve & Send" : "Reject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

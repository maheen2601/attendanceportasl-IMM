// src/pages/AdminTimeCorrections.jsx
import React, { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import { toast } from "react-toastify";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

function fmtDate(d) {
  try { return new Date(d).toLocaleDateString(); } catch { return d; }
}
function hhmm(v) {
  // DRF TimeField usually returns "HH:MM:SS"
  if (!v) return "—";
  if (typeof v === "string" && v.length >= 5) return v.slice(0, 5);
  return v;
}

// Pretty buttons
function ApproveBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Approve request"
      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
    >
      <CheckCircleIcon className="h-4 w-4" />
      Approve
    </button>
  );
}
function RejectBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Reject request"
      className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 hover:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400/60"
    >
      <XCircleIcon className="h-4 w-4" />
      Reject
    </button>
  );
}

// Small status chip
function StatusChip({ status }) {
  const s = (status || "").toLowerCase();
  const map = {
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
    pending: "bg-amber-100 text-amber-700",
  };
  const cls = map[s] || "bg-gray-100 text-gray-700";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}

export default function AdminTimeCorrections() {
  const [rows, setRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [open, setOpen] = useState(false);
  const [acting, setActing] = useState(false);
  const [current, setCurrent] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [actionType, setActionType] = useState("approved"); // or "rejected"

  const fetchList = async () => {
    setLoading(true); setErr("");
    try {
      const res = await api.get("attendance-corrections/", {
        params: { status: statusFilter },
      });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to load corrections.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchList(); }, [statusFilter]);

  const openApprove = (row) => { setCurrent(row); setAdminNote(""); setActionType("approved"); setOpen(true); };
  const openReject  = (row) => { setCurrent(row); setAdminNote(""); setActionType("rejected"); setOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    if (!current) return;
    setActing(true);
    try {
      await api.patch(`attendance-corrections/${current.id}/`, {
        status: actionType,
        admin_note: adminNote || null,
      });
      toast.success(actionType === "approved" ? "Approved & applied ✅" : "Rejected.");
      setOpen(false);
      await fetchList();
    } catch (e) {
      const payload = e?.response?.data || {};
      const msg =
        payload.detail ||
        Object.entries(payload)
          .map(([k, v]) => (Array.isArray(v) ? `${k}: ${v.join(" ")}` : `${k}: ${v}`))
          .join(" | ") ||
        "Action failed.";
      toast.error(msg);
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Time Corrections </h1>

      <div className="bg-white rounded-xl border p-4 mb-4 flex items-center gap-3">
        <label className="text-sm text-gray-600">Status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
        <button onClick={fetchList} className="ml-auto px-3 py-2 rounded-lg bg-gray-900 text-white">Refresh</button>
      </div>

      {loading && <div className="mb-4 p-3 rounded bg-gray-50 text-gray-700 border">Loading…</div>}
      {err && !loading && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border">{err}</div>}

      <div className="overflow-x-auto bg-white rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Employee</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Requested</th>
              <th className="px-4 py-2 text-left">Reason</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Admin note</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2">{r.employee_name}</td>
                <td className="px-4 py-2">{fmtDate(r.for_date)}</td>
                <td className="px-4 py-2">
                  CI: <b>{hhmm(r.want_check_in)}</b> · CO: <b>{hhmm(r.want_check_out)}</b>
                </td>
                <td className="px-4 py-2 max-w-md">{r.reason}</td>
                <td className="px-4 py-2 capitalize">
                  <StatusChip status={r.status} />
                </td>
                <td className="px-4 py-2">{r.admin_note || "—"}</td>
                <td className="px-4 py-2">
                  {r.status === "pending" ? (
                    <div className="flex flex-wrap gap-2">
                      <ApproveBtn onClick={() => openApprove(r)} />
                      <RejectBtn onClick={() => openReject(r)} />
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td colSpan={7} className="px-4 py-4 text-gray-500">No items</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl border">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold">
                {actionType === "approved" ? "Approve correction" : "Reject correction"}
              </h3>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={submit} className="p-4 grid gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Admin note</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  className="border rounded-lg px-3 py-2 w-full"
                  placeholder={actionType === "rejected" ? "Brief reason for rejection…" : "Optional note…"}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-60"
                  disabled={acting}
                >
                  {acting ? "Saving…" : (actionType === "approved" ? "Approve" : "Reject")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

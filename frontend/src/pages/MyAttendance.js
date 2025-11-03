
// src/pages/MyAttendance.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../utils/axiosInstance";
import { toast } from "react-toastify";

/* ---------- small helpers ---------- */
function ymd(d) {
  const dt = new Date(d);
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${mm}-${dd}`;
}
function startOfMonth(d = new Date()) {
  const x = new Date(d);
  x.setDate(1);
  return ymd(x);
}
function endOfMonth(d = new Date()) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + 1, 0);
  return ymd(x);
}
const TODAY_YMD = ymd(new Date());

function fmtDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
}
function fmtTime(t) {
  if (!t) return "—";
  if (typeof t === "string" && /^\d{2}:\d{2}$/.test(t)) return t; // already HH:MM
  try {
    return new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return t;
  }
}
function toHHMM(val) {
  if (!val) return "";
  if (/^\d{2}:\d{2}$/.test(val)) return val;

  const ampm = String(val).trim().match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (ampm) {
    let hh = parseInt(ampm[1], 10);
    const mm = ampm[2];
    const ap = ampm[3].toUpperCase();
    if (ap === "PM" && hh < 12) hh += 12;
    if (ap === "AM" && hh === 12) hh = 0;
    return `${String(hh).padStart(2, "0")}:${mm}`;
  }

  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }
  return "";
}

/* ---- total hours helpers ---- */
function minutesToHM(mins) {
  if (mins == null || isNaN(mins)) return "—";
  const m = Math.max(0, Math.round(mins));
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  return `${h}:${mm}`;
}
function minutesFromRow(r) {
  // Prefer API hours_worked (hours as float), else compute diff from check_in/out
  const hw = r?.hours_worked;
  if (hw != null && !isNaN(hw)) {
    return Math.max(0, Math.round(parseFloat(hw) * 60));
  }
  const ci = r?.check_in;
  const co = r?.check_out;
  if (!ci || !co) return null;

  // If strings like "HH:MM", stitch with the row date to compute
  const toDate = (dateStr, hhmm) => {
    if (!dateStr || !hhmm) return null;
    if (/^\d{2}:\d{2}$/.test(hhmm)) {
      const [h, m] = hhmm.split(":").map(Number);
      const d = new Date(dateStr + "T00:00:00");
      d.setHours(h, m, 0, 0);
      return d;
    }
    const d = new Date(hhmm);
    return isNaN(d.getTime()) ? null : d;
  };

  const dIn = toDate(r.date, ci);
  const dOut = toDate(r.date, co);
  if (!dIn || !dOut) return null;

  const mins = (dOut - dIn) / 60000;
  return mins >= 0 ? Math.round(mins) : null;
}

function StatusChip({ status }) {
  const s = (status || "").toLowerCase();
  const map = {
    present: "bg-emerald-100 text-emerald-700",
    leave: "bg-indigo-100 text-indigo-700",
    absent: "bg-rose-100 text-rose-700",
    none: "bg-gray-100 text-gray-600",
  };
  const cls = map[s] || "bg-gray-100 text-gray-700";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{status || "—"}</span>;
}
function TagChip({ tag }) {
  if (!tag) return "—";
  const t = String(tag).toLowerCase();
  const map = {
    normal: "bg-gray-100 text-gray-700",
    late_inf: "bg-amber-100 text-amber-700",
    late_uninf: "bg-rose-100 text-rose-700",
    short_hours: "bg-rose-100 text-rose-700",
    early_off_ok: "bg-sky-100 text-sky-700",
  };
  const cls = map[t] || "bg-gray-100 text-gray-700";
  const label = {
    late_inf: "Late (informed)",
    late_uninf: "Late (uninformed)",
    short_hours: "Short hours",
    early_off_ok: "Early-off OK",
  }[t] || tag;
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{label}</span>;
}

function Modal({ open, onClose, children, title = "Request time correction" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl border">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
function pickApproved(c, keys) {
  for (const k of keys) {
    const v = c?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return "";
}
function sameMonth(a, b) {
  if (!a || !b) return false;
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth();
}

/* ---------- component ---------- */
export default function MyAttendance() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // one-month range
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // corrections
  const [corrList, setCorrList] = useState([]);
  const [corrOpen, setCorrOpen] = useState(false);
  const [corrSubmitting, setCorrSubmitting] = useState(false);
  const [corrForm, setCorrForm] = useState({
    for_date: "",
    requested_check_in: "",
    requested_check_out: "",
    reason: "",
  });

  // initial: this month, but clamp "to" to today if this is the current month
  useEffect(() => {
    const f = startOfMonth();
    const eom = endOfMonth();
    const t = new Date(eom) > new Date(TODAY_YMD) ? TODAY_YMD : eom;
    setFrom(f);
    setTo(t);
    (async () => {
      await fetchAttendance({ from: f, to: t });
      await fetchCorrections();
    })();
  }, []);

  const fetchAttendance = async (params) => {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("me/attendance/", { params });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to fetch attendance.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCorrections = async () => {
    try {
      const res = await api.get("me/attendance/corrections/");
      setCorrList(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCorrList([]);
    }
  };

  const submitFilter = async (e) => {
    e.preventDefault();
    if (!from || !to) return;

    if (new Date(to) < new Date(from)) {
      toast.error("“To” date cannot be before “From” date.");
      return;
    }
    if (!sameMonth(from, to)) {
      toast.error("Please select dates within the same calendar month.");
      return;
    }

    // If it's the current month, don't go beyond today
    let effectiveTo = to;
    if (sameMonth(from, TODAY_YMD) && new Date(to) > new Date(TODAY_YMD)) {
      effectiveTo = TODAY_YMD;
      setTo(effectiveTo);
    }
    await fetchAttendance({ from, to: effectiveTo });
  };

  const resetFilter = async () => {
    const f = startOfMonth();
    const eom = endOfMonth();
    const t = new Date(eom) > new Date(TODAY_YMD) ? TODAY_YMD : eom;
    setFrom(f);
    setTo(t);
    await fetchAttendance({ from: f, to: t });
  };

  /* ---- merge approved corrections client-side ---- */
  const rowsWithCorrections = useMemo(() => {
    if (!rows.length || !corrList.length) return rows;
    const approvedByDate = new Map();
    corrList.forEach((c) => {
      const status = (c.status || "").toLowerCase();
      const dateKey = c.for_date || c.date;
      if (status !== "approved" || !dateKey) return;
      const existing = approvedByDate.get(dateKey);
      if (!existing || (c.id && (!existing.id || c.id > existing.id))) {
        approvedByDate.set(dateKey, c);
      }
    });
    if (!approvedByDate.size) return rows;

    return rows.map((r) => {
      const c = approvedByDate.get(r.date);
      if (!c) return r;

      const newIn = toHHMM(
        pickApproved(c, [
          "approved_check_in",
          "new_check_in",
          "final_check_in",
          "apply_check_in",
          "set_check_in",
          "want_check_in",
          "requested_check_in",
          "req_check_in",
        ])
      );
      const newOut = toHHMM(
        pickApproved(c, [
          "approved_check_out",
          "new_check_out",
          "final_check_out",
          "apply_check_out",
          "set_check_out",
          "want_check_out",
          "requested_check_out",
          "req_check_out",
        ])
      );

      if (!newIn && !newOut) return r;
      return { ...r, check_in: newIn || r.check_in, check_out: newOut || r.check_out, _patchedByCorrection: true };
    });
  }, [rows, corrList]);

  // hide any future dates just in case backend includes them
  const displayRows = useMemo(
    () => rowsWithCorrections.filter((r) => !r.date || r.date <= TODAY_YMD),
    [rowsWithCorrections]
  );

  // columns present?
  const hasTag = useMemo(() => displayRows.some((r) => r.tag != null), [displayRows]);
  const hasCheckIn = useMemo(() => displayRows.some((r) => r.check_in), [displayRows]);
  const hasCheckOut = useMemo(() => displayRows.some((r) => r.check_out), [displayRows]);
  const hasLateMins = useMemo(() => displayRows.some((r) => typeof r.minutes_late === "number"), [displayRows]);
  const hasHours = useMemo(
    () => displayRows.some((r) => minutesFromRow(r) != null),
    [displayRows]
  );

  const openCorrectionFor = (row) => {
    setCorrForm({
      for_date: row?.date || "",
      requested_check_in: toHHMM(row?.check_in),
      requested_check_out: toHHMM(row?.check_out),
      reason: "",
    });
    setCorrOpen(true);
  };

  const submitCorrection = async (e) => {
    e.preventDefault();
    if (!corrForm.for_date) return toast.error("Date is required.");
    if (!corrForm.requested_check_in && !corrForm.requested_check_out)
      return toast.error("Provide at least one of check-in or check-out.");
    if (!corrForm.reason) return toast.error("Reason is required.");

    const wantIn = toHHMM(corrForm.requested_check_in) || null;
    const wantOut = toHHMM(corrForm.requested_check_out) || null;

    setCorrSubmitting(true);
    try {
      await api.post("me/attendance/corrections/", {
        for_date: corrForm.for_date,
        want_check_in: wantIn,
        want_check_out: wantOut,
        reason: corrForm.reason,
      });
      toast.success("Correction request submitted ✅");
      setCorrOpen(false);
      await Promise.all([fetchAttendance({ from, to }), fetchCorrections()]);
    } catch (e) {
      const payload = e?.response?.data || {};
      const msg =
        payload.detail ||
        Object.entries(payload)
          .map(([k, v]) => (Array.isArray(v) ? `${k}: ${v.join(" ")}` : `${k}: ${v}`))
          .join(" | ") ||
        "Could not submit correction.";
      toast.error(msg);
    } finally {
      setCorrSubmitting(false);
    }
  };

  /* ---------- UI ---------- */
  // Max for "to" input: end of selected month, but if it's the current month clamp to today
  const toMax = sameMonth(from, TODAY_YMD) ? TODAY_YMD : endOfMonth(from || new Date());

  return (
    <div className="w-full min-h-screen bg-gray-100 px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">My Attendance</h1>

      <form onSubmit={submitFilter} className="bg-white rounded-xl border p-4 mb-4 flex gap-4 items-end flex-wrap">
        <div>
          <label className="block text-sm text-gray-600 mb-1">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => {
              const v = e.target.value;
              setFrom(v);
              // keep one-month window; fix "to" into the same month
              if (!sameMonth(v, to)) {
                const eom = endOfMonth(v || new Date());
                const nextTo = sameMonth(v, TODAY_YMD) && new Date(eom) > new Date(TODAY_YMD) ? TODAY_YMD : eom;
                setTo(nextTo);
              }
            }}
            className="border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">To</label>
          <input
            type="date"
            value={to}
            max={toMax}
            onChange={(e) => {
              let v = e.target.value;
              // force same month as "from"
              if (from && !sameMonth(from, v)) v = endOfMonth(from);
              // clamp to today when current month
              if (sameMonth(from, TODAY_YMD) && new Date(v) > new Date(TODAY_YMD)) v = TODAY_YMD;
              setTo(v);
            }}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        <button className="px-4 py-2 rounded-lg bg-gray-900 text-white">Apply</button>
        <button type="button" onClick={resetFilter} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800">
          Reset
        </button>
      </form>

      {loading && (
        <div className="mb-4 p-3 rounded bg-gray-50 text-gray-700 border border-gray-200">Loading…</div>
      )}

      {err && !loading && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{err}</div>
      )}

      {/* Attendance table */}
      <div className="overflow-x-auto bg-white rounded-xl border mb-8">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Mode</th>
              {hasTag && <th className="px-4 py-2 text-left">Tag</th>}
              {hasLateMins && <th className="px-4 py-2 text-left">Late (min)</th>}
              {hasCheckIn && <th className="px-4 py-2 text-left">Check-in</th>}
              {hasCheckOut && <th className="px-4 py-2 text-left">Check-out</th>}
              {hasHours && <th className="px-4 py-2 text-left">Total hours</th>}
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((r) => {
              const rowKey = r.id ?? `absent-${r.date}`;
              const mins = minutesFromRow(r);
              return (
                <tr key={rowKey} className="border-t">
                  <td className="px-4 py-2">{fmtDate(r.date)}</td>
                  <td className="px-4 py-2">
                    <StatusChip status={r.status} />
                  </td>
                  <td className="px-4 py-2">{r.mode || "—"}</td>
                  {hasTag && (
                    <td className="px-4 py-2">
                      <TagChip tag={r.tag} />
                    </td>
                  )}
                  {hasLateMins && (
                    <td className="px-4 py-2">{typeof r.minutes_late === "number" ? r.minutes_late : "—"}</td>
                  )}
                  {hasCheckIn && <td className="px-4 py-2">{fmtTime(r.check_in)}</td>}
                  {hasCheckOut && <td className="px-4 py-2">{fmtTime(r.check_out)}</td>}
                  {hasHours && <td className="px-4 py-2">{mins != null ? minutesToHM(mins) : "—"}</td>}
                  <td className="px-4 py-2">
                    <button onClick={() => openCorrectionFor(r)} className="text-indigo-600 hover:underline">
                      Request time change
                    </button>
                  </td>
                </tr>
              );
            })}

            {displayRows.length === 0 && !loading && (
              <tr>
                <td
                  className="px-4 py-4 text-gray-500"
                  colSpan={
                    4 +
                    (hasTag ? 1 : 0) +
                    (hasLateMins ? 1 : 0) +
                    (hasCheckIn ? 1 : 0) +
                    (hasCheckOut ? 1 : 0) +
                    (hasHours ? 1 : 0)
                  }
                >
                  No records
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Your correction requests */}
      <div className="bg-white rounded-xl border">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold">My time-correction requests</h2>
          <button
            onClick={() => {
              fetchCorrections();
              fetchAttendance({ from, to });
            }}
            className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Req. check-in</th>
                <th className="px-4 py-2 text-left">Req. check-out</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Admin note</th>
              </tr>
            </thead>
            <tbody>
              {corrList.map((c) => {
                const d = c.for_date || c.date;
                const rci = c.requested_check_in || c.req_check_in || c.new_check_in || c.want_check_in;
                const rco = c.requested_check_out || c.req_check_out || c.new_check_out || c.want_check_out;
                const st = (c.status || "pending").toLowerCase();
                const statusCls =
                  st === "approved"
                    ? "bg-emerald-100 text-emerald-700"
                    : st === "rejected"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-amber-100 text-amber-700";
                return (
                  <tr key={c.id ?? `${d}-${rci}-${rco}`} className="border-t">
                    <td className="px-4 py-2">{fmtDate(d)}</td>
                    <td className="px-4 py-2">{rci || "—"}</td>
                    <td className="px-4 py-2">{rco || "—"}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusCls}`}>
                        {c.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-2">{c.admin_note || c.note || "—"}</td>
                  </tr>
                );
              })}
              {corrList.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={5}>
                    No requests yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={corrOpen} onClose={() => setCorrOpen(false)} title="Request time correction">
        <form onSubmit={submitCorrection} className="grid gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Date</label>
            <input
              type="date"
              value={corrForm.for_date}
              onChange={(e) => setCorrForm((p) => ({ ...p, for_date: e.target.value }))}
              required
              className="border rounded-lg px-3 py-2 w-full"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Requested check-in</label>
              <input
                type="time"
                value={corrForm.requested_check_in}
                onChange={(e) => setCorrForm((p) => ({ ...p, requested_check_in: e.target.value }))}
                className="border rounded-lg px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Requested check-out</label>
              <input
                type="time"
                value={corrForm.requested_check_out}
                onChange={(e) => setCorrForm((p) => ({ ...p, requested_check_out: e.target.value }))}
                className="border rounded-lg px-3 py-2 w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Reason</label>
            <textarea
              value={corrForm.reason}
              onChange={(e) => setCorrForm((p) => ({ ...p, reason: e.target.value }))}
              required
              rows={3}
              className="border rounded-lg px-3 py-2 w-full"
              placeholder="What needs to be fixed and why?"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800"
              onClick={() => setCorrOpen(false)}
            >
              Cancel
            </button>
            <button className="px-4 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-60" disabled={corrSubmitting}>
              {corrSubmitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


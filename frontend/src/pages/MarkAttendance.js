// src/pages/MarkAttendance.js
import React, { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import { toast } from "react-toastify";

function fmtTime(t) {
  if (!t) return "—";
  try {
    // support either ISO or "HH:MM"
    if (typeof t === "string" && /^\d{2}:\d{2}$/.test(t)) return t;
    return new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return String(t);
  }
}
const todayYMD = () => new Date().toISOString().slice(0, 10);

export default function MarkAttendance() {
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [today, setToday] = useState({
    date: todayYMD(),
    check_in: null,
    check_out: null,
    mode: null,
  });

  const hasCheckedIn = Boolean(today.check_in);
  const hasCheckedOut = Boolean(today.check_out);

  // --- load today's status (tries a specific endpoint, falls back gracefully)
  const loadToday = async () => {
    setLoading(true);
    try {
      let record = null;

      try {
        const res = await api.get("me/attendance/today/");
        const data = res.data;
        record = Array.isArray(data) ? data[0] : data;
      } catch {
        const res = await api.get("me/attendance/", { params: { days: 1 } });
        const rows = Array.isArray(res.data) ? res.data : [];
        record =
          rows.find((r) => r.date === todayYMD()) ||
          rows[0] || // if backend returns only today
          null;
      }

      setToday({
        date: record?.date || todayYMD(),
        check_in: record?.check_in || record?.checked_in_at || null,
        check_out: record?.check_out || record?.checked_out_at || null,
        mode: record?.mode || null,
      });
    } catch (e) {
      // keep quiet, buttons will still work; show toast only on actions
      // console.warn("Could not load today's attendance", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadToday(); }, []);

  // --- actions (client-side guards so they only execute once)
  const notifyLate = async () => {
    if (hasCheckedIn) {
      toast.info("You’re already checked in — late pre-notice no longer applies.");
      return;
    }
    if (acting) return;
    setActing(true);
    try {
      await api.post("me/attendance/pre-notice/late/");
      toast.success("Late pre-notice sent ✅");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not send pre-notice.");
    } finally {
      setActing(false);
    }
  };

  const checkIn = async (mode) => {
    if (hasCheckedIn) {
      toast.info(`Already checked-in${today.mode ? ` (${today.mode})` : ""} at ${fmtTime(today.check_in)}.`);
      return;
    }
    if (acting) return;
    setActing(true);
    try {
      await api.post("me/attendance/check-in/", { mode });
      toast.success(`Checked-in (${mode}).`);
      await loadToday(); // refresh state so buttons lock
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not check-in.");
    } finally {
      setActing(false);
    }
  };

  const checkOut = async () => {
    if (!hasCheckedIn) {
      toast.info("You need to check-in before you can check-out.");
      return;
    }
    if (hasCheckedOut) {
      toast.info(`Already checked-out at ${fmtTime(today.check_out)}.`);
      return;
    }
    if (acting) return;
    setActing(true);
    try {
      await api.post("me/attendance/check-out/");
      toast.success("Checked-out.");
      await loadToday(); // refresh to lock UI
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not check-out.");
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Mark Attendance</h1>

      <div className="bg-white rounded-xl border p-6 max-w-xl space-y-5">
        <div className="text-sm text-gray-600">
          <div>Today: <b>{today.date}</b></div>
          <div>Check-in: <b>{fmtTime(today.check_in)}</b> {today.mode ? <span className="text-gray-500">({today.mode})</span> : null}</div>
          <div>Check-out: <b>{fmtTime(today.check_out)}</b></div>
        </div>

        <p className="text-gray-600">
          Use pre-notice if you’ll be late, then check-in once and check-out once.
        </p>

        <div className="flex gap-3">
          <button
            onClick={notifyLate}
            disabled={hasCheckedIn || acting || loading}
            className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
          >
            Pre-notify Late
          </button>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => checkIn("WFH")}
            disabled={hasCheckedIn || acting || loading}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Check-in (WFH)
          </button>
          <button
            onClick={() => checkIn("Onsite")}
            disabled={hasCheckedIn || acting || loading}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Check-in (Onsite)
          </button>
          <button
            onClick={checkOut}
            disabled={!hasCheckedIn || hasCheckedOut || acting || loading}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50"
          >
            Check-out
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Tip: Pre-notify at least the configured minutes before shift start to be counted as “Late (informed)”.
        </p>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import api from "../utils/axiosInstance";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { toast } from "react-toastify";

function fmtTime(t) {
  if (!t) return "—";
  try {
    if (typeof t === "string" && /^\d{2}:\d{2}$/.test(t)) return t; // "HH:MM"
    return new Date(t).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(t);
  }
}

const todayYMD = () => new Date().toISOString().slice(0, 10);

export default function EmployeeDashboard() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [acting, setActing] = useState(false);
  const [lateNotified, setLateNotified] = useState(false);

  const [data, setData] = useState({
    profile: { username: "", designation: "", team: "", join_date: "", leave_balance: 0 },
    today: { status: "None", mode: null },
    month: { present: 0, absent: 0, leave: 0, wfh: 0, onsite: 0 },
    pending_leaves: 0,
    trend: [],
    // keep keys present to avoid undefined checks
    open_shift: null,
    auto_closed_shift: null,
  });

  const [todayRec, setTodayRec] = useState({
    date: todayYMD(),
    check_in: null,
    check_out: null,
    mode: null,
  });

  const hasCheckedIn = Boolean(todayRec.check_in);
  const hasCheckedOut = Boolean(todayRec.check_out);

  // Initialize lateNotified from localStorage (per-day)
  useEffect(() => {
    const key = `late_prenotify:${todayYMD()}`;
    setLateNotified(localStorage.getItem(key) === "1");
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("me/dashboard/");
      setData(res.data || {});
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const loadToday = async () => {
    const res = await api.get("me/attendance/", { params: { days: 1 } });
    const rows = Array.isArray(res.data) ? res.data : [];
    const r = rows.find((x) => x.date === todayYMD()) || rows[0] || null;
    setTodayRec({
      date: r?.date || todayYMD(),
      check_in: r?.check_in || r?.checked_in_at || null,
      check_out: r?.check_out || r?.checked_out_at || null,
      mode: r?.mode || null,
    });
  };

  useEffect(() => {
    Promise.all([fetchDashboard(), loadToday()]);
  }, []);

  const lineData = useMemo(() => {
    const raw = Array.isArray(data.trend) ? data.trend : [];
    return raw
      .map((d) => ({
        date: d.date?.slice(5) ?? "",
        Present: Number(d.present ?? 0),
        Total: Number(d.total ?? 0),
        Absent: Math.max(0, Number(d.total ?? 0) - Number(d.present ?? 0)),
        _iso: d.date,
      }))
      .sort((a, b) => new Date(a._iso) - new Date(b._iso));
  }, [data.trend]);

  // -------- Attendance actions --------
  const notifyLate = async () => {
    if (hasCheckedIn) {
      toast.info("You’re already checked in — late pre-notice no longer applies.");
      return;
    }
    if (lateNotified) {
      toast.info("You already notified your lead for today.");
      return;
    }
    if (acting) return;
    setActing(true);
    try {
      await api.post("me/attendance/pre-notice/late/");
      toast.success("Late pre-notice sent ✅");
      setLateNotified(true);
      localStorage.setItem(`late_prenotify:${todayYMD()}`, "1");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not send pre-notice.");
    } finally {
      setActing(false);
    }
  };

  const checkIn = async (mode) => {
    if (hasCheckedIn) {
      toast.info(
        `Already checked-in${todayRec.mode ? ` (${todayRec.mode})` : ""} at ${fmtTime(todayRec.check_in)}.`
      );
      return;
    }
    if (acting) return;
    setActing(true);
    try {
      await api.post("me/attendance/check-in/", { mode });
      toast.success(`Checked-in (${mode}).`);
      await Promise.all([fetchDashboard(), loadToday()]);
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
      toast.info(`Already checked-out at ${fmtTime(todayRec.check_out)}.`);
      return;
    }
    if (acting) return;
    setActing(true);
    try {
      await api.post("me/attendance/check-out/");
      toast.success("Checked-out.");
      await Promise.all([fetchDashboard(), loadToday()]);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not check-out.");
    } finally {
      setActing(false);
    }
  };
  // -------------------------------------

  const { profile, today, month, pending_leaves } = data;

  // read the open shift from API and always show inline if it exists
  const openShift = data?.open_shift || null;
  const showOpenInline = !!openShift; // <-- important: show for today or past days

  return (
    <div className="w-full min-h-screen bg-gray-100 px-6 py-10">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-semibold">
          Hi, {profile.username || "—"} — {profile.designation || "—"}
        </h1>
        <span className="ml-1 inline-flex items-center rounded-full bg-gray-200 px-2.5 py-0.5 text-xs text-gray-800">
          Team: {profile.team || "Unassigned"}
        </span>
      </div>

      {loading && <div>Loading…</div>}
      {err && !loading && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
          {err}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card title="Leave Balance" value={profile.leave_balance} />
        <Card title="Today Status" value={today.status} />
        <Card title="Today Mode" value={today.mode || "—"} />
        <Card title="Pending Leaves" value={pending_leaves} />
        <Card title="Team" value={profile.team || "—"} />
      </div>

      {/* Quick Attendance */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-gray-700 font-semibold">Quick Attendance</div>
            <div className="text-sm text-gray-500">
              Use pre-notice if you’ll be late, then check-in/out (only once each).
            </div>

            {/* The small inline info row */}
            <div className="mt-2 text-xs text-gray-600">
              Today: <b>{todayRec.date}</b> · Check-in: <b>{fmtTime(todayRec.check_in)}</b>
              {todayRec.mode ? (
                <>
                  {" "}(<b>{todayRec.mode}</b>)
                </>
              ) : null}
              {" "}· Check-out: <b>{fmtTime(todayRec.check_out)}</b>

              {/* 🔴 Inline OPEN SHIFT message (always when open_shift exists) */}
              {showOpenInline && (
                <>
                  {" "}·{" "}
                  <span className="text-red-600">
                    Open shift: <b>{openShift.date}</b> (in <b>{fmtTime(openShift.check_in)}</b>) — please check out
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={notifyLate}
              disabled={hasCheckedIn || lateNotified || acting}
              className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {lateNotified ? "Pre-notified" : "Pre-notify Late"}
            </button>

            <button
              onClick={() => checkIn("WFH")}
              disabled={hasCheckedIn || acting}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Check-in (WFH)
            </button>

            <button
              onClick={() => checkIn("Onsite")}
              disabled={hasCheckedIn || acting}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Check-in (Onsite)
            </button>

            <button
              onClick={checkOut}
              disabled={!hasCheckedIn || hasCheckedOut || acting}
              className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50"
            >
              Check-out
            </button>
          </div>
        </div>
      </div>

      {/* Month counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card title="Present (month)" value={month.present} />
        <Card title="Absent (month)" value={month.absent} />
        <Card title="Leave (month)" value={month.leave} />
        <Card title="WFH/Onsite" value={`${month.wfh}/${month.onsite}`} />
      </div>

      {/* Trend chart */}
      <div className="bg-white rounded-xl border p-4">
        <div className="font-semibold text-gray-700 mb-2">Last 7 Days</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Present" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Absent" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Total" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
        {value ?? "—"}
      </div>
    </div>
  );
}

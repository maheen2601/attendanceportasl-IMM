// src/pages/Settings.js
// this is a read-only view of current policy settings
import React, { useEffect, useState } from "react";
import api from "../utils/axiosInstance";

export default function Settings() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPolicy = async () => {
    setLoading(true); setErr("");
    try {
      const res = await api.get("policy/");
      setData(res.data || {});
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to load policy.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPolicy(); }, []);

  const D = (v, suffix = "") => (v === 0 || v ? `${v}${suffix}` : "—");

  return (
    <div className="w-full min-h-screen bg-gray-100 px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Policy (Read-only)</h1>
        <button
          onClick={fetchPolicy}
          className="px-3 py-2 rounded-lg bg-gray-900 text-white"
        >
          Refresh
        </button>
      </div>

      {loading && <div>Loading…</div>}
      {err && !loading && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{err}</div>
      )}

      {data && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-4">
            <div className="font-semibold text-gray-700 mb-3">Attendance Rules</div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <KV k="Grace window (minutes)" v={D(data.grace_minutes, "m")} />
              <KV k="Min daily hours" v={D(data.min_daily_hours, "h")} />
              <KV k="Late notice (minutes before shift)" v={D(data.late_notice_minutes, "m")} />
              <KV k="WFH prior approval (days)" v={D(data.wfh_prior_days, "d")} />
            </dl>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <div className="font-semibold text-gray-700 mb-3">Notice Thresholds</div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <KV k="Sick / Emergency" v={D(data.notice_sick_hours, "h before shift")} />
              <KV k="Casual" v={D(data.notice_casual_hours, "h prior")} />
              <KV k="Annual (≤10 days)" v={D(data.notice_annual_short_days, "d prior")} />
              <KV k="Annual (>10 days)" v={D(data.notice_annual_long_days, "d prior")} />
              <KV k="Compensatory" v={D(data.notice_comp_days, "d prior")} />
            </dl>
          </div>

          {/* Optional: show holidays/shifts if your API returns them */}
          {Array.isArray(data.holidays) && (
            <div className="bg-white rounded-xl border p-4 lg:col-span-2">
              <div className="font-semibold text-gray-700 mb-3">Holidays</div>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {data.holidays.map((h, i) => (
                  <li key={i}>{h.date} — {h.name || "Holiday"}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KV({ k, v }) {
  return (
    <>
      <dt className="text-gray-500">{k}</dt>
      <dd className="font-medium text-gray-900">{v}</dd>
    </>
  );
}

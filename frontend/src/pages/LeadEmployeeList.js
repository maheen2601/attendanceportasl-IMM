// // src/pages/Employees.js
// import React, { useEffect, useMemo, useState } from "react";
// import api from "../utils/axiosInstance";
// import { toast } from "react-toastify";

// function EmployeeList() {
//   const [employees, setEmployees] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [employeeToDelete, setEmployeeToDelete] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   const fetchEmployees = async () => {
//     setLoading(true);
//     setErr("");
//     try {
//       const params = new URLSearchParams();
//       if (fromDate) params.append("from", fromDate);
//       if (toDate) params.append("to", toDate);
//       const url = `admin/employees/${params.toString() ? `?${params.toString()}` : ""}`;

//       const { data } = await api.get(url);
//       const list = Array.isArray(data) ? data : [];

//       const normalized = list.map((e) => {
//         const username = e.username ?? e.user?.username ?? "";
//         const email = e.email ?? e.user?.email ?? "";
//         const team =
//           e.team_name ??
//           (typeof e.team === "string" ? e.team : e.team?.name) ??
//           "";

//         return {
//           id: e.id,
//           username,
//           email,
//           team,
//           designation: e.designation ?? "",
//           leave_balance: e.leave_balance ?? 0,
//           join_date: e.join_date ?? "",
//           wfh_count: e.wfh_count ?? e.wfh ?? 0,
//           onsite_count: e.onsite_count ?? e.onsite ?? 0,

//           // kept for future use, but not rendered here
//           is_team_lead: !!e.is_team_lead,
//           lead_teams: Array.isArray(e.lead_teams) ? e.lead_teams : [],
//           team_leads: Array.isArray(e.team_leads) ? e.team_leads : [],
//         };
//       });

//       setEmployees(normalized);
//     } catch (error) {
//       console.error("❌ Error fetching employees:", error?.response || error);
//       setErr(
//         error?.response?.data?.detail ||
//           error?.message ||
//           "Failed to load employees"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchEmployees();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const confirmDelete = (id) => {
//     setEmployeeToDelete(id);
//     setShowModal(true);
//   };

//   const handleDelete = async () => {
//     if (!employeeToDelete) return;
//     try {
//       await api.delete(`admin/employees/${employeeToDelete}/`);
//       setEmployees((prev) => prev.filter((e) => e.id !== employeeToDelete));
//       toast.success("✅ Employee deleted successfully!");
//     } catch (error) {
//       console.error("❌ Error deleting employee:", error?.response || error);
//       toast.error(
//         error?.response?.data?.detail || "❌ Failed to delete employee."
//       );
//     } finally {
//       setShowModal(false);
//       setEmployeeToDelete(null);
//     }
//   };

//   const q = searchTerm.trim().toLowerCase();
//   const filteredEmployees = useMemo(() => {
//     return employees.filter((emp) => {
//       const u = (emp.username || "").toLowerCase();
//       const m = (emp.email || "").toLowerCase();
//       const t = (emp.team || "").toLowerCase();
//       const leads = (emp.team_leads || []).join(", ").toLowerCase();
//       return u.includes(q) || m.includes(q) || t.includes(q) || leads.includes(q);
//     });
//   }, [employees, q]);

//   return (
//     <div className="p-6 min-h-screen bg-gray-50">
//       <h2 className="text-3xl font-semibold mb-6 text-gray-800">Employee List</h2>

//       {/* Controls row */}
//       <div className="flex flex-wrap items-end gap-3 mb-4">
//         <div className="flex items-center gap-2">
//           <label className="text-sm text-gray-600">From</label>
//           <input
//             type="date"
//             className="border px-3 py-2 rounded"
//             value={fromDate}
//             onChange={(e) => setFromDate(e.target.value)}
//           />
//         </div>
//         <div className="flex items-center gap-2">
//           <label className="text-sm text-gray-600">To</label>
//           <input
//             type="date"
//             className="border px-3 py-2 rounded"
//             value={toDate}
//             onChange={(e) => setToDate(e.target.value)}
//           />
//         </div>
//         <button
//           onClick={fetchEmployees}
//           className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
//           title="Apply date range"
//         >
//           Apply
//         </button>

//         <div className="ml-auto flex items-center gap-2">
//           <input
//             type="text"
//             placeholder="Search by username, email, team, or lead…"
//             className="border px-4 py-2 rounded w-72"
//             onChange={(e) => setSearchTerm(e.target.value)}
//             value={searchTerm}
//           />
//           <button
//             onClick={fetchEmployees}
//             className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
//           >
//             Refresh
//           </button>
//         </div>
//       </div>

//       {loading && <div className="text-gray-600">Loading employees…</div>}
//       {err && !loading && (
//         <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
//           {err}
//         </div>
//       )}

//       {!loading && filteredEmployees.length === 0 && !err && (
//         <div className="text-gray-500">No employees found.</div>
//       )}

//       {!loading && filteredEmployees.length > 0 && (
//         <table className="w-full border-collapse border shadow-sm bg-white rounded-lg overflow-hidden">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border px-4 py-2 text-left">Username</th>
//               <th className="border px-4 py-2 text-left">Email</th>
//               <th className="border px-4 py-2 text-left">Team</th>
//               <th className="border px-4 py-2 text-left">Team Lead(s)</th>
//               <th className="border px-4 py-2 text-left">Designation</th>
//               <th className="border px-4 py-2 text-left">Leave Balance</th>
//               <th className="border px-4 py-2 text-left">WFH</th>
//               <th className="border px-4 py-2 text-left">Onsite</th>
//               <th className="border px-4 py-2 text-left">Join Date</th>
//               <th className="border px-4 py-2 text-left">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {filteredEmployees.map((emp) => {
//               const leadNames = (emp.team_leads || []).join(", ");
//               return (
//                 <tr key={emp.id} className="hover:bg-gray-50">
//                   <td className="border px-4 py-2">{emp.username || "-"}</td>
//                   <td className="border px-4 py-2">
//                     {emp.email ? (
//                       <a
//                         href={`mailto:${emp.email}`}
//                         className="text-blue-600 hover:underline"
//                       >
//                         {emp.email}
//                       </a>
//                     ) : (
//                       <span>-</span>
//                     )}
//                   </td>
//                   <td className="border px-4 py-2">{emp.team || "-"}</td>
//                   <td className="border px-4 py-2">
//                     {leadNames || <span className="text-gray-400">-</span>}
//                   </td>
//                   <td className="border px-4 py-2">{emp.designation || "-"}</td>
//                   <td className="border px-4 py-2">{emp.leave_balance ?? "-"}</td>
//                   <td className="border px-4 py-2">{emp.wfh_count}</td>
//                   <td className="border px-4 py-2">{emp.onsite_count}</td>
//                  <td className="border px-4 py-2">  {isSingleDay ? fromDate : "—"}</td>
//                   <td className="border px-4 py-2">
//                     <button
//                       onClick={() => confirmDelete(emp.id)}
//                       className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       )}

//       {/* Delete modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 shadow-lg w-[90%] max-w-md">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">
//               Delete Employee
//             </h3>
//             <p className="text-gray-600 mb-6">
//               Are you sure you want to delete this employee? This action cannot be undone.
//             </p>
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDelete}
//                 className="px-4 py-2 text-sm rounded bg-red-600 hover:bg-red-700 text-white"
//               >
//                 Yes, Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// export default EmployeeList;
// src/pages/LeadEmployees.js
import React, { useEffect, useMemo, useState } from "react";
import api from "../utils/axiosInstance";
import { toast } from "react-toastify";

const HEADERS = [
  "Username",
  "Email",
  "Team",
  "Team Lead(s)",
  "Designation",
  "Leave Balance",
  "WFH",
  "Onsite",
  "Check-in",
  "Check-out",
  "Hours",
  "Pre-Notify Late",
  "Status",
  "Date",
  "Actions",
];

const DAILY_TARGET_MINUTES = 8 * 60;

/* ---------- utils ---------- */
function minutesToHM(mins) {
  if (mins == null || isNaN(mins)) return "—";
  const m = Math.max(0, Math.round(mins));
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  return `${h}:${mm}`;
}
function timeToHM(isoOrHHMM) {
  if (!isoOrHHMM) return "—";
  if (/^\d{2}:\d{2}$/.test(isoOrHHMM)) return isoOrHHMM;
  try {
    const d = new Date(isoOrHHMM);
    if (isNaN(d)) return "—";
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  } catch {
    return "—";
  }
}

// "HH:MM" or ISO → minutes since midnight
function toClockMinutes(isoOrHHMM) {
  if (!isoOrHHMM) return null;
  if (/^\d{2}:\d{2}$/.test(isoOrHHMM)) {
    const [h, m] = isoOrHHMM.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  }
  const d = new Date(isoOrHHMM);
  if (isNaN(+d)) return null;
  return d.getHours() * 60 + d.getMinutes();
}
// normalize work minutes (accept minutes, hours, "H:MM")
function workToMinutes(v) {
  if (v == null) return null;

  // Handle "HH:MM" strings
  if (typeof v === "string" && /^\d{1,2}:\d{2}$/.test(v)) {
    const [h, m] = v.split(":").map(Number);
    return h * 60 + m;
  }

  // Handle numeric or string numbers
  const n = typeof v === "string" ? Number(v) : v;
  if (isNaN(n)) return null;

  // New logic
  if (n < 60) return n; // treat as minutes
  if (n <= 24 && String(v).includes(".")) return Math.round(n * 60); // hours with decimals
  if (n <= 24 && n % 1 === 0) return n; // 1..24 whole numbers still mean minutes if from backend
  return n; // assume already in minutes
}
function pct(n) {
  if (n == null || isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}
// Mon–Sat
function countWorkingDays(fromStr, toStr) {
  if (!fromStr || !toStr) return 0;
  const start = new Date(fromStr);
  const end = new Date(toStr);
  if (isNaN(start) || isNaN(end) || start > end) return 0;
  let cnt = 0;
  const d = new Date(start);
  while (d <= end) {
    const wd = d.getDay(); // 0..6
    if (wd >= 1 && wd <= 6) cnt += 1;
    d.setDate(d.getDate() + 1);
  }
  return cnt;
}
const fmtHead = (isoDate) => {
  try {
    const d = new Date(`${isoDate}T00:00:00`);
    return {
      day: d.getDate(),
      wk: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()],
    };
  } catch {
    return { day: "?", wk: "?" };
  }
};
/* --------------------------------- */

export default function LeadEmployees() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // attendance modal state
  const [attOpen, setAttOpen] = useState(false);
  const [attLoading, setAttLoading] = useState(false);
  const [attErr, setAttErr] = useState("");
  const [attRows, setAttRows] = useState([]);
  const [attFrom, setAttFrom] = useState("");
  const [attTo, setAttTo] = useState("");
  const [attEmployee, setAttEmployee] = useState(null);

  const isSingleDay = fromDate && toDate && fromDate === toDate;

  const fetchEmployees = async () => {
    setLoading(true);
    setErr("");
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append("from", fromDate);
      if (toDate) params.append("to", toDate);
      if (teamFilter) params.append("team", teamFilter);

      const url = `lead/employees/${params.toString() ? `?${params.toString()}` : ""}`;
      const { data } = await api.get(url);
      const list = Array.isArray(data) ? data : [];

      const normalized = list.map((e) => {
        const username = e.username ?? e.user?.username ?? "";
        const email = e.email ?? e.user?.email ?? "";
        const team =
          (e.team_name ??
            (typeof e.team === "string" ? e.team : e.team?.name) ??
            "")?.trim();

        const wfh_count = Number(e.wfh_count ?? e.wfh ?? 0);
        const onsite_count = Number(e.onsite_count ?? e.onsite ?? 0);

        const avg_work_minutes = e.avg_work_minutes ?? null;
        const checkin_time = e.checkin_time ?? null;
        const checkout_time = e.checkout_time ?? null;
        const work_minutes = e.work_minutes ?? null;
        const pre_notify_late = Boolean(e.pre_notify_late); // ✅ backend flag

        const present =
          wfh_count + onsite_count > 0 ||
          (work_minutes != null && work_minutes > 0) ||
          Boolean(e.present);

        return {
          id: e.id,
          username,
          email,
          team,
          designation: e.designation ?? "",
          leave_balance: e.leave_balance ?? 0,
          join_date: e.join_date ?? "",
          wfh_count,
          onsite_count,
          present,
          team_leads: Array.isArray(e.team_leads) ? e.team_leads : [],
          checkin_time,
          checkout_time,
          work_minutes,
          avg_work_minutes,
          pre_notify_late, // ✅ include in state
        };
      });

      setEmployees(normalized);
    } catch (error) {
      setErr(error?.response?.data?.detail || error?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  // default to today so single-day fields can show immediately
  useEffect(() => {
    const today = new Date().toLocaleDateString("en-CA");
    if (!fromDate) setFromDate(today);
    if (!toDate) setToDate(today);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fromDate && toDate) fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate, teamFilter]);

  const confirmDelete = (id) => {
    setEmployeeToDelete(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;
    try {
      // Note: leads might not have permission for this endpoint.
      await api.delete(`admin/employees/${employeeToDelete}/`);
      setEmployees((prev) => prev.filter((e) => e.id !== employeeToDelete));
      toast.success("✅ Employee deleted successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.detail || "❌ Failed to delete employee.");
    } finally {
      setShowModal(false);
      setEmployeeToDelete(null);
    }
  };

  // derive team options from visible data
  const teamOptions = useMemo(() => {
    const s = new Set();
    employees.forEach((e) => {
      const t = (e.team || "").trim();
      if (t) s.add(t);
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [employees]);

  // client-side search + team filter
  const filteredEmployees = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return employees.filter((emp) => {
      if (
        teamFilter &&
        (emp.team || "").trim().toLowerCase() !== teamFilter.trim().toLowerCase()
      ) {
        return false;
      }
      if (!q) return true;
      const u = (emp.username || "").toLowerCase();
      const m = (emp.email || "").toLowerCase();
      const t = (emp.team || "").toLowerCase();
      const leads = (emp.team_leads || []).join(", ").toLowerCase();
      return u.includes(q) || m.includes(q) || t.includes(q) || leads.includes(q);
    });
  }, [employees, teamFilter, searchTerm]);

  // overall bar
  const workingDays = useMemo(
    () => countWorkingDays(fromDate, toDate),
    [fromDate, toDate]
  );

  const { overallTotalMinutes, overallCapacityMinutes } = useMemo(() => {
    const considered = filteredEmployees.filter(
      (e) => e.avg_work_minutes != null && !isNaN(e.avg_work_minutes)
    );
    const people = considered.length;
    if (people === 0 || workingDays === 0) {
      return { overallTotalMinutes: 0, overallCapacityMinutes: 0 };
    }
    const totalWorked = considered.reduce(
      (sum, e) => sum + Number(e.avg_work_minutes) * workingDays,
      0
    );
    const totalCapacity = workingDays * DAILY_TARGET_MINUTES * people;
    return { overallTotalMinutes: totalWorked, overallCapacityMinutes: totalCapacity };
  }, [filteredEmployees, workingDays]);

  const overallPct =
    overallCapacityMinutes > 0
      ? pct((overallTotalMinutes / overallCapacityMinutes) * 100)
      : 0;

  /* ----------------- Attendance Modal ----------------- */
  const fetchAttendance = async (empId, f, t) => {
    setAttLoading(true);
    setAttErr("");
    try {
      const { data } = await api.get("admin/employee-attendance/", {
        params: { employee_id: empId, from: f, to: t },
      });
      setAttRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setAttErr(e?.response?.data?.detail || "Failed to load attendance.");
      setAttRows([]);
    } finally {
      setAttLoading(false);
    }
  };

  const openAttendance = (emp) => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toLocaleDateString("en-CA");
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toLocaleDateString("en-CA");
    const f = fromDate || monthStart;
    const t = toDate || monthEnd;

    setAttEmployee({ id: emp.id, username: emp.username });
    setAttFrom(f);
    setAttTo(t);
    setAttOpen(true);
    fetchAttendance(emp.id, f, t);
  };

  const applyAttRange = (e) => {
    e.preventDefault();
    if (!attEmployee || !attFrom || !attTo) return;
    fetchAttendance(attEmployee.id, attFrom, attTo);
  };

  const attAverages = useMemo(() => {
    if (!attRows?.length) return { inAvg: null, outAvg: null, workAvg: null };
    const ins = [], outs = [], works = [];
    attRows.forEach(r => {
      const mi = toClockMinutes(r.check_in);
      const mo = toClockMinutes(r.check_out);
      const wm = workToMinutes(r.work_minutes ?? r.hours_minutes ?? r.hours_worked);
      if (mi != null) ins.push(mi);
      if (mo != null) outs.push(mo);
      if (wm != null) works.push(wm);
    });
    const mean = a => a.length ? Math.round(a.reduce((s,x)=>s+x,0)/a.length) : null;
    return { inAvg: mean(ins), outAvg: mean(outs), workAvg: mean(works) };
  }, [attRows]);
  /* ---------------------------------------------------- */

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h2 className="text-3xl font-semibold mb-4 text-gray-800">Team Members</h2>

      {/* Overall bar */}
      <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">
            Overall Working Time (date range)
          </h3>
          <span className="text-sm text-gray-600">
            {minutesToHM(overallTotalMinutes)} / {minutesToHM(overallCapacityMinutes)}
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded">
          <div
            className="h-3 bg-indigo-500 rounded"
            style={{ width: `${overallPct}%` }}
            aria-label="overall worked vs capacity"
            title={`${minutesToHM(overallTotalMinutes)} of ${minutesToHM(overallCapacityMinutes)}`}
          />
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Workdays counted: {workingDays} • People: {filteredEmployees.length}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">From</label>
          <input
            type="date"
            className="border px-3 py-2 rounded"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">To</label>
          <input
            type="date"
            className="border px-3 py-2 rounded"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Team</label>
          <select
            className="border px-3 py-2 rounded min-w-[12rem]"
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
          >
            <option value="">All teams</option>
            {teamOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchEmployees}
          className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
          title="Apply filters"
        >
          Apply
        </button>

        <div className="ml-auto flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by username, email, team, or lead…"
            className="border px-4 py-2 rounded w-72"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
          <button
            onClick={fetchEmployees}
            className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && <div className="text-gray-600">Loading team…</div>}
      {err && !loading && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
          {err}
        </div>
      )}

      {!loading && filteredEmployees.length === 0 && !err && (
        <div className="text-gray-500">No team members found.</div>
      )}

      {!loading && filteredEmployees.length > 0 && (
        <table className="w-full border-collapse border shadow-sm bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              {HEADERS.map((h) => (
                <th key={h} className="border px-4 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((emp) => {
              let statusChip;
              if (emp.pre_notify_late) {
                statusChip = (
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                    Late (Informed)
                  </span>
                );
              } else if (emp.present) {
                statusChip = (
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                    Present
                  </span>
                );
              } else {
                statusChip = (
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                    Absent
                  </span>
                );
              }

              const dayCheckIn = isSingleDay ? (emp.checkin_time || "—") : "—";
              const dayCheckOut = isSingleDay ? (emp.checkout_time || "—") : "—";
              const dayHours = isSingleDay ? minutesToHM(emp.work_minutes) : "—";

              return (
                <tr
                  key={emp.id}
                  className={`hover:bg-gray-50 ${emp.pre_notify_late ? "bg-yellow-50" : ""}`}
                >
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => openAttendance(emp)}
                      className="text-indigo-600 hover:underline"
                    >
                      {emp.username || "-"}
                    </button>
                  </td>
                  <td className="border px-4 py-2">
                    {emp.email ? (
                      <a href={`mailto:${emp.email}`} className="text-blue-600 hover:underline">
                        {emp.email}
                      </a>
                    ) : ("-")}
                  </td>
                  <td className="border px-4 py-2">{emp.team || "-"}</td>
                  <td className="border px-4 py-2">
                    {(emp.team_leads || []).join(", ") || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="border px-4 py-2">{emp.designation || "-"}</td>
                  <td className="border px-4 py-2">{emp.leave_balance ?? "-"}</td>
                  <td className="border px-4 py-2">{emp.wfh_count}</td>
                  <td className="border px-4 py-2">{emp.onsite_count}</td>

                  <td className="border px-4 py-2">{dayCheckIn}</td>
                  <td className="border px-4 py-2">{dayCheckOut}</td>
                  <td className="border px-4 py-2">{dayHours}</td>

                  <td className="border px-4 py-2 text-center">
                    {emp.pre_notify_late ? (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                        Yes
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        No
                      </span>
                    )}
                  </td>

                  <td className="border px-4 py-2">{statusChip}</td>
                  <td className="border px-4 py-2">
                    {fromDate && toDate
                      ? (fromDate === toDate ? fromDate : `${fromDate} → ${toDate}`)
                      : "—"}
                  </td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => confirmDelete(emp.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* delete modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-[90%] max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Employee</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this employee? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance modal with Avg column */}
      {attOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-6xl rounded-xl bg-white shadow-xl border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold">Attendance — {attEmployee?.username}</h3>
              <button onClick={() => setAttOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            {/* range filter */}
            <form onSubmit={applyAttRange} className="px-4 pt-4 pb-2 flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">From</label>
                <input
                  type="date"
                  value={attFrom}
                  onChange={(e) => setAttFrom(e.target.value)}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">To</label>
                <input
                  type="date"
                  value={attTo}
                  onChange={(e) => setAttTo(e.target.value)}
                  className="border rounded px-3 py-2"
                />
              </div>
              <button className="ml-auto rounded-lg bg-indigo-600 text-white px-3 py-2">
                Apply
              </button>
            </form>

            {attLoading && <div className="px-4 py-3 text-gray-600">Loading…</div>}
            {attErr && !attLoading && <div className="px-4 py-3 text-red-700 bg-red-50 border-t">{attErr}</div>}

            {!attLoading && !attErr && (
              <div className="p-4 overflow-x-auto">
                {attRows.length === 0 ? (
                  <div className="text-gray-500">No attendance in this range.</div>
                ) : (
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr>
                        {attRows.map((r) => {
                          const { day, wk } = fmtHead(r.date);
                          return (
                            <th key={r.date} className="px-2 py-1 border text-center">
                              <div className="font-semibold">{day}</div>
                              <div className="text-gray-500">{wk}</div>
                            </th>
                          );
                        })}
                        {/* AVG header */}
                        <th className="px-2 py-1 border text-center">
                          <div className="font-semibold">Avg</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* In row */}
                      <tr>
                        {attRows.map((r) => (
                          <td key={r.date + "-in"} className="px-2 py-1 border text-center">
                            <span className="text-[11px] text-gray-500 mr-1">In</span>
                            <span className="text-[11px] font-medium">
                              {timeToHM(r.check_in)}
                            </span>
                          </td>
                        ))}
                        <td className="px-2 py-1 border text-center">
                          <span className="text-[11px] text-gray-500 mr-1">In</span>
                          <span className="text-[11px] font-semibold">
                            {minutesToHM(attAverages.inAvg)}
                          </span>
                        </td>
                      </tr>

                      {/* Out row */}
                      <tr>
                        {attRows.map((r) => (
                          <td key={r.date + "-out"} className="px-2 py-1 border text-center">
                            <span className="text-[11px] text-gray-500 mr-1">Out</span>
                            <span className="text-[11px] font-medium">
                              {timeToHM(r.check_out)}
                            </span>
                          </td>
                        ))}
                        <td className="px-2 py-1 border text-center">
                          <span className="text-[11px] text-gray-500 mr-1">Out</span>
                          <span className="text-[11px] font-semibold">
                            {minutesToHM(attAverages.outAvg)}
                          </span>
                        </td>
                      </tr>

                      {/* Work hours row */}
                      <tr>
                        {attRows.map((r) => (
                          <td key={r.date + "-wh"} className="px-2 py-1 border text-center">
                            <span className="text-[11px] text-gray-500 mr-1">Wrk Hr</span>
                            <span className="text-[11px] font-medium">
                              {minutesToHM(
                                workToMinutes(r.work_minutes ?? r.hours_minutes ?? r.hours_worked)
                              )}
                            </span>
                          </td>
                        ))}
                        {/* Avg column */}
                        <td className="px-2 py-1 border text-center">
                          <span className="text-[11px] text-gray-500 mr-1">Wrk Hr</span>
                          <span className="text-[11px] font-semibold">
                            {minutesToHM(attAverages.workAvg)}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

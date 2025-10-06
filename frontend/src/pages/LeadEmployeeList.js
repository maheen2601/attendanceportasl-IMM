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


// src/pages/Employees.js
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
  "Status",
  "Date",
  "Actions",
];

const DAILY_TARGET_MINUTES = 8 * 60;

// ---------- utils ----------
function minutesToHM(mins) {
  if (mins == null || isNaN(mins)) return "—";
  const m = Math.max(0, Math.round(mins));
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  return `${h}:${mm}`;
}
function pct(n) {
  if (n == null || isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}
// count Mon–Sat workdays (change if your week differs)
function countWorkingDays(fromStr, toStr) {
  if (!fromStr || !toStr) return 0;
  const start = new Date(fromStr);
  const end = new Date(toStr);
  if (isNaN(start) || isNaN(end) || start > end) return 0;
  let cnt = 0;
  const d = new Date(start);
  while (d <= end) {
    const wd = d.getDay(); // 0..6 (Sun..Sat)
    if (wd >= 1 && wd <= 6) cnt += 1;
    d.setDate(d.getDate() + 1);
  }
  return cnt;
}

// ---------- component ----------
function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const isSingleDay = fromDate && toDate && fromDate === toDate;

  const fetchEmployees = async () => {
    setLoading(true);
    setErr("");
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append("from", fromDate);
      if (toDate) params.append("to", toDate);
      const url = `admin/employees/${params.toString() ? `?${params.toString()}` : ""}`;

      const { data } = await api.get(url);
      const list = Array.isArray(data) ? data : [];

      const normalized = list.map((e) => {
        const username = e.username ?? e.user?.username ?? "";
        const email = e.email ?? e.user?.email ?? "";
        const team =
          e.team_name ??
          (typeof e.team === "string" ? e.team : e.team?.name) ??
          "";

        // counts
        const wfh_count = Number(e.wfh_count ?? e.wfh ?? 0);
        const onsite_count = Number(e.onsite_count ?? e.onsite ?? 0);

        // range/day fields from backend
        const avg_work_minutes = e.avg_work_minutes ?? null;
        const checkin_time = e.checkin_time ?? null;   // "HH:MM" when single day
        const checkout_time = e.checkout_time ?? null; // "HH:MM" when single day
        const work_minutes = e.work_minutes ?? null;   // minutes when single day

        // presence
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
          // lead info (array of names)
          team_leads: Array.isArray(e.team_leads) ? e.team_leads : [],
          // single-day extras
          checkin_time,
          checkout_time,
          work_minutes,
          // range avg
          avg_work_minutes,
        };
      });

      setEmployees(normalized);
    } catch (error) {
      console.error("❌ Error fetching employees:", error?.response || error);
      setErr(
        error?.response?.data?.detail ||
          error?.message ||
          "Failed to load employees"
      );
    } finally {
      setLoading(false);
    }
  };

  // default to today so check-in/out/hours can show immediately
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (!fromDate) setFromDate(today);
    if (!toDate) setToDate(today);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refetch whenever dates change (after they are both set)
  useEffect(() => {
    if (fromDate && toDate) fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  const confirmDelete = (id) => {
    setEmployeeToDelete(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;
    try {
      await api.delete(`admin/employees/${employeeToDelete}/`);
      setEmployees((prev) => prev.filter((e) => e.id !== employeeToDelete));
      toast.success("✅ Employee deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting employee:", error?.response || error);
      toast.error(
        error?.response?.data?.detail || "❌ Failed to delete employee."
      );
    } finally {
      setShowModal(false);
      setEmployeeToDelete(null);
    }
  };

  // search
  const q = searchTerm.trim().toLowerCase();
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const u = (emp.username || "").toLowerCase();
      const m = (emp.email || "").toLowerCase();
      const t = (emp.team || "").toLowerCase();
      const leads = (emp.team_leads || []).join(", ").toLowerCase();
      return u.includes(q) || m.includes(q) || t.includes(q) || leads.includes(q);
    });
  }, [employees, q]);

  // top overall bar: sum(avg per day * days) vs capacity (days * 8h * people)
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

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h2 className="text-3xl font-semibold mb-4 text-gray-800">Employee List</h2>

      {/* top overall bar */}
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

      {/* Controls row */}
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
        <button
          onClick={fetchEmployees}
          className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
          title="Apply date range"
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

      {loading && <div className="text-gray-600">Loading employees…</div>}
      {err && !loading && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
          {err}
        </div>
      )}

      {!loading && filteredEmployees.length === 0 && !err && (
        <div className="text-gray-500">No employees found.</div>
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
              const leadNames = (emp.team_leads || []).join(", ");
              const statusChip = emp.present ? (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                  Present
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                  Absent
                </span>
              );

              const dayCheckIn = isSingleDay ? (emp.checkin_time || "—") : "—";
              const dayCheckOut = isSingleDay ? (emp.checkout_time || "—") : "—";
              const dayHours = isSingleDay ? minutesToHM(emp.work_minutes) : "—";

              return (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{emp.username || "-"}</td>
                  <td className="border px-4 py-2">
                    {emp.email ? (
                      <a href={`mailto:${emp.email}`} className="text-blue-600 hover:underline">
                        {emp.email}
                      </a>
                    ) : ("-")}
                  </td>
                  <td className="border px-4 py-2">{emp.team || "-"}</td>
                  <td className="border px-4 py-2">
                    {leadNames || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="border px-4 py-2">{emp.designation || "-"}</td>
                  <td className="border px-4 py-2">{emp.leave_balance ?? "-"}</td>
                  <td className="border px-4 py-2">{emp.wfh_count}</td>
                  <td className="border px-4 py-2">{emp.onsite_count}</td>

                  <td className="border px-4 py-2">{dayCheckIn}</td>
                  <td className="border px-4 py-2">{dayCheckOut}</td>
                  <td className="border px-4 py-2">{dayHours}</td>

                  <td className="border px-4 py-2">{statusChip}</td>
                  <td className="border px-4 py-2">{emp.join_date || "-"}</td>
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
    </div>
  );
}

export default EmployeeList;



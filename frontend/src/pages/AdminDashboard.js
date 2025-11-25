



// // src/pages/AdminDashboard.js
// import React, { useEffect, useMemo, useState } from "react";
// import api from "../utils/axiosInstance";
// import {
//   ResponsiveContainer,
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
//   LineChart, Line,
//   PieChart, Pie, Cell,
// } from "recharts";

// const COLORS = ["#8b5cf6", "#06b6d4", "#f43f5e", "#10b981", "#60a5fa", "#f59e0b"];

// // Team options for the filter (add/remove as needed)
// const TEAM_OPTIONS = [
//   "TCP","The News","Hungama","Jang",
//   "Celeb In Box","Gad Insider","Gossip Herald",
//   "Geo","SEO","Data","Social",
// ];

// /* small date helpers */
// const fmt = (d) => d.toISOString().slice(0, 10);
// const todayStr = () => fmt(new Date());
// const daysAgoStr = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return fmt(d); };

// export default function AdminDashboard() {
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");
//   const [stats, setStats] = useState({
//     total_employees: 0,
//     present_today: 0,
//     absent_today: 0,
//     leave_pending: 0,
//     wfh: 0,
//     onsite: 0,
//     trend: [],
//     range: { from: "", to: "" },
//   });

//   // Range (default last 7 days)
//   const [from, setFrom] = useState(daysAgoStr(6));
//   const [to, setTo] = useState(todayStr());

//   // ---- Team filter state: [] means "All"
//   const [selectedTeams, setSelectedTeams] = useState([]);

//   const fetchStats = async () => {
//     setLoading(true);
//     setErr("");
//     try {
//       const params = {};
//       if (from) params.from = from;
//       if (to) params.to = to;
//       if (selectedTeams.length > 0) params.team = selectedTeams; // sends ?team=A&team=B

//       const res = await api.get("dashboard-stats/", { params });
//       setStats(res.data || {});
//     } catch (e) {
//       const msg = e?.response?.data?.detail || "Failed to load dashboard stats";
//       setErr(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStats();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [from, to, JSON.stringify(selectedTeams)]);

//   const {
//     total_employees = 0,
//     present_today = 0,
//     absent_today = 0,
//     leave_pending = 0,
//     wfh = 0,
//     onsite = 0,
//     range = {},
//   } = stats;

//   // Normalize trend → oldest → newest
//   const lineData = useMemo(() => {
//     const raw = Array.isArray(stats.trend) ? stats.trend : [];
//     return raw
//       .map((d) => ({
//         date: d.date?.slice(5) ?? "",
//         Present: Number(d.present ?? 0),
//         Leave: Number(d.leave ?? 0),
//         Total: Number(d.total ?? 0),
//         Absent: Math.max(0, Number(d.total ?? 0) - Number(d.present ?? 0) - Number(d.leave ?? 0)),
//         _iso: d.date,
//       }))
//       .sort((a, b) => new Date(a._iso) - new Date(b._iso));
//   }, [stats.trend]);

//   const todayBarData = [
//     { name: "Present", value: Number(present_today) },
//     { name: "Absent", value: Number(absent_today) },
//   ];

//   const modePieData = [
//     { name: "WFH", value: Number(wfh) },
//     { name: "Onsite", value: Number(onsite) },
//   ];

//   const applyRange = (e) => {
//     e?.preventDefault?.();
//     if (!from || !to) return;
//     fetchStats();
//   };

//   const resetRange = () => {
//     const f = daysAgoStr(6);
//     const t = todayStr();
//     setFrom(f);
//     setTo(t);
//     setSelectedTeams([]); // also reset teams to All
//   };

//   return (
//     <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white px-6 py-10">
//       {/* Header row */}
//       <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//         <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">
//           Admin Dashboard
//         </h1>

//         {/* Right-side controls (date + teams + stat-like card) */}
//         <div className="flex flex-wrap items-end gap-3">
//           {/* Date range */}
//           <form onSubmit={applyRange} className="flex items-center gap-2">
//             <span className="text-sm text-gray-600">Range:</span>
//             <input
//               type="date"
//               value={from}
//               onChange={(e) => setFrom(e.target.value)}
//               className="border rounded-lg px-3 py-1.5 text-sm"
//             />
//             <span className="text-gray-400">—</span>
//             <input
//               type="date"
//               value={to}
//               onChange={(e) => setTo(e.target.value)}
//               className="border rounded-lg px-3 py-1.5 text-sm"
//             />
//             <button
//               type="submit"
//               className="ml-2 rounded-lg bg-gray-900 text-white px-3 py-1.5 text-sm"
//             >
//               Apply
//             </button>
//             <button
//               type="button"
//               onClick={resetRange}
//               className="rounded-lg bg-gray-200 text-gray-800 px-3 py-1.5 text-sm"
//             >
//               Reset
//             </button>
//           </form>

//           {/* Team filter: dropdown multi-select */}
//           <div className="flex flex-col">
//             <label className="text-sm text-gray-600 mb-1">Teams:</label>
//             <TeamMultiDropdown
//               options={TEAM_OPTIONS}
//               selected={selectedTeams}
//               onChange={(vals) => setSelectedTeams(vals)}
//             />
//             <p className="text-xs text-gray-500 mt-1">
//               Tip: Search inside the dropdown. “All” = no filter.
//             </p>
//           </div>

//           {/* KPI-style Selected Teams card */}
//           <SelectedTeamsStatCard
//             selectedTeams={selectedTeams}
//             onClear={() => setSelectedTeams([])}
//           />
//         </div>
//       </div>

//       {loading && <div className="mt-4">Loading…</div>}
//       {err && !loading && (
//         <div className="mt-4 mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
//           {err}
//         </div>
//       )}

//       {/* KPIs */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-4">
//         <StatCard title="Total Employees" value={total_employees}
//           accent="from-violet-500/20 to-fuchsia-500/20" icon="users" />
//         <StatCard title={`Present (${range?.to || to})`} value={present_today}
//           accent="from-emerald-500/20 to-teal-500/20" icon="check" />
//         <StatCard title={`Absent (${range?.to || to})`} value={absent_today}
//           accent="from-rose-500/20 to-orange-500/20" icon="x" />
//         <StatCard title="Leave Pending" value={leave_pending}
//           accent="from-sky-500/20 to-indigo-500/20" icon="clock" />
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
//         <ChartCard title={`Attendance on ${range?.to || to}`} subtitle="Present vs Absent">
//           <ChartGradients />
//           <div className="h-64">
//             {todayBarData.every((d) => d.value === 0) ? (
//               <EmptyState />
//             ) : (
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={todayBarData} barSize={38}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                   <XAxis dataKey="name" tick={{ fill: "#6b7280" }} axisLine={false} tickLine={false} />
//                   <YAxis allowDecimals={false} tick={{ fill: "#6b7280" }} axisLine={false} tickLine={false} />
//                   <Tooltip content={<NiceTooltip />} />
//                   <Legend />
//                   <Bar dataKey="value" name="Count" radius={[10,10,0,0]} fill="url(#barGradient)" />
//                 </BarChart>
//               </ResponsiveContainer>
//             )}
//           </div>
//         </ChartCard>

//         <ChartCard title={`WFH vs Onsite (${range?.to || to})`} subtitle="Work mode distribution">
//           <div className="h-64">
//             {modePieData.every((d) => d.value === 0) ? (
//               <EmptyState />
//             ) : (
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Tooltip content={<NiceTooltip />} />
//                   <Legend />
//                   <Pie data={modePieData} dataKey="value" nameKey="name"
//                        outerRadius={95} innerRadius={50} paddingAngle={3} label>
//                     {modePieData.map((_, idx) => (
//                       <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
//                     ))}
//                   </Pie>
//                 </PieChart>
//               </ResponsiveContainer>
//             )}
//           </div>
//         </ChartCard>

//         <ChartCard title="Attendance Trend" subtitle={`${range?.from || from} — ${range?.to || to}`}>
//           <ChartGradients />
//           <div className="h-64">
//             {lineData.length === 0 ? (
//               <EmptyState />
//             ) : (
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart data={lineData}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                   <XAxis dataKey="date" tick={{ fill: "#6b7280" }} axisLine={false} tickLine={false} />
//                   <YAxis allowDecimals={false} tick={{ fill: "#6b7280" }} axisLine={false} tickLine={false} />
//                   <Tooltip content={<NiceTooltip />} />
//                   <Legend />
//                   <Line type="monotone" dataKey="Absent"  stroke="url(#lineRed)"    strokeWidth={2.5} dot={{ r: 3 }} />
//                   <Line type="monotone" dataKey="Present" stroke="url(#lineGreen)"  strokeWidth={2.5} dot={{ r: 3 }} />
//                   <Line type="monotone" dataKey="Total"   stroke="url(#lineIndigo)" strokeWidth={2.5} dot={{ r: 3 }} />
//                 </LineChart>
//               </ResponsiveContainer>
//             )}
//           </div>
//         </ChartCard>
//       </div>
//     </div>
//   );
// }

// /* ---------- Team dropdown (multi-select with search/All) ---------- */
// function TeamMultiDropdown({ options = [], selected = [], onChange }) {
//   const [open, setOpen] = React.useState(false);
//   const [query, setQuery] = React.useState("");
//   const ref = React.useRef(null);

//   const normalized = options.map((o) => ({ label: o, value: o }));
//   const filtered = query
//     ? normalized.filter((o) =>
//         o.label.toLowerCase().includes(query.trim().toLowerCase())
//       )
//     : normalized;

//   const noneSelectedMeansAll = selected.length === 0;

//   const toggle = (val) => {
//     if (selected.includes(val)) {
//       const next = selected.filter((v) => v !== val);
//       onChange(next); // empty => All
//     } else {
//       const next = [...selected, val];
//       onChange(next);
//     }
//   };

//   const selectAll = () => onChange([]);
//   const selectFiltered = () => onChange(Array.from(new Set([...selected, ...filtered.map(f => f.value)])));
//   const clearFiltered = () => onChange(selected.filter(v => !filtered.some(f => f.value === v)));

//   // click outside to close
//   React.useEffect(() => {
//     const onDocClick = (e) => {
//       if (ref.current && !ref.current.contains(e.target)) setOpen(false);
//     };
//     document.addEventListener("mousedown", onDocClick);
//     return () => document.removeEventListener("mousedown", onDocClick);
//   }, []);

//   const buttonLabel = noneSelectedMeansAll
//     ? "All teams"
//     : `${selected.length} selected`;

//   return (
//     <div className="relative" ref={ref}>
//       <button
//         type="button"
//         onClick={() => setOpen((o) => !o)}
//         className="w-[260px] rounded-lg border px-3 py-2 text-sm bg-white text-gray-800 flex items-center justify-between"
//       >
//         <span className="truncate">{buttonLabel}</span>
//         <svg className={`h-4 w-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"/></svg>
//       </button>

//       {open && (
//         <div className="absolute z-20 mt-2 w-[320px] rounded-xl border border-gray-200 bg-white shadow-lg">
//           {/* Top controls */}
//           <div className="p-2 border-b border-gray-100 flex items-center gap-2">
//             <input
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search teams…"
//               className="flex-1 rounded-md border px-2 py-1.5 text-sm"
//             />
//             <button
//               type="button"
//               onClick={selectAll}
//               className="rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
//               title="All = no filter"
//             >
//               All
//             </button>
//           </div>

//           {/* Bulk actions on filtered set */}
//           <div className="px-2 pt-2 flex items-center gap-2">
//             <button
//               type="button"
//               onClick={selectFiltered}
//               className="rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
//               title="Add all matching the search"
//             >
//               Add filtered
//             </button>
//             <button
//               type="button"
//               onClick={clearFiltered}
//               className="rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
//               title="Remove all matching the search"
//             >
//               Remove filtered
//             </button>
//             {!noneSelectedMeansAll && (
//               <button
//                 type="button"
//                 onClick={selectAll}
//                 className="ml-auto rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
//               >
//                 Clear
//               </button>
//             )}
//           </div>

//           {/* List */}
//           <div className="max-h-56 overflow-auto p-2 space-y-1">
//             {/* All pseudo-option at top */}
//             <label className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer">
//               <input
//                 type="checkbox"
//                 className="rounded"
//                 checked={noneSelectedMeansAll}
//                 onChange={selectAll}
//               />
//               <span className="text-sm text-gray-800">All (no filter)</span>
//             </label>

//             <div className="h-px bg-gray-100 my-1" />

//             {filtered.length === 0 ? (
//               <div className="text-xs text-gray-400 px-2 py-1">No matches</div>
//             ) : (
//               filtered.map((opt) => (
//                 <label
//                   key={opt.value}
//                   className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
//                 >
//                   <input
//                     type="checkbox"
//                     className="rounded"
//                     checked={selected.includes(opt.value)}
//                     onChange={() => toggle(opt.value)}
//                   />
//                   <span className="text-sm text-gray-800">{opt.label}</span>
//                 </label>
//               ))
//             )}
//           </div>

//           {/* Footer: selected chips */}
//           <div className="border-t border-gray-100 p-2">
//             {noneSelectedMeansAll ? (
//               <span className="text-xs text-gray-500">All teams</span>
//             ) : (
//               <div className="flex flex-wrap gap-1.5">
//                 {selected.map((t) => (
//                   <span
//                     key={t}
//                     className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
//                   >
//                     {t}
//                     <button
//                       type="button"
//                       onClick={() => toggle(t)}
//                       className="hover:text-gray-600"
//                       title="Remove"
//                     >
//                       ×
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ---------- KPI-style "Selected Teams" card ---------- */
// function SelectedTeamsStatCard({ selectedTeams, onClear }) {
//   const none = selectedTeams.length === 0;

//   return (
//     <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all w-[300px]">
//       {/* same top gradient ribbon as KPI cards */}
//       <div className="pointer-events-none absolute inset-x-0 -top-1 h-1 bg-gradient-to-r from-sky-500/20 to-indigo-500/20" />

//       <div className="flex items-start gap-4">
//         <Icon
//           kind="filter"
//           className="h-10 w-10 rounded-xl bg-gray-50 p-2 text-gray-700 group-hover:scale-105 transition-transform"
//         />

//         <div className="min-w-0 flex-1">
//           <div className="text-sm text-gray-500">Selected Teams</div>

//           {/* Headline mirrors KPI number line */}
//           <div className="mt-1 text-2xl font-bold text-gray-900">
//             {none ? "All teams" : `${selectedTeams.length} selected`}
//           </div>

//           {/* Chips / clear */}
//           <div className="mt-2 flex items-center gap-2">
//             {none ? (
//               <span className="text-xs text-gray-500">No filter</span>
//             ) : (
//               <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
//                 {selectedTeams.map((t) => (
//                   <span
//                     key={t}
//                     title={t}
//                     className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-800 whitespace-nowrap"
//                   >
//                     {t}
//                   </span>
//                 ))}
//               </div>
//             )}

//             {!none && (
//               <button
//                 type="button"
//                 onClick={onClear}
//                 className="ml-auto rounded-lg border px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50"
//               >
//                 Clear
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ---------- Small helpers / presentational bits ---------- */
// function StatCard({ title, value, accent = "from-gray-200 to-gray-100", icon = "dot" }) {
//   return (
//     <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all">
//       <div className={`pointer-events-none absolute inset-x-0 -top-1 h-1 bg-gradient-to-r ${accent}`} />
//       <div className="flex items-center gap-4">
//         <Icon kind={icon} className="h-10 w-10 rounded-xl bg-gray-50 p-2 text-gray-700 group-hover:scale-105 transition-transform" />
//         <div>
//           <div className="text-sm text-gray-500">{title}</div>
//           <div className="mt-1 text-3xl font-bold text-gray-900 tabular-nums">{Number(value ?? 0)}</div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function ChartCard({ title, subtitle, children }) {
//   return (
//     <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
//       <div className="mb-3 flex items-center justify-between">
//         <div>
//           <h3 className="font-semibold text-gray-800">{title}</h3>
//           {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
//         </div>
//       </div>
//       {children}
//     </div>
//   );
// }

// function EmptyState() {
//   return (
//     <div className="h-full w-full grid place-items-center">
//       <div className="text-sm text-gray-400">No data to display</div>
//     </div>
//   );
// }

// function NiceTooltip({ active, payload, label }) {
//   if (!active || !payload || !payload.length) return null;
//   return (
//     <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
//       {label && <div className="mb-1 text-xs font-medium text-gray-500">{label}</div>}
//       {payload.map((p, i) => (
//         <div key={i} className="flex items-center gap-2 text-sm">
//           <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
//           <span className="text-gray-700">{p.name}</span>
//           <span className="ml-2 font-semibold text-gray-900">{p.value}</span>
//         </div>
//       ))}
//     </div>
//   );
// }

// /* SVG icons */
// function Icon({ kind, className }) {
//   switch (kind) {
//     case "users":
//       return (
//         <svg viewBox="0 0 24 24" className={className} fill="currentColor">
//           <path d="M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3s1.34 3 3 3m-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5S5 6.34 5 8s1.34 3 3 3m0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13m8 0c-.29 0-.62.02-.97.05c1.16.84 1.97 1.94 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5Z" />
//         </svg>
//       );
//     case "check":
//       return (
//         <svg viewBox="0 0 24 24" className={className} fill="currentColor">
//           <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
//         </svg>
//       );
//     case "x":
//       return (
//         <svg viewBox="0 0 24 24" className={className} fill="currentColor">
//           <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
//         </svg>
//       );
//     case "clock":
//       return (
//         <svg viewBox="0 0 24 24" className={className} fill="currentColor">
//           <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2m1 11h5v-2h-4V6h-2z" />
//         </svg>
//       );
//     case "filter":
//       return (
//         <svg viewBox="0 0 24 24" className={className} fill="currentColor">
//           <path d="M10 18h4v-2h-4v2m-7-8v2h18v-2H3m3-6v2h12V4H6Z" />
//         </svg>
//       );
//     default:
//       return <span className={className} />;
//   }
// }

// /* Gradients for charts */
// function ChartGradients() {
//   return (
//     <svg width="0" height="0">
//       <defs>
//         <linearGradient id="barGradient" x1="0" x2="0" y1="0" y2="1">
//           <stop offset="0%" stopColor="#8b5cf6" />
//           <stop offset="100%" stopColor="#60a5fa" />
//         </linearGradient>
//         <linearGradient id="lineGreen" x1="0" x2="1">
//           <stop offset="0%" stopColor="#10b981" />
//           <stop offset="100%" stopColor="#34d399" />
//         </linearGradient>
//         <linearGradient id="lineIndigo" x1="0" x2="1">
//           <stop offset="0%" stopColor="#6366f1" />
//           <stop offset="100%" stopColor="#60a5fa" />
//         </linearGradient>
//         <linearGradient id="lineRed" x1="0" x2="1">
//           <stop offset="0%" stopColor="#f43f5e" />
//           <stop offset="100%" stopColor="#fb7185" />
//         </linearGradient>
//       </defs>
//     </svg>
//   );
// }
// src/pages/AdminDashboard.js
import React, { useEffect, useMemo, useState } from "react";
import api from "../utils/axiosInstance";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#8b5cf6", "#06b6d4", "#f43f5e", "#10b981", "#60a5fa", "#f59e0b"];
const LEAVE_COLORS = ["#22c55e", "#f97316"];       // On Leave: green, Not on Leave: orange
const EARLY_OFF_COLORS = ["#f97316", "#0ea5e9"];   // Early Off: orange, Completed: sky blue


// ---- Self-attendance endpoints for ADMIN ----
// axiosInstance baseURL should already include `/api/`
const SELF_BASE = "me/attendance";

const MY_ATTENDANCE_TODAY_URL = `${SELF_BASE}/today/`;
const PRE_NOTIFY_LATE_URL = `${SELF_BASE}/pre-notice/late/`;
const CHECK_IN_URL = `${SELF_BASE}/check-in/`;
const CHECK_OUT_URL = `${SELF_BASE}/check-out/`;

// Team options for the filter (add/remove as needed)
const TEAM_OPTIONS = [
  "TCP",
  "The News",
  "Hungama",
  "Jang",
  "Celeb In Box",
  "Gad Insider",
  "Gossip Herald",
  "Geo",
  "SEO",
  "Data",
  "Social",
];

/* small date helpers */
const fmt = (d) => d.toISOString().slice(0, 10);
const todayStr = () => fmt(new Date());
const daysAgoStr = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return fmt(d);
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // include new fields here too so UI doesn't flash "undefined"
  const [stats, setStats] = useState({
    total_employees: 0,
    present_today: 0,
    absent_today: 0,
    leave_pending: 0,
    // daily (end-date) WFH / Onsite
    wfh_today: 0,
    onsite_today: 0,
    // range-based WFH / Onsite / Leave / Avg hours / Early off
    wfh_range: 0,
    onsite_range: 0,
    leave_in_range: 0,
    avg_work_hours: 0,
    early_off_count: 0,
    trend: [],
    range: { from: "", to: "" },
  });

  // Range (default last 7 days)
  const [from, setFrom] = useState(daysAgoStr(6));
  const [to, setTo] = useState(todayStr());

  // ---- Team filter state: [] means "All"
  const [selectedTeams, setSelectedTeams] = useState([]);

  // ---- Admin self-attendance state ----
  // Example shape:
  // { date: "2025-11-17", check_in: "...", check_out: "...", status: "Present", pre_notified: true }
  const [myToday, setMyToday] = useState(null);
  const [myAttLoading, setMyAttLoading] = useState(false);
  const [myAttErr, setMyAttErr] = useState("");

  // NEW: date for Leave donut (defaults to today, then syncs with rangeTo)
  const [leaveDate, setLeaveDate] = useState(() => todayStr()); // NEW

  const fetchStats = async () => {
    setLoading(true);
    setErr("");
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (selectedTeams.length > 0) params.team = selectedTeams; // sends ?team=A&team=B

      const res = await api.get("dashboard-stats/", { params });
      setStats(res.data || {});
    } catch (e) {
      const msg = e?.response?.data?.detail || "Failed to load dashboard stats";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyToday = async () => {
    setMyAttLoading(true);
    setMyAttErr("");
    try {
      const res = await api.get(MY_ATTENDANCE_TODAY_URL);
      setMyToday(res.data);
    } catch (e) {
      // For admin, backend typically sends PermissionDenied (403) if no Employee profile
      const msg =
        e?.response?.data?.detail ||
        "Could not load your attendance for today.";
      setMyAttErr(msg);
      setMyToday(null);
    } finally {
      setMyAttLoading(false);
    }
  };

  const handleAdminPreNotifyLate = async () => {
    setMyAttLoading(true);
    setMyAttErr("");
    try {
      await api.post(PRE_NOTIFY_LATE_URL, {}); // adjust body if your API expects anything
      await fetchMyToday();
    } catch (e) {
      setMyAttErr(
        e?.response?.data?.detail || "Pre-notify late failed. Please try again."
      );
    } finally {
      setMyAttLoading(false);
    }
  };

  const handleAdminCheckIn = async (mode) => {
    setMyAttLoading(true);
    setMyAttErr("");
    try {
      await api.post(CHECK_IN_URL, { mode }); // mode: "WFH" | "Onsite"
      await Promise.all([fetchMyToday(), fetchStats()]);
    } catch (e) {
      setMyAttErr(
        e?.response?.data?.detail || "Check-in failed. Please try again."
      );
    } finally {
      setMyAttLoading(false);
    }
  };

  const handleAdminCheckOut = async () => {
    setMyAttLoading(true);
    setMyAttErr("");
    try {
      await api.post(CHECK_OUT_URL, {});
      await Promise.all([fetchMyToday(), fetchStats()]);
    } catch (e) {
      setMyAttErr(
        e?.response?.data?.detail || "Check-out failed. Please try again."
      );
    } finally {
      setMyAttLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, JSON.stringify(selectedTeams)]);

  // load admin’s own attendance once on mount
  useEffect(() => {
    fetchMyToday();
  }, []);

  // ---------- Derived KPI numbers (with fallbacks for old backend keys) ----------
  const totalEmployees = Number(stats.total_employees ?? 0);
  const presentToday = Number(stats.present_today ?? 0);
  const absentToday = Number(stats.absent_today ?? 0);
  const leavePending = Number(stats.leave_pending ?? 0);

  const wfhToday = Number(stats.wfh_today ?? stats.wfh ?? 0);
  const onsiteToday = Number(stats.onsite_today ?? stats.onsite ?? 0);

  const wfhRange = Number(stats.wfh_range ?? stats.wfh ?? 0);
  const onsiteRange = Number(stats.onsite_range ?? stats.onsite ?? 0);
  const leaveInRange = Number(stats.leave_in_range ?? stats.leave_today ?? 0);

  const avgWorkHours = Number(stats.avg_work_hours ?? 0);
  const earlyOffCount = Number(stats.early_off_count ?? 0);

  const range = stats.range || {};
  const rangeFrom = range.from || from;
  const rangeTo = range.to || to;

  // NEW: whenever the backend rangeTo changes, sync leaveDate so the donut is in-range
  useEffect(() => {
    if (rangeTo) {
      setLeaveDate((prev) => {
        // if current leaveDate is outside the new range, reset to rangeTo
        if (!prev || prev < rangeFrom || prev > rangeTo) return rangeTo;
        return prev;
      });
    }
  }, [rangeFrom, rangeTo]); // NEW

  // Percentages (based on end date snapshot)
  const pctPresent = totalEmployees
    ? Math.round((presentToday / totalEmployees) * 100)
    : 0;
  const pctAbsent = totalEmployees
    ? Math.round((absentToday / totalEmployees) * 100)
    : 0;
  const pctWfh = totalEmployees
    ? Math.round((wfhToday / totalEmployees) * 100)
    : 0;
  const pctOnsite = totalEmployees
    ? Math.round((onsiteToday / totalEmployees) * 100)
    : 0;

  // Normalize trend → oldest → newest
  const lineData = useMemo(() => {
    const raw = Array.isArray(stats.trend) ? stats.trend : [];
    return raw
      .map((d) => ({
        date: d.date?.slice(5) ?? "",
        Present: Number(d.present ?? 0),
        Leave: Number(d.leave ?? 0),
        Total: Number(d.total ?? 0),
        Absent: Math.max(
          0,
          Number(d.total ?? 0) - Number(d.present ?? 0) - Number(d.leave ?? 0)
        ),
        _iso: d.date,
      }))
      .sort((a, b) => new Date(a._iso) - new Date(b._iso));
  }, [stats.trend]);

  const todayBarData = [
    { name: "Present", value: presentToday },
    { name: "Absent", value: absentToday },
  ];

  // ✅ donut now uses RANGE, not just a single day
  const modePieData = [
    { name: "WFH", value: wfhRange },
    { name: "Onsite", value: onsiteRange },
  ];

  // NEW: Leave vs Not-on-leave donut data (per selected date via trend)
  const leaveDonutData = useMemo(() => {
    const raw = Array.isArray(stats.trend) ? stats.trend : [];
    if (!leaveDate) {
      return [
        { name: "On Leave", value: 0 },
        { name: "Not on Leave", value: 0 },
      ];
    }
    const match = raw.find((d) => d.date === leaveDate);
    if (!match) {
      return [
        { name: "On Leave", value: 0 },
        { name: "Not on Leave", value: 0 },
      ];
    }
    const total = Number(match.total ?? 0);
    const leave = Number(match.leave ?? 0);
    const notLeave = Math.max(0, total - leave);

    return [
      { name: "On Leave", value: leave },
      { name: "Not on Leave", value: notLeave },
    ];
  }, [stats.trend, leaveDate]); // NEW

  // NEW: Early off vs no-early-off donut (based on range & snapshot totalEmployees)
  const earlyOffDonutData = useMemo(() => {
    const early = earlyOffCount;
    const nonEarly = Math.max(0, totalEmployees - early);
    return [
      { name: "Early Off", value: early },
      {
        name: "Completed / Not Early Off",
        value: nonEarly,
      },
    ];
  }, [earlyOffCount, totalEmployees]); // NEW

  const applyRange = (e) => {
    e?.preventDefault?.();
    if (!from || !to) return;
    fetchStats();
  };

  const resetRange = () => {
    const f = daysAgoStr(6);
    const t = todayStr();
    setFrom(f);
    setTo(t);
    setSelectedTeams([]); // also reset teams to All
  };

  const formatAvgHours = (h) => {
    if (!h || Number.isNaN(h)) return "0.0";
    return h.toFixed(1);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white px-6 py-10">
      {/* Header row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">
          Admin Dashboard
        </h1>

        {/* Right-side controls (date + teams + stat-like card) */}
        <div className="flex flex-wrap items-end gap-3">
          {/* Date range */}
          <form onSubmit={applyRange} className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Range:</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm"
            />
            <span className="text-gray-400">—</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm"
            />
            <button
              type="submit"
              className="ml-2 rounded-lg bg-gray-900 text-white px-3 py-1.5 text-sm"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={resetRange}
              className="rounded-lg bg-gray-200 text-gray-800 px-3 py-1.5 text-sm"
            >
              Reset
            </button>
          </form>

          {/* Team filter: dropdown multi-select */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Teams:</label>
            <TeamMultiDropdown
              options={TEAM_OPTIONS}
              selected={selectedTeams}
              onChange={(vals) => setSelectedTeams(vals)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Tip: Search inside the dropdown. “All” = no filter.
            </p>
          </div>

          {/* KPI-style Selected Teams card */}
          <SelectedTeamsStatCard
            selectedTeams={selectedTeams}
            onClear={() => setSelectedTeams([])}
          />
        </div>
      </div>

      {loading && <div className="mt-4">Loading…</div>}
      {err && !loading && (
        <div className="mt-4 mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
          {err}
        </div>
      )}

      {/* Primary KPIs (snapshot on end date) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4 mt-4">
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          accent="from-violet-500/20 to-fuchsia-500/20"
          icon="users"
        />
        <StatCard
          title={`Present (${rangeTo})`}
          value={presentToday}
          accent="from-emerald-500/20 to-teal-500/20"
          icon="check"
        />
        <StatCard
          title={`Absent (${rangeTo})`}
          value={absentToday}
          accent="from-rose-500/20 to-orange-500/20"
          icon="x"
        />
        <StatCard
          title="Leave Pending"
          value={leavePending}
          accent="from-sky-500/20 to-indigo-500/20"
          icon="clock"
        />
      </div>

      {/* Secondary KPIs (range-based + percentages + early off) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={`WFH (${rangeFrom} — ${rangeTo})`}
          value={wfhRange}
          accent="from-indigo-500/20 to-sky-500/20"
          icon="home"
          extra={
            <div className="mt-1 text-xs text-gray-500">
              Today: {wfhToday} employees
            </div>
          }
        />
        <StatCard
          title={`Onsite (${rangeFrom} — ${rangeTo})`}
          value={onsiteRange}
          accent="from-emerald-500/20 to-lime-500/20"
          icon="office"
          extra={
            <div className="mt-1 text-xs text-gray-500">
              Today: {onsiteToday} employees
            </div>
          }
        />
        <StatCard
          title={`On Leave (${rangeFrom} — ${rangeTo})`}
          value={leaveInRange}
          accent="from-amber-500/20 to-orange-500/20"
          icon="leave"
        />
        <StatCard
          title={`Avg Working Hours (${rangeFrom} — ${rangeTo})`}
          value={`${formatAvgHours(avgWorkHours)}h`}
          accent="from-slate-500/20 to-gray-500/20"
          icon="hours"
        />
      </div>

      {/* Third row: percentage split + early offs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Attendance % Split (Today)"
          value={`${pctPresent}% Present`}
          accent="from-blue-500/20 to-indigo-500/20"
          icon="percent"
          extra={
            <div className="mt-1 text-xs text-gray-600 space-y-0.5">
              <div>Absent: {pctAbsent}%</div>
              <div>WFH: {pctWfh}% · Onsite: {pctOnsite}%</div>
            </div>
          }
        />
        <StatCard
          title={`Early Off Count (${rangeFrom} — ${rangeTo})`}
          value={earlyOffCount}
          accent="from-rose-500/20 to-red-500/20"
          icon="earlyoff"
          extra={
            <div className="mt-1 text-xs text-gray-500">
              Short-hours / early-off (range)
            </div>
          }
        />
      </div>

      {/* Admin's own quick attendance card */}
      <div className="mb-8">
        <MyQuickAttendanceCard
          myToday={myToday}
          loading={myAttLoading}
          error={myAttErr}
          onPreNotifyLate={handleAdminPreNotifyLate}
          onCheckInWFH={() => handleAdminCheckIn("WFH")}
          onCheckInOnsite={() => handleAdminCheckIn("Onsite")}
          onCheckOut={handleAdminCheckOut}
          onRefresh={fetchMyToday}
        />
      </div>

      {/* Charts: row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ChartCard
          title={`Attendance on ${rangeTo}`}
          subtitle="Present vs Absent"
        >
          <ChartGradients />
          <div className="h-64">
            {todayBarData.every((d) => d.value === 0) ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={todayBarData} barSize={38}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<NiceTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="value"
                    name="Count"
                    radius={[10, 10, 0, 0]}
                    fill="url(#barGradient)"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard
          title={`WFH vs Onsite (${rangeFrom} — ${rangeTo})`}
          subtitle="Work mode distribution in selected range"
        >
          <div className="h-64">
            {modePieData.every((d) => d.value === 0) ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<NiceTooltip />} />
                  <Legend />
                  <Pie
                    data={modePieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={95}
                    innerRadius={50}
                    paddingAngle={3}
                    label
                  >
                    {modePieData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard
          title="Attendance Trend"
          subtitle={`${rangeFrom} — ${rangeTo}`}
        >
          <ChartGradients />
          <div className="h-64">
            {lineData.length === 0 ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<NiceTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Absent"
                    stroke="url(#lineRed)"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Present"
                    stroke="url(#lineGreen)"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Total"
                    stroke="url(#lineIndigo)"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </div>

      {/* NEW: Charts row 2 – Leave donut + Early off donut */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Leave vs Not-on-leave with its own date filter */}
        <ChartCard
          title="Leave Status"
          subtitle={
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500">
                On-leave vs not-on-leave for selected date
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Date:</span>
                <input
                  type="date"
                  value={leaveDate}
                  min={rangeFrom}
                  max={rangeTo}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  className="border rounded-lg px-2 py-1 text-xs"
                />
              </div>
            </div>
          }
        >
          <div className="h-64">
            {leaveDonutData.every((d) => d.value === 0) ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<NiceTooltip />} />
                  <Legend />
                  <Pie
                    data={leaveDonutData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={95}
                    innerRadius={50}
                    paddingAngle={3}
                    label
                  >
                    {leaveDonutData.map((_, idx) => (
                      <Cell key={idx} fill={LEAVE_COLORS[idx % LEAVE_COLORS.length]} />
                    ))}
                  </Pie>

                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        {/* Early off vs not-early-off in current range */}
        <ChartCard
          title="Early Off vs Completed Shift"
          subtitle={`Range: ${rangeFrom} — ${rangeTo}`}
        >
          <div className="h-64">
            {earlyOffDonutData.every((d) => d.value === 0) ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<NiceTooltip />} />
                  <Legend />
                  <Pie
  data={earlyOffDonutData}
  dataKey="value"
  nameKey="name"
  outerRadius={95}
  innerRadius={50}
  paddingAngle={3}
  label
>
  {earlyOffDonutData.map((_, idx) => (
    <Cell key={idx} fill={EARLY_OFF_COLORS[idx % EARLY_OFF_COLORS.length]} />
  ))}
</Pie>


                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

/* ---------- My Quick Attendance Card ---------- */
function MyQuickAttendanceCard({
  myToday,
  loading,
  error,
  onPreNotifyLate,
  onCheckInWFH,
  onCheckInOnsite,
  onCheckOut,
  onRefresh,
}) {
  const hasCheckIn = !!myToday?.check_in;
  const hasCheckOut = !!myToday?.check_out;
  const preNotified = !!myToday?.pre_notified;

  const canPreNotify = !preNotified && !hasCheckIn;
  const canCheckIn = !hasCheckIn;
  const canCheckOut = hasCheckIn && !hasCheckOut;

  const todayLabel = myToday?.date || todayStr();

  const formatTime = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h2 className="text-base font-semibold text-gray-800">
            My Quick Attendance
          </h2>
          <p className="text-xs text-gray-500">
            Use pre-notice if you’ll be late, then check-in/out (only once each).
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-lg border px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="text-xs text-gray-500 mb-2">
          Loading your attendance…
        </div>
      )}

      {error && !loading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="text-xs text-gray-600 mb-3">
        Today:{" "}
        <span className="font-medium text-gray-800">{todayLabel}</span> ·{" "}
        Check-in:{" "}
        <span className="font-medium text-gray-800">
          {formatTime(myToday?.check_in)}
        </span>{" "}
        · Check-out:{" "}
        <span className="font-medium text-gray-800">
          {formatTime(myToday?.check_out)}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPreNotifyLate}
          disabled={!canPreNotify || loading}
          className={`rounded-md px-4 py-2 text-xs font-medium text-white ${
            canPreNotify && !loading
              ? "bg-amber-600 hover:bg-amber-700"
              : "bg-amber-300 cursor-not-allowed"
          }`}
        >
          Pre-notify Late
        </button>

        <button
          type="button"
          onClick={onCheckInWFH}
          disabled={!canCheckIn || loading}
          className={`rounded-md px-4 py-2 text-xs font-medium text-white ${
            canCheckIn && !loading
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "bg-indigo-300 cursor-not-allowed"
          }`}
        >
          Check-in (WFH)
        </button>

        <button
          type="button"
          onClick={onCheckInOnsite}
          disabled={!canCheckIn || loading}
          className={`rounded-md px-4 py-2 text-xs font-medium text-white ${
            canCheckIn && !loading
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-emerald-300 cursor-not-allowed"
          }`}
        >
          Check-in (Onsite)
        </button>

        <button
          type="button"
          onClick={onCheckOut}
          disabled={!canCheckOut || loading}
          className={`rounded-md px-4 py-2 text-xs font-medium text-white ${
            canCheckOut && !loading
              ? "bg-gray-600 hover:bg-gray-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Check-out
        </button>
      </div>
    </div>
  );
}

/* ---------- Team dropdown (multi-select with search/All) ---------- */
function TeamMultiDropdown({ options = [], selected = [], onChange }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const ref = React.useRef(null);

  const normalized = options.map((o) => ({ label: o, value: o }));
  const filtered = query
    ? normalized.filter((o) =>
        o.label.toLowerCase().includes(query.trim().toLowerCase())
      )
    : normalized;

  const noneSelectedMeansAll = selected.length === 0;

  const toggle = (val) => {
    if (selected.includes(val)) {
      const next = selected.filter((v) => v !== val);
      onChange(next); // empty => All
    } else {
      const next = [...selected, val];
      onChange(next);
    }
  };

  const selectAll = () => onChange([]);
  const selectFiltered = () =>
    onChange(
      Array.from(new Set([...selected, ...filtered.map((f) => f.value)]))
    );
  const clearFiltered = () =>
    onChange(selected.filter((v) => !filtered.some((f) => f.value === v)));

  // click outside to close
  React.useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const buttonLabel = noneSelectedMeansAll
    ? "All teams"
    : `${selected.length} selected`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-[260px] rounded-lg border px-3 py-2 text-sm bg-white text-gray-800 flex items-center justify-between"
      >
        <span className="truncate">{buttonLabel}</span>
        <svg
          className={`h-4 w-4 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-[320px] rounded-xl border border-gray-200 bg-white shadow-lg">
          {/* Top controls */}
          <div className="p-2 border-b border-gray-100 flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search teams…"
              className="flex-1 rounded-md border px-2 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={selectAll}
              className="rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
              title="All = no filter"
            >
              All
            </button>
          </div>

          {/* Bulk actions on filtered set */}
          <div className="px-2 pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={selectFiltered}
              className="rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
              title="Add all matching the search"
            >
              Add filtered
            </button>
            <button
              type="button"
              onClick={clearFiltered}
              className="rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
              title="Remove all matching the search"
            >
              Remove filtered
            </button>
            {!noneSelectedMeansAll && (
              <button
                type="button"
                onClick={selectAll}
                className="ml-auto rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-56 overflow-auto p-2 space-y-1">
            {/* All pseudo-option at top */}
            <label className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                className="rounded"
                checked={noneSelectedMeansAll}
                onChange={selectAll}
              />
              <span className="text-sm text-gray-800">All (no filter)</span>
            </label>

            <div className="h-px bg-gray-100 my-1" />

            {filtered.length === 0 ? (
              <div className="text-xs text-gray-400 px-2 py-1">No matches</div>
            ) : (
              filtered.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={selected.includes(opt.value)}
                    onChange={() => toggle(opt.value)}
                  />
                  <span className="text-sm text-gray-800">{opt.label}</span>
                </label>
              ))
            )}
          </div>

          {/* Footer: selected chips */}
          <div className="border-t border-gray-100 p-2">
            {noneSelectedMeansAll ? (
              <span className="text-xs text-gray-500">All teams</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {selected.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => toggle(t)}
                      className="hover:text-gray-600"
                      title="Remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- KPI-style "Selected Teams" card ---------- */
function SelectedTeamsStatCard({ selectedTeams, onClear }) {
  const none = selectedTeams.length === 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all w-[300px]">
      {/* same top gradient ribbon as KPI cards */}
      <div className="pointer-events-none absolute inset-x-0 -top-1 h-1 bg-gradient-to-r from-sky-500/20 to-indigo-500/20" />

      <div className="flex items-start gap-4">
        <Icon
          kind="filter"
          className="h-10 w-10 rounded-xl bg-gray-50 p-2 text-gray-700 group-hover:scale-105 transition-transform"
        />

        <div className="min-w-0 flex-1">
          <div className="text-sm text-gray-500">Selected Teams</div>

          {/* Headline mirrors KPI number line */}
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {none ? "All teams" : `${selectedTeams.length} selected`}
          </div>

          {/* Chips / clear */}
          <div className="mt-2 flex items-center gap-2">
            {none ? (
              <span className="text-xs text-gray-500">No filter</span>
            ) : (
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {selectedTeams.map((t) => (
                  <span
                    key={t}
                    title={t}
                    className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-800 whitespace-nowrap"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {!none && (
              <button
                type="button"
                onClick={onClear}
                className="ml-auto rounded-lg border px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small helpers / presentational bits ---------- */
function StatCard({
  title,
  value,
  accent = "from-gray-200 to-gray-100",
  icon = "dot",
  extra,
}) {
  const renderValue =
    typeof value === "number"
      ? Number.isNaN(value)
        ? 0
        : value
      : value ?? "";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all">
      <div
        className={`pointer-events-none absolute inset-x-0 -top-1 h-1 bg-gradient-to-r ${accent}`}
      />
      <div className="flex items-center gap-4">
        <Icon
          kind={icon}
          className="h-10 w-10 rounded-xl bg-gray-50 p-2 text-gray-700 group-hover:scale-105 transition-transform"
        />
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="mt-1 text-3xl font-bold text-gray-900 tabular-nums">
            {renderValue}
          </div>
          {extra}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          {subtitle && (
            <div className="mt-0.5 text-sm text-gray-500">{subtitle}</div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full w-full grid place-items-center">
      <div className="text-sm text-gray-400">No data to display</div>
    </div>
  );
}

function NiceTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
      {label && (
        <div className="mb-1 text-xs font-medium text-gray-500">{label}</div>
      )}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-gray-700">{p.name}</span>
          <span className="ml-2 font-semibold text-gray-900">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* SVG icons */
function Icon({ kind, className }) {
  switch (kind) {
    case "users":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3s1.34 3 3 3m-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5S5 6.34 5 8s1.34 3 3 3m0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13m8 0c-.29 0-.62.02-.97.05c1.16.84 1.97 1.94 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5Z" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      );
    case "clock":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2m1 11h5v-2h-4V6h-2z" />
        </svg>
      );
    case "filter":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M10 18h4v-2h-4v2m-7-8v2h18v-2H3m3-6v2h12V4H6Z" />
        </svg>
      );
    case "home": // WFH
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="m12 3 9 8h-2v9h-5v-6H10v6H5v-9H3Z" />
        </svg>
      );
    case "office": // Onsite
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M4 3h10v6h6v12H4V3m2 2v14h12v-8h-4v-6H6Z" />
        </svg>
      );
    case "leave":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M7 2a1 1 0 0 0-1 1v3H3v2h3v3h2V8h3V6H8V3a1 1 0 0 0-1-1m5 6v2h3v3h2v-3h3V8h-3V5h-2v3Z" />
          <path d="M5 14h14v6H5z" />
        </svg>
      );
    case "hours":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M12 1a11 11 0 1 0 11 11A11.013 11.013 0 0 0 12 1m1 6h-2v6h6v-2h-4Z" />
        </svg>
      );
    case "percent":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M7 7a3 3 0 1 1 3-3a3 3 0 0 1-3 3m10 13a3 3 0 1 1 3-3a3 3 0 0 1-3 3M6 20L18 4" />
        </svg>
      );
    case "earlyoff":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M12 1a9 9 0 0 0-9 9h2a7 7 0 1 1 7 7v-3l-4 4 4 4v-3a9 9 0 0 0 0-18Z" />
        </svg>
      );
    default:
      return <span className={className} />;
  }
}

/* Gradients for charts */
function ChartGradients() {
  return (
    <svg width="0" height="0">
      <defs>
        <linearGradient id="barGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
        <linearGradient id="lineGreen" x1="0" x2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="lineIndigo" x1="0" x2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
        <linearGradient id="lineRed" x1="0" x2="1">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#fb7185" />
        </linearGradient>
      </defs>
    </svg>
  );
}



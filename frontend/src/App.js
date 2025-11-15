// // // src/App.js
// // import React, { useEffect, useState } from "react";
// // import {
// //   BrowserRouter,
// //   Routes,
// //   Route,
// //   Navigate,
// //   useLocation,
// //   useNavigate,
// // } from "react-router-dom";

// // // Pages & components
// // import Login from "./components/login";
// // import BubbleBackground from "./components/BubbleBackground";
// // import Sidebar from "./components/Sidebar";               // Admin sidebar
// // import EmployeeSidebar from "./components/EmployeeSidebar"; // Employee sidebar
// // import EarlyOff from "./pages/EarlyOff";
// // // import Settings from "./pages/Settings";

// // import AdminDashboard from "./pages/AdminDashboard";
// // import EmployeeList from "./pages/Employees";
// // import AddEmployee from "./pages/AddEmployee";
// // import Attendance from "./pages/Attendance";
// // import LeaveRequests from "./pages/LeaveRequests";
// // import Settings from "./pages/Settings";
// // import AdminTimeCorrections from "./pages/AdminTimeCorrections";

// // import EmployeeDashboard from "./pages/EmployeeDashboard";
// // import MarkAttendance from "./pages/MarkAttendance";
// // import MyAttendance from "./pages/MyAttendance";
// // import EmployeeLeaves from "./pages/EmployeeLeaves";
// // import AdminEarlyOff from "./pages/AdminEarlyOff";
// // // Toasts
// // import { ToastContainer, toast } from "react-toastify";
// // import "react-toastify/dist/ReactToastify.css";

// // // ---------- Footer ----------
// // function Footer() {
// //   return (
// //     <footer className="mt-8 border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
// //       © {new Date().getFullYear()} All Rights Reserved —{"  "}
// //       <span className="font-semibold text-gray-700">Data Analyst Team</span>
// //       {/* or: Repaired & Enhanced by Your Name */}
// //     </footer>
// //   );
// // }

// // // ---------- Layouts ----------
// // const AdminLayout = ({ children }) => (
// //   <div className="flex">
// //     <Sidebar />
// //     <div className="flex-1 ml-64 bg-gray-100 min-h-screen p-6">
// //       {children}
// //       <Footer />
// //     </div>
// //   </div>
// // );

// // const EmployeeLayout = ({ children }) => (
// //   <div className="flex">
// //     <EmployeeSidebar />
// //     <div className="flex-1 ml-64 bg-gray-100 min-h-screen p-6">
// //       {children}
// //       <Footer />
// //     </div>
// //   </div>
// // );

// // // ---------- App Wrapper with routing guards ----------
// // function AppWrapper() {
// //   const location = useLocation();
// //   const navigate = useNavigate();

// //   const [isLoggedIn, setIsLoggedIn] = useState(
// //     Boolean(localStorage.getItem("access"))
// //   );
// //   const [role, setRole] = useState(localStorage.getItem("role") || null);

// //   useEffect(() => {
// //     const token = localStorage.getItem("access");
// //     setIsLoggedIn(Boolean(token));
// //     setRole(token ? localStorage.getItem("role") : null);
// //   }, []);

// //   // Redirect this tab if user logs out in another tab + show toast
// //   useEffect(() => {
// //     const onStorage = (e) => {
// //       if (e.key === "access" && !e.newValue) {
// //         toast.info("You’ve been logged out.");
// //         navigate("/login", { replace: true });
// //       }
// //     };
// //     window.addEventListener("storage", onStorage);
// //     return () => window.removeEventListener("storage", onStorage);
// //   }, [navigate]);

// //   // Guarded route
// //   const ProtectedRoute = ({ element, roleRequired }) => {
// //     const token = localStorage.getItem("access");
// //     const currentRole = localStorage.getItem("role");

// //     if (!token) return <Navigate to="/login" replace />;

// //     if (roleRequired && currentRole !== roleRequired) {
// //       if (currentRole === "admin") return <Navigate to="/admin-dashboard" replace />;
// //       if (currentRole === "employee") return <Navigate to="/employee-dashboard" replace />;
// //       return <Navigate to="/login" replace />;
// //     }

// //     return element;
// //   };

// //   const showBubbles = location.pathname === "/login";

// //   return (
// //     <>
// //       {showBubbles && <BubbleBackground />}

// //       <Routes>
// //         {/* Default redirect */}
// //         <Route path="/" element={<Navigate to="/login" replace />} />

// //         {/* Login */}
// //         <Route
// //           path="/login"
// //           element={
// //             <Login
// //               onLogin={() => {
// //                 const r = localStorage.getItem("role");
// //                 setIsLoggedIn(true);
// //                 setRole(r);
// //                 if (r === "admin") navigate("/admin-dashboard", { replace: true });
// //                 else if (r === "employee") navigate("/employee-dashboard", { replace: true });
// //                 else navigate("/login", { replace: true });
// //               }}
// //             />
// //           }
// //         />

// //         {/* ---------- Admin routes ---------- */}
// //         <Route
// //           path="/admin-dashboard"
// //           element={
// //             <ProtectedRoute
// //               roleRequired="admin"
// //               element={
// //                 <AdminLayout>
// //                   <AdminDashboard />
// //                 </AdminLayout>
// //               }
// //             />
// //           }
// //         />
// //         <Route
// //           path="/admin/employees"
// //           element={
// //             <ProtectedRoute
// //               roleRequired="admin"
// //               element={
// //                 <AdminLayout>
// //                   <EmployeeList />
// //                 </AdminLayout>
// //               }
// //             />
// //           }
// //         />
// //         <Route path="/me/early-off" element={<EarlyOff />} />
// //         <Route
// //           path="/admin/add-employee"
// //           element={
// //             <ProtectedRoute
// //               roleRequired="admin"
// //               element={
// //                 <AdminLayout>
// //                   <AddEmployee />
// //                 </AdminLayout>
// //               }
// //             />
// //           }
// //         />
// //         <Route 
// //           path="/admin/earlyoff" 
// //           element={
// //             <ProtectedRoute
// //               roleRequired="admin"
// //               element={
// //                 <AdminLayout>
// //                   <AdminEarlyOff />
// //                 </AdminLayout>
// //               }
// //             />
// //           } 
// //         />
// //         <Route path="/admin/earlyoff" element={
// //             <AdminEarlyOff />} />
// //         <Route
// //           path="/admin/attendance"
// //           element={
// //             <ProtectedRoute
// //               roleRequired="admin"
// //               element={
// //                 <AdminLayout>
// //                   <Attendance />
// //                 </AdminLayout>
// //               }
// //             />
// //           }
// //         />
// //         <Route 
// //           path="/admin/time-corrections" 
// //           element={
// //             <ProtectedRoute
// //                 roleRequired="admin"
// //                 element={
// //                   <AdminLayout>
// //                     <AdminTimeCorrections />
// //                   </AdminLayout>
// //                 }
// //               />
// //                 }
// //         />
// //         <Route
// //           path="/admin/leave-requests"
// //           element={
// //             <ProtectedRoute
// //               roleRequired="admin"
// //               element={
// //                 <AdminLayout>
// //                   <LeaveRequests />
// //                 </AdminLayout>
// //               }
// //             />
// //           }
// //         />
// //         <Route
// //           path="/admin/settings"
// //           element={
// //             <ProtectedRoute
// //               roleRequired="admin"
// //               element={
// //                 <AdminLayout>
// //                   <Settings />
// //                 </AdminLayout>
// //               }
// //             />
// //           }
// //         />

// //         {/* ---------- Employee routes ---------- */}
// //         <Route
// //           path="/employee-dashboard"
// //           element={
// //             <ProtectedRoute
// //               roleRequired="employee"
// //               element={
// //                 <EmployeeLayout>
// //                   <EmployeeDashboard />
// //                 </EmployeeLayout>
// //               }
// //             />
// //           }
// //         />
// //         <Route
// //           path="/employee/mark"
// //           element={
// //             <ProtectedRoute
// //               roleRequired="employee"
// //               element={
// //                 <EmployeeLayout>
// //                   <MarkAttendance />
// //                 </EmployeeLayout>
// //               }
// //             />
// //           }
// //         />
// //         <Route
// //           path="/employee/attendance"
// //           element={
// //             <ProtectedRoute
// //               roleRequired="employee"
// //               element={
// //                 <EmployeeLayout>
// //                   <MyAttendance />
// //                 </EmployeeLayout>
// //               }
// //             />
// //           }
// //         />
// //         <Route
// //           path="/employee/leaves"
// //           element={
// //             <ProtectedRoute
// //               roleRequired="employee"
// //               element={
// //                 <EmployeeLayout>
// //                   <EmployeeLeaves />
// //                 </EmployeeLayout>
// //               }
// //             />
// //           }
// //         />
// //         <Route
// //           path="/policy"
// //           element={
// //             <ProtectedRoute
// //               roleRequired="employee"
// //               element={
// //                 <EmployeeLayout>
// //                   <Settings />
// //                 </EmployeeLayout>
// //               }
// //             />
// //           }
// //         />
  
// //         <Route
// //           path="/employee/early-off"
// //           element={
// //             <ProtectedRoute
// //               roleRequired="employee"
// //               element={
// //                 <EmployeeLayout>
// //                   <EarlyOff />
// //                 </EmployeeLayout>
// //               }
// //             />
// //           }
// //         />        {/* Fallback */}
// //         <Route path="*" element={<Navigate to="/login" replace />} />
// //       </Routes>
// //     </>
// //   );
// // }

// // // ---------- App Root ----------
// // export default function App() {
// //   return (
// //     <BrowserRouter>
// //       <AppWrapper />
// //       {/* ✅ Global toast portal */}
// //       <ToastContainer position="top-right" theme="colored" newestOnTop />
// //     </BrowserRouter>
// //   );
// // }

// // src/App.js
// import React, { useEffect, useState } from "react";
// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
//   useLocation,
//   useNavigate,
// } from "react-router-dom";

// // Auth / shared
// import Login from "./components/login";
// import BubbleBackground from "./components/BubbleBackground";

// // Layout sidebars
// import Sidebar from "./components/Sidebar";                 // Admin sidebar
// import LeadSidebar from "./components/LeadSidebar";         // Lead sidebar
// import EmployeeSidebar from "./components/EmployeeSidebar";  // Employee sidebar

// // Admin pages
// import AdminDashboard from "./pages/AdminDashboard";
// import EmployeeList from "./pages/Employees";
// import AddEmployee from "./pages/AddEmployee";
// import Attendance from "./pages/Attendance";
// import LeaveRequests from "./pages/LeaveRequests";
// import Settings from "./pages/Settings";
// import AdminTimeCorrections from "./pages/AdminTimeCorrections";
// import AdminEarlyOff from "./pages/AdminEarlyOff";

// // Employee pages
// import EmployeeDashboard from "./pages/EmployeeDashboard";
// import MarkAttendance from "./pages/MarkAttendance";
// import MyAttendance from "./pages/MyAttendance";
// import EmployeeLeaves from "./pages/EmployeeLeaves";
// import EarlyOff from "./pages/EarlyOff";

// // Lead pages
// import LeadDashboard from "./pages/LeadDashboard";
// import LeadEmployeeList from "./pages/LeadEmployeeList";
// import LeadAddEmployee from "./pages/LeadAddEmployee";
// import LeadEarlyOff from "./pages/LeadEarlyOff";
// import LeadLeaveRequest from "./pages/LeadLeaveRequest";
// import LeadTimeCorrections from "./pages/LeadTimeCorrections";

// // Toasts
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// /* ---------------- Footer ---------------- */
// function Footer() {
//   return (
//     <footer className="mt-8 border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
//       © {new Date().getFullYear()} All Rights Reserved —{" "}
//       <span className="font-semibold text-gray-700">Data Team</span>
//     </footer>
//   );
// }

// /* ---------------- Layouts ---------------- */
// const AdminShell = ({ children }) => (
//   <div className="flex">
//     <Sidebar />
//     <div className="flex-1 ml-64 bg-gray-100 min-h-screen p-6">
//       {children}
//       <Footer />
//     </div>
//   </div>
// );

// const LeadShell = ({ children }) => (
//   <div className="flex">
//     <LeadSidebar />
//     <div className="flex-1 ml-64 bg-gray-100 min-h-screen p-6">
//       {children}
//       <Footer />
//     </div>
//   </div>
// );

// const EmployeeLayout = ({ children }) => (
//   <div className="flex">
//     <EmployeeSidebar />
//     <div className="flex-1 ml-64 bg-gray-100 min-h-screen p-6">
//       {children}
//       <Footer />
//     </div>
//   </div>
// );

// /* ---------------- Helpers ---------------- */
// const homeFor = (role) =>
//   role === "admin" ? "/admin-dashboard" :
//   role === "lead"  ? "/lead-dashboard"  :
//   role === "employee" ? "/employee-dashboard" :
//   "/login";

// /* ---------------- App Wrapper w/ Guards ---------------- */
// function AppWrapper() {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [, setIsLoggedIn] = useState(Boolean(localStorage.getItem("access")));
//   const [, setRole] = useState(localStorage.getItem("role") || null);

//   useEffect(() => {
//     const token = localStorage.getItem("access");
//     setIsLoggedIn(Boolean(token));
//     setRole(token ? localStorage.getItem("role") : null);
//   }, []);

//   // cross-tab logout
//   useEffect(() => {
//     const onStorage = (e) => {
//       if (e.key === "access" && !e.newValue) {
//         toast.info("You’ve been logged out.");
//         navigate("/login", { replace: true });
//       }
//     };
//     window.addEventListener("storage", onStorage);
//     return () => window.removeEventListener("storage", onStorage);
//   }, [navigate]);

//   // Generic guard: allow is an array of roles
//   const ProtectedRoute = ({ element, allow }) => {
//     const token = localStorage.getItem("access");
//     const r = localStorage.getItem("role");
//     if (!token) return <Navigate to="/login" replace />;
//     if (Array.isArray(allow) && !allow.includes(r)) {
//       return <Navigate to={homeFor(r)} replace />;
//     }
//     return element;
//   };

//   const showBubbles = location.pathname === "/login";

//   return (
//     <>
//       {showBubbles && <BubbleBackground />}

//       <Routes>
//         {/* Default redirect (role-aware) */}
//         <Route
//           path="/"
//           element={<Navigate to={homeFor(localStorage.getItem("role"))} replace />}
//         />

//         {/* Login */}
//         <Route
//           path="/login"
//           element={
//             <Login
//               onLogin={() => {
//                 const r = localStorage.getItem("role");
//                 setIsLoggedIn(true);
//                 setRole(r);
//                 navigate(homeFor(r), { replace: true });
//               }}
//             />
//           }
//         />

//         {/* ---------- ADMIN ---------- */}
//         <Route
//           path="/admin-dashboard"
//           element={<ProtectedRoute allow={["admin"]} element={<AdminShell><AdminDashboard /></AdminShell>} />}
//         />
//         <Route
//           path="/admin/employees"
//           element={<ProtectedRoute allow={["admin"]} element={<AdminShell><EmployeeList /></AdminShell>} />}
//         />
//         <Route
//           path="/admin/add-employee"
//           element={<ProtectedRoute allow={["admin"]} element={<AdminShell><AddEmployee /></AdminShell>} />}
//         />
//         <Route
//           path="/admin/attendance"
//           element={<ProtectedRoute allow={["admin"]} element={<AdminShell><Attendance /></AdminShell>} />}
//         />
//         <Route
//           path="/admin/leave-requests"
//           element={<ProtectedRoute allow={["admin"]} element={<AdminShell><LeaveRequests /></AdminShell>} />}
//         />
//         <Route
//           path="/admin/time-corrections"
//           element={<ProtectedRoute allow={["admin"]} element={<AdminShell><AdminTimeCorrections /></AdminShell>} />}
//         />
//         <Route
//           path="/admin/earlyoff"
//           element={<ProtectedRoute allow={["admin"]} element={<AdminShell><AdminEarlyOff /></AdminShell>} />}
//         />
//         <Route
//           path="/admin/settings"
//           element={<ProtectedRoute allow={["admin"]} element={<AdminShell><Settings /></AdminShell>} />}
//         />

//         {/* ---------- EMPLOYEE ---------- */}
//         <Route
//           path="/employee-dashboard"
//           element={<ProtectedRoute allow={["employee"]} element={<EmployeeLayout><EmployeeDashboard /></EmployeeLayout>} />}
//         />
//         <Route
//           path="/employee/mark"
//           element={<ProtectedRoute allow={["employee"]} element={<EmployeeLayout><MarkAttendance /></EmployeeLayout>} />}
//         />
//         <Route
//           path="/employee/attendance"
//           element={<ProtectedRoute allow={["employee"]} element={<EmployeeLayout><MyAttendance /></EmployeeLayout>} />}
//         />
//         <Route
//           path="/employee/leaves"
//           element={<ProtectedRoute allow={["employee"]} element={<EmployeeLayout><EmployeeLeaves /></EmployeeLayout>} />}
//         />
//         <Route
//           path="/employee/early-off"
//           element={<ProtectedRoute allow={["employee"]} element={<EmployeeLayout><EarlyOff /></EmployeeLayout>} />}
//         />
//         <Route
//           path="/policy"
//           element={<ProtectedRoute allow={["employee"]} element={<EmployeeLayout><Settings /></EmployeeLayout>} />}
//         />

//         {/* ---------- LEAD ---------- */}
//         <Route
//           path="/lead-dashboard"
//           element={<ProtectedRoute allow={["lead"]} element={<LeadShell><LeadDashboard /></LeadShell>} />}
//         />
//         <Route
//           path="/lead/employees"
//           element={<ProtectedRoute allow={["lead"]} element={<LeadShell><LeadEmployeeList /></LeadShell>} />}
//         />
//         <Route
//           path="/lead/add-employee"
//           element={<ProtectedRoute allow={["lead"]} element={<LeadShell><LeadAddEmployee /></LeadShell>} />}
//         />
//         <Route
//           path="/lead/early-off"
//           element={<ProtectedRoute allow={["lead"]} element={<LeadShell><LeadEarlyOff /></LeadShell>} />}
//         />
//         <Route
//           path="/lead/leave-requests"
//           element={<ProtectedRoute allow={["lead"]} element={<LeadShell><LeadLeaveRequest /></LeadShell>} />}
//         />
//         <Route
//           path="/lead/time-corrections"
//           element={<ProtectedRoute allow={["lead"]} element={<LeadShell><LeadTimeCorrections /></LeadShell>} />}
//         />

//         {/* Fallback */}
//         <Route path="*" element={<Navigate to={homeFor(localStorage.getItem("role"))} replace />} />
//       </Routes>
//     </>
//   );
// }

// /* ---------------- App Root ---------------- */
// export default function App() {
//   return (
//     <BrowserRouter>
//       <AppWrapper />
//       <ToastContainer position="top-right" theme="colored" newestOnTop />
//     </BrowserRouter>
//   );
// }

// src/App.js
import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

// Auth / shared
import Login from "./components/login";
import BubbleBackground from "./components/BubbleBackground";

// Layout sidebars
import Sidebar from "./components/Sidebar";                 // Admin sidebar
import LeadSidebar from "./components/LeadSidebar";         // Lead sidebar
import EmployeeSidebar from "./components/EmployeeSidebar"; // Employee sidebar

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeList from "./pages/Employees";
import AddEmployee from "./pages/AddEmployee";
import Attendance from "./pages/Attendance";
import LeaveRequests from "./pages/LeaveRequests";
import Settings from "./pages/Settings";
import AdminTimeCorrections from "./pages/AdminTimeCorrections";
import AdminEarlyOff from "./pages/AdminEarlyOff";

// Employee pages
import EmployeeDashboard from "./pages/EmployeeDashboard";
import MarkAttendance from "./pages/MarkAttendance";
import MyAttendance from "./pages/MyAttendance";
import EmployeeLeaves from "./pages/EmployeeLeaves";
import EarlyOff from "./pages/EarlyOff";

// Lead pages
import LeadDashboard from "./pages/LeadDashboard";
import LeadEmployeeList from "./pages/LeadEmployeeList";
import LeadAddEmployee from "./pages/LeadAddEmployee";
import LeadEarlyOff from "./pages/LeadEarlyOff";
import LeadLeaveRequest from "./pages/LeadLeaveRequest";
import LeadTimeCorrections from "./pages/LeadTimeCorrections";

// Lead self-service pages
import LeadMyAttendance from "./pages/MyAttendance"; // or "./pages/LeadMyAttendance"
import LeadMyLeaves from "./pages/LeadMyLeaves";

// Toasts
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


/* ---------------- Footer ---------------- */
function Footer() {
  return (
    <footer className="mt-8 border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
      © {new Date().getFullYear()} All Rights Reserved —{" "}
      <span className="font-semibold text-gray-700">
        Malik Farooq Jr. Data Analyst
      </span>
    </footer>
  );
}

/* ---------------- Layouts ---------------- */
const AdminShell = ({ children }) => (
  <div className="flex">
    <Sidebar />
    <div className="flex-1 ml-64 bg-gray-100 min-h-screen p-6">
      {children}
      <Footer />
    </div>
  </div>
);

const LeadShell = ({ children }) => (
  
 <div className="flex">
    <LeadSidebar />
    <div className="flex-1 ml-64 bg-gray-100 min-h-screen p-6">
      {children}
      <Footer />
    </div>
  </div>
);




const EmployeeLayout = ({ children }) => (
  <div className="flex">

    <EmployeeSidebar />
    <div className="flex-1 ml-64 bg-gray-100 min-h-screen p-6">
      {children}
      <Footer />
    </div>
  </div>
);

/* ---------------- Helpers ---------------- */
const homeFor = (role) =>
  role === "admin"
    ? "/admin-dashboard"
    : role === "lead"
    ? "/lead-dashboard"
    : role === "employee"
    ? "/employee-dashboard"
    : "/login";

/* ---------------- App Wrapper w/ Guards ---------------- */
function AppWrapper() {
  const location = useLocation();
  const navigate = useNavigate();

  const [, setIsLoggedIn] = useState(Boolean(localStorage.getItem("access")));
  const [, setRole] = useState(localStorage.getItem("role") || null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    setIsLoggedIn(Boolean(token));
    setRole(token ? localStorage.getItem("role") : null);
  }, []);

  // cross-tab logout
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "access" && !e.newValue) {
        toast.info("You’ve been logged out.");
        navigate("/login", { replace: true });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [navigate]);

  // Generic guard: allow is an array of roles
  const ProtectedRoute = ({ element, allow }) => {
    const token = localStorage.getItem("access");
    const r = localStorage.getItem("role");
    if (!token) return <Navigate to="/login" replace />;
    if (Array.isArray(allow) && !allow.includes(r)) {
      return <Navigate to={homeFor(r)} replace />;
    }
    return element;
  };

  const showBubbles = location.pathname === "/login";

  return (
    <>
      {showBubbles && <BubbleBackground />}

      <Routes>
        {/* Default redirect (role-aware) */}
        <Route
          path="/"
          element={
            <Navigate to={homeFor(localStorage.getItem("role"))} replace />
          }
        />

        {/* Login */}
        <Route
          path="/login"
          element={
            <Login
              onLogin={() => {
                const r = localStorage.getItem("role");
                setIsLoggedIn(true);
                setRole(r);
                navigate(homeFor(r), { replace: true });
              }}
            />
          }
        />

        {/* ---------- ADMIN ---------- */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute
              allow={["admin"]}
              element={<AdminShell><AdminDashboard /></AdminShell>}
            />
          }
        />
        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute
              allow={["admin"]}
              element={<AdminShell><EmployeeList /></AdminShell>}
            />
          }
        />
        <Route
          path="/admin/add-employee"
          element={
            <ProtectedRoute
              allow={["admin"]}
              element={<AdminShell><AddEmployee /></AdminShell>}
            />
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute
              allow={["admin"]}
              element={<AdminShell><Attendance /></AdminShell>}
            />
          }
        />
        <Route
          path="/admin/leave-requests"
          element={
            <ProtectedRoute
              allow={["admin"]}
              element={<AdminShell><LeaveRequests /></AdminShell>}
            />
          }
        />
        <Route
          path="/admin/time-corrections"
          element={
            <ProtectedRoute
              allow={["admin"]}
              element={<AdminShell><AdminTimeCorrections /></AdminShell>}
            />
          }
        />
        <Route
          path="/admin/earlyoff"
          element={
            <ProtectedRoute
              allow={["admin"]}
              element={<AdminShell><AdminEarlyOff /></AdminShell>}
            />
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute
              allow={["admin"]}
              element={<AdminShell><Settings /></AdminShell>}
            />
          }
        />

        {/* ---------- EMPLOYEE ---------- */}
        <Route
          path="/employee-dashboard"
          element={
            <ProtectedRoute
              allow={["employee"]}
              element={
                <EmployeeLayout>
                  <EmployeeDashboard />
                </EmployeeLayout>
              }
            />
          }
        />
        <Route
          path="/employee/mark"
          element={
            <ProtectedRoute
              allow={["employee"]}
              element={
                <EmployeeLayout>
                  <MarkAttendance />
                </EmployeeLayout>
              }
            />
          }
        />
        <Route
          path="/employee/attendance"
          element={
            <ProtectedRoute
              allow={["employee"]}
              element={
                <EmployeeLayout>
                  <MyAttendance />
                </EmployeeLayout>
              }
            />
          }
        />
        <Route
          path="/employee/leaves"
          element={
            <ProtectedRoute
              allow={["employee"]}
              element={
                <EmployeeLayout>
                  <EmployeeLeaves />
                </EmployeeLayout>
              }
            />
          }
        />
        <Route
          path="/employee/early-off"
          element={
            <ProtectedRoute
              allow={["employee"]}
              element={
                <EmployeeLayout>
                  <EarlyOff />
                </EmployeeLayout>
              }
            />
          }
        />
        <Route
          path="/policy"
          element={
            <ProtectedRoute
              allow={["employee"]}
              element={
                <EmployeeLayout>
                  <Settings />
                </EmployeeLayout>
              }
            />
          }
        />

        {/* ---------- LEAD ---------- */}
        <Route
          path="/lead-dashboard"
          element={
            <ProtectedRoute
              allow={["lead"]}
              element={<LeadShell><LeadDashboard /></LeadShell>}
            />
          }
        />
        <Route
          path="/lead/employees"
          element={
            <ProtectedRoute
              allow={["lead"]}
              element={<LeadShell><LeadEmployeeList /></LeadShell>}
            />
          }
        />
        <Route
          path="/lead/add-employee"
          element={
            <ProtectedRoute
              allow={["lead"]}
              element={<LeadShell><LeadAddEmployee /></LeadShell>}
            />
          }
        />

        {/* ✅ Lead self-service early-off */}
        <Route
          path="/lead/my-early-off"
          element={
            <ProtectedRoute
              allow={["lead"]}
              element={<LeadShell><EarlyOff /></LeadShell>}
            />
          }
        />

        {/* ✅ Lead early-off approvals list */}
        <Route
          path="/lead/early-off-requests"
          element={
            <ProtectedRoute
              allow={["lead"]}
              element={<LeadShell><LeadEarlyOff /></LeadShell>}
            />
          }
        />

        <Route
          path="/lead/leave-requests"
          element={
            <ProtectedRoute
              allow={["lead"]}
              element={<LeadShell><LeadLeaveRequest /></LeadShell>}
            />
          }
        />
        <Route
          path="/lead/time-corrections"
          element={
            <ProtectedRoute
              allow={["lead"]}
              element={<LeadShell><LeadTimeCorrections /></LeadShell>}
            />
          }
        />

        {/* Lead self-service: attendance & leaves */}
        <Route
          path="/lead/my-attendance"
          element={
            <ProtectedRoute
              allow={["lead"]}
              element={<LeadShell><LeadMyAttendance /></LeadShell>}
            />
          }
        />
        <Route
          path="/lead/leave-request"
          element={
            <ProtectedRoute
              allow={["lead"]}
              element={<LeadShell><LeadMyLeaves /></LeadShell>}
            />
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={
            <Navigate
              to={homeFor(localStorage.getItem("role"))}
              replace
            />
          }
        />
      </Routes>
    </>
  );
}

/* ---------------- App Root ---------------- */
export default function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
      <ToastContainer position="top-right" theme="colored" newestOnTop />
    </BrowserRouter>
  );
}


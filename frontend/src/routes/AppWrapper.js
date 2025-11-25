// src/routes/AppWrapper.jsx
import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ------------ Auth / shared ------------ */
import Login from "../components/login";
import BubbleBackground from "../components/BubbleBackground";

/* ------------ Layout sidebars ------------ */
import Sidebar from "../components/Sidebar";                 // Admin
import LeadSidebar from "../components/LeadSidebar";         // Lead
import EmployeeSidebar from "../components/EmployeeSidebar"; // Employee

/* ------------ Admin pages ------------ */
import AdminDashboard from "../pages/AdminDashboard";
import EmployeeList from "../pages/Employees";
import AddEmployee from "../pages/AddEmployee";
import Attendance from "../pages/Attendance";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import AdminTimeCorrections from "../pages/AdminTimeCorrections";
import AdminEarlyOff from "../pages/AdminEarlyOff";

/* ------------ Employee pages ------------ */
import EmployeeDashboard from "../pages/EmployeeDashboard";
import MarkAttendance from "../pages/MarkAttendance";
import MyAttendance from "../pages/MyAttendance";
import EmployeeLeaves from "../pages/EmployeeLeaves";
import EarlyOff from "../pages/EarlyOff"; // self-service early-off form

/* ------------ Lead pages ------------ */
import LeadDashboard from "../pages/LeadDashboard";
import LeadEmployeeList from "../pages/LeadEmployeeList";
import LeadAddEmployee from "../pages/LeadAddEmployee";
import LeadEarlyOff from "../pages/LeadEarlyOff";           // approval list
import LeadLeaveRequest from "../pages/LeadLeaveRequest";
import LeadTimeCorrections from "../pages/LeadTimeCorrections";

// Self-service for leads (reuse employee components)
import LeadMyAttendance from "../pages/MyAttendance";
import LeadMyLeaves from "../pages/LeadMyLeaves";

/* ------------ Layout shells ------------ */

const AdminShell = ({ children }) => (
  <div className="flex">
    <Sidebar />
    <div className="flex-1 ml-64 bg-gray-100 min-h-screen p-6">{children}</div>
  </div>
);

const LeadShell = ({ children }) => (
  <div className="flex">
    <LeadSidebar />
    <div className="flex-1 ml-64 bg-gray-100 min-h-screen p-6">{children}</div>
  </div>
);

const EmployeeLayout = ({ children }) => (
  <div className="flex">
    <EmployeeSidebar />
    <div className="flex-1 ml-64 bg-gray-100 min-h-screen p-6">{children}</div>
  </div>
);

/* ------------ Helpers ------------ */

const homeFor = (role) =>
  role === "admin"
    ? "/admin-dashboard"
    : role === "lead"
    ? "/lead-dashboard"
    : role === "employee"
    ? "/employee-dashboard"
    : "/login";

// Generic guard: allow={['admin']} or ['employee'] or ['lead']
const ProtectedRoute = ({ element, allow }) => {
  const token = localStorage.getItem("access");
  const role = localStorage.getItem("role");

  if (!token) {
    toast.error("🚫 Please log in to continue.");
    return <Navigate to="/login" replace />;
  }

  if (allow && !allow.includes(role)) {
    toast.error("🚫 Unauthorized access.");
    return <Navigate to={homeFor(role)} replace />;
  }

  return element;
};

/* ------------ Main wrapper ------------ */

function AppWrapper() {
  const location = useLocation();
  const navigate = useNavigate();

  const [, setIsLoggedIn] = useState(!!localStorage.getItem("access"));
  const [, setRole] = useState(localStorage.getItem("role"));

  // Sync on mount
  useEffect(() => {
    const token = localStorage.getItem("access");
    setIsLoggedIn(!!token);
    setRole(token ? localStorage.getItem("role") : null);
  }, []);

  // Cross-tab logout
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "access" && !e.newValue) {
        setIsLoggedIn(false);
        setRole(null);
        toast.warn("⚠️ Session expired. Please log in again.");
        navigate("/login", { replace: true });
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);

  const showBubbles = location.pathname === "/login";

  return (
    <>
      <ToastContainer />
      {showBubbles && <BubbleBackground />}

      <Routes>
        {/* ---------- Auth ---------- */}
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

        {/* Default redirect (role aware) */}
        <Route
          path="/"
          element={
            <Navigate to={homeFor(localStorage.getItem("role"))} replace />
          }
        />

        {/* ---------- ADMIN ---------- */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute
              allow={["admin"]}
              element={
                <AdminShell>
                  <AdminDashboard />
                </AdminShell>
              }
            />
          }
        />
        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute
              allow={["admin"]}
              element={
                <AdminShell>
                  <EmployeeList />
                </AdminShell>
              }
            />
          }
        />
        <Route
          path="/admin/add-employee"
          element={
            <ProtectedRoute
              allow={["admin"]}
              element={
                <AdminShell>
                  <AddEmployee />
                </AdminShell>
              }
            />
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute
              allow={["admin"]}
              element={
                <AdminShell>
                  <Attendance />
                </AdminShell>
              }
            />
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute
              allow={["admin"]}
              element={
                <AdminShell>
                  <Reports />
                </AdminShell>
              }
            />
          }
        />
        <Route
          path="/admin/time-corrections"
          element={
            <ProtectedRoute
              allow={["admin"]}
              element={
                <AdminShell>
                  <AdminTimeCorrections />
                </AdminShell>
              }
            />
          }
        />
        <Route
          path="/admin/earlyoff"
          element={
            <ProtectedRoute
              allow={["admin"]}
              element={
                <AdminShell>
                  <AdminEarlyOff />
                </AdminShell>
              }
            />
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute
              allow={["admin"]}
              element={
                <AdminShell>
                  <Settings />
                </AdminShell>
              }
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

        {/* ---------- LEAD ---------- */}
        <Route
          path="/lead-dashboard"
          element={
            <ProtectedRoute
              allow={["lead"]}
              element={
                <LeadShell>
                  <LeadDashboard />
                </LeadShell>
              }
            />
          }
        />
        <Route
          path="/lead/employees"
          element={
            <ProtectedRoute
              allow={["lead"]}
              element={
                <LeadShell>
                  <LeadEmployeeList />
                </LeadShell>
              }
            />
          }
        />
        <Route
          path="/lead/add-employee"
          element={
            <ProtectedRoute
              allow={["lead"]}
              element={
                <LeadShell>
                  <LeadAddEmployee />
                </LeadShell>
              }
            />
          }
        />

        {/* ✅ Lead self-service Early-off (your “My Early-off”) */}
        <Route
          path="/lead/my-early-off"
          element={
            <ProtectedRoute
              allow={["lead"]}
              element={
                <LeadShell>
                  <EarlyOff />
                </LeadShell>
              }
            />
          }
        />

        {/* ✅ Lead approval list (“Early-off Requests”) */}
        <Route
          path="/lead/early-off-requests"
          element={
            <ProtectedRoute
              allow={["lead"]}
              element={
                <LeadShell>
                  <LeadEarlyOff />
                </LeadShell>
              }
            />
          }
        />

        <Route
          path="/lead/leave-requests"
          element={
            <ProtectedRoute
              allow={["lead"]}
              element={
                <LeadShell>
                  <LeadLeaveRequest />
                </LeadShell>
              }
            />
          }
        />
        <Route
          path="/lead/time-corrections"
          element={
            <ProtectedRoute
              allow={["lead"]}
              element={
                <LeadShell>
                  <LeadTimeCorrections />
                </LeadShell>
              }
            />
          }
        />

        {/* Lead self-service: attendance & leaves */}
        <Route
          path="/lead/my-attendance"
          element={
            <ProtectedRoute
              allow={["lead"]}
              element={
                <LeadShell>
                  <LeadMyAttendance />
                </LeadShell>
              }
            />
          }
        />
        <Route
          path="/lead/leave-request"
          element={
            <ProtectedRoute
              allow={["lead"]}
              element={
                <LeadShell>
                  <LeadMyLeaves />
                </LeadShell>
              }
            />
          }
        />

        {/* ---------- Fallback ---------- */}
        <Route
          path="*"
          element={
            <Navigate to={homeFor(localStorage.getItem("role"))} replace />
          }
        />
      </Routes>
    </>
  );
}

export default AppWrapper;

// import React, { useEffect, useState } from "react";
// import {
//   Routes,
//   Route,
//   Navigate,
//   useLocation,
//   useNavigate,
// } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// /* ------------ Auth / shared ------------ */
// import Login from "../components/login";
// import BubbleBackground from "../components/BubbleBackground";

// /* ------------ Layout sidebars ------------ */
// import Sidebar from "../components/Sidebar";                 // Admin
// import LeadSidebar from "../components/LeadSidebar";         // Lead
// import EmployeeSidebar from "../components/EmployeeSidebar"; // Employee

// /* ------------ Admin pages ------------ */
// import AdminDashboard from "../pages/AdminDashboard";
// import EmployeeList from "../pages/Employees";
// import AddEmployee from "../pages/AddEmployee";
// import Attendance from "../pages/Attendance";
// import Reports from "../pages/Reports";
// import Settings from "../pages/Settings";
// import AdminTimeCorrections from "../pages/AdminTimeCorrections";
// import AdminEarlyOff from "../pages/AdminEarlyOff";

// /* ------------ Employee pages ------------ */
// import EmployeeDashboard from "../pages/EmployeeDashboard";
// import MarkAttendance from "../pages/MarkAttendance";
// import MyAttendance from "../pages/MyAttendance";
// import EmployeeLeaves from "../pages/EmployeeLeaves";
// import EarlyOff from "../pages/EarlyOff"; // self-service early-off form

// /* ------------ Lead pages ------------ */
// import LeadDashboard from "../pages/LeadDashboard";
// import LeadEmployeeList from "../pages/LeadEmployeeList";
// import LeadAddEmployee from "../pages/LeadAddEmployee";
// import LeadEarlyOff from "../pages/LeadEarlyOff";           // approval list
// import LeadLeaveRequest from "../pages/LeadLeaveRequest";
// import LeadTimeCorrections from "../pages/LeadTimeCorrections";

// // Self-service for leads (reuse employee components)
// import LeadMyAttendance from "../pages/MyAttendance";
// import LeadMyLeaves from "../pages/LeadMyLeaves";

// /* ------------ Layout shells ------------ */

// const AdminShell = ({ children }) => (
//   <div className="flex">
//     <Sidebar />
//     <div className="flex-1 ml-64 bg-gray-100 min-h-screen p-6">{children}</div>
//   </div>
// );

// const LeadShell = ({ children }) => (
//   <div className="flex">
//     <LeadSidebar />
//     <div className="flex-1 ml-64 bg-gray-100 min-h-screen p-6">{children}</div>
//   </div>
// );

// const EmployeeLayout = ({ children }) => (
//   <div className="flex">
//     <EmployeeSidebar />
//     <div className="flex-1 ml-64 bg-gray-100 min-h-screen p-6">{children}</div>
//   </div>
// );

// /* ------------ Helpers ------------ */

// const homeFor = (role) =>
//   role === "admin"
//     ? "/admin-dashboard"
//     : role === "lead"
//     ? "/lead-dashboard"
//     : role === "employee"
//     ? "/employee-dashboard"
//     : "/login";

// // Generic guard: allow={['admin']} or ['employee'] or ['lead']
// const ProtectedRoute = ({ element, allow }) => {
//   const token = localStorage.getItem("access");
//   const role = localStorage.getItem("role");

//   if (!token) {
//     toast.error("🚫 Please log in to continue.");
//     return <Navigate to="/login" replace />;
//   }

//   if (allow && !allow.includes(role)) {
//     toast.error("🚫 Unauthorized access.");
//     return <Navigate to={homeFor(role)} replace />;
//   }

//   return element;
// };

// /* ------------ Main wrapper ------------ */

// function AppWrapper() {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [, setIsLoggedIn] = useState(!!localStorage.getItem("access"));
//   const [, setRole] = useState(localStorage.getItem("role"));

//   // Sync on mount
//   useEffect(() => {
//     const token = localStorage.getItem("access");
//     setIsLoggedIn(!!token);
//     setRole(token ? localStorage.getItem("role") : null);
//   }, []);

//   // Cross-tab logout
//   useEffect(() => {
//     const handleStorageChange = (e) => {
//       if (e.key === "access" && !e.newValue) {
//         setIsLoggedIn(false);
//         setRole(null);
//         toast.warn("⚠️ Session expired. Please log in again.");
//         navigate("/login", { replace: true });
//       }
//     };
//     window.addEventListener("storage", handleStorageChange);
//     return () => window.removeEventListener("storage", handleStorageChange);
//   }, [navigate]);

//   const showBubbles = location.pathname === "/login";

//   return (
//     <>
//       <ToastContainer />
//       {showBubbles && <BubbleBackground />}

//       <Routes>
//         {/* ---------- Auth ---------- */}
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

//         {/* Default redirect (role aware) */}
//         <Route
//           path="/"
//           element={
//             <Navigate to={homeFor(localStorage.getItem("role"))} replace />
//           }
//         />

//         {/* ---------- ADMIN ---------- */}
//         <Route
//           path="/admin-dashboard"
//           element={
//             <ProtectedRoute
//               allow={["admin"]}
//               element={
//                 <AdminShell>
//                   <AdminDashboard />
//                 </AdminShell>
//               }
//             />
//           }
//         />
//         <Route
//           path="/admin/employees"
//           element={
//             <ProtectedRoute
//               allow={["admin"]}
//               element={
//                 <AdminShell>
//                   <EmployeeList />
//                 </AdminShell>
//               }
//             />
//           }
//         />
//         <Route
//           path="/admin/add-employee"
//           element={
//             <ProtectedRoute
//               allow={["admin"]}
//               element={
//                 <AdminShell>
//                   <AddEmployee />
//                 </AdminShell>
//               }
//             />
//           }
//         />
//         <Route
//           path="/admin/attendance"
//           element={
//             <ProtectedRoute
//               allow={["admin"]}
//               element={
//                 <AdminShell>
//                   <Attendance />
//                 </AdminShell>
//               }
//             />
//           }
//         />
//         <Route
//           path="/admin/reports"
//           element={
//             <ProtectedRoute
//               allow={["admin"]}
//               element={
//                 <AdminShell>
//                   <Reports />
//                 </AdminShell>
//               }
//             />
//           }
//         />
//         <Route
//           path="/admin/time-corrections"
//           element={
//             <ProtectedRoute
//               allow={["admin"]}
//               element={
//                 <AdminShell>
//                   <AdminTimeCorrections />
//                 </AdminShell>
//               }
//             />
//           }
//         />
//         <Route
//           path="/admin/earlyoff"
//           element={
//             <ProtectedRoute
//               allow={["admin"]}
//               element={
//                 <AdminShell>
//                   <AdminEarlyOff />
//                 </AdminShell>
//               }
//             />
//           }
//         />
//         <Route
//           path="/admin/settings"
//           element={
//             <ProtectedRoute
//               allow={["admin"]}
//               element={
//                 <AdminShell>
//                   <Settings />
//                 </AdminShell>
//               }
//             />
//           }
//         />

//         {/* ---------- EMPLOYEE ---------- */}
//         <Route
//           path="/employee-dashboard"
//           element={
//             <ProtectedRoute
//               allow={["employee"]}
//               element={
//                 <EmployeeLayout>
//                   <EmployeeDashboard />
//                 </EmployeeLayout>
//               }
//             />
//           }
//         />
//         <Route
//           path="/employee/mark"
//           element={
//             <ProtectedRoute
//               allow={["employee"]}
//               element={
//                 <EmployeeLayout>
//                   <MarkAttendance />
//                 </EmployeeLayout>
//               }
//             />
//           }
//         />
//         <Route
//           path="/employee/attendance"
//           element={
//             <ProtectedRoute
//               allow={["employee"]}
//               element={
//                 <EmployeeLayout>
//                   <MyAttendance />
//                 </EmployeeLayout>
//               }
//             />
//           }
//         />
//         <Route
//           path="/employee/leaves"
//           element={
//             <ProtectedRoute
//               allow={["employee"]}
//               element={
//                 <EmployeeLayout>
//                   <EmployeeLeaves />
//                 </EmployeeLayout>
//               }
//             />
//           }
//         />
//         <Route
//           path="/employee/early-off"
//           element={
//             <ProtectedRoute
//               allow={["employee"]}
//               element={
//                 <EmployeeLayout>
//                   <EarlyOff />
//                 </EmployeeLayout>
//               }
//             />
//           }
//         />

//         {/* ---------- LEAD ---------- */}
//         <Route
//           path="/lead-dashboard"
//           element={
//             <ProtectedRoute
//               allow={["lead"]}
//               element={
//                 <LeadShell>
//                   <LeadDashboard />
//                 </LeadShell>
//               }
//             />
//           }
//         />
//         <Route
//           path="/lead/employees"
//           element={
//             <ProtectedRoute
//               allow={["lead"]}
//               element={
//                 <LeadShell>
//                   <LeadEmployeeList />
//                 </LeadShell>
//               }
//             />
//           }
//         />
//         <Route
//           path="/lead/add-employee"
//           element={
//             <ProtectedRoute
//               allow={["lead"]}
//               element={
//                 <LeadShell>
//                   <LeadAddEmployee />
//                 </LeadShell>
//               }
//             />
//           }
//         />

//         {/* ✅ Lead self-service Early-off (your “My Early-off”) */}
//         <Route
//           path="/lead/my-early-off"
//           element={
//             <ProtectedRoute
//               allow={["lead"]}
//               element={
//                 <LeadShell>
//                   <EarlyOff />
//                 </LeadShell>
//               }
//             />
//           }
//         />

//         {/* ✅ Lead approval list (“Early-off Requests”) */}
//         <Route
//           path="/lead/early-off-requests"
//           element={
//             <ProtectedRoute
//               allow={["lead"]}
//               element={
//                 <LeadShell>
//                   <LeadEarlyOff />
//                 </LeadShell>
//               }
//             />
//           }
//         />

//         <Route
//           path="/lead/leave-requests"
//           element={
//             <ProtectedRoute
//               allow={["lead"]}
//               element={
//                 <LeadShell>
//                   <LeadLeaveRequest />
//                 </LeadShell>
//               }
//             />
//           }
//         />
//         <Route
//           path="/lead/time-corrections"
//           element={
//             <ProtectedRoute
//               allow={["lead"]}
//               element={
//                 <LeadShell>
//                   <LeadTimeCorrections />
//                 </LeadShell>
//               }
//             />
//           }
//         />

//         {/* Lead self-service: attendance & leaves */}
//         <Route
//           path="/lead/my-attendance"
//           element={
//             <ProtectedRoute
//               allow={["lead"]}
//               element={
//                 <LeadShell>
//                   <LeadMyAttendance />
//                 </LeadShell>
//               }
//             />
//           }
//         />
//         <Route
//           path="/lead/leave-request"
//           element={
//             <ProtectedRoute
//               allow={["lead"]}
//               element={
//                 <LeadShell>
//                   <LeadMyLeaves />
//                 </LeadShell>
//               }
//             />
//           }
//         />

//         {/* ---------- Fallback ---------- */}
//         <Route
//           path="*"
//           element={
//             <Navigate to={homeFor(localStorage.getItem("role"))} replace />
//           }
//         />
//       </Routes>
//     </>
//   );
// }

// export default AppWrapper;

// // }

// // export default AppWrapper;

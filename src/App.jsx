// import { useState, useEffect, Suspense, lazy } from "react";
// import { Routes, Route, useLocation, Outlet } from "react-router-dom";
// import Navigation from "./layout/Sidebar";

// // Lazy load pages
// const Login = lazy(() => import("./pages/Login/Login"));
// const Dashboard = lazy(() => import("./pages/DashBoard/dashboard"));
// const UserMaster = lazy(() =>
//   import("./pages/SystemAdmin/userMaster/UserMaster")
// );
// const AddUser = lazy(() => import("./pages/SystemAdmin/userMaster/AddUser"));

// // Fallback spinner
// const fallbackSpinner = (
//   <div
//     className="spinnerc"
//     style={{
//       display: "flex",
//       justifyContent: "center",
//       alignItems: "center",
//       height: "100vh",
//     }}
//   />
// );

// const Layout = ({ isNavbarOpen, toggleNavbar }) => {
//   return (
//     <div className="flex flex-col min-h-screen">
//       <Navigation
//         isNavbarOpen={isNavbarOpen}
//         toggleNavbar={toggleNavbar}
//       />
//       <main
//         className={`flex-grow bg-gray-100 transition-all duration-300 ${
//           isNavbarOpen ? "ml-60" : "ml-16"
//         }`}
//       >
//         <Outlet />
//       </main>
//     </div>
//   );
// };

// const App = () => {
//   return <AppWithNavigation />;
// };

// const AppWithNavigation = () => {
//   const location = useLocation();
//   const [isNavbarOpen, setIsNavbarOpen] = useState(true);

//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth < 1024) {
//         setIsNavbarOpen(false);
//       } else {
//         setIsNavbarOpen(true);
//       }
//     };

//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return (
//     <Routes>
//       <Route
//         path="/"
//         element={
//           <Suspense fallback={fallbackSpinner}>
//             <Login />
//           </Suspense>
//         }
//       />
//       <Route
//         element={
//           <Layout
//           isNavbarOpen={isNavbarOpen}
//           toggleNavbar={() => setIsNavbarOpen(!isNavbarOpen)}
//           />
//         }
//       >
//         <Route
//           path="/dashboard"
//           element={
//             <Suspense fallback={fallbackSpinner}>
//               <Dashboard />
//             </Suspense>
//           }
//         />
//         <Route
//           path="/system-admin/user-master"
//           element={
//             <Suspense fallback={fallbackSpinner}>
//               <UserMaster />
//             </Suspense>
//           }
//         />
//         <Route
//           path="/system-admin/user-master/add-user"
//           element={
//             <Suspense fallback={fallbackSpinner}>
//               <AddUser />
//             </Suspense>
//           }
//         />
//       </Route>
//     </Routes>
//   );
// };

// export default App;

import { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation, Outlet } from "react-router-dom";
// import Navigation from "./Navigation/navbar";
import Layout from "./layout/Layout";
// Lazy load pages
const Login = lazy(() => import("./pages/Login/Login"));
const Dashboard = lazy(() => import("./pages/DashBoard/dashboard"));
const UserMaster = lazy(() =>
  import("./pages/SystemAdmin/userMaster/UserMaster")
);
const UserMasterAddUser = lazy(() =>
  import("./pages/SystemAdmin/userMaster/AddUser")
);
const UserMasterEditUser = lazy(() =>
  import("./pages/SystemAdmin/userMaster/EditUser")
);
// Fallback spinner
const fallbackSpinner = (
  <div
    className="spinnerc"
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    }}
  />
);

const App = () => {
  return <AppWithNavigation />;
};

const AppWithNavigation = () => {
  const location = useLocation();
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsNavbarOpen(false);
      } else {
        setIsNavbarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={fallbackSpinner}>
            <Login />
          </Suspense>
        }
      />
      <Route element={<Layout />}>
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={fallbackSpinner}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="/system-admin/user-master"
          element={
            <Suspense fallback={fallbackSpinner}>
              <UserMaster />
            </Suspense>
          }
        />
        <Route
          path="/system-admin/user-master/add-user"
          element={
            <Suspense fallback={fallbackSpinner}>
              <UserMasterAddUser />
            </Suspense>
          }
        />
        <Route
          path="/system-admin/user-master/edit-user"
          element={
            <Suspense fallback={fallbackSpinner}>
              <UserMasterEditUser />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
};

export default App;

import { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation, Outlet } from "react-router-dom";
// import Navigation from "./Navigation/navbar";
import Layout from "./layout/Layout";
// Lazy load pages
const Login = lazy(() => import("./pages/Login/Login"));
const Dashboard = lazy(() => import("./pages/DashBoard/dashboard"));
//User Master
const UserMaster = lazy(() =>
  import("./pages/SystemAdmin/userMaster/UserMaster")
);
const UserMasterAddUser = lazy(() =>
  import("./pages/SystemAdmin/userMaster/AddUser")
);
const UserMasterEditUser = lazy(() =>
  import("./pages/SystemAdmin/userMaster/EditUser")
);

// Department Master
const DepartmentMaster = lazy(() => import('./pages/SystemAdmin/departmentMaster/Department'));
const AddDepartment = lazy(() => import('./pages/SystemAdmin/departmentMaster/AddDepartment'));
const EditDepartment = lazy(() => import('./pages/SystemAdmin/departmentMaster/EditDepartment'));

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
          <Route path='/system-admin/department-master' element={
            <Suspense fallback={fallbackSpinner}>
              <DepartmentMaster/>
            </Suspense>
          }/>
             <Route path='/system-admin/department-master/add-department' element={
            <Suspense fallback={fallbackSpinner}>
              <AddDepartment/>
            </Suspense>
          }/>
          <Route path='/system-admin/department-master/edit-department' element={
            <Suspense fallback={fallbackSpinner}>
              <EditDepartment/>
            </Suspense>
          }/>
      </Route>
    </Routes>
  );
};

export default App;

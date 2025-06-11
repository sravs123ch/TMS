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


// Designation Master
const DesignationMaster = lazy(() => import('./pages/SystemAdmin/designationMaster/DesignatureMaster'));
const AddDesignation = lazy(() => import('./pages/SystemAdmin/designationMaster/AddDesignature'));
const EditDesignation = lazy(() => import('./pages/SystemAdmin/designationMaster/EditDesignature'));

// Role Master
const RoleMaster = lazy(() => import('./pages/SystemAdmin/roleMaster/RoleMaster'));
// const AddRole = lazy(() => import('./pages/systemAdmin/roleMaster/addRoleMaster/AddRole.jsx'));
// const EditRole = lazy(() => import('./pages/systemAdmin/roleMaster/editRoleMaster/EditRole.jsx'));
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
            {/* Designation Master */}
          <Route path='/system-admin/designation-master' element={
            <Suspense fallback={fallbackSpinner}>
              <DesignationMaster/>
            </Suspense>
          }/>
          <Route path='/system-admin/designation-master/add-designation' element={
            <Suspense fallback={fallbackSpinner}>
              <AddDesignation/>
            </Suspense>
          }/>
          <Route path='/system-admin/designation-master/edit-designation' element={
            <Suspense fallback={fallbackSpinner}>
              <EditDesignation/>
            </Suspense>
          }/>

             {/* Role Master */}
          <Route path='/system-admin/role-master' element={
            <Suspense fallback={fallbackSpinner}>
              <RoleMaster/>
            </Suspense>
          }/>
          {/* <Route path='/system-admin/role-master/add-role' element={
            <Suspense fallback={fallbackSpinner}>
              <AddRole/>
            </Suspense>
          }/>
          <Route path='/system-admin/role-master/edit-role' element={
            <Suspense fallback={fallbackSpinner}>
              <EditRole/>
            </Suspense>
          }/> */}

      </Route>
    </Routes>
  );
};

export default App;

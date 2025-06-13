import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
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
const DepartmentMaster = lazy(() =>
  import("./pages/SystemAdmin/departmentMaster/Department")
);
const AddDepartment = lazy(() =>
  import("./pages/SystemAdmin/departmentMaster/AddDepartment")
);
const EditDepartment = lazy(() =>
  import("./pages/SystemAdmin/departmentMaster/EditDepartment")
);

// Designation Master
const DesignationMaster = lazy(() =>
  import("./pages/SystemAdmin/designationMaster/DesignatureMaster")
);
const AddDesignation = lazy(() =>
  import("./pages/SystemAdmin/designationMaster/AddDesignature")
);
const EditDesignation = lazy(() =>
  import("./pages/SystemAdmin/designationMaster/EditDesignature")
);

// Role Master
const RoleMaster = lazy(() =>
  import("./pages/SystemAdmin/roleMaster/RoleMaster")
);
const AddRole = lazy(() =>
  import("./pages/SystemAdmin/roleMaster/AddRoleMaster")
);
const EditRole = lazy(() =>
  import("./pages/SystemAdmin/roleMaster/EditRoleMaster")
);
// Plant Master
const PlantMaster = lazy(() =>
  import("./pages/SystemAdmin/plantMaster/PlaintMaster.jsx")
);
const AddPlant = lazy(() =>
  import("./pages/SystemAdmin/plantMaster/AddPlant.jsx")
);
const EditPlant = lazy(() =>
  import("./pages/SystemAdmin/plantMaster/EditPlant.jsx")
);

// User Personal Details
const UserProfile = lazy(() =>
  import("./pages/SystemAdmin/userPersonalDetails/UserPersonalDetails.jsx")
);
const UserProfileAddUser = lazy(() =>
  import("./pages/SystemAdmin/userPersonalDetails/AddUserPersonalDetails.jsx")
);
const UserProfileEditUser = lazy(() =>
  import("./pages/SystemAdmin/userPersonalDetails/EditUserPersonalDetails.jsx")
);
// Role Assignment
const RoleAssignment = lazy(() =>
  import("./pages/SystemAdmin/roleAssignment/RoleAssignment.jsx")
);
const AddRoleAssignment = lazy(() =>
  import("./pages/SystemAdmin/roleAssignment/AddRoleAssignment.jsx")
);
const EditRoleAssignment = lazy(() =>
  import("./pages/SystemAdmin/roleAssignment/EditRoleAssignment.jsx")
);

// Plant Assign
const PlantAssign = lazy(() =>
  import("./pages/SystemAdmin/plantAssignment/PlantAssignment.jsx")
);
const AddPlantAssign = lazy(() =>
  import("./pages/SystemAdmin/plantAssignment/AddPlantAssignment.jsx")
);
const EditPlantAssign = lazy(() =>
  import("./pages/SystemAdmin/plantAssignment/EditPlantAssignment.jsx")
);
// Password Configuration
const PasswordConfiguration = lazy(() =>
  import("./pages/SystemAdmin/passwordConfiguration/PasswordConfiguration.jsx")
);
//Password Reset
const PasswordReset = lazy(() =>
  import("./pages/SystemAdmin/passwordReset/PasswordReset.jsx")
);

// Induction Assign
const InductionAssign = lazy(() => import('./pages/Induction/inductionAssign/InductionAssign.jsx'));
const AddInductionAssign = lazy(() => import('./pages/Induction/inductionAssign/AddInductionAssign.jsx'));
const EditInductionAssign = lazy(() => import('./pages/Induction/inductionAssign/EditInductionAssign.jsx'));

// Induction Module
const JobResposibility = lazy(() => import('./pages/Induction/jobResponsibility/JobResponsibility.jsx'));
const AddJobResposibility = lazy(() => import('./pages/Induction/jobResponsibility/AddJobResponsibility.jsx'));
const EditJobResposibility = lazy(() => import('./pages/Induction/jobResponsibility/EditJobResponsibility.jsx'));

//Induction Sign
const InductionSign = lazy(() => import('./pages/Induction/inductionSign/InductionSign.jsx'));
// Document Registration
const DocumentRegistration = lazy(() => import('./pages/sopojt-Management/documentRegistration/DocumentRegistration.jsx'));
const RegisterDocument = lazy(() => import('./pages/sopojt-Management/documentRegistration/RegisterDocument.jsx'));
const EditDocument = lazy(() => import('./pages/sopojt-Management/documentRegistration/EditDocument.jsx'));

// Document Review & Approval
const DocumentReviewApproval = lazy(() => import('./pages/sopojt-Management/documentReview&Approval/documentReview&Approval.jsx'));

const AddQuestionPrepare = lazy(() => import('./pages/sopojt-Management/questionPrepare/AddQuestionPrepare.jsx'));
const QuestionPrepareGrid = lazy(() => import('./pages/sopojt-Management/questionPrepare/QuestionPrepareGrid.jsx'));
const EditQuestionPrepare = lazy(() => import('./pages/sopojt-Management/questionPrepare/EditQuestionPrepare.jsx'));
// const QuestionApprove = lazy(() => import('./pages/sopojt-Management/questionApprove/questionApprove.jsx'));

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
        <Route
          path="/system-admin/department-master"
          element={
            <Suspense fallback={fallbackSpinner}>
              <DepartmentMaster />
            </Suspense>
          }
        />
        <Route
          path="/system-admin/department-master/add-department"
          element={
            <Suspense fallback={fallbackSpinner}>
              <AddDepartment />
            </Suspense>
          }
        />
        <Route
          path="/system-admin/department-master/edit-department"
          element={
            <Suspense fallback={fallbackSpinner}>
              <EditDepartment />
            </Suspense>
          }
        />
        {/* Designation Master */}
        <Route
          path="/system-admin/designation-master"
          element={
            <Suspense fallback={fallbackSpinner}>
              <DesignationMaster />
            </Suspense>
          }
        />
        <Route
          path="/system-admin/designation-master/add-designation"
          element={
            <Suspense fallback={fallbackSpinner}>
              <AddDesignation />
            </Suspense>
          }
        />
        <Route
          path="/system-admin/designation-master/edit-designation"
          element={
            <Suspense fallback={fallbackSpinner}>
              <EditDesignation />
            </Suspense>
          }
        />

        {/* Role Master */}
        <Route
          path="/system-admin/role-master"
          element={
            <Suspense fallback={fallbackSpinner}>
              <RoleMaster />
            </Suspense>
          }
        />
        <Route
          path="/system-admin/role-master/add-role"
          element={
            <Suspense fallback={fallbackSpinner}>
              <AddRole />
            </Suspense>
          }
        />
        <Route
          path="/system-admin/role-master/edit-role"
          element={
            <Suspense fallback={fallbackSpinner}>
              <EditRole />
            </Suspense>
          }
        />
        {/* Plant Master */}
        <Route
          path="/system-admin/plant-master"
          element={
            <Suspense fallback={fallbackSpinner}>
              <PlantMaster />
            </Suspense>
          }
        />
        <Route
          path="/system-admin/plant-master/add-plant"
          element={
            <Suspense fallback={fallbackSpinner}>
              <AddPlant />
            </Suspense>
          }
        />
        <Route
          path="/system-admin/plant-master/edit-plant"
          element={
            <Suspense fallback={fallbackSpinner}>
              <EditPlant />
            </Suspense>
          }
        />
        {/* User Personal Details Routes */}
        <Route
          path="/system-admin/user-personal-details"
          element={
            <Suspense fallback={fallbackSpinner}>
              <UserProfile />
            </Suspense>
          }
        />
        <Route
          path="/system-admin/user-personal-details/add-user"
          element={
            <Suspense fallback={fallbackSpinner}>
              <UserProfileAddUser />
            </Suspense>
          }
        />
        <Route
          path="/system-admin/user-personal-details/edit-user"
          element={
            <Suspense fallback={fallbackSpinner}>
              <UserProfileEditUser />
            </Suspense>
          }
        />
        {/* Role Assignment */}
        <Route
          path="/system-admin/role-assignment"
          element={
            <Suspense fallback={fallbackSpinner}>
              <RoleAssignment />
            </Suspense>
          }
        />
        <Route
          path="/system-admin/role-assignment/add-role-assignment"
          element={
            <Suspense fallback={fallbackSpinner}>
              <AddRoleAssignment />
            </Suspense>
          }
        />
        <Route
          path="/system-admin/role-assignment/edit-role-assignment"
          element={
            <Suspense fallback={fallbackSpinner}>
              <EditRoleAssignment />
            </Suspense>
          }
        />
        {/* Plant Assign */}
        <Route
          path="/system-admin/plant-assignment"
          element={
            <Suspense fallback={fallbackSpinner}>
              <PlantAssign />
            </Suspense>
          }
        />
        <Route
          path="system-admin/plant-assignment/add-plant-assignment"
          element={
            <Suspense fallback={fallbackSpinner}>
              <AddPlantAssign />
            </Suspense>
          }
        />
        <Route
          path="/system-admin/plant-assignment/edit-plant-assignment"
          element={
            <Suspense fallback={fallbackSpinner}>
              <EditPlantAssign />
            </Suspense>
          }
        />
        {/* Password Configuration Routes */}
        <Route
          path="/system-admin/password-configuration"
          element={
            <Suspense fallback={fallbackSpinner}>
              <PasswordConfiguration />
            </Suspense>
          }
        />
        {/* Password Reset */}
        <Route
          path="/system-admin/password-reset"
          element={
            <Suspense fallback={fallbackSpinner}>
              <PasswordReset />
            </Suspense>
          }
        />
        {/* Induction Assign */}
          <Route path="/induction/induction-assign" element={
            <Suspense fallback={fallbackSpinner}>
              <InductionAssign/>
            </Suspense>
          } />
          <Route path="/induction/induction-assign/add-induction-assign" element={
            <Suspense fallback={fallbackSpinner}>
              <AddInductionAssign/>
            </Suspense>
          } />
          <Route path="/induction/induction-assign/edit-induction-assign" element={
            <Suspense fallback={fallbackSpinner}>
              <EditInductionAssign/>
            </Suspense>
          } />
            {/* Induction Module */}
          <Route path="/induction/job-responsibility" element={
            <Suspense fallback={fallbackSpinner}>
              <JobResposibility />
            </Suspense>
          } />
          <Route path="/induction/job-responsibility/add-job-responsibility" element={
            <Suspense fallback={fallbackSpinner}>
              <AddJobResposibility/>
            </Suspense>
          } />
          <Route path="/induction/job-responsibility/edit-job-responsibility" element={
            <Suspense fallback={fallbackSpinner}>
              <EditJobResposibility />
            </Suspense>
          } />
   {/* Induction Sign */}
          <Route path="/induction/induction-sign" element={
            <Suspense fallback={fallbackSpinner}>
              <InductionSign/>
            </Suspense>
          } />

            {/* SOP Module */}
          <Route path="/document-management/document-registration" element={
            <Suspense fallback={fallbackSpinner}>
              <DocumentRegistration/>
            </Suspense>
          } />
       <Route path="/document-management/document-registration/register-document" element={
            <Suspense fallback={fallbackSpinner}>
              <RegisterDocument/>
            </Suspense>
          } />
         <Route path="/document-management/document-registration/edit-document" element={
            <Suspense fallback={fallbackSpinner}>
              <EditDocument/>
            </Suspense>
          } />
    {/* Document Review & Approval */}
          <Route path="/document-management/document-approval" element={
            <Suspense fallback={fallbackSpinner}>
              <DocumentReviewApproval/>
            </Suspense>
          } />
         <Route path="/document-management/questioner-preparation" element={
            <Suspense fallback={fallbackSpinner}>
              <QuestionPrepareGrid />
            </Suspense>
          } />
          <Route path="/document-management/questioner-preparation/add" element={
            <Suspense fallback={fallbackSpinner}>
              <AddQuestionPrepare />
            </Suspense>
          } />
          <Route path="/document-management/questioner-preparation/edit/:id" element={
            <Suspense fallback={fallbackSpinner}>
              <EditQuestionPrepare />
            </Suspense>
          } />
           {/*  <Route path="/document-management/questioner-approval" element={
            <Suspense fallback={fallbackSpinner}>
              <QuestionApprove/>
            </Suspense>
          } />  */}
      </Route>
    </Routes>
  );
};

export default App;

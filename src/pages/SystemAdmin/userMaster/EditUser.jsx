import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { UserContext } from "../../../context/UserContext";
import {
  fetchUsersBasicInfo,
  updateUserBasicInfo,
  fetchUsersWithSearch,
} from "../../../services/systemAdmin/UserMasterService";
import {
  fetchAllDepartments,
  fetchDepartmentsWithSearch,
} from "../../../services/systemAdmin/DepartmentMasterService";
import {
  fetchAllDesignations,
  fetchDesignationsWithSearch,
} from "../../../services/systemAdmin/DesignationMasterService";
import {
  fetchAllRoles,
  fetchRolesWithSearch,
} from "../../../services/systemAdmin/RoleMasterService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "../../../components/common/Modal";
import {
  InputField,
  RadioGroup,
  CustomAsyncSelect, EnhancedInputField,
} from "../../../components/common/ui/FormFields";


const EditUser = () => {
  const navigate = useNavigate();
  const { userDetails } = useContext(UserContext);
  const initialFormDataRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonForChange, setReasonForChange] = useState("");

  // State for dropdowns
  const [designationOptions, setDesignationOptions] = useState([]);
  const [designationSearch, setDesignationSearch] = useState("");
  const [designationPage, setDesignationPage] = useState(0);
  const [hasMoreDesignations, setHasMoreDesignations] = useState(true);
  const [isLoadingDesignations, setIsLoadingDesignations] = useState(false);

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [departmentPage, setDepartmentPage] = useState(0);
  const [hasMoreDepartments, setHasMoreDepartments] = useState(true);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

  const [roleOptions, setRoleOptions] = useState([]);
  const [roleSearch, setRoleSearch] = useState("");
  const [rolePage, setRolePage] = useState(0);
  const [hasMoreRoles, setHasMoreRoles] = useState(true);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  const [userOptions, setUserOptions] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(0);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const [formData, setFormData] = useState({
    userID: "",
    EmployeeID: "",
    FirstName: "",
    LastName: "",
    Gender: "",
    CategoryType: "",
    RoleID: "",
    DepartmentID: "",
    DesignationID: "",
    ReportsTo: "",
    EmailID: "",
    LoginID: "",
    InductionRequire: false,
    UserProfileID: "",
  });

  const customStyles = {
    control: (base) => ({
      ...base,
      border: "1px solid #d1d5db",
      borderRadius: "0.5rem",
      padding: "0.25rem",
      fontSize: "0.875rem",
      minHeight: "38px",
      "&:hover": { borderColor: "#3b82f6" },
    }),
    menu: (base) => ({
      ...base,
      maxHeight: "200px",
      zIndex: 10,
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "200px",
      overflowY: "auto",
      "&::-webkit-scrollbar": {
        width: "8px",
      },
      "&::-webkit-scrollbar-track": {
        background: "#f1f1f1",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "#888",
        borderRadius: "4px",
      },
      "&::-webkit-scrollbar-thumb:hover": {
        background: "#555",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#e6f3ff" : "white",
      color: "#333",
      padding: "8px 12px",
      "&:hover": { backgroundColor: "#e6f3ff" },
    }),
  };

  // Load initial data for dropdowns
  const loadInitialDesignations = async () => {
    try {
      setIsLoadingDesignations(true);
      const response = await fetchDesignationsWithSearch(0, 10, "");
      if (response.designations) {
        const options = response.designations.map((d) => ({
          value: d.designationID,
          label: d.designationName,
        }));
        setDesignationOptions(options);
        setHasMoreDesignations(response.totalRecord > 10);
        setDesignationPage(1);
      }
    } catch (error) {
      console.error("Error loading initial designations:", error);
      toast.error("Error loading designations");
    } finally {
      setIsLoadingDesignations(false);
    }
  };

  const loadInitialDepartments = async () => {
    try {
      setIsLoadingDepartments(true);
      const response = await fetchDepartmentsWithSearch(0, 10, "");
      if (response.departments) {
        const options = response.departments.map((d) => ({
          value: d.departmentID,
          label: d.departmentName,
        }));
        setDepartmentOptions(options);
        setHasMoreDepartments(response.totalRecord > 10);
        setDepartmentPage(1);
      }
    } catch (error) {
      console.error("Error loading initial departments:", error);
      toast.error("Error loading departments");
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const loadInitialRoles = async () => {
    try {
      setIsLoadingRoles(true);
      const response = await fetchRolesWithSearch(0, 10, "");
      if (response.roles) {
        const options = response.roles.map((r) => ({
          value: r.roleID,
          label: r.roleName,
        }));
        setRoleOptions(options);
        setHasMoreRoles(response.totalRecord > 10);
        setRolePage(1);
      }
    } catch (error) {
      console.error("Error loading initial roles:", error);
      toast.error("Error loading roles");
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const loadInitialUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await fetchUsersWithSearch(0, 10, "");
      if (response.usersBasicInfo) {
        const options = response.usersBasicInfo.map((u) => ({
          value: u.userID.toString(),
          label: `${u.firstName} ${u.lastName} (${u.employeeID})`,
        }));
        setUserOptions(options);
        setHasMoreUsers(response.totalRecord > 10);
        setUserPage(1);
      }
    } catch (error) {
      console.error("Error loading initial users:", error);
      toast.error("Error loading users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Load initial data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          loadInitialDesignations(),
          loadInitialDepartments(),
          loadInitialRoles(),
          loadInitialUsers(),
        ]);

        const storedFormData = JSON.parse(
          localStorage.getItem("editUserFormData")
        );
        const initialData = storedFormData || userDetails;

        if (initialData) {
          const formattedData = {
            userID: initialData.userID || "",
            EmployeeID: initialData.employeeID || "",
            FirstName: initialData.firstName || "",
            LastName: initialData.lastName || "",
            Gender: initialData.gender || "",
            CategoryType: initialData.categoryType || "",
            RoleID: initialData.roleID || "",
            DepartmentID: initialData.departmentID || "",
            DesignationID: initialData.designationID || "",
            ReportsTo: initialData.reportsTo || "",
            EmailID: initialData.emailID || "",
            LoginID: initialData.loginID || "",
            InductionRequire: initialData.inductionRequire === "True" || false,
            UserProfileID: initialData.userProfileID || "",
          };

          setFormData(formattedData);
          initialFormDataRef.current = { ...formattedData };
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userDetails]);

  // Load more options for dropdowns
  const loadMoreDesignations = async () => {
    if (!hasMoreDesignations || isLoadingDesignations) return;
    try {
      setIsLoadingDesignations(true);
      const response = await fetchDesignationsWithSearch(
        designationPage * 10,
        10,
        designationSearch
      );
      if (response.designations && response.designations.length > 0) {
        const newOptions = response.designations.map((d) => ({
          value: d.designationID,
          label: d.designationName,
        }));
        const existingIds = new Set(designationOptions.map((opt) => opt.value));
        const uniqueNewOptions = newOptions.filter(
          (opt) => !existingIds.has(opt.value)
        );
        if (uniqueNewOptions.length > 0) {
          setDesignationOptions((prev) => [...prev, ...uniqueNewOptions]);
          setHasMoreDesignations(
            response.totalRecord > (designationPage + 1) * 10
          );
          setDesignationPage((prev) => prev + 1);
        } else {
          setHasMoreDesignations(false);
        }
      } else {
        setHasMoreDesignations(false);
      }
    } catch (error) {
      console.error("Error loading more designations:", error);
      toast.error("Error loading more designations");
    } finally {
      setIsLoadingDesignations(false);
    }
  };

  const loadMoreDepartments = async () => {
    if (!hasMoreDepartments || isLoadingDepartments) return;
    try {
      setIsLoadingDepartments(true);
      const response = await fetchDepartmentsWithSearch(
        departmentPage * 10,
        10,
        departmentSearch
      );
      if (response.departments && response.departments.length > 0) {
        const newOptions = response.departments.map((d) => ({
          value: d.departmentID,
          label: d.departmentName,
        }));
        const existingIds = new Set(departmentOptions.map((opt) => opt.value));
        const uniqueNewOptions = newOptions.filter(
          (opt) => !existingIds.has(opt.value)
        );
        if (uniqueNewOptions.length > 0) {
          setDepartmentOptions((prev) => [...prev, ...uniqueNewOptions]);
          setHasMoreDepartments(
            response.totalRecord > (departmentPage + 1) * 10
          );
          setDepartmentPage((prev) => prev + 1);
        } else {
          setHasMoreDepartments(false);
        }
      } else {
        setHasMoreDepartments(false);
      }
    } catch (error) {
      console.error("Error loading more departments:", error);
      toast.error("Error loading more departments");
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const loadMoreRoles = async () => {
    if (!hasMoreRoles || isLoadingRoles) return;
    try {
      setIsLoadingRoles(true);
      const response = await fetchRolesWithSearch(rolePage * 10, 10, roleSearch);
      if (response.roles && response.roles.length > 0) {
        const newOptions = response.roles.map((r) => ({
          value: r.roleID,
          label: r.roleName,
        }));
        const existingIds = new Set(roleOptions.map((opt) => opt.value));
        const uniqueNewOptions = newOptions.filter(
          (opt) => !existingIds.has(opt.value)
        );
        if (uniqueNewOptions.length > 0) {
          setRoleOptions((prev) => [...prev, ...uniqueNewOptions]);
          setHasMoreRoles(response.totalRecord > (rolePage + 1) * 10);
          setRolePage((prev) => prev + 1);
        } else {
          setHasMoreRoles(false);
        }
      } else {
        setHasMoreRoles(false);
      }
    } catch (error) {
      console.error("Error loading more roles:", error);
      toast.error("Error loading more roles");
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const loadMoreUsers = async () => {
    if (!hasMoreUsers || isLoadingUsers) return;
    try {
      setIsLoadingUsers(true);
      const response = await fetchUsersWithSearch(userPage * 10, 10, userSearch);
      if (response.usersBasicInfo && response.usersBasicInfo.length > 0) {
        const newOptions = response.usersBasicInfo.map((u) => ({
          value: u.userID.toString(),
          label: `${u.firstName} ${u.lastName} (${u.employeeID})`,
        }));
        const existingIds = new Set(userOptions.map((opt) => opt.value));
        const uniqueNewOptions = newOptions.filter(
          (opt) => !existingIds.has(opt.value)
        );
        if (uniqueNewOptions.length > 0) {
          setUserOptions((prev) => [...prev, ...uniqueNewOptions]);
          setHasMoreUsers(response.totalRecord > (userPage + 1) * 10);
          setUserPage((prev) => prev + 1);
        } else {
          setHasMoreUsers(false);
        }
      } else {
        setHasMoreUsers(false);
      }
    } catch (error) {
      console.error("Error loading more users:", error);
      toast.error("Error loading more users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Load options for search
  const loadDesignations = async (inputValue, callback) => {
    if (!inputValue) {
      callback(designationOptions);
      return;
    }
    try {
      setIsLoadingDesignations(true);
      const response = await fetchDesignationsWithSearch(0, 10, inputValue);
      if (response.designations) {
        const options = response.designations.map((d) => ({
          value: d.designationID,
          label: d.designationName,
        }));
        setDesignationOptions(options);
        setDesignationPage(1);
        setHasMoreDesignations(response.totalRecord > 10);
        callback(options);
      } else {
        callback([]);
      }
    } catch (error) {
      console.error("Error loading designations:", error);
      toast.error("Error loading designations");
      callback([]);
    } finally {
      setIsLoadingDesignations(false);
    }
  };

  const loadDepartments = async (inputValue, callback) => {
    if (!inputValue) {
      callback(departmentOptions);
      return;
    }
    try {
      setIsLoadingDepartments(true);
      const response = await fetchDepartmentsWithSearch(0, 10, inputValue);
      if (response.departments) {
        const options = response.departments.map((d) => ({
          value: d.departmentID,
          label: d.departmentName,
        }));
        setDepartmentOptions(options);
        setDepartmentPage(1);
        setHasMoreDepartments(response.totalRecord > 10);
        callback(options);
      } else {
        callback([]);
      }
    } catch (error) {
      console.error("Error loading departments:", error);
      toast.error("Error loading departments");
      callback([]);
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const loadRoles = async (inputValue, callback) => {
    if (!inputValue) {
      callback(roleOptions);
      return;
    }
    try {
      setIsLoadingRoles(true);
      const response = await fetchRolesWithSearch(0, 10, inputValue);
      if (response.roles) {
        const options = response.roles.map((r) => ({
          value: r.roleID,
          label: r.roleName,
        }));
        setRoleOptions(options);
        setRolePage(1);
        setHasMoreRoles(response.totalRecord > 10);
        callback(options);
      } else {
        callback([]);
      }
    } catch (error) {
      console.error("Error loading roles:", error);
      toast.error("Error loading roles");
      callback([]);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const loadUsers = async (inputValue, callback) => {
    if (!inputValue) {
      callback(userOptions);
      return;
    }
    try {
      setIsLoadingUsers(true);
      const response = await fetchUsersWithSearch(0, 10, inputValue);
      if (response.usersBasicInfo) {
        const options = response.usersBasicInfo.map((u) => ({
          value: u.userID.toString(),
          label: `${u.firstName} ${u.lastName} (${u.employeeID})`,
        }));
        setUserOptions(options);
        setUserPage(1);
        setHasMoreUsers(response.totalRecord > 10);
        callback(options);
      } else {
        callback([]);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Error loading users");
      callback([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };
    setFormData(updatedFormData);
    localStorage.setItem("editUserFormData", JSON.stringify(updatedFormData));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = [
      "FirstName",
      "LastName",
      "Gender",
      "EmployeeID",
      "RoleID",
      "DepartmentID",
      "DesignationID",
      "EmailID",
      "LoginID",
    ];

    for (let field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill in the ${field} field`);
        return;
      }
    }

    if (!["M", "F", "O"].includes(formData.Gender)) {
      toast.error("Please select a valid gender");
      return;
    }

    const currentData = { ...formData };
    if (
      JSON.stringify(currentData) === JSON.stringify(initialFormDataRef.current)
    ) {
      toast.info("No changes made to update.");
      return;
    }

    setShowReasonModal(true);
  };

  const handleConfirmUpdate = async () => {
    if (!reasonForChange.trim()) {
      toast.error("Reason for change is required.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userID: formData.userID,
        employeeID: formData.EmployeeID.trim(),
        firstName: formData.FirstName.trim(),
        lastName: formData.LastName.trim(),
        gender: formData.Gender,
        categoryType: formData.CategoryType || "",
        roleID: Number(formData.RoleID),
        departmentID: Number(formData.DepartmentID),
        designationID: Number(formData.DesignationID),
        reportsTo: formData.ReportsTo ? Number(formData.ReportsTo) : 0,
        emailID: formData.EmailID.trim(),
        loginID: formData.LoginID.trim(),
        inductionRequire: formData.InductionRequire || false,
        userProfileID: Number(formData.UserProfileID) || 0,
        modifiedBy: sessionStorage.getItem("userId") || "Admin",
        reasonForChange: reasonForChange,
        electronicSignature: sessionStorage.getItem("userId") || "Admin",
        signatureDate: new Date().toISOString(),
        plantID: Number(sessionStorage.getItem("plantId")) || 0,
      };

      const response = await updateUserBasicInfo(payload);
      if (response.header?.errorCount === 0) {
        toast.success("User details updated successfully!");
        localStorage.removeItem("editUserFormData");
        setTimeout(() => {
          navigate("/system-admin/user-master");
        }, 3000);
      } else {
        const errorMsg =
          response.header?.messages?.[0]?.messageText ||
          "Failed to update user details";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user details. Please try again.");
    } finally {
      setLoading(false);
      setShowReasonModal(false);
      setReasonForChange("");
    }
  };

  const handleCancelUpdate = () => {
    setShowReasonModal(false);
    setReasonForChange("");
  };

  if (loading) {
    return (
      <>
        <ToastContainer
          position="top-right"
          autoClose={1500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <div className="main-container p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-8">Edit User Master</h3>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="main-container">
        <form onSubmit={handleSubmit}>
        <h3 className="heading">Edit User Master</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-4">
            <EnhancedInputField
              label="First Name"
              name="FirstName"
              value={formData.FirstName}
              onChange={handleChange}
              required
            />
            <EnhancedInputField
              label="Last Name"
              name="LastName"
              value={formData.LastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <Select
              name="Gender"
              options={[
                { value: "M", label: "Male" },
                { value: "F", label: "Female" },
                { value: "O", label: "Other" },
              ]}
              value={
                formData.Gender
                  ? {
                      value: formData.Gender,
                      label: { M: "Male", F: "Female", O: "Other" }[
                        formData.Gender
                      ],
                    }
                  : null
              }
              onChange={(selected) => {
                const updatedFormData = {
                  ...formData,
                  Gender: selected ? selected.value : "",
                };
                setFormData(updatedFormData);
                localStorage.setItem(
                  "editUserFormData",
                  JSON.stringify(updatedFormData)
                );
              }}
              className="text-sm"
              styles={customStyles}
              placeholder="-- Select Gender --"
              isSearchable={false}
            />
          </div>

          <div className="mb-6">
            <EnhancedInputField
              label="Employee ID"
              name="EmployeeID"
              value={formData.EmployeeID}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <CustomAsyncSelect
              label="Role"
              options={roleOptions}
              value={roleOptions.find((r) => r.value === Number(formData.RoleID))}
              loadOptions={loadRoles}
              onChange={(selected) => {
                const updatedFormData = {
                  ...formData,
                  RoleID: selected ? selected.value : "",
                };
                setFormData(updatedFormData);
                localStorage.setItem(
                  "editUserFormData",
                  JSON.stringify(updatedFormData)
                );
              }}
              onMenuOpen={() => {
                if (roleOptions.length === 0) loadInitialRoles();
              }}
              onMenuScrollToBottom={loadMoreRoles}
              onInputChange={(value) => {
                setRoleSearch(value);
                if (!value) {
                  setRolePage(0);
                  loadInitialRoles();
                }
              }}
              isLoading={isLoadingRoles}
              placeholder="-- Select Role --"
              required
            />
            <CustomAsyncSelect
              label="Department"
              options={departmentOptions}
              value={departmentOptions.find(
                (d) => d.value === Number(formData.DepartmentID)
              )}
              loadOptions={loadDepartments}
              onChange={(selected) => {
                const updatedFormData = {
                  ...formData,
                  DepartmentID: selected ? selected.value : "",
                };
                setFormData(updatedFormData);
                localStorage.setItem(
                  "editUserFormData",
                  JSON.stringify(updatedFormData)
                );
              }}
              onMenuOpen={() => {
                if (departmentOptions.length === 0) loadInitialDepartments();
              }}
              onMenuScrollToBottom={loadMoreDepartments}
              onInputChange={(value) => {
                setDepartmentSearch(value);
                if (!value) {
                  setDepartmentPage(0);
                  loadInitialDepartments();
                }
              }}
              isLoading={isLoadingDepartments}
              placeholder="-- Select Department --"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <CustomAsyncSelect
              label="Designation"
              options={designationOptions}
              value={designationOptions.find(
                (d) => d.value === Number(formData.DesignationID)
              )}
              loadOptions={loadDesignations}
              onChange={(selected) => {
                const updatedFormData = {
                  ...formData,
                  DesignationID: selected ? selected.value : "",
                };
                setFormData(updatedFormData);
                localStorage.setItem(
                  "editUserFormData",
                  JSON.stringify(updatedFormData)
                );
              }}
              onMenuOpen={() => {
                if (designationOptions.length === 0) loadInitialDesignations();
              }}
              onMenuScrollToBottom={loadMoreDesignations}
              onInputChange={(value) => {
                setDesignationSearch(value);
                if (!value) {
                  setDesignationPage(0);
                  loadInitialDesignations();
                }
              }}
              isLoading={isLoadingDesignations}
              placeholder="-- Select Designation --"
              required
            />
            <CustomAsyncSelect
              label="Reports To"
              options={userOptions}
              value={userOptions.find((u) => u.value === formData.ReportsTo)}
              loadOptions={loadUsers}
              onChange={(selected) => {
                const updatedFormData = {
                  ...formData,
                  ReportsTo: selected ? selected.value : "",
                };
                setFormData(updatedFormData);
                localStorage.setItem(
                  "editUserFormData",
                  JSON.stringify(updatedFormData)
                );
              }}
              onMenuOpen={() => {
                if (userOptions.length === 0) loadInitialUsers();
              }}
              onMenuScrollToBottom={loadMoreUsers}
              onInputChange={(value) => {
                setUserSearch(value);
                if (!value) {
                  setUserPage(0);
                  loadInitialUsers();
                }
              }}
              isLoading={isLoadingUsers}
              placeholder="-- Select Manager --"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <EnhancedInputField
              label="Email"
              name="EmailID"
              type="email"
              value={formData.EmailID}
              onChange={handleChange}
              required
            />
            <EnhancedInputField
              label="Login ID"
              name="LoginID"
              value={formData.LoginID}
              onChange={handleChange}
              readOnly
              required
            />
          </div>

          <RadioGroup
            label="Induction Required"
            name="InductionRequire"
            value={formData.InductionRequire}
            onChange={(value) => {
              const updatedFormData = {
                ...formData,
                InductionRequire: value,
              };
              setFormData(updatedFormData);
              localStorage.setItem(
                "editUserFormData",
                JSON.stringify(updatedFormData)
              );
            }}
            options={[
              { value: true, label: "Yes" },
              { value: false, label: "No" },
            ]}
          />

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[--primary-color]  text-white rounded-lg hover:bg-[--primary-color]  focus:outline-none focus:ring-2 focus:ring-[--primary-color] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update"}
            </button>
               <button
              type="button"
              onClick={() => navigate(-1)}
               className="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {showReasonModal && (
        <Modal
          title="Reason for Change"
          message={
            <div>
              <p className="mb-4">
                Please provide a reason for updating the user "
                {formData.FirstName} {formData.LastName}"
              </p>
              <EnhancedInputField
                name="reasonForChange"
                value={reasonForChange}
                onChange={(e) => setReasonForChange(e.target.value)}
                placeholder="Please provide a reason for this change..."
                asTextarea
                rows={4}
                required
              />
            </div>
          }
          onConfirm={handleConfirmUpdate}
          onCancel={handleCancelUpdate}
        />
      )}
    </>
  );
};

export default EditUser;
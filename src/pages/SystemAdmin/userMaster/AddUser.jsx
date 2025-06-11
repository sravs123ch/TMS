import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AsyncSelect from "react-select/async";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  createUserBasicInfo,
  fetchUsersWithSearch,
} from "../../../services/systemAdmin/UserMasterService";
import { fetchDepartmentsWithSearch } from "../../../services/systemAdmin/DepartmentMasterService";
import { fetchDesignationsWithSearch } from "../../../services/systemAdmin/DesignationMasterService";
import { fetchRolesWithSearch } from "../../../services/systemAdmin/RoleMasterService";
import {
  InputField,
  PasswordInput,
  RadioGroup,
  CustomAsyncSelect,
} from "../../../components/common/ui/FormFields";

const AddUser = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
    Password: "",
    ConfirmPassword: "",
    InductionRequire: false,
    UserProfileID: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  // Load initial data functions (unchanged)
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

  useEffect(() => {
    loadInitialDesignations();
    loadInitialDepartments();
    loadInitialRoles();
    loadInitialUsers();
  }, []);

  const handleMenuOpen = () => {
    if (designationOptions.length === 0) {
      loadInitialDesignations();
    }
  };

  const handleDepartmentMenuOpen = () => {
    if (departmentOptions.length === 0) {
      loadInitialDepartments();
    }
  };

  const handleRoleMenuOpen = () => {
    if (roleOptions.length === 0) {
      loadInitialRoles();
    }
  };

  const handleUserMenuOpen = () => {
    if (userOptions.length === 0) {
      loadInitialUsers();
    }
  };

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
    if (!hasMoreDepartments || isLoadingDepartmentsDepartments) return;
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
      const response = await fetchRolesWithSearch(
        rolePage * 10,
        10,
        roleSearch
      );
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
      const response = await fetchUsersWithSearch(
        userPage * 10,
        10,
        userSearch
      );
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
      toast.error(" error loading designations");
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
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
      "Password",
      "ConfirmPassword",
    ];

    for (let field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill in the ${field} field.`);
        return;
      }
    }

    if (formData.Password !== formData.ConfirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!["M", "F", "O"].includes(formData.Gender)) {
      toast.error("Please selectcz a valid gender");
      return;
    }

    try {
      const payload = {
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
        password: formData.Password,
        inductionRequire: formData.InductionRequire || false,
        userProfileID: Number(formData.UserProfileID) || 0,
        createdBy: "admin",
        reasonForChange: "Initial creation",
        electronicSignature: "admin-signature",
        signatureDate: new Date().toISOString(),
        plantID: Number(sessionStorage.getItem("plantId")) || 0,
      };

      const response = await createUserBasicInfo(payload);

      if (response.header?.errorCount === 0) {
        const allMessages = response.header?.messages || [];
        const errorMessages = allMessages.filter(
          (msg) => msg.messageLevel === "Error"
        );
        const infoMessages = allMessages.filter(
          (msg) => msg.messageLevel === "Information"
        );

        if (errorMessages.length > 0) {
          errorMessages.forEach((msg) => toast.error(msg.messageText));
        } else {
          infoMessages.forEach((msg, index) => {
            setTimeout(() => {
              toast.success(msg.messageText);
            }, index * 500);
          });

          setTimeout(() => {
            navigate("/system-admin/user-master");
          }, infoMessages.length * 500 + 3200);
        }
      } else {
        const allMessages = response.header?.messages || [];
        const errorMessages = allMessages.filter(
          (msg) => msg.messageLevel === "Error"
        );
        errorMessages.forEach((msg) => toast.error(msg.messageText));
      }
    } catch (error) {
      console.error("Error creating user:", error);
      const errorMsg =
        error?.response?.data?.messages?.[0]?.messageText ||
        error?.response?.data?.message ||
        "An error occurred while creating user.";
      toast.error(errorMsg);
    }
  };

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
          <h3 className="heading">Add User Master</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <InputField
              label="First Name"
              name="FirstName"
              value={formData.FirstName}
              onChange={handleChange}
              required
            />
            <InputField
              label="Last Name"
              name="LastName"
              value={formData.LastName}
              onChange={handleChange}
              required
            />
          </div>

          <CustomAsyncSelect
            label="Gender"
            options={[
              { value: "M", label: "Male" },
              { value: "F", label: "Female" },
              { value: "O", label: "Other" },
            ]}
            value={
              ["M", "F", "O"].includes(formData.Gender)
                ? {
                    value: formData.Gender,
                    label: { M: "Male", F: "Female", O: "Other" }[
                      formData.Gender
                    ],
                  }
                : null
            }
            onChange={(selected) =>
              setFormData({
                ...formData,
                Gender: selected ? selected.value : "",
              })
            }
            placeholder="-- Select Gender --"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <InputField
              label="Employee ID"
              name="EmployeeID"
              value={formData.EmployeeID}
              onChange={handleChange}
              required
            />
            <InputField
              label="Category Type"
              name="CategoryType"
              value={formData.CategoryType}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomAsyncSelect
              label="Role"
              options={roleOptions}
              value={roleOptions.find(
                (r) => r.value.toString() === formData.RoleID
              )}
              loadOptions={loadRoles}
              onChange={(selected) =>
                setFormData({
                  ...formData,
                  RoleID: selected ? selected.value : "",
                })
              }
              onMenuOpen={handleRoleMenuOpen}
              onMenuScrollToBottom={loadMoreRoles}
              onInputChange={(value) => {
                setRoleSearch(value);
                if (!value) {
                  setRolePage(0);
                  loadInitialRoles();
                } else {
                  setRolePage(0);
                  setRoleOptions([]);
                  setHasMoreRoles(true);
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
                (d) => d.value.toString() === formData.DepartmentID
              )}
              loadOptions={loadDepartments}
              onChange={(selected) =>
                setFormData({
                  ...formData,
                  DepartmentID: selected ? selected.value : "",
                })
              }
              onMenuOpen={handleDepartmentMenuOpen}
              onMenuScrollToBottom={loadMoreDepartments}
              onInputChange={(value) => {
                setDepartmentSearch(value);
                if (!value) {
                  setDepartmentPage(0);
                  loadInitialDepartments();
                } else {
                  setDepartmentPage(0);
                  setDepartmentOptions([]);
                  setHasMoreDepartments(true);
                }
              }}
              isLoading={isLoadingDepartments}
              placeholder="-- Select Department --"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomAsyncSelect
              label="Designation"
              options={designationOptions}
              value={designationOptions.find(
                (d) => d.value.toString() === formData.DesignationID
              )}
              loadOptions={loadDesignations}
              onChange={(selected) =>
                setFormData({
                  ...formData,
                  DesignationID: selected ? selected.value : "",
                })
              }
              onMenuOpen={handleMenuOpen}
              onMenuScrollToBottom={loadMoreDesignations}
              onInputChange={(value) => {
                setDesignationSearch(value);
                if (!value) {
                  setDesignationPage(0);
                  loadInitialDesignations();
                } else {
                  setDesignationPage(0);
                  setDesignationOptions([]);
                  setHasMoreDesignations(true);
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
              onChange={(selected) =>
                setFormData({
                  ...formData,
                  ReportsTo: selected ? selected.value : "",
                })
              }
              onMenuOpen={handleUserMenuOpen}
              onMenuScrollToBottom={loadMoreUsers}
              onInputChange={(value) => {
                setUserSearch(value);
                if (!value) {
                  setUserPage(0);
                  loadInitialUsers();
                } else {
                  setUserPage(0);
                  setUserOptions([]);
                  setHasMoreUsers(true);
                }
              }}
              isLoading={isLoadingUsers}
              placeholder="-- Select Manager --"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Email"
              name="EmailID"
              type="email"
              value={formData.EmailID}
              onChange={handleChange}
              required
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              title="Please enter a valid email address"
            />
            <InputField
              label="Login ID"
              name="LoginID"
              value={formData.LoginID}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PasswordInput
              label="Password"
              name="Password"
              value={formData.Password}
              onChange={handleChange}
              showPassword={showPassword}
              toggleShowPassword={() => setShowPassword(!showPassword)}
              required
              error={
                formData.Password &&
                formData.ConfirmPassword &&
                formData.Password !== formData.ConfirmPassword
                  ? "Passwords do not match"
                  : ""
              }
            />
            <PasswordInput
              label="Confirm Password"
              name="ConfirmPassword"
              value={formData.ConfirmPassword}
              onChange={handleChange}
              showPassword={showConfirmPassword}
              toggleShowPassword={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              required
              error={
                formData.Password &&
                formData.ConfirmPassword &&
                formData.Password !== formData.ConfirmPassword
                  ? "Passwords do not match"
                  : ""
              }
            />
          </div>

          <RadioGroup
            label="Induction Required"
            name="InductionRequire"
            value={formData.InductionRequire}
            onChange={(value) =>
              setFormData({ ...formData, InductionRequire: value })
            }
            options={[
              { value: true, label: "Yes" },
              { value: false, label: "No" },
            ]}
          />

          <div className="flex justify-end gap-2 mt-6 flex-wrap">
            <button
              type="submit"
              className="bg-[--primary-color]  text-white px-4 py-2 rounded-lg hover:bg-[--primary-color]  transition-colors font-medium"
            >
              Submit
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
    </>
  );
};

export default AddUser;

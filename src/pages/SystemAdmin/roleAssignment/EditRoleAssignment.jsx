import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
  getAllRoles,
  getAllUsersBasicInfo,
  updateRoleAssignment,
} from "../../../services/systemAdmin/RoleAssignmentService";
import Spinner from '../../../components/common/Spinner';
import { CustomAsyncSelect } from "../../../components/common/ui/FormFields";
import Modal from "../../../components/common/Modal";

const EditRoleAssignment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const assignmentData = location.state?.assignmentData;

  const [formData, setFormData] = useState({ roleID: "", userID: "" });
  const [rolesOptions, setRolesOptions] = useState([]);
  const [usersOptions, setUsersOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonForChange, setReasonForChange] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialFormDataRef = useRef(null);

  useEffect(() => {
    if (!assignmentData) {
      toast.error("No assignment data found.");
      navigate("/system-admin/role-assignment");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [rolesRes, usersRes] = await Promise.all([
          getAllRoles(),
          getAllUsersBasicInfo(),
        ]);

        const roles =
          rolesRes?.roles?.map((r) => ({
            label: r.roleName,
            value: r.roleID,
            description: r.description,
          })) || [];

        const users =
          usersRes?.usersBasicInfo?.map((u) => ({
            label: `${u.firstName} ${u.lastName}`,
            value: u.userID,
          })) || [];

        setRolesOptions(roles);
        setUsersOptions(users);

        const initial = {
          roleID: assignmentData.roleID,
          userID: assignmentData.userID,
        };

        setFormData(initial);
        initialFormDataRef.current = initial;
      } catch (error) {
        toast.error("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assignmentData, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.roleID || !formData.userID) {
      toast.error("Please fill all required fields.");
      return;
    }

    const hasChanged =
      JSON.stringify(formData) !== JSON.stringify(initialFormDataRef.current);

    if (!hasChanged) {
      toast.info("No changes made.");
      return;
    }

    setShowReasonModal(true);
  };

  const handleUpdate = async () => {
    if (!reasonForChange.trim()) {
      toast.error("Reason for change is required.");
      return;
    }

    setIsSubmitting(true);

    const user = JSON.parse(localStorage.getItem("user"));
    const modifiedBy = `${user?.firstName || "Admin"} ${
      user?.lastName || ""
    }`.trim();
    const plantID = parseInt(sessionStorage.getItem("plantId")) || 1;

    const selectedRole = rolesOptions.find((r) => r.value === formData.roleID);

    const payload = {
      roleID: parseInt(formData.roleID),
      roleName: selectedRole.label,
      description: selectedRole.description || selectedRole.label,
      modifiedBy,
      plantID,
      reasonForChange,
      electronicSignature: modifiedBy,
      signatureDate: new Date().toISOString(),
    };

    try {
      const res = await updateRoleAssignment(payload);
      const message = res?.header?.messages?.[0];

      if (message) {
        const { messageText, messageLevel } = message;
        if (messageLevel.toLowerCase() === "error") toast.error(messageText);
        else if (messageLevel.toLowerCase() === "warning")
          toast.warning(messageText);
        else toast.success(messageText);
      }

      if (res?.header?.errorCount === 0) {
        setTimeout(() => navigate("/system-admin/role-assignment"), 1200);
      }
    } catch (err) {
      toast.error("Something went wrong while updating.");
    } finally {
      setIsSubmitting(false);
      setShowReasonModal(false);
    }
  };

  const handleCancel = () => {
    setReasonForChange("");
    setShowReasonModal(false);
  };

  return (
    <div className="main-container">
      <ToastContainer position="top-right" autoClose={1500} />
      <div className="tableWhiteCardContainer">
        <h3 className="heading">Edit Role Assignment</h3>
        {isSubmitting  && <Spinner />}
        <form onSubmit={handleSubmit}>
          {/* User (Disabled) */}
          <CustomAsyncSelect
            label="Select User"
            name="userID"
            options={usersOptions}
            value={usersOptions.find((u) => u.value === formData.userID)}
            isDisabled
            placeholder="-- Select User --"
          />

          {/* Role (Editable) */}
          <CustomAsyncSelect
            label="Select Role"
            name="roleID"
            options={rolesOptions}
            value={rolesOptions.find((r) => r.value === formData.roleID)}
            onChange={(selected) =>
              setFormData({ ...formData, roleID: selected?.value || "" })
            }
            placeholder="-- Select Role --"
            isClearable
          />

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="submit"
              className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Modal for Reason */}
      {showReasonModal && (
        <Modal
          title="Reason for Role Update"
          message={
            <div>
              <p className="mb-2 text-sm text-gray-700">
                Please provide a reason for changing role for user "
                {usersOptions.find((u) => u.value === formData.userID)?.label}"
                from "
                {
                  rolesOptions.find(
                    (r) => r.value === initialFormDataRef.current?.roleID
                  )?.label
                }
                " to "
                {rolesOptions.find((r) => r.value === formData.roleID)?.label}"
              </p>
              <textarea
                className="w-full border rounded p-2 mt-2 text-sm"
                rows={4}
                value={reasonForChange}
                onChange={(e) => setReasonForChange(e.target.value)}
                placeholder="Enter reason for change..."
              />
            </div>
          }
          onConfirm={handleUpdate}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default EditRoleAssignment;

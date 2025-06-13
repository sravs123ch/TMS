import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RoleContext } from "../../../context/RoleContext";
import { updateRole } from "../../../services/systemAdmin/RoleMasterService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  InputField,
  EnhancedInputField,
} from "../../../components/common/ui/FormFields";
import Modal from "../../../components/common/Modal";
import Spinner from "../../../components/common/Spinner";

const EditRole = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedRole } = useContext(RoleContext);
  const initialFormDataRef = useRef(null);

  const [formData, setFormData] = useState({
    roleID: "",
    roleName: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonForChange, setReasonForChange] = useState("");

  useEffect(() => {
    const fallbackData = {
      roleID: selectedRole?.roleID || "",
      roleName: selectedRole?.roleName || "",
      description: selectedRole?.description || "",
    };
    const roleData = location.state?.roleData || fallbackData;

    setFormData(roleData);
    initialFormDataRef.current = { ...roleData };
  }, [location.state, selectedRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      JSON.stringify(formData) === JSON.stringify(initialFormDataRef.current)
    ) {
      toast.info("No changes made to update.");
      return;
    }
    setShowReasonModal(true);
  };

  const handleConfirmUpdate = async () => {
    if (!reasonForChange.trim()) {
      toast.error("Please provide a reason for the change.");
      return;
    }

    const userId = localStorage.getItem("userId") || "11";
    const payload = {
      roleID: formData.roleID,
      roleName: formData.roleName,
      description: formData.description,
      modifiedBy: userId,
      plantID: 0,
      reasonForChange: reasonForChange,
      electronicSignature: formData.roleName,
      signatureDate: new Date().toISOString(),
    };

    setLoading(true);
    try {
      const response = await updateRole(payload);

      const message = response?.header?.messages?.[0];
      const level = message?.messageLevel?.toLowerCase();

      if (level === "error") {
        toast.error(message.messageText);
      } else if (level === "warning") {
        toast.warning(message.messageText);
      } else if (level === "information") {
        toast.success(message.messageText || "Role updated successfully.");
        setTimeout(() => navigate("/system-admin/role-master"), 1500);
      } else {
        toast.error("Unexpected response from server.");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("An error occurred while updating the role.");
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

  return (
    <>
      <ToastContainer />
      <div className="main-container p-4 md:p-6">
        <div className="tableWhiteCardContainer">
          <form onSubmit={handleSubmit}>
            <h3 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-6">
              Edit Role
            </h3>

            <div className="mb-6">
              <InputField
                label="Role Name"
                name="roleName"
                value={formData.roleName}
                onChange={handleChange}
                placeholder="Enter role name"
                required
                className="w-full"
              />
            </div>

            <div className="mb-6">
              <EnhancedInputField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description (optional)"
                className="w-full"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                type="submit"
                className="primaryButton"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="secondaryButton"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Popup Modal */}
      {showReasonModal && (
        <Modal
          title="Reason for Change"
          message={
            <div className="relative">
              {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-60 z-10 flex items-center justify-center">
                  <Spinner />
                </div>
              )}
              <p className="text-gray-700">
                Please provide a reason for updating the role "
                {formData.roleName}"
              </p>
              <textarea
                value={reasonForChange}
                onChange={(e) => setReasonForChange(e.target.value)}
                placeholder="Please provide a reason for this change..."
                required
                className="w-full mt-3 p-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={4}
                disabled={loading}
              />
            </div>
          }
          onConfirm={handleConfirmUpdate}
          onCancel={handleCancelUpdate}
          confirmDisabled={loading || !reasonForChange.trim()}
          cancelDisabled={loading}
        />
      )}
    </>
  );
};

export default EditRole;

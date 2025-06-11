import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DesignationContext } from "../../../context/DesignationContext";
import { updateDesignation } from "../../../services/systemAdmin/DesignationMasterService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "../../../components/common/Modal";
import { InputField } from "../../../components/common/ui/FormFields";
import Spinner from "../../../components/common/Spinner";
const EditDesignation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedDesignation } = useContext(DesignationContext);
  const initialFormDataRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonForChange, setReasonForChange] = useState("");

  const [formData, setFormData] = useState({
    DesignationID: selectedDesignation.designationId || "",
    DesignationName: selectedDesignation.designationName || "",
  });

  useEffect(() => {
    if (location.state?.designationData) {
      const initialData = {
        DesignationID: location.state.designationData.designationID,
        DesignationName: location.state.designationData.designationName,
      };
      setFormData(initialData);
      initialFormDataRef.current = { ...initialData };
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      toast.error("Reason for change is required.");
      return;
    }

    setLoading(true);

    const requestBody = {
      designationID: formData.DesignationID,
      designationName: formData.DesignationName.trim(),
      modifiedBy: "Your Name or User ID",
      plantID: 0,
      reasonForChange,
      electronicSignature: "Your Electronic Signature",
      signatureDate: new Date().toISOString(),
    };

    try {
      const response = await updateDesignation(requestBody);
      const message = response?.header?.messages?.[0];

      if (message?.messageLevel) {
        const level = message.messageLevel.toLowerCase();
        if (level === "error") toast.error(message.messageText);
        else if (level === "warning") toast.warning(message.messageText);
        else if (level === "information") {
          toast.success(message.messageText);
          setTimeout(() => navigate("/system-admin/designation-master"), 3000);
        }
      } else {
        toast.error("Unexpected response from server.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred while updating.");
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
      <div className="main-container">
        <form onSubmit={handleSubmit}>
          <h3 className="heading">Edit Designation</h3>

          <div className="mb-4 mt-4">
            <InputField
              label="Designation Name"
              name="DesignationName"
              value={formData.DesignationName}
              onChange={handleChange}
              placeholder="Enter Designation Name"
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
             className="bg-[--primary-color]  text-white px-4 py-2 rounded-lg hover:bg-[--primary-color]  transition-colors font-medium"
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
           <div className="relative">
              {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-60 z-10 flex items-center justify-center">
                  <Spinner />
                </div>
              )}
              <p className="text-gray-700">
                Please provide a reason for updating the designation "
                {formData.DesignationName}"
              </p>
              <textarea
                value={reasonForChange}
                onChange={(e) => setReasonForChange(e.target.value)}
                placeholder="Please provide a reason for this change..."
                required
                className="w-full mt-3 p-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={4}
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

export default EditDesignation;

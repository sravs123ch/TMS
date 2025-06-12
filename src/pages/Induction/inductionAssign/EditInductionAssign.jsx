import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Spinner from "../../../components/common/Spinner";
import Modal from "../../../components/common/Modal";
import DatePicker from "../../../components/common/ui/DatePicker";
import {
  CustomAsyncSelect,
  EnhancedInputField,
} from "../../../components/common/ui/FormFields";
import CustomSelect from "../../../components/common/ui/CustomSelect"
import {
  getInductionAssignmentById,
  updateInductionAssignment,
} from "../../../services/induction/InductionAssignService";

const EditInductionAssign = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialFormDataRef = useRef(null);

  const [formData, setFormData] = useState({
    inductionID: "",
    userID: "",
    userName: "",
    dueDate: "",
    remarks: "",
    inductionStatus: "",
  });

  const [loading, setLoading] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonForChange, setReasonForChange] = useState("");

  const statusOptions = [
    { label: "Assigned", value: "Assigned" },
    { label: "InProgress", value: "InProgress" },
    { label: "Completed", value: "Completed" },
    { label: "Overdue", value: "Overdue" },
  ];

  useEffect(() => {
    const loadInductionData = async () => {
      const inductionID = location.state?.inductionData?.inductionID;

      if (inductionID) {
        try {
          const result = await getInductionAssignmentById(inductionID);
          if (result) {
            const initialData = {
              inductionID: result.inductionID,
              userID: result.userID,
              userName: `${result.firstName} ${result.lastName}`,
             dueDate: result.dueDate ? new Date(result.dueDate) : null,
              remarks: result.remarks || "",
              inductionStatus: result.inductionStatus || "",
            };
            setFormData(initialData);
            initialFormDataRef.current = { ...initialData };
          } else {
            toast.error("Failed to load induction assignment details.");
          }
        } catch (error) {
          toast.error("An error occurred while loading the data.");
        }
      } else {
        toast.error("Invalid induction assignment ID.");
        navigate(-1);
      }
    };

    loadInductionData();
  }, [location.state, navigate]);

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

    const payload = {
      inductionID: parseInt(formData.inductionID),
      userID: parseInt(formData.userID),
      modifiedBy: "2",
      remarks: formData.remarks,
      inductionStatus: formData.inductionStatus,
      reasonForChange,
      electronicSignature: "2",
      signatureDate: new Date().toISOString(),
      dueDate: formData.dueDate
        ? new Date(formData.dueDate).toISOString()
        : null,
    };

    try {
      const response = await updateInductionAssignment(payload);
      if (response.header?.errorCount === 0) {
        toast.success(
          response.header?.messages?.[0]?.messageText || "Updated successfully."
        );
        setShowReasonModal(false);
        setReasonForChange("");
        setTimeout(() => navigate("/induction/induction-assign"), 1500);
      } else {
        toast.error(
          response.header?.messages?.[0]?.messageText || "Update failed."
        );
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelUpdate = () => {
    setShowReasonModal(false);
    setReasonForChange("");
  };

  return (
    <>
      <ToastContainer />
      <div className="max-container">
        <div className="tableWhiteCardContainer">
          <form onSubmit={handleSubmit}>
            {loading && <Spinner />}

            <h3 className="heading">Edit Induction Assignment</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                User Name
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 text-gray-700"
              />
            </div>

            <div className="mb-4">
              <DatePicker
                label="Due Date"
                value={formData.dueDate}
                onChange={(date) =>
                  setFormData((prev) => ({ ...prev, dueDate: date }))
                }
                minDate={new Date()}
                placeholder="Select due date"
                sx={{ width: "100%" }}
              />
            </div>

            <EnhancedInputField
              name="remarks"
              label="Remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Optional remarks"
            />

            {/* <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Induction Status
              </label>
              <CustomAsyncSelect
                value={
                  formData.inductionStatus
                    ? {
                        label: formData.inductionStatus,
                        value: formData.inductionStatus,
                      }
                    : null
                }
                onChange={(option) =>
                  setFormData((prev) => ({
                    ...prev,
                    inductionStatus: option?.value || "",
                  }))
                }
                options={statusOptions}
                placeholder="--Select Status--"
              />
            </div> */}
            <div className="mb-4">
  <label className="block text-sm font-medium mb-1">Induction Status</label>
  <CustomSelect
    value={formData.inductionStatus}
    onChange={(value) =>
      setFormData((prev) => ({ ...prev, inductionStatus: value }))
    }
    options={["Assigned", "InProgress", "Completed", "Overdue"]}
    placeholder="--Select Status--"
  />
</div>


            <div className="flex justify-end gap-3 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[--primary-color] text-white rounded-lg text-sm hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
      {showReasonModal && (
        <Modal
          title="Reason for Change"
          message={
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Please provide a reason for updating the Induction Assignment
                for "{formData.userName}"
              </p>
              <textarea
                value={reasonForChange}
                onChange={(e) => setReasonForChange(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mt-2"
                placeholder="Please provide a reason for this change..."
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

export default EditInductionAssign;

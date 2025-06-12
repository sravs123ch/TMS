import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { updatePlant } from "../../../services/systemAdmin/PlantMasterService";
import { PlantContext } from "../../../context/PlantContext";
import { toast, ToastContainer } from "react-toastify";
import Modal from "../../../components/common/Modal";
import { InputField } from "../../../components/common/ui/FormFields";
import Spinner from "../../../components/common/Spinner";
import "react-toastify/dist/ReactToastify.css";

const EditPlant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPlant } = useContext(PlantContext);
  const initialFormDataRef = useRef(null);

  const [formData, setFormData] = useState({
    plantID: selectedPlant?.plantID || "",
    plantName: selectedPlant?.plantName || "",
  });
  const [loading, setLoading] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonForChange, setReasonForChange] = useState("");

  useEffect(() => {
    if (location.state?.plant) {
      const initialData = {
        plantID: location.state.plant.plantID,
        plantName: location.state.plant.plantName,
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

    if (!formData.plantName.trim()) {
      toast.error("Plant name is required.");
      return;
    }

    const currentData = { ...formData };
    if (JSON.stringify(currentData) === JSON.stringify(initialFormDataRef.current)) {
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

    const payload = {
      plantID: Number(formData.plantID),
      plantName: formData.plantName.trim(),
      modifiedBy: "Admin",
      reasonForChange: reasonForChange.trim(),
      electronicSignature: "Admin",
      signatureDate: new Date().toISOString().split("T")[0],
    };

    setLoading(true);
    try {
      const response = await updatePlant(payload);
      if (response.header?.errorCount === 0) {
        toast.success(response.header?.messages?.[0]?.messageText || "Plant updated successfully!");
        setTimeout(() => navigate("/system-admin/plant-master"), 1500);
      } else {
        toast.error(response.header?.messages?.[0]?.messageText || "Failed to update plant");
      }
    } catch (error) {
      console.error("Error updating plant:", error);
      toast.error("An error occurred during update");
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
      <div className="main-container">
      <ToastContainer position="top-right" autoClose={1500} />
      {loading && <Spinner />}

      <form
        onSubmit={handleSubmit}
      >
         <h3 className="heading">Edit Plant</h3>
   <div className="relative mt-6 mb-6">
        <InputField
          label="Plant Name"
          name="plantName"
          value={formData.plantName}
          onChange={handleChange}
          placeholder="Enter Plant Name"
          required
        />

        <div className="flex justify-end gap-4 pt-4">
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
            disabled={loading}
          >
            Cancel
          </button>
        </div>
        </div>
      </form>

      {/* Reason Modal */}
      {showReasonModal && (
        <Modal
          title="Reason for Change"
          message={
            <div>
              <p className="mb-2">
                Please provide a reason for updating the plant{" "}
                <span className="font-semibold text-blue-700">"{formData.plantName}"</span>:
              </p>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-2 mt-2"
                rows={4}
                value={reasonForChange}
                onChange={(e) => setReasonForChange(e.target.value)}
                placeholder="Please provide a reason for this change..."
                required
              />
            </div>
          }
          onConfirm={handleConfirmUpdate}
          onCancel={handleCancelUpdate}
        />
      )}
    </div>
  );
};

export default EditPlant;

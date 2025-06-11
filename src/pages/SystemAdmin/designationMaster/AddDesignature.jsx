import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDesignation } from "../../../services/systemAdmin/DesignationMasterService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "../../../components/common/Spinner";
import { InputField } from "../../../components/common/ui/FormFields";

const AddDesignation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    DesignationName: "",
    createdBy: "admin",
    plantID: 1,
    electronicSignature: "admin-signature",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      designationName: formData.DesignationName.trim(),
      createdBy: formData.createdBy,
      plantID: formData.plantID,
      electronicSignature: formData.electronicSignature,
      signatureDate: new Date().toISOString(),
    };

    try {
      const result = await createDesignation(payload);
      const message = result?.header?.messages?.[0];
      if (message?.messageLevel) {
        const level = message.messageLevel.toLowerCase();
        if (level === "error") toast.error(message.messageText);
        else if (level === "warning") toast.warning(message.messageText);
        else if (level === "information") {
          toast.success(message.messageText);
          setTimeout(() => navigate("/system-admin/designation-master"), 1200);
        }
      } else {
        toast.error("Unexpected response from server.");
      }
    } catch (error) {
      console.error("Error creating designation:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <ToastContainer position="top-right" autoClose={1500} />
      <form onSubmit={handleSubmit}>
        <h3 className="heading">Add Designation</h3>

        <div className="relative mt-6 mb-6">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
                <Spinner/>
              </div>
            )}
          <InputField
            label="Designation Name"
            name="DesignationName"
            value={formData.DesignationName}
            onChange={handleChange}
            placeholder="Enter Designation Name"
            required
          />
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="submit"
            disabled={loading}
             className="bg-[--primary-color]  text-white px-4 py-2 rounded-lg hover:bg-[--primary-color]  transition-colors font-medium"
          >
            {loading ? "Creating..." : "Submit"}
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
  );
};

export default AddDesignation;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPlant } from "../../../services/systemAdmin/PlantMasterService";
import { toast, ToastContainer } from "react-toastify";
import Spinner from "../../../components/common/Spinner";
import { InputField } from "../../../components/common/ui/FormFields";
import "react-toastify/dist/ReactToastify.css";

const AddPlant = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ plantName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ plantName: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.plantName.trim()) {
      setError("Plant name is required");
      return;
    }

    const payload = {
      plantName: formData.plantName.trim(),
      createdBy: "Admin",
      electronicSignature: "Admin",
      signatureDate: new Date().toISOString().split("T")[0],
    };

    setLoading(true);
    try {
      const response = await createPlant(payload);
      if (response.header?.errorCount === 0) {
        const successMsg = response.header?.messages?.[0]?.messageText;
        toast.success(successMsg || "Plant added successfully!");
        setTimeout(() => navigate("/system-admin/plant-master"), 1500);
      } else {
        const errorMsg = response.header?.messages?.[0]?.messageText;
        setError(errorMsg || "Failed to add plant");
        toast.error(errorMsg || "Failed to add plant");
      }
    } catch (err) {
      toast.error("An error occurred while adding the plant");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="main-container">
      <ToastContainer position="top-right" autoClose={1500} />

      {loading && <Spinner />}

      <form
        onSubmit={handleSubmit}
      >
          <h3 className="heading">Add Plant</h3>
   <div className="relative mt-6 mb-6">
        <InputField
          label="Plant Name"
          name="plantName"
          placeholder="Enter Plant Name"
          required
          value={formData.plantName}
          onChange={handleChange}
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-[--primary-color] text-white rounded-lg text-sm hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      </form>
    </div>
  );
};

export default AddPlant;

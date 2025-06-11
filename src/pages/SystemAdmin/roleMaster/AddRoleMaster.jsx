import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRole } from "../../../services/systemAdmin/RoleMasterService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { InputField } from "../../../components/common/ui/FormFields";
import Spinner from "../../../components/common/Spinner";
const AddRole = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    roleName: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      roleName: formData.roleName.trim(),
      description: formData.description.trim(),
      createdBy: "11", 
      plantID: 0,
      electronicSignature: "string",
      signatureDate: new Date().toISOString(),
    };

    setLoading(true);
    try {
      const response = await createRole(payload);

      if (response.header?.errorCount === 0) {
        const infoMsg = response.header?.messages?.find(
          (msg) => msg.messageLevel === "Information"
        )?.messageText;

        toast.success(infoMsg || "Role added successfully");
        setTimeout(() => {
          navigate("/system-admin/role-master");
        }, 1500);
      } else {
        const errorMsg = response.header?.messages?.find(
          (msg) => msg.messageLevel === "Error"
        )?.messageText;
        toast.error(errorMsg || "Failed to add role");
      }
    } catch (error) {
      toast.error("Error occurred while adding role");
      console.error("Error creating role:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="main-container">
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="container">
        <form onSubmit={handleSubmit}>
          <h3 className="heading">Add Role</h3>

          {/* Form Fields Container */}
          <div className="relative mt-6 mb-6">
            {/* Spinner overlay on top of input fields */}
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
                <Spinner/>
              </div>
            )}
            <div
              className={`${loading ? "opacity-50 pointer-events-none" : ""}`}
            >
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
                <InputField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="bg-[--primary-color] text-white px-4 py-2 rounded-lg hover:bg-[--primary-color] transition-colors font-medium"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
            <button
              onClick={() => navigate(-1)}
              disabled={loading}
              className="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRole;

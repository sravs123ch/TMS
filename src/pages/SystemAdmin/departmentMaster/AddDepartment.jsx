import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDepartment } from "../../../services/systemAdmin/DepartmentMasterService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { InputField } from "../../../components/common/ui/FormFields";
import Spinner from "../../../components/common/Spinner";
const AddDepartment = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    departmentName: "",
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
    setError("");
    setLoading(true);

    try {
      const departmentData = {
        departmentName: formData.departmentName.trim(),
        createdBy: "Admin", // Replace dynamically if needed
        plantID: 0,
        electronicSignature: "Admin",
        signatureDate: new Date().toISOString(),
      };

      const response = await createDepartment(departmentData);
      console.log(response);

      if (response.header?.errorCount === 0) {
        const infoMsg = response.header?.messages?.[0]?.messageText;
        toast.success(infoMsg);
        setTimeout(() => {
          navigate("/system-admin/department-master");
        }, 1000);
      } else {
        if (response.header?.errorCount !== 0) {
          const errorMsg = response.header?.messages?.[0]?.messageText;
          if (errorMsg) {
            setError(errorMsg);
            toast.error(errorMsg);
          }
        }
      }
    } catch (error) {
      setError("An error occurred while creating the department");
      toast.error("An error occurred");
    } finally {
      setLoading(false);
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
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="main-container">
        <div className="tableWhiteCardContainer">
          <form onSubmit={handleSubmit}>
            <h3 className="heading">Add Department</h3>

            <div className="relative mt-6 mb-6">
              {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
                  <Spinner />
                </div>
              )}
              <InputField
                label="Department Name"
                name="departmentName"
                type="text"
                value={formData.departmentName}
                onChange={handleChange}
                placeholder="Enter Department Name"
                required
                labelSuffix={<span className="text-red-500">*</span>}
              />
            </div>

            {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

            <div className="flex justify-end gap-3 mt-6">
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
                className="secondaryButton"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddDepartment;

import React, { useState } from "react";
import { InputField, EnhancedInputField, CustomAsyncSelect, RadioGroup } from "../../../components/common/ui/FormFields";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Spinner from "../../../components/common/Spinner";
// Dummy load options function for departments
const loadDepartmentOptions = async (inputValue, callback) => {
  try {
    const res = await fetch(`/api/departments?search=${inputValue}`);
    const data = await res.json();
    const options = data.map((dept) => ({ label: dept.name, value: dept.id }));
    callback(options);
  } catch (error) {
    console.error("Error loading departments:", error);
    callback([]);
  }
};

const AddJobResponsibility = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    responsibilityName: "",
    description: "",
    department: null,
    roleType: "Primary",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, department: selectedOption }));
  };

  const handleRadioChange = (value) => {
    setFormData((prev) => ({ ...prev, roleType: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.responsibilityName.trim()) newErrors.responsibilityName = "Name is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      const payload = {
        name: formData.responsibilityName,
        description: formData.description,
        departmentId: formData.department.value,
        roleType: formData.roleType,
      };

      const res = await fetch("/api/job-responsibilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Job Responsibility added successfully!");
        navigate("/job-responsibilities");
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to add job responsibility");
      }
    } catch (err) {
      toast.error("Something went wrong. Try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <div className="main-container">
        <div className="tableWhiteCardContainer">
      <h2 className="heading">Add Job Responsibility</h2>
      <form onSubmit={handleSubmit}>
        <InputField
          label="Responsibility Name"
          name="responsibilityName"
          value={formData.responsibilityName}
          onChange={handleChange}
          required
          error={errors.responsibilityName}
          placeholder="Enter job responsibility name"
        />

        <CustomAsyncSelect
          label="Department"
          value={formData.department}
          onChange={handleSelectChange}
          loadOptions={loadDepartmentOptions}
          options={[]} // You can preload some if needed
          placeholder="Select department"
          required
          isLoading={false}
        />
        {errors.department && (
          <span className="text-red-500 text-xs mt-1">{errors.department}</span>
        )}

        <RadioGroup
          label="Role Type"
          name="roleType"
          value={formData.roleType}
          onChange={handleRadioChange}
          options={[
            { label: "Primary", value: "Primary" },
            { label: "Secondary", value: "Secondary" },
          ]}
        />

        <EnhancedInputField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          error={errors.description}
          placeholder="Enter description"
          asTextarea
        />

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
             className="btn-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
           className="px-5 py-2.5 bg-[--primary-color] text-white rounded-lg text-sm hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
      </div>
  );
};

export default AddJobResponsibility;

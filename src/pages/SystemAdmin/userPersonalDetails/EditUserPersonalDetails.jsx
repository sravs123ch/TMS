import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  InputField,
  EnhancedInputField,
} from "../../../components/common/ui/FormFields";
import DatePicker, {
  phoneInputStyles,
} from "../../../components/common/ui/DatePicker";
import Spinner from "../../../components/common/Spinner";
import { updateUserPersonalDetail } from "../../../services/systemAdmin/UserPersonalDetailsService";

const EditUser = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    userID: "",
    firstName: "",
    lastName: "",
    address: "",
    contactNo: "",
    dob: "",
    doj: "",
    emergencyNo: "",
    bloodGroup: "",
    fatherName: "",
    motherName: "",
    totalExperience: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { userData } = location.state || {};
    if (userData) {
      setFormData({
        userID: userData.userID || "",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        address: userData.address || "",
        contactNo: userData.contactNo || "",
        dob: userData.dob
          ? new Date(userData.dob).toISOString().split("T")[0]
          : "",
        doj: userData.doj
          ? new Date(userData.doj).toISOString().split("T")[0]
          : "",
        emergencyNo: userData.emergencyNo || "",
        bloodGroup: userData.bloodGroup || "",
        fatherName: userData.fatherName || "",
        motherName: userData.motherName || "",
        totalExperience: userData.totalExperience || "",
      });
    } else {
      toast.error("No user data found");
      navigate("/system-admin/User-Personal-Details");
    }
  }, [location.state, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (value, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        toast.error("Authorization token missing. Please log in again.");
        return;
      }

      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.address ||
        !formData.contactNo ||
        !formData.dob ||
        !formData.doj
      ) {
        toast.error("Please fill in all required fields.");
        return;
      }

      if (formData.contactNo.length !== 12) {
        toast.error("Please enter a valid contact number");
        return;
      }

      if (formData.emergencyNo && formData.emergencyNo.length !== 12) {
        toast.error("Please enter a valid emergency number");
        return;
      }

      const payload = {
        ...formData,
        dob: new Date(formData.dob).toISOString(),
        doj: new Date(formData.doj).toISOString(),
        totalExperience: parseFloat(formData.totalExperience),
        modifiedBy: "admin",
        plantID: 0,
        reasonForChange: "User details updated",
        electronicSignature: "admin-signature",
        signatureDate: new Date().toISOString(),
      };

      const result = await updateUserPersonalDetail(payload);

      if (result.header?.errorCount === 0) {
        toast.success("User details updated!");
        setTimeout(() => navigate("/system-admin/User-Personal-Details"), 1500);
      } else {
        const errorMsg =
          result.header?.messages?.map((msg) => msg.messageText).join("\n") ||
          "Failed to update user details";
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Error updating user details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <ToastContainer position="top-right" autoClose={1500} />
      <div className="tableWhiteCardContainer">
        <h2 className="heading">Edit User Personal Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <InputField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <InputField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              label="Date of Birth"
              value={formData.dob}
              onChange={(date) =>
                setFormData((prev) => ({ ...prev, dob: date }))
              }
              required
            />
            <DatePicker
              label="Date of Joining"
              value={formData.doj}
              onChange={(date) =>
                setFormData((prev) => ({ ...prev, doj: date }))
              }
              required
            />
          </div>

          <EnhancedInputField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            type="textarea"
            rows={3}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-sm">
                Contact No <span className="text-red-500">*</span>
              </label>
              <PhoneInput
                inputStyle={phoneInputStyles.input}
                country={"in"}
                value={formData.contactNo}
                onChange={(phone) => handlePhoneChange(phone, "contactNo")}
                enableSearch
                inputClass="w-full !rounded-md !border-gray-300 !shadow-sm !text-sm"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-sm">
                Emergency No
              </label>
              <PhoneInput
                inputStyle={phoneInputStyles.input}
                country={"in"}
                value={formData.emergencyNo}
                onChange={(phone) => handlePhoneChange(phone, "emergencyNo")}
                enableSearch
                inputClass="w-full !rounded-md !border-gray-300 !shadow-sm !text-sm"
              />
            </div>
          </div>

          <InputField
            label="Blood Group"
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Father's Name"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
            />
            <InputField
              label="Mother's Name"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
            />
          </div>

          <InputField
            label="Total Experience (Years)"
            name="totalExperience"
            value={formData.totalExperience}
            onChange={handleChange}
            type="number"
            step="0.1"
          />

          <div className="flex justify-end items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="primaryButton"
            >
              {loading ? <Spinner size="sm" /> : "Update"}
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
  );
};

export default EditUser;

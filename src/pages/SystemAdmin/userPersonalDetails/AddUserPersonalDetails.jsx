import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt } from "react-icons/fa";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { createUserPersonalDetail } from "../../../services/systemAdmin/UserPersonalDetailsService";
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

const AddUserPersonalDetails = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userID: "",
    name: "",
    address: "",
    dob: "",
    doj: "",
    contactNo: "",
    emergencyNo: "",
    bloodGroup: "",
    fatherName: "",
    motherName: "",
    totalExperience: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { name, address, dob, doj, contactNo, emergencyNo, totalExperience } =
      formData;

    if (
      !name ||
      !address ||
      !dob ||
      !doj ||
      !contactNo ||
      !emergencyNo ||
      !totalExperience
    ) {
      setErrorMessage("Please fill all required fields.");
      return false;
    }
    if (contactNo.length < 10 || emergencyNo.length < 10) {
      setErrorMessage("Please enter valid phone numbers.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateForm()) return;

    try {
      setLoading(true);
      const payload = {
        userID: formData.userID,
        address: formData.address,
        dob: new Date(formData.dob).toISOString(),
        doj: new Date(formData.doj).toISOString(),
        totalExperience: parseFloat(formData.totalExperience),
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        contactNo: formData.contactNo,
        emergencyNo: formData.emergencyNo,
        bloodGroup: formData.bloodGroup,
        createdBy: "admin",
        plantID: 0,
        reasonForChange: "New user added",
        electronicSignature: "admin-signature",
        signatureDate: new Date().toISOString(),
      };

      const result = await createUserPersonalDetail(payload);

      if (result.header?.errorCount === 0) {
        toast.success("User created successfully");
        navigate("/system-admin/User-Personal-Details");
      } else {
        toast.error(result.header?.message || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Something went wrong");
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

      {loading && <Spinner overlay />}
      <div className="tableWhiteCardContainer">
        <form onSubmit={handleSubmit} className="p-6">
          <h3 className="heading">Add User Personal Details</h3>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-6">
            {/* User ID */}
            <InputField
              label="User ID"
              name="userID"
              type="number"
              value={formData.userID}
              onChange={handleChange}
              placeholder="User ID"
              required
            />

            {/* Name */}
            <InputField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Blood Group */}
            <InputField
              label="Blood Group"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              placeholder="O+"
              required
            />

            {/* Address */}
            <InputField
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Contact No */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Contact No
              </label>
              <PhoneInput
                country={"in"}
                value={formData.contactNo}
                onChange={(phone) =>
                  setFormData((prev) => ({ ...prev, contactNo: phone }))
                }
                inputStyle={phoneInputStyles.input}
                containerClass="w-full"
                enableSearch
                required
              />
            </div>

            {/* Emergency No */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Emergency No
              </label>
              <PhoneInput
                country={"in"}
                value={formData.emergencyNo}
                onChange={(phone) =>
                  setFormData((prev) => ({ ...prev, emergencyNo: phone }))
                }
                enableSearch
                required
                containerStyle={{
                  width: "100%",
                }}
                inputStyle={phoneInputStyles.input}
                buttonStyle={{
                  border: "none",
                  background: "transparent",
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* DOB */}
            <DatePicker
              label="Date of Birth"
              value={formData.dob}
              onChange={(date) =>
                setFormData((prev) => ({ ...prev, dob: date }))
              }
              placeholder="Select date of birth"
              maxDate={new Date()}
              required
            />

            {/* DOJ */}
            <DatePicker
              label="Date of Joining"
              value={formData.doj}
              onChange={(date) =>
                setFormData((prev) => ({ ...prev, doj: date }))
              }
              placeholder="Select date of joining"
              maxDate={new Date()}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Father's Name */}
            <InputField
              label="Father's Name"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              placeholder="Father's Name"
            />

            {/* Mother's Name */}
            <InputField
              label="Mother's Name"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              placeholder="Mother's Name"
            />
          </div>

          <div className="mb-6">
            {/* Total Experience */}
            <InputField
              label="Total Experience (Years)"
              name="totalExperience"
              type="number"
              value={formData.totalExperience}
              onChange={handleChange}
              placeholder="Years"
              required
            />
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              className="secondaryButton"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              disabled={loading}
              loading={loading}
              className="primaryButton"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserPersonalDetails;

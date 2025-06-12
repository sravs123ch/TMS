import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "../../../components/common/ui/DatePicker";
import { EnhancedInputField } from "../../../components/common/ui/FormFields";
import {
  getJobResponsibilityByUserId,
  signOffInductionAssignment,
} from "../../../services/induction/InductionSignService";

const InductionSign = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [jobResponsibilities, setJobResponsibilities] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [isSignedOff, setIsSignedOff] = useState(false);

  const [formData, setFormData] = useState({
    userID: "",
    induction_ID: "",
    jobResponsibilityID: "",
    plantID: "",
    createdBy: "",
    remarks: "",
    electronicSignature: "",
    signatureDate: new Date().toISOString().split("T")[0],
    confirmation: false,
  });

  const [inductionData, setInductionData] = useState({
    employeeName: "",
    employeeID: "",
    plantName: "",
    department: "",
    assignedJDTitle: "",
    responsibilities: "",
  });

  useEffect(() => {
    const loadJobResponsibility = async () => {
      const userId = sessionStorage.getItem("userId");
      const userData = sessionStorage.getItem("userData");

      if (userId) {
        try {
          setLoading(true);
          setHasError(false);
          const response = await getJobResponsibilityByUserId(userId);

          if (
            response &&
            response.jobResponsibility &&
            !response.header.errorCount
          ) {
            const jobResp = response.jobResponsibility;

            // Validate required fields
            if (
              !jobResp.userID ||
              !jobResp.inductionID ||
              !jobResp.jobResponsibilityID ||
              !jobResp.plantID
            ) {
              setHasError(true);
              toast.error(
                "Missing required job responsibility information. Please contact your administrator."
              );
              return;
            }

            // Check if already signed off
            if (jobResp.isSignedOff) {
              setIsSignedOff(true);
              toast.info("This induction has already been signed off");
            }

            setJobResponsibilities(jobResp);

            const updatedInductionData = {
              assignedJDTitle: jobResp.title || "",
              responsibilities: jobResp.responsibilities || "",
              department: jobResp.departmentName || "",
              plantName: jobResp.plantName?.trim() || "Not Assigned",
              employeeName: `${jobResp.firstName || ""} ${
                jobResp.lastName || ""
              }`.trim(),
              employeeID: jobResp.employeeID || "",
            };

            setInductionData(updatedInductionData);

            setFormData((prevFormData) => ({
              ...prevFormData,
              userID: jobResp.userID,
              induction_ID: jobResp.inductionID,
              jobResponsibilityID: jobResp.jobResponsibilityID,
              plantID: jobResp.plantID,
              createdBy: userId,
              confirmation: jobResp.isSignedOff || prevFormData.confirmation,
              electronicSignature: jobResp.isSignedOff
                ? `${jobResp.firstName} ${jobResp.lastName}`.trim()
                : prevFormData.electronicSignature,
              signatureDate:
                jobResp.signatureDate || prevFormData.signatureDate,
              remarks: jobResp.remarks || prevFormData.remarks,
            }));
          } else {
            setHasError(true);
            const errorMessage =
              response?.header?.messages?.[0]?.messageText ||
              "No job responsibility data found";

            toast.error(errorMessage);
          }
        } catch (error) {
          setHasError(true);
          toast.error("Failed to load job responsibility data");
        } finally {
          setLoading(false);
        }
      } else {
        toast.error("Please log in to access this page");
        navigate("/login");
      }
    };

    loadJobResponsibility();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      signatureDate: date,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.confirmation) {
      toast.error("Please confirm that you have completed your induction");
      return;
    }

    if (!formData.electronicSignature) {
      toast.error("Please enter your electronic signature");
      return;
    }

    const userData = JSON.parse(sessionStorage.getItem("userData"));
    const fullName = `${userData.firstName} ${userData.lastName}`.trim();

    if (formData.electronicSignature.trim() !== fullName) {
      toast.error("Electronic signature must match your full name");
      return;
    }

    // Validate required fields
    if (
      !formData.userID ||
      !formData.induction_ID ||
      !formData.jobResponsibilityID ||
      !formData.plantID
    ) {
      toast.error(
        "Missing required information. Please refresh the page and try again."
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        userID: formData.userID,
        induction_ID: formData.induction_ID,
        jobResponsibilityID: formData.jobResponsibilityID,
        plantID: formData.plantID,
        createdBy: formData.createdBy,
        remarks: formData.remarks || "",
        electronicSignature: formData.electronicSignature,
        signatureDate: formData.signatureDate,
      };

      const response = await signOffInductionAssignment(payload);

      if (response.header?.errorCount === 0) {
        toast.success("Your induction has been successfully signed off");
        // Navigate back to assignments page after successful sign-off
        setTimeout(() => {
          navigate("/induction/induction-assign");
        }, 2000);
      } else {
        const errorMessage =
          response.header?.messages?.[0]?.messageText ||
          "Failed to sign off induction";

        // Show a more detailed error message
        if (errorMessage.includes("failed to signed off")) {
          toast.error(
            <div>
              <p>Your induction sign-off failed.</p>
              <p>Please ensure:</p>
              <ul>
                <li>You have completed all required training</li>
                <li>Your induction is not already signed off</li>
                <li>You have the correct permissions</li>
              </ul>
              <p>If the issue persists, please contact your administrator.</p>
            </div>
          );
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.header?.messages?.[0]?.messageText ||
        "An unexpected error occurred";

      if (errorMessage.includes("failed to signed off")) {
        toast.error(
          <div>
            <p>Your induction sign-off failed.</p>
            <p>Please ensure:</p>
            <ul>
              <li>You have completed all required training</li>
              <li>Your induction is not already signed off</li>
              <li>You have the correct permissions</li>
            </ul>
            <p>If the issue persists, please contact your administrator.</p>
          </div>
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div className="tableWhiteCardContainer">
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
        {hasError ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
              <h2 className="heading">Unable to Load Job Responsibility</h2>
              <p className="text-gray-600 mb-6">
                Please ensure you have a valid job responsibility assigned
                before signing off your induction.
              </p>
              <button
                className="bg-[--primary-color] hover:bg-[--primary-color] text-white px-6 py-2 rounded-md transition-colors"
                onClick={() => navigate("/induction/induction-assign")}
              >
                Return to Induction Assignments
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {loading && (
              <div className="h-1 mb-4 w-full overflow-hidden">
                <div className="animate-pulse w-full h-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
              </div>
            )}

            <h2 className="heading">
              {isSignedOff
                ? "Induction Sign Off Details"
                : "Induction Sign Off"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EnhancedInputField
                label="Employee Name"
                value={inductionData.employeeName || ""}
                readOnly
              />
              <EnhancedInputField
                label="Employee ID"
                value={inductionData.employeeID || ""}
                readOnly
              />
              <EnhancedInputField
                label="Plant Name"
                value={inductionData.plantName || ""}
                readOnly
              />
              <EnhancedInputField
                label="Department"
                value={inductionData.department || ""}
                readOnly
              />
              <EnhancedInputField
                label="Assigned JD Title"
                value={inductionData.assignedJDTitle || ""}
                readOnly
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsibilities
              </label>
              <div className="p-4 border border-gray-300 rounded-lg bg-white h-48 overflow-y-auto">
                {inductionData.responsibilities || ""}
              </div>
            </div>

            {!isSignedOff && (
              <div className="bg-gray-50 p-5 rounded-lg mb-6">
                <h4 className="text-lg font-medium text-blue-900 mb-4">
                  Sign Off Details
                </h4>

                <div className="mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="confirmation"
                      checked={formData.confirmation}
                      onChange={handleChange}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">
                      I confirm that I have completed my induction and accept
                      the responsibilities assigned to me as part of my Job
                      Description.
                    </span>
                  </label>
                </div>

                <EnhancedInputField
                  label="Electronic Signature"
                  name="electronicSignature"
                  value={formData.electronicSignature}
                  onChange={handleChange}
                  placeholder="Enter your name as electronic signature"
                  required
                />

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Signature Date
                  </label>
                  <DatePicker
                    value={formData.signatureDate}
                    onChange={handleDateChange}
                    maxDate={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <EnhancedInputField
                  label="Remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Enter remarks (optional)"
                  maxLength={500}
                  asTextarea
                  rows={3}
                />
              </div>
            )}

            <div className="flex justify-end space-x-3">
              {!isSignedOff && (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-[--primary-color] text-white rounded-lg text-sm hover:bg-[--primary-color] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing Off..." : "Sign Off"}
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-cancel"
              >
                {isSignedOff ? "Back" : "Cancel"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InductionSign;

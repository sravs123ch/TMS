import React, { useState, useEffect } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createDocument } from "../../../services/sopojt-Management/DocumentRegistrationService";
import { fetchDocumentTypes } from "../../../services/lookup/lookupService";
import {
  InputField,
  EnhancedInputField,
  CustomAsyncSelect,
  FileUploadField,
} from "../../../components/common/ui/FormFields";
import Spinner from "../../../components/common/Spinner";

const RegisterDocument = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    documentName: "",
    uniqueCode: "",
    documentType: "",
    version: "",
    estimatedReadingTime: "",
    effectiveFrom: "",
    nextReviewDate: "",
    uploadFile: null,
    remarks: "",
    createdBy: "",
    createdDate: new Date().toISOString().split("T")[0],
  });

  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getDocumentTypes = async () => {
      try {
        const data = await fetchDocumentTypes();
        if (data?.documentTypes) {
          const options = data.documentTypes.map((type) => ({
            value: type.documentTypeID,
            label: type.documentTypeName,
          }));
          setDocumentTypes(options);
        }
      } catch (err) {
        const errorMessage =
          err?.response?.data?.message || "Failed to load document types";
        toast.error(errorMessage);
      }
    };

    getDocumentTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (name === "effectiveFrom") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        nextReviewDate:
          prev.nextReviewDate && new Date(prev.nextReviewDate) < new Date(value)
            ? prev.nextReviewDate
            : "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "file" ? files[0] : value,
      }));
    }
  };

  const validateDocumentName = (name) => {
    if (name.length < 5) {
      return "Document name must be at least 5 characters long";
    }
    if (name.length > 100) {
      return "Document name must not exceed 100 characters";
    }
    if (!/^[a-zA-Z0-9\s\-_.,()]+$/.test(name)) {
      return "Document name can only contain letters, numbers, spaces, and basic punctuation";
    }
    return null;
  };

  const validateUniqueCode = (code) => {
    if (!code) return "Unique code is required";
    return null;
  };

  const validateDates = (effectiveFrom, nextReviewDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const effectiveDate = new Date(effectiveFrom);
    const reviewDate = new Date(nextReviewDate);

    if (effectiveDate < today) {
      return "Effective From date cannot be in the past";
    }

    if (reviewDate <= effectiveDate) {
      return "Next Review Date must be after Effective From Date";
    }

    const maxReviewPeriod = new Date(effectiveDate);
    maxReviewPeriod.setFullYear(maxReviewPeriod.getFullYear() + 2);
    if (reviewDate > maxReviewPeriod) {
      return "Next Review Date cannot be more than 2 years after Effective From Date";
    }

    return null;
  };

  const validateFile = (file) => {
    if (!file) return "File is required";

    const allowedTypes = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "video/mp4",
    ];
    if (!allowedTypes.includes(file.type)) {
      return "Only PDF, PPT, PPTX, and MP4 files are allowed";
    }

    const maxFileSize = 500 * 1024 * 1024;
    if (file.size > maxFileSize) {
      return "File size must be less than 500MB";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const nameError = validateDocumentName(formData.documentName);
    if (nameError) {
      toast.error(nameError);
      setLoading(false);
      return;
    }

    const codeError = validateUniqueCode(formData.uniqueCode);
    if (codeError) {
      toast.error(codeError);
      setLoading(false);
      return;
    }

    if (!formData.documentType) {
      toast.error("Please select a document type");
      setLoading(false);
      return;
    }

    if (
      !formData.estimatedReadingTime ||
      isNaN(formData.estimatedReadingTime) ||
      Number(formData.estimatedReadingTime) <= 0
    ) {
      toast.error("Estimated Reading Time must be a positive number");
      setLoading(false);
      return;
    }

    const dateError = validateDates(
      formData.effectiveFrom,
      formData.nextReviewDate
    );
    if (dateError) {
      toast.error(dateError);
      setLoading(false);
      return;
    }

    const fileError = validateFile(formData.uploadFile);
    if (fileError) {
      toast.error(fileError);
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("DocumentPath", "");
      formDataToSend.append(
        "DocumentExtention",
        `.${formData.uploadFile.name.split(".").pop()}`
      );
      formDataToSend.append("SignatureDate", new Date().toISOString());
      formDataToSend.append("PlantID", 0);
      formDataToSend.append("DocumentName", formData.documentName);
      formDataToSend.append("DocumentCode", formData.uniqueCode);
      formDataToSend.append("DocumentTypeID", formData.documentType);
      formDataToSend.append("Remarks", formData.remarks || "");
      formDataToSend.append("ElectronicSignature", "string");
      formDataToSend.append("file", formData.uploadFile);
      formDataToSend.append(
        "EstimatedReadingTime",
        formData.estimatedReadingTime
      );
      formDataToSend.append("DocumentVersion", formData.version);
      formDataToSend.append("CreatedBy", formData.createdBy || "string");

      const result = await createDocument(formDataToSend);

      if (result?.header?.errorCount === 0) {
        const apiMessage =
          result.header.messages?.[0]?.messageText ||
          "Document registered successfully";
        toast.success(apiMessage);
        setTimeout(() => {
          navigate("/document-management/document-registration");
        }, 2000);
      } else {
        const errorMessage =
          result?.header?.messages?.[0]?.messageText ||
          "Failed to register document";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("An error occurred while submitting the form");
      console.error("Submission error:", error);
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
            {loading && (
              <div className="spinner-position-addpages">
                <Spinner />
              </div>
            )}
        <div className="tableWhiteCardContainer">
          <form onSubmit={handleSubmit}>
            <h3 className="heading">Document Registration</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <InputField
                label="Document Name"
                name="documentName"
                value={formData.documentName}
                onChange={handleChange}
                required
                placeholder="Enter document name (5-100 characters)"
              />

              <InputField
                label="Unique Code"
                name="uniqueCode"
                value={formData.uniqueCode}
                onChange={handleChange}
                required
                placeholder="e.g., SOP-001"
              />

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Document Type <span className="text-red-500">*</span>
                </label>
                <Select
                  name="documentType"
                  options={documentTypes}
                  value={documentTypes.find(
                    (type) => type.value === formData.documentType
                  )}
                  onChange={(selected) =>
                    setFormData({
                      ...formData,
                      documentType: selected ? selected.value : "",
                    })
                  }
                  isClearable
                  placeholder="-- Select Document Type --"
                  className="text-sm"
                  styles={{
                    control: (base) => ({
                      ...base,
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      padding: "0.25rem",
                      fontSize: "0.875rem",
                      minHeight: "38px",
                      "&:hover": { borderColor: "#3b82f6" },
                    }),
                    menu: (base) => ({
                      ...base,
                      maxHeight: "200px",
                      zIndex: 10,
                    }),
                  }}
                />
              </div>

              <InputField
                label="Version"
                name="version"
                value={formData.version}
                onChange={handleChange}
                required
                placeholder="e.g., 1.0"
              />

              <InputField
                label="Estimated Reading Time (minutes)"
                name="estimatedReadingTime"
                type="number"
                min="1"
                value={formData.estimatedReadingTime}
                onChange={handleChange}
                required
                placeholder="Enter estimated reading time"
              />

              <FileUploadField
                label="Document File"
                name="uploadFile"
                onChange={handleChange}
                accept=".pdf,.ppt,.pptx,.mp4"
                required
                file={formData.uploadFile}
                description="Accepted formats: PDF, PPT, PPTX, MP4 (Max size: 500MB)"
              />
            </div>

            <EnhancedInputField
              label="Remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              asTextarea
              rows={4}
              maxLength={500}
              placeholder="Enter remarks (max 500 characters)"
            />
            <small className="text-gray-500 text-sm">
              {formData.remarks.length}/500 characters
            </small>

            <div className="flex justify-end gap-4 mt-8">
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
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
          </form>
        </div>
      </div>
    </>
  );
};

export default RegisterDocument;

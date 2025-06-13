import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DocumentContext } from '../../../context/sopOjt-Management/DocumentContext';
import { updateDocument } from '../../../services/sopojt-Management/DocumentRegistrationService';
import { fetchDocumentTypes } from '../../../services/lookup/lookupService';
import {
  InputField,
  EnhancedInputField,
  FileUploadField
} from '../../../components/common/ui/FormFields';
import Modal from '../../../components/common/Modal';
import Spinner from '../../../components/common/Spinner';

const EditDocument = () => {
  const navigate = useNavigate();
  const { documentDetails } = useContext(DocumentContext);

  const [documentTypes, setDocumentTypes] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    documentName: '',
    uniqueCode: '',
    documentType: '',
    documentVersion: '',
    effectiveFrom: '',
    nextReviewDate: '',
    uploadFile: null,
    remarks: '',
    estimatedReadingTime: '',
    createdDate: new Date().toISOString().split('T')[0],
    documentStatus: '',
    reasonForChange: '',
  });
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonForChange, setReasonForChange] = useState('');
  const [loading, setLoading] = useState(false);
  const initialFormRef = useRef(null);

  // Load document types
  useEffect(() => {
    const loadDocumentTypes = async () => {
      try {
        const data = await fetchDocumentTypes();
        if (data?.documentTypes) {
          const options = data.documentTypes.map(type => ({
            value: type.documentTypeID,
            label: type.documentTypeName,
          }));
          setDocumentTypes(options);
        }
        if (data?.header?.errorCount > 0) {
          const errMsg = data.header.messages?.[0]?.messageText;
          if (errMsg) toast.error(errMsg);
        }
      } catch {
        toast.error('Failed to load document types');
      }
    };
    loadDocumentTypes();
  }, []);

  // Load document details
  useEffect(() => {
    if (documentDetails) {
      setFormData({
        id: documentDetails.documentID || '',
        documentName: documentDetails.documentName || '',
        uniqueCode: documentDetails.documentCode || '',
        documentVersion: documentDetails.documentVersion || '',
        effectiveFrom: documentDetails.effectiveFrom || '',
        nextReviewDate: documentDetails.nextReviewDate || '',
        uploadFile: null,
        remarks: documentDetails.remarks || '',
        estimatedReadingTime: documentDetails.estimatedReadingTime || '',
        createdDate: documentDetails.createdDate || new Date().toISOString().split('T')[0],
        documentStatus: documentDetails.documentStatus || '',
        reasonForChange: '',
      });
    } else {
      const storedDoc = localStorage.getItem('editDocumentData');
      if (storedDoc) {
        const docData = JSON.parse(storedDoc);
        setFormData({
          id: docData.documentID || '',
          documentName: docData.documentName || '',
          uniqueCode: docData.documentCode || '',
          documentVersion: docData.documentVersion || '',
          effectiveFrom: docData.effectiveFrom || '',
          nextReviewDate: docData.nextReviewDate || '',
          uploadFile: null,
          remarks: docData.remarks || '',
          estimatedReadingTime: docData.estimatedReadingTime || '',
          createdDate: docData.createdDate || new Date().toISOString().split('T')[0],
          documentStatus: docData.documentStatus || '',
          reasonForChange: '',
        });
      } else {
        toast.error('No document selected for editing');
        navigate('/document-management/document-registration');
      }
    }
  }, [documentDetails, navigate]);

  // Set document type once both documentTypes and formData are loaded
  useEffect(() => {
    const docTypeName = documentDetails?.documentType || (() => {
      const storedDoc = localStorage.getItem('editDocumentData');
      if (storedDoc) {
        const docData = JSON.parse(storedDoc);
        return docData.documentType || '';
      }
      return '';
    })();

    if (documentTypes.length > 0 && docTypeName) {
      const matchedOption = documentTypes.find(opt => opt.label === docTypeName);
      if (matchedOption) {
        setSelectedDocType(matchedOption);
        setFormData(prev => ({ ...prev, documentType: matchedOption.value }));
      }
    }
  }, [documentTypes, documentDetails]);

  // Store initial form data for change detection
  useEffect(() => {
    if (formData.id && documentTypes.length > 0) {
      initialFormRef.current = JSON.stringify({ ...formData, documentType: formData.documentType });
    }
  }, [documentTypes, formData]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (name === 'effectiveFrom') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        nextReviewDate: prev.nextReviewDate && new Date(prev.nextReviewDate) < new Date(value)
          ? prev.nextReviewDate
          : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'file' ? files[0] : value,
      }));
    }
  };

  const isFormChanged = () => {
    if (!initialFormRef.current) return false;
    return JSON.stringify({ ...formData, documentType: formData.documentType }) !== initialFormRef.current;
  };

  const handleUpdateClick = () => {
    if (!isFormChanged()) {
      toast.info('No changes made to update.');
      return;
    }
    setShowReasonModal(true);
  };

  const handleConfirmUpdate = async () => {
    if (!reasonForChange.trim()) {
      toast.error('Reason for change is required.');
      return;
    }
    setLoading(true);
    try {
      await handleSubmit(reasonForChange);
    } finally {
      setLoading(false);
    }
  };

  const validateDocumentName = (name) => {
    if (name.length < 5) return 'Document name must be at least 5 characters long';
    if (name.length > 100) return 'Document name must not exceed 100 characters';
    if (!/^[a-zA-Z0-9\s\-_.,()]+$/.test(name)) {
      return 'Document name can only contain letters, numbers, spaces, and basic punctuation';
    }
    return null;
  };

  const validateDates = (effectiveFrom, nextReviewDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const effectiveDate = new Date(effectiveFrom);
    const reviewDate = new Date(nextReviewDate);

    if (effectiveDate < today) return 'Effective From date cannot be in the past';
    if (reviewDate <= effectiveDate) return 'Next Review Date must be after Effective From Date';
    
    const maxReviewPeriod = new Date(effectiveDate);
    maxReviewPeriod.setFullYear(maxReviewPeriod.getFullYear() + 2);
    if (reviewDate > maxReviewPeriod) {
      return 'Next Review Date cannot be more than 2 years after Effective From Date';
    }
    return null;
  };

  const validateFile = (file) => {
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'video/mp4'
      ];
      if (!allowedTypes.includes(file.type)) {
        return 'Only PDF, PPT, PPTX, and MP4 files are allowed';
      }
      const maxFileSize = 500 * 1024 * 1024;
      if (file.size > maxFileSize) return 'File size must be less than 500MB';
    }
    return null;
  };

  const handleSubmit = async (reason) => {
    const nameError = validateDocumentName(formData.documentName);
    if (nameError) return toast.error(nameError);

    if (!formData.documentType) return toast.error('Please select a document type');
    if (!formData.estimatedReadingTime || isNaN(formData.estimatedReadingTime) || Number(formData.estimatedReadingTime) <= 0) {
      return toast.error('Estimated Reading Time must be a positive number');
    }

    const dateError = validateDates(formData.effectiveFrom, formData.nextReviewDate);
    if (dateError) return toast.error(dateError);

    const fileError = validateFile(formData.uploadFile);
    if (fileError) return toast.error(fileError);

    const formDataToSend = new FormData();
    formDataToSend.append('DocumentID', formData.id);
    formDataToSend.append('DocumentPath', '');
    if (formData.uploadFile) {
      formDataToSend.append('DocumentExtention', `.${formData.uploadFile.name.split('.').pop()}`);
      formDataToSend.append('file', formData.uploadFile);
    } else {
      formDataToSend.append('DocumentExtention', '');
    }
    formDataToSend.append('SignatureDate', new Date().toISOString());
    formDataToSend.append('PlantID', 0);
    formDataToSend.append('DocumentName', formData.documentName);
    formDataToSend.append('DocumentCode', formData.uniqueCode);
    formDataToSend.append('DocumentTypeID', formData.documentType);
    formDataToSend.append('Remarks', formData.remarks || '');
    formDataToSend.append('ReasonForChange', reason);
    formDataToSend.append('ElectronicSignature', 'string');
    formDataToSend.append('EstimatedReadingTime', formData.estimatedReadingTime);
    formDataToSend.append('DocumentVersion', formData.documentVersion);
    formDataToSend.append('CreatedBy', formData.createdBy || 'string');
    formDataToSend.append('DocumentStatus', formData.documentStatus);

    try {
      const result = await updateDocument(formDataToSend);
      if (result?.header?.errorCount === 0) {
        const apiMessage = result.header.messages?.[0]?.messageText || 'Document updated successfully';
        toast.success(apiMessage);
        setTimeout(() => navigate('/document-management/document-registration'), 2000);
      } else {
        const errorMessage = result?.header?.messages?.[0]?.messageText || 'Failed to update document';
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.header?.messages?.[0]?.messageText || 'Error updating document';
      toast.error(errorMsg);
      console.error(error);
    }
  };

  const getCurrentFileExtension = () => {
    const ext = documentDetails?.documentExtention || (() => {
      const storedDoc = localStorage.getItem('editDocumentData');
      if (storedDoc) {
        const docData = JSON.parse(storedDoc);
        return docData.documentExtention;
      }
      return '';
    })();
    return ext ? (ext.startsWith('.') ? ext : `.${ext}`) : '';
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

        <form>
         <h3 className="heading">Edit Document</h3>

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
              readOnly
            />

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Document Type <span className="text-red-500">*</span>
              </label>
              <Select
                options={documentTypes}
                value={selectedDocType}
                onChange={(selected) => {
                  setSelectedDocType(selected);
                  setFormData(prev => ({ ...prev, documentType: selected ? selected.value : '' }));
                }}
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
                }}
              />
            </div>

            <InputField
              label="Version"
              name="documentVersion"
              value={formData.documentVersion}
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
              file={formData.uploadFile}
              description="Accepted formats: PDF, PPT, PPTX, MP4 (Max size: 500MB)"
              currentFile={!formData.uploadFile ? `${formData.documentName}${getCurrentFileExtension()}` : null}
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
          <small className="text-gray-500 text-sm">{formData.remarks.length}/500 characters</small>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={handleUpdateClick}
             className="btn-submit"
              disabled={loading}
            >
              Update
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
      {showReasonModal && (
        <Modal
          title="Reason for Change"
          message={
            <div className="relative">
              {loading && (
                <div className="spinner-position-addpages">
                  <Spinner />
                </div>
              )}
            <div className="space-y-4">
              <p>Please provide a reason for updating the document "{formData.documentName}" ({formData.uniqueCode})</p>
              <EnhancedInputField
                name="reasonForChange"
                value={reasonForChange}
                onChange={(e) => setReasonForChange(e.target.value)}
                asTextarea
                rows={4}
                placeholder="Please provide a reason for this change..."
                required
              />
            </div>
            </div>
          }
          onConfirm={handleConfirmUpdate}
          onCancel={() => setShowReasonModal(false)}
          confirmDisabled={!reasonForChange.trim()}
        />
      )}
    </>
  );
};

export default EditDocument;
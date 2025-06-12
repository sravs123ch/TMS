import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  fetchUsersNotAssignedJobResponsibility,
  updateJobResponsibility,
  fetchJobResponsibilityLookupByUserId
} from '../../../services/induction/JobResponsibilityService';
import Modal from '../../../components/common/Modal';
import {InputField, EnhancedInputField } from '../../../components/common/ui/FormFields';


const TOAST_CONFIG = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  toastId: 'unique-toast'
};

const EditJobResponsibility = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const initialFormDataRef = useRef(null);

  const [formData, setFormData] = useState({
    userID: '',
    inductionID: '',
    title: '',
    JobResposibility: '',
    responsibilities: ''
  });

  const [jobLookupData, setJobLookupData] = useState([]);
  const [titleOptions, setTitleOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonForChange, setReasonForChange] = useState('');

  const fetchData = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetchUsersNotAssignedJobResponsibility();
      if (response.header?.errorCount > 0) {
        toast.error(response.header.messages[0].messageText, TOAST_CONFIG);
        return;
      }
    } catch (error) {
      const msg =
        error.response?.data?.header?.messages?.[0]?.messageText ||
        'Error fetching users. Please try again.';
      toast.error(msg, TOAST_CONFIG);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchData();
      hasFetched.current = true;
    }
  }, [fetchData]);

  useEffect(() => {
    const loadJobResponsibilityData = () => {
      try {
        const storedData = localStorage.getItem('editJobResponsibilityFormData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);

          const initialData = {
            userID: parsedData.userID || '',
            inductionID: parsedData.inductionID || '',
            title: parsedData.title || '',
            JobResposibility: parsedData.description || '',
            responsibilities: parsedData.responsibilities || ''
          };

          setFormData(initialData);
          initialFormDataRef.current = { ...initialData };

          if (parsedData.userID && parsedData.firstName && parsedData.lastName) {
            const user = {
              value: parsedData.userID.toString(),
              label: `${parsedData.firstName} ${parsedData.lastName}`,
              inductionID: parsedData.inductionID
            };
            setSelectedUser(user);
          }

          return;
        }

        toast.error('No job responsibility data found for editing', TOAST_CONFIG);
        navigate('/induction/job-Responsibility');
      } catch (error) {
        toast.error('Failed to load job responsibility data', TOAST_CONFIG);
        navigate('/induction/job-Responsibility');
      }
    };

    loadJobResponsibilityData();
  }, [navigate]);

  useEffect(() => {
    const fetchJobLookup = async () => {
      const userId = sessionStorage.getItem('userId');
      try {
        const response = await fetchJobResponsibilityLookupByUserId(userId);
        if (response.header?.errorCount > 0) {
          toast.error(response.header.messages[0]?.messageText || 'Failed to fetch job responsibility lookup', TOAST_CONFIG);
          return;
        }
        if (response.jobResponsibiltyLookup) {
          setJobLookupData(response.jobResponsibiltyLookup);
          setTitleOptions(response.jobResponsibiltyLookup.map(job => ({
            value: job.title,
            label: job.title,
            description: job.description,
            responsibilities: job.responsibilities
          })));
        }
      } catch (error) {
        toast.error(error.response?.data?.header?.messages?.[0]?.messageText || 'Error fetching job responsibility lookup', TOAST_CONFIG);
      }
    };

    fetchJobLookup();
  }, []);

  const handleSelectChange = (selected, field) => {
    if (field === 'title') {
      const selectedJob = jobLookupData.find(job => job.title === selected.value);
      if (selectedJob) {
        setFormData(prev => ({
          ...prev,
          title: selectedJob.title,
          JobResposibility: selectedJob.description,
          responsibilities: selectedJob.responsibilities
        }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredFields = ['userID', 'title', 'JobResposibility'];
    for (let field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill in the ${field} field.`, TOAST_CONFIG);
        return;
      }
    }
    if (JSON.stringify(formData) === JSON.stringify(initialFormDataRef.current)) {
      toast.info('No changes made to update.');
      return;
    }
    setShowReasonModal(true);
  };

  const handleConfirmUpdate = async () => {
    if (!reasonForChange.trim()) {
      toast.error('Reason for change is required.', TOAST_CONFIG);
      return;
    }

    setIsSubmitting(true);
    try {
      const storedData = JSON.parse(localStorage.getItem('editJobResponsibilityFormData'));
      const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');

      const payload = {
        jobResponsibilityID: parseInt(storedData.jobResponsibilityID),
        inductionID: parseInt(storedData.inductionID),
        userID: parseInt(storedData.userID),
        jobDescriptionMasterID: 1,
        title: formData.title,
        description: formData.JobResposibility,
        responsibilities: formData.responsibilities || '',
        modifiedBy: userData.userID?.toString() || '2',
        reasonForChange: reasonForChange,
        electronicSignature: userData.firstName + ' ' + userData.lastName,
        signatureDate: new Date().toISOString()
      };

      const response = await updateJobResponsibility(payload);

      if (response.header?.errorCount > 0) {
        toast.error(response.header.messages[0]?.messageText || 'Failed to update job responsibility', TOAST_CONFIG);
        return;
      }

      toast.success('Job responsibility updated successfully', TOAST_CONFIG);
      localStorage.removeItem('editJobResponsibilityFormData');
      setTimeout(() => navigate('/induction/job-Responsibility'), 3000);
    } catch (error) {
      toast.error('An error occurred while updating job responsibility', TOAST_CONFIG);
    } finally {
      setIsSubmitting(false);
      setShowReasonModal(false);
      setReasonForChange('');
    }
  };

  return (
    <>
      <ToastContainer {...TOAST_CONFIG} />
 <div className="main-container">
        <div className="tableWhiteCardContainer">
      <h2 className="heading">Edit Job Responsibility</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            label="User"
            value={selectedUser?.label || ''}
            readOnly
          />

          <div>
            <label className="block font-medium mb-1">
              Title <span className="text-red-600">*</span>
            </label>
            <Select
              name="title"
              options={titleOptions}
              value={titleOptions.find(opt => opt.value === formData.title) || null}
              onChange={(selected) => handleSelectChange(selected, 'title')}
              isClearable
              isSearchable
              placeholder="-- Select Title --"
              classNamePrefix="react-select"
            />
          </div>

          <EnhancedInputField
            name="JobResposibility"
            label="Description"
            required
            rows={2}
            value={formData.JobResposibility}
            onChange={handleChange}
          />

          <EnhancedInputField
            name="responsibilities"
            label="Responsibilities (Optional)"
            rows={2}
            value={formData.responsibilities}
            onChange={handleChange}
          />

         <div className="flex justify-end gap-4 mt-6">
            <button type="submit"
            className="px-5 py-2.5 bg-[--primary-color] text-white rounded-lg text-sm hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update'}
            </button>
            <button type="button" 
            className="btn-cancel"
            onClick={() => navigate(-1)} disabled={isSubmitting}>
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
            <div>
              <p>Please provide a reason for updating the Job Responsibility for "{selectedUser?.label}"</p>
              <textarea
                value={reasonForChange}
                onChange={(e) => setReasonForChange(e.target.value)}
                className="w-full mt-3 border rounded-lg p-2"
                rows={3}
                placeholder="Please provide a reason for this change..."
              />
            </div>
          }
          onConfirm={handleConfirmUpdate}
          onCancel={() => setShowReasonModal(false)}
        />
      )}
    </>
  );
};

export default EditJobResponsibility;
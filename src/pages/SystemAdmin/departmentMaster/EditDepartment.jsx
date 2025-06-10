import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DepartmentContext } from '../../../context/DepartmentContext';
import { updateDepartment } from '../../../services/systemAdmin/DepartmentMasterService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '../../../components/common/Modal';
import { InputField, EnhancedInputField } from '../../../components/common/ui/FormFields';

const EditDepartment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedDepartment } = useContext(DepartmentContext);
  const initialFormDataRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonForChange, setReasonForChange] = useState('');

  const [formData, setFormData] = useState({
    departmentID: selectedDepartment?.departmentId || '',
    departmentName: selectedDepartment?.departmentName || '',
  });

  useEffect(() => {
    if (location.state?.departmentData) {
      const initialData = {
        departmentID: location.state.departmentData.departmentID,
        departmentName: location.state.departmentData.departmentName,
      };
      setFormData(initialData);
      initialFormDataRef.current = { ...initialData };
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if form data has changed
    const currentData = { ...formData };
    if (JSON.stringify(currentData) === JSON.stringify(initialFormDataRef.current)) {
      toast.info('No changes made to update.');
      return;
    }

    // Open the reason modal
    setShowReasonModal(true);
  };

  const handleConfirmUpdate = async () => {
    if (!reasonForChange.trim()) {
      toast.error('Reason for change is required.');
      return;
    }

    setLoading(true);

    try {
      const departmentData = {
        departmentID: formData.departmentID,
        departmentName: formData.departmentName.trim(),
        modifiedBy: "Admin",
        plantID: 1,
        reasonForChange: reasonForChange,
        electronicSignature: "Admin",
        signatureDate: new Date().toISOString().split('T')[0],
      };

      const response = await updateDepartment(departmentData);

      if (response.header?.errorCount === 0) {
        const infoMsg = response.header?.messages?.[0]?.messageText || 'Department updated successfully';
        toast.success(infoMsg);
        setTimeout(() => {
          navigate('/system-admin/department-master');
        }, 1200);
      } else {
        const errorMsg = response.header?.messages?.[0]?.messageText || 'Failed to update department';
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Error updating department:', error);
      toast.error("An error occurred while updating the department");
    } finally {
      setLoading(false);
      setShowReasonModal(false);
      setReasonForChange('');
    }
  };

  const handleCancelUpdate = () => {
    setShowReasonModal(false);
    setReasonForChange('');
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
        <form onSubmit={handleSubmit}>
        <h3 className="heading">Edit Department</h3>
 <div className="mb-4 mt-6">
          <InputField
            label="Department Name"
            name="departmentName"
            value={formData.departmentName}
            onChange={handleChange}
            placeholder="Enter Department Name"
            required
          />
</div>
          <div className="flex justify-end gap-4 mt-8">
           
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[--primary-color] text-white rounded-lg hover:bg-[--primary-color] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
               <button
              type="button"
              onClick={() => navigate(-1)}
             className="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {showReasonModal && (
        <Modal
          title="Reason for Change"
          message={
            <div>
              <p className="mb-4">Please provide a reason for updating the department "{formData.departmentName}"</p>
              <EnhancedInputField
                name="reasonForChange"
                value={reasonForChange}
                onChange={(e) => setReasonForChange(e.target.value)}
                placeholder="Please provide a reason for this change..."
                asTextarea
                rows={4}
                required
              />
            </div>
          }
          onConfirm={handleConfirmUpdate}
          onCancel={handleCancelUpdate}
        />
      )}
    </>
  );
};

export default EditDepartment;

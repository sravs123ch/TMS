import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PlantAssignContext } from "../../../context/PlantAssignContext";
import { fetchAllPlants } from '../../../services/systemAdmin/PlantMasterService';
import { updatePlantAssign } from "../../../services/systemAdmin/PlantAssignService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '../../../components/common/Modal';

const EditPlantAssign = () => {
  const navigate = useNavigate();
  const { selectedPlantAssignment } = useContext(PlantAssignContext);
  const initialFormDataRef = useRef(null);

  const [formData, setFormData] = useState({
    employeeID: '',
    selectedPlant: [],
  });

  const [plants, setPlants] = useState([]);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonForChange, setReasonForChange] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const plantsData = await fetchAllPlants();
        const formattedPlants = plantsData?.plants?.map(p => ({
          value: p.plantID,
          label: p.plantName,
        })) || [];
        setPlants(formattedPlants);
      } catch (error) {
        console.error("Error fetching plants:", error);
        setPlants([]);
      }
    };

    fetchPlants();

    if (selectedPlantAssignment?.employeeID) {
      const initialData = {
        employeeID: selectedPlantAssignment.employeeID,
        selectedPlant: Array.isArray(selectedPlantAssignment.plantIDs)
          ? selectedPlantAssignment.plantIDs
          : typeof selectedPlantAssignment.plantIDs === 'string'
            ? selectedPlantAssignment.plantIDs.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))
            : [],
      };
      setFormData(initialData);
      initialFormDataRef.current = { ...initialData };
    }
  }, [selectedPlantAssignment]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const plantID = parseInt(value);
    if (name === "selectedPlant" && !isNaN(plantID)) {
      setFormData(prev => ({
        ...prev,
        selectedPlant: checked
          ? [...prev.selectedPlant, plantID]
          : prev.selectedPlant.filter(id => id !== plantID),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.employeeID || formData.selectedPlant.length === 0) {
      toast.error("Please select at least one plant.");
      return;
    }

    const currentData = { ...formData };
    if (JSON.stringify(currentData) === JSON.stringify(initialFormDataRef.current)) {
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
    const payload = {
      plantAssignmentID: selectedPlantAssignment?.plantAssignmentID,
      plantIDs: formData.selectedPlant.filter(Boolean).map(String).join(','),
      userId: formData.employeeID,
      modifiedBy: "admin",
      reasonForChange,
      electronicSignature: "signature_placeholder",
      signatureDate: new Date().toISOString(),
    };

    try {
      const response = await updatePlantAssign(payload);
      if (response.header?.errorCount === 0) {
        showMessagesFromHeader(response.header, 'success');
        setTimeout(() => navigate('/system-admin/plant-assignment'), 3000);
      } else {
        showMessagesFromHeader(response.header, 'error');
      }
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.entries(errors).forEach(([field, messages]) => {
          messages.forEach(msg => toast.error(`${field}: ${msg}`));
        });
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
      setShowReasonModal(false);
      setReasonForChange('');
    }
  };

  const showMessagesFromHeader = (header, type) => {
    header?.messages?.forEach((msg) => {
      if (msg.messageText) {
        type === 'success' ? toast.success(msg.messageText) : toast.error(msg.messageText);
      }
    });
  };

  const handleCancelUpdate = () => {
    setShowReasonModal(false);
    setReasonForChange('');
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={1500} />
       <div className="main-container">
         <h3 className="heading">Edit Plant Assignment</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Readonly User Info */}
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              User <span className="text-red-500">*</span>
            </label>
            <div className="p-2 bg-gray-100 rounded-md font-medium">
              {selectedPlantAssignment?.fullName || "No user selected"}
            </div>
          </div>

          {/* Checkbox List */}
          <div>
            <label className="block font-medium mb-2 text-gray-700">
              Select Plants <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-4">
              {plants.map((plant) => (
                <label key={plant.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="selectedPlant"
                    value={plant.value}
                    checked={formData.selectedPlant.includes(plant.value)}
                    onChange={handleChange}
                    className="rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{plant.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit/Cancel */}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[--primary-color] text-white rounded-lg text-sm hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Reason Modal */}
      {showReasonModal && (
        <Modal
          title="Reason for Change"
          message={
            <div className="space-y-4">
              <p className="text-gray-700 text-sm">
                Please provide a reason for updating the plant assignments for user "
                <strong>{selectedPlantAssignment?.fullName}</strong>" from "
                <strong>{initialFormDataRef.current?.selectedPlant.map(id => plants.find(p => p.value === id)?.label).filter(Boolean).join(', ')}</strong>" to "
                <strong>{formData.selectedPlant.map(id => plants.find(p => p.value === id)?.label).filter(Boolean).join(', ')}</strong>"
              </p>
              <textarea
                value={reasonForChange}
                onChange={(e) => setReasonForChange(e.target.value)}
                placeholder="Enter your reason here..."
                required
                className="w-full min-h-[100px] border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

export default EditPlantAssign;

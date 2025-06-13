import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { fetchUsersBasicInfo } from "../../../services/systemAdmin/UserMasterService";
import {
  createPlantAssign,
  fetchAllPlants,
} from "../../../services/systemAdmin/PlantAssignService";
import "react-toastify/dist/ReactToastify.css";
import { CustomAsyncSelect } from "../../../components/common/ui/FormFields";
const AddPlantAssignment = () => {
  const [formData, setFormData] = useState({
    employeeID: "",
    selectedPlant: [],
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [plants, setPlants] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const showMessagesFromHeader = (header, type = "success") => {
    if (Array.isArray(header?.messages)) {
      header.messages.forEach((msg) => {
        if (msg?.messageText) {
          if (msg.messageLevel === "Information") {
            toast.info(msg.messageText);
          } else {
            type === "error"
              ? toast.error(msg.messageText)
              : toast.success(msg.messageText);
          }
        }
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const usersData = await fetchUsersBasicInfo();
      if (usersData.header?.errorCount === 0) {
        const formattedUsers = usersData.usersBasicInfo.map((user) => ({
          value: user.userID,
          label: `${user.firstName} ${user.lastName}`,
        }));
        setUsers(formattedUsers);
      } else {
        setUsers([]);
      }

      const plantsData = await fetchAllPlants();
      if (plantsData?.plants) {
        const formattedPlants = plantsData.plants.map((plant) => ({
          value: plant.plantID,
          label: plant.plantName,
        }));
        setPlants(formattedPlants);
      } else {
        setPlants([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setUsers([]);
      setPlants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const plantID = parseInt(value);
    if (name === "selectedPlant") {
      setFormData((prev) => ({
        ...prev,
        selectedPlant: checked
          ? [...prev.selectedPlant, plantID]
          : prev.selectedPlant.filter((id) => id !== plantID),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (!formData.employeeID || formData.selectedPlant.length === 0) return;

    const payload = {
      plantIDs: formData.selectedPlant.join(","),
      userID: parseInt(formData.employeeID),
      createdBy: "3",
      electronicSignature: "string",
      signatureDate: new Date().toISOString(),
    };

    try {
      const response = await createPlantAssign(payload);
      if (response.header?.errorCount === 0) {
        showMessagesFromHeader(response.header, "success");

        setFormData({ employeeID: "", selectedPlant: [] });
        setFormSubmitted(false);

        setTimeout(() => {
          navigate("/system-admin/plant-assignment");
        }, 3000);
      } else {
        showMessagesFromHeader(response.header, "error");
      }
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("Failed to assign plant.");
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={1500} />

      <div className="main-container">
        <div className="tableWhiteCardContainer">
          <h3 className="heading">Assign Plants</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Select */}
            <div>
              <CustomAsyncSelect
                label="Select User"
                options={users}
                value={users.find((user) => user.value === formData.employeeID)}
                onChange={(selected) =>
                  setFormData({
                    ...formData,
                    employeeID: selected?.value || "",
                  })
                }
                placeholder="-- Select User --"
                isLoading={loading}
                required
              />
              {formSubmitted && !formData.employeeID && (
                <p className="text-sm text-red-600 mt-1">
                  User selection is required.
                </p>
              )}
            </div>

            {/* Plants Checkbox */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Plants <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {plants.map((plant) => (
                  <label
                    key={plant.value}
                    className="flex items-center space-x-2 text-gray-700"
                  >
                    <input
                      type="checkbox"
                      name="selectedPlant"
                      value={plant.value}
                      checked={formData.selectedPlant.includes(plant.value)}
                      onChange={handleChange}
                      className="form-checkbox text-blue-600"
                    />
                    <span>{plant.label}</span>
                  </label>
                ))}
              </div>
              {formSubmitted && formData.selectedPlant.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  Select at least one plant.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-4 justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[--primary-color] text-white rounded-lg text-sm hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-cancel"
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

export default AddPlantAssignment;

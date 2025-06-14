import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "../../../components/common/Spinner";
import {
  CustomAsyncSelect,
  EnhancedInputField,
  InputField,
} from "../../../components/common/ui/FormFields";
import DatePicker from "../../../components/common/ui/DatePicker";
import {
  assignInduction,
  fetchUnassignedUsers,
} from "../../../services/induction/InductionAssignService";

const AddInductionAssign = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userID: "",
    dueDate: null,
    remarks: "",
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUnassignedUsers = async () => {
    try {
      const usersData = await fetchUnassignedUsers();
      if (Array.isArray(usersData)) {
        setUsers(usersData);
      } else {
        setUsers([]);
        toast.error("No unassigned users found.");
      }
    } catch (error) {
      console.error("Error fetching unassigned users:", error);
      toast.error("Error fetching unassigned users.");
    }
  };

  useEffect(() => {
    loadUnassignedUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        userID: formData.userID,
        dueDate: formData.dueDate || null,
        remarks: formData.remarks || "",
        assignedBy: "Admin", // Replace with dynamic value if needed
        assignedOn: new Date().toISOString(),
        electronicSignature: "Admin",
        signatureDate: new Date().toISOString(),
      };

      const response = await assignInduction(payload);

      if (response.header?.errorCount === 0) {
        toast.success(
          response.header?.messages?.[0]?.messageText ||
            "Assigned successfully."
        );
        setTimeout(() => navigate("/induction/induction-assign"), 1000);
      } else {
        toast.error(
          response.header?.messages?.[0]?.messageText || "Assignment failed."
        );
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="main-container">
        <div className="tableWhiteCardContainer">
          <form onSubmit={handleSubmit}>
            {loading && (
              <div className="spinner-position-addpages">
                <Spinner />
              </div>
            )}

            <h2 className="heading">Assign Induction</h2>
            {/* Select User */}
            <div className="mb-4 mt-4">
              <CustomAsyncSelect
                label="Select User"
                options={users.map((user) => ({
                  value: user.userID,
                  label: user.userName,
                }))}
                value={
                  users.find((u) => u.userID === formData.userID)
                    ? {
                        value: formData.userID,
                        label: users.find((u) => u.userID === formData.userID)
                          .userName,
                      }
                    : null
                }
                onChange={(selected) =>
                  setFormData((prev) => ({
                    ...prev,
                    userID: selected ? selected.value : "",
                  }))
                }
                placeholder="-- Select User --"
                required
              />
            </div>

            {/* Due Date */}
            <div className="mb-4 ">
              <DatePicker
                label="Due Date"
                value={formData.dueDate}
                onChange={(date) =>
                  setFormData((prev) => ({ ...prev, dueDate: date }))
                }
                minDate={new Date()}
                placeholder="Select due date"
                sx={{ width: "100%",}}
                required
              />
            </div>

            {/* Remarks */}
            <InputField
              name="remarks"
              label="Remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Enter remarks (optional)"
              multiline
              rows={3}
            />

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? "Assigning..." : "Submit"}
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
      </div>
    </>
  );
};

export default AddInductionAssign;

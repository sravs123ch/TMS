import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import {
  getAllRoles,
  getAllUsersBasicInfo,
  addRoleAssignment
} from '../../../services/systemAdmin/RoleAssignmentService';

import { CustomAsyncSelect } from '../../../components/common/ui/FormFields';
import Spinner from '../../../components/common/Spinner';

const AddRoleAssignment = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    roleID: '',
    userID: '',
    reasonForChange: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const rolesResponse = await getAllRoles();
        if (rolesResponse.header?.errorCount === 0) {
          setRoles(
            rolesResponse.roles.map((r) => ({
              value: r.roleID,
              label: r.roleName,
            }))
          );
        }

        const usersResponse = await getAllUsersBasicInfo();
        if (usersResponse.header?.errorCount === 0) {
          setUsers(
            usersResponse.usersBasicInfo.map((u) => ({
              value: u.userID,
              label: `${u.firstName} ${u.lastName}`,
            }))
          );
        }
      } catch (err) {
        toast.error('Error loading dropdown data');
      }
    };

    fetchDropdowns();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.roleID || !formData.userID) {
      toast.error('Please select both role and user');
      return;
    }

    setIsSubmitting(true);

    const user = JSON.parse(localStorage.getItem('user'));
    const createdBy = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'admin';
    const plantID = sessionStorage.getItem('plantId') || '001';

    const payload = {
      ...formData,
      createdBy,
      plantID,
      electronicSignature: createdBy,
      signatureDate: new Date().toISOString(),
      reasonForChange: 'Creating role assignment',
    };

    try {
      const response = await addRoleAssignment(payload);
      if (response?.header?.errorCount > 0) {
        toast.error(response.header.messages?.[0]?.messageText || 'Submission failed');
        return;
      }
      toast.success('Role Assignment Created Successfully');
      setTimeout(() => navigate('/system-admin/role-assignment'), 2000);
    } catch (err) {
      toast.error('Error submitting role assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="main-container">
      <ToastContainer autoClose={1500} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="heading">Add Role Assignment</h3>

        <div>
          <CustomAsyncSelect
           label="Select User"
            options={users}
            value={users.find((u) => u.value === formData.userID)}
            onChange={(selected) => setFormData({ ...formData, userID: selected?.value || '' })}
            placeholder="-- Select User --"
            isClearable
          />
        </div>

        <div>
          <CustomAsyncSelect
           label="Select Role"
            options={roles}
            value={roles.find((r) => r.value === formData.roleID)}
            onChange={(selected) => setFormData({ ...formData, roleID: selected?.value || '' })}
            placeholder="-- Select Role --"
            isClearable
          />
        </div>

       <div className="flex justify-end gap-4 pt-4">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[--primary-color] text-white rounded-lg text-sm hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner size="sm" /> : 'Submit'}
          </button>
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRoleAssignment;

import React, { useState, useEffect, useContext } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { RoleContext } from "../../../context/RoleContext";
import { fetchAllRoles, deleteRole } from "../../../services/systemAdmin/RoleMasterService";

import Modal from "../../../components/common/Modal";
import SearchAddBar from "../../../components/common/ui/SearchButton";
import TableRow from "@mui/material/TableRow";
import {
  StyledTableCell,
  StyledTableRow,
  TablePaginationActions,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableFooter,
  TablePagination,
  Paper,
} from "../../../components/common/Table/CustomTablePagination";

const RoleMaster = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const { setRoleDetails } = useContext(RoleContext);

  // Debounce searchTerm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const loadRoles = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAllRoles(page + 1, rowsPerPage, debouncedSearchTerm);
        const message = data.header?.messages?.[0];

        if (message?.messageLevel?.toLowerCase() === "warning") {
          toast.warning(message.messageText);
        } else if (message?.messageLevel?.toLowerCase() === "error") {
          toast.error(message.messageText);
        }

        if (data.header?.errorCount === 0 && Array.isArray(data.roles)) {
          setRoles(data.roles);
          setTotalRecords(data.totalRecord || 0);
        } else {
          console.error("Failed to load roles:", data.header?.message);
        }
      } catch (error) {
        toast.error("Error fetching roles");
        console.error("Error fetching roles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoles();
  }, [page, rowsPerPage, debouncedSearchTerm, refreshKey]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddClick = () => {
    navigate("/system-admin/role-master/add-role");
  };

  const handleEdit = (role) => {
    setRoleDetails(role.roleID, role.roleName, role.description);
    navigate("/system-admin/role-master/edit-role", { state: { roleData: role } });
  };

  const handleDelete = (role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const result = await deleteRole(selectedRole.roleID);
      if (result.header?.errorCount === 0) {
        toast.success("Role deleted successfully");
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error(result.header?.messages?.[0]?.messageText || "Failed to delete role");
      }
    } catch (err) {
      toast.error("Error deleting role");
      console.error("Delete Error:", err);
    } finally {
      setShowDeleteModal(false);
      setSelectedRole(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedRole(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
        <div className="body-container">
          <h2 className="heading">Role Master</h2>
          <SearchAddBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onAddClick={handleAddClick}
          />
        </div>

          <TableContainer component={Paper} className="shadow-none">
            <Table stickyHeader aria-label="role table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Role Name</StyledTableCell>
                  <StyledTableCell>Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <StyledTableRow>
                    <StyledTableCell colSpan={2} className="text-center py-5">
                      <div className="border-4 border-gray-200 border-t-teal-600 rounded-full w-10 h-10 animate-spin mx-auto"></div>
                    </StyledTableCell>
                  </StyledTableRow>
                ) : roles.length > 0 ? (
                  roles.map((item) => (
                    <StyledTableRow key={item.roleID}>
                      <StyledTableCell>{item.roleName}</StyledTableCell>
                      <StyledTableCell>
                        <div className="flex gap-3 items-center h-full">
                          <button
                            onClick={() => handleEdit(item)}
                            className="icon-btn edit"
                            title="Edit Role"
                          >
                            <FaEdit className="icon-md" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="icon-btn delete"
                            title="Delete Role"
                          >
                            <FcCancel className="icon-md" />
                          </button>
                        </div>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <StyledTableRow>
                    <StyledTableCell colSpan={2} className="text-center py-5">
                      No roles found.
                    </StyledTableCell>
                  </StyledTableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    count={totalRecords}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                    className="border-none"
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </div>


      {showDeleteModal && (
        <Modal
          title="Confirm Delete"
          message={`Are you sure you want to delete role "${selectedRole?.roleName}"?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </>
  );
};

export default RoleMaster;

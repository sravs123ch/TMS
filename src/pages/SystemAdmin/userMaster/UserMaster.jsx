import { useState, useEffect, useContext } from "react";
import profile from "../../../assets/images/profile.png";
import { FaEdit } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/UserContext";
import {
  fetchUsersBasicInfo,
  deleteUser,
} from "../../../services/systemAdmin/UserMasterService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "../../../components/common/Modal";
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
import TableRow from "@mui/material/TableRow";
import SearchAddBar from "../../../components/common/ui/SearchButton";
import { constants } from "../../../utils/constants";

const UserMaster = () => {
  const navigate = useNavigate();
  const { setUserId, setUserDetails } = useContext(UserContext);

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(constants.rowsPerPage);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const currentPage = page + 1;
        const data = await fetchUsersBasicInfo(
          currentPage,
          rowsPerPage,
          debouncedSearchTerm
        );

        const message = data.header?.messages?.[0];
        if (message?.messageLevel?.toLowerCase() === "warning") {
          toast.warning(message.messageText);
        } else if (message?.messageLevel?.toLowerCase() === "error") {
          toast.error(message.messageText);
        }

        if (data.header?.errorCount === 0 && Array.isArray(data.usersBasicInfo)) {
          setUsers(data.usersBasicInfo);
          setTotalRecords(data.totalRecord || 0);
        } else {
          console.error("Failed to load users:", data.header?.message);
        }
      } catch (error) {
        toast.error("Error fetching users");
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [page, rowsPerPage, debouncedSearchTerm, refreshKey]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddUserClick = () => navigate("/system-admin/user-master/add-user");

  const handleEditUserClick = (user) => {
    try {
      if (!user || !user.userID) {
        toast.error("Invalid user data");
        return;
      }

      setUserId(user.userID);
      setUserDetails(user);

      const userDataToStore = {
        userID: user.userID,
        employeeID: user.employeeID,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        categoryType: user.categoryType,
        roleID: user.roleID,
        departmentID: user.departmentID,
        designationID: user.designationID,
        reportsTo: user.reportsTo,
        emailID: user.emailID,
        loginID: user.loginID,
        inductionRequire: user.inductionRequire,
        userProfileID: user.userProfileID,
      };

      localStorage.setItem("editUserFormData", JSON.stringify(userDataToStore));
      navigate("/system-admin/user-master/edit-user");
    } catch (error) {
      console.error("Error preparing user data for edit:", error);
      toast.error("Failed to prepare user data for editing");
    }
  };

  const handleDeactivateClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const response = await deleteUser(selectedUser.userID);

      if (response.header?.errorCount === 0) {
        const successMsg =
          response.header?.messages?.[0]?.messageText ||
          "User deactivated successfully.";
        toast.success(successMsg);
        setShowDeleteModal(false);
        setSelectedUser(null);
        setRefreshKey((prev) => prev + 1);
      } else {
        const errorMsg =
          response.header?.messages?.[0]?.messageText || "Failed to deactivate user.";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error deactivating user:", error);
      toast.error("An error occurred while deactivating user.");
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
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

      {showDeleteModal && (
        <Modal
          title="Confirm Deactivate"
          message={
            <div>
              <p>
                Are you sure you want to deactivate user "
                {selectedUser?.firstName} {selectedUser?.lastName}"?
              </p>
            </div>
          }
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      <div className="main-container">
        {/* White card container */}
        <div className="tableWhiteCardContainer">
          <div className="tableHeaderLayout">
            <h2 className="heading">User Master</h2>
            <SearchAddBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onAddClick={handleAddUserClick}
            />
          </div>

          <TableContainer component={Paper} className="shadow-none">
            <Table className="min-w-full">
              <TableHead >
                <TableRow>
                  <StyledTableCell>Name</StyledTableCell>
                  <StyledTableCell>Department</StyledTableCell>
                  <StyledTableCell>Designation</StyledTableCell>
                  <StyledTableCell>Role</StyledTableCell>
                  <StyledTableCell>Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <StyledTableRow>
                    <StyledTableCell colSpan={5}>
                      <div className="flex justify-center p-4">
                        <div className="loader"></div>
                      </div>
                    </StyledTableCell>
                  </StyledTableRow>
                ) : users.length > 0 ? (
                  users.map((user, index) => (
                    <StyledTableRow key={index}>
                      <StyledTableCell>
                        <div className="flex items-center gap-2">
                          <div className="shrink-0 relative">
                            <img
                              src={profile}
                              alt="profile"
                              className="h-8 w-8 rounded-full object-cover border border-[var(--primary-color)]"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "default-profile.png";
                              }}
                            />
                          </div>
                          <span>{`${user.firstName} ${user.lastName}`}</span>
                        </div>
                      </StyledTableCell>
                      <StyledTableCell>{user.departmentName}</StyledTableCell>
                      <StyledTableCell>{user.designationName}</StyledTableCell>
                      <StyledTableCell>{user.roleName || "-"}</StyledTableCell>
                      <StyledTableCell>
                        <div className="flex space-x-2 items-center h-10">
                          <button
                            onClick={() => handleEditUserClick(user)}
                            className="icon-btn edit"
                            title="Edit User"
                          >
                            <FaEdit className="icon-md" />
                          </button>
                          <button
                            onClick={() => handleDeactivateClick(user)}
                            className="icon-btn delete"
                            title="Deactivate User"
                          >
                            <FcCancel className="icon-md" />
                          </button>
                        </div>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <StyledTableRow>
                    <StyledTableCell colSpan={5}>
                      <div className="noData">
                        No users found.
                      </div>
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
                    colSpan={5}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </div>
      </div>
     
    </>
  );
};

export default UserMaster;

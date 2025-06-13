import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import profile from "../../../assets/images/profile.png";
import { fetchAllUserPersonalDetails } from "../../../services/systemAdmin/UserPersonalDetailsService";
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
import Spinner from "../../../components/common/Spinner";

const UserPersonalDetails = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0); // Reset to first page on new search
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const currentPage = page + 1; // Convert to 1-based index for API
        const data = await fetchAllUserPersonalDetails(
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

        if (
          data.header?.errorCount === 0 &&
          Array.isArray(data.usersPersonalnfo)
        ) {
          setUsers(data.usersPersonalnfo);
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
  }, [page, rowsPerPage, debouncedSearchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEditUserClick = (user) => {
    navigate("/system-admin/User-Personal-Details/edit-user", {
      state: { userData: user },
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  const getUserStatus = (user) => {
    const requiredFields = {
      firstName: user.firstName,
      lastName: user.lastName,
      dob: user.dob,
      doj: user.doj,
      address: user.address,
      contactNo: user.contactNo,
      totalExperience: user.totalExperience,
    };

    const isFilled = (field) => {
      if (field === null || field === undefined) return false;
      if (typeof field === "string") return field.trim() !== "";
      if (typeof field === "number") return true;
      return false;
    };

    const missingFields = Object.entries(requiredFields).filter(
      ([value]) => !isFilled(value)
    );

    if (missingFields.length > 0) {
      return { status: "Pending", className: "bg-yellow-100 text-yellow-800" };
    } else {
      return { status: "Completed", className: "bg-green-100 text-green-800" };
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleAddUserPersonalDetailsClick = () =>
    navigate("/system-admin/user-personal-details/add-user");
  return (
    <div className="main-container">
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
        {/* White card container */}
        <div className="tableWhiteCardContainer">
          <div className="tableHeaderLayout">
            <h3 className="heading">User Personal Details</h3>
            <div className="flex gap-2.5 flex-wrap">
              <SearchAddBar
                searchValue={searchTerm}
                onSearchChange={handleSearchChange}
                searchPlaceholder="Search users..."
                // onAddClick={handleAddUserPersonalDetailsClick}
              />
            </div>
          </div>

          {loading ? (
            <div>
              <Spinner />
            </div>
          ) : (
            <TableContainer component={Paper} className="mb-4">
              <Table className="min-w-full">
                <TableHead className="bg-gray-100">
                  <TableRow>
                    <StyledTableCell>Name</StyledTableCell>
                    <StyledTableCell>Address</StyledTableCell>
                    <StyledTableCell>Contact Info</StyledTableCell>
                    <StyledTableCell>DOB</StyledTableCell>
                    <StyledTableCell>DOJ</StyledTableCell>
                    <StyledTableCell>Status</StyledTableCell>
                    <StyledTableCell>Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user, index) => {
                      const { status, className } = getUserStatus(user);
                      return (
                        <StyledTableRow key={index} hover>
                          <StyledTableCell>
                            <div className="profile-info">
                              <div>
                                <img
                                  src={profile}
                                  alt="profile"
                                  className="profile-avatar"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "default-profile.png";
                                  }}
                                />
                              </div>
                              <span>{`${user.firstName} ${user.lastName}`}</span>
                            </div>
                          </StyledTableCell>
                          <StyledTableCell>
                            {user.address || "-"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {user.contactNo || "-"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatDate(user.dob)}
                          </StyledTableCell>
                          <StyledTableCell>
                            {formatDate(user.doj)}
                          </StyledTableCell>
                          <StyledTableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}
                            >
                              {status}
                            </span>
                          </StyledTableCell>
                          <StyledTableCell>
                            <button
                              onClick={() => handleEditUserClick(user)}
                              className="icon-btn edit"
                              title="Edit User"
                            >
                              <FaEdit className="icon-md" />
                            </button>
                          </StyledTableCell>
                        </StyledTableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <StyledTableCell colSpan={7} className="noData">
                        No users found.
                      </StyledTableCell>
                    </TableRow>
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
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPersonalDetails;

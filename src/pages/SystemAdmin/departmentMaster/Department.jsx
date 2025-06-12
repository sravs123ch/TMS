import { useState, useEffect, useContext } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { DepartmentContext } from "../../../context/DepartmentContext";
import {
  fetchAllDepartments,
  deleteDepartment,
} from "../../../services/systemAdmin/DepartmentMasterService";
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
import { constants } from "../../../utils/constants";

import Modal from "../../../components/common/Modal";
import TableRow from "@mui/material/TableRow";
import SearchAddBar from "../../../components/common/ui/SearchButton";
import Spinner from "../../../components/common/Spinner";
const DepartmentMaster = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(constants.rowsPerPage);
  const [totalRecords, setTotalRecords] = useState(0);
  const { setDepartmentDetails } = useContext(DepartmentContext);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce searchTerm input
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setIsLoading(true);
        const currentPage = page + 1; // MUI pagination is 0-indexed, API is 1-indexed
        const data = await fetchAllDepartments(
          currentPage,
          rowsPerPage,
          debouncedSearchTerm
        );

        if (data.header?.errorCount === 0 && Array.isArray(data.departments)) {
          setDepartments(data.departments);
          setTotalRecords(data.totalRecord || 0);
        } else {
          toast.error(
            data.header?.messages?.[0]?.messageText ||
              "Failed to load departments"
          );
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        toast.error("An error occurred while fetching departments");
      } finally {
        setIsLoading(false);
      }
    };

    loadDepartments();
  }, [page, rowsPerPage, debouncedSearchTerm, refreshKey]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const navigateTo = (path, state = {}) => {
    navigate(path, { state });
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  const handleAddDeaprtmentClick = () =>
    navigate("/system-admin/department-master/add-department");

  const handleEditDepartment = (department) => {
    setDepartmentDetails(department.departmentID, department.departmentName);
    navigateTo("/system-admin/department-master/edit-department", {
      departmentData: department,
    });
  };

  const handleDeleteDepartment = (department) => {
    setSelectedDepartment(department);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await deleteDepartment(selectedDepartment.departmentID);
      if (res.header?.errorCount === 0) {
        toast.success(
          res.header?.messages?.[0]?.messageText || "Deleted successfully"
        );
        setPage(0);
        setRefreshKey((prev) => prev + 1);
      } else {
        toast.error(res.header?.messages?.[0]?.messageText || "Delete failed");
      }
    } catch (error) {
      toast.error("Error while deleting department");
      console.error(error);
    } finally {
      setShowDeleteModal(false);
      setSelectedDepartment(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedDepartment(null);
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

      <div className="main-container ">
        <div className="tableWhiteCardContainer">
          <div className="body-container">
            <h2 className="heading">Department Master</h2>
            <div className="flex gap-2.5 flex-wrap">
              <SearchAddBar
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                onAddClick={handleAddDeaprtmentClick}
              />
            </div>
          </div>

          <TableContainer component={Paper} className="shadow-none">
            <Table stickyHeader aria-label="department table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Department Name</StyledTableCell>
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
                ) : departments.length > 0 ? (
                  departments.map((item, index) => (
                    <StyledTableRow key={index}>
                      <StyledTableCell>{item.departmentName}</StyledTableCell>
                      <StyledTableCell>
                        <div className="flex gap-3 items-center h-full">
                          <button
                            onClick={() => handleEditDepartment(item)}
                            className="icon-btn edit"
                            title="Edit User"
                          >
                            <FaEdit className="icon-md" />
                          </button>

                          <button
                            onClick={() => handleDeleteDepartment(item)}
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
                    <StyledTableCell colSpan={2} className="noData">
                      No Records found.
                    </StyledTableCell>
                  </StyledTableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    count={totalRecords}
                    rowsPerPage={constants.rowsPerPage}
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
      </div>

      {showDeleteModal && (
        <Modal
          title="Confirm Delete"
          message={`Are you sure you want to delete department "${selectedDepartment?.departmentName}"?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </>
  );
};

export default DepartmentMaster;

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { DesignationContext } from "../../../context/DesignationContext";
import {
  fetchAllDesignations,
  deleteDesignation,
} from "../../../services/systemAdmin/DesignationMasterService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import Spinner from "../../../components/common/Spinner";
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
import Modal from "../../../components/common/Modal";
import SearchAddBar from "../../../components/common/ui/SearchButton";

const DesignationMaster = () => {
  const navigate = useNavigate();
  const [designations, setDesignations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const { setDesignationDetails } = useContext(DesignationContext);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Debounce searchTerm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const loadDesignations = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAllDesignations(
          page + 1,
          rowsPerPage,
          debouncedSearchTerm
        );

        const message = data.header?.messages?.[0];
        if (message?.messageLevel?.toLowerCase() === "warning") {
          toast.warning(message.messageText);
        } else if (message?.messageLevel?.toLowerCase() === "error") {
          toast.error(message.messageText);
        }

        if (data.header?.errorCount === 0 && Array.isArray(data.designations)) {
          setDesignations(data.designations);
          setTotalRecords(data.totalRecord);
        } else {
          console.error("Failed to load designations:", data.header?.message);
        }
      } catch (error) {
        toast.error("Error fetching designations");
        console.error("Error fetching designations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDesignations();
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

  const handleAddDesignationClick = () => {
    navigate("/system-admin/designation-master/add-designation");
  };

  const handleEditDesignation = (designation) => {
    setDesignationDetails(
      designation.designationID,
      designation.designationName
    );
    navigate("/system-admin/designation-master/edit-designation", {
      state: { designationData: designation },
    });
  };

  const handleDeleteDesignation = (designation) => {
    setSelectedDesignation(designation);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await deleteDesignation(selectedDesignation.designationID);
      if (res.header?.errorCount === 0) {
        toast.success("Designation deleted successfully");
        setRefreshKey((prev) => prev + 1);
      } else {
        toast.error(
          res.header?.messages?.[0]?.messageText ||
            "Failed to delete designation"
        );
      }
    } catch (err) {
      toast.error("Error deleting designation");
      console.error("Delete Error:", err);
    } finally {
      setShowDeleteModal(false);
      setSelectedDesignation(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedDesignation(null);
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
        <div className="tableWhiteCardContainer">
          <div className="body-container">
            <h2 className="heading">Designation Master</h2>
            <SearchAddBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onAddClick={handleAddDesignationClick}
            />
          </div>

          <TableContainer component={Paper} className="shadow-none">
            <Table stickyHeader aria-label="designation table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Designation Name</StyledTableCell>
                  <StyledTableCell>Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <StyledTableRow>
                    <StyledTableCell colSpan={5} >
                      <Spinner />
                    </StyledTableCell>
                  </StyledTableRow>
                ) : designations.length > 0 ? (
                  designations.map((item) => (
                    <StyledTableRow key={item.designationID}>
                      <StyledTableCell>{item.designationName}</StyledTableCell>
                      <StyledTableCell>
                        <div className="flex gap-3 items-center h-full">
                          <button
                            onClick={() => handleEditDesignation(item)}
                            className="icon-btn edit"
                            title="Edit Designation"
                          >
                            <FaEdit className="icon-md" />
                          </button>
                          <button
                            onClick={() => handleDeleteDesignation(item)}
                            className="icon-btn delete"
                            title="Delete Designation"
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
      </div>

      {showDeleteModal && (
        <Modal
          title="Confirm Delete"
          message={`Are you sure you want to delete designation "${selectedDesignation?.designationName}"?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </>
  );
};

export default DesignationMaster;

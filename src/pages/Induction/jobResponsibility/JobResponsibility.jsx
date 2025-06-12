import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  StyledTableCell,
  StyledTableRow,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableFooter,
  TablePagination,
  TablePaginationActions,
  Paper,
} from "../../../components/common/Table/CustomTablePagination";
import SearchAddBar from "../../../components/common/ui/SearchButton";
import StatusChip from "../../../components/StatusChip/StatusChip";
import { FaEdit } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import {
  fetchAllJobResponsibilities,
  deleteJobResponsibility,
} from "../../../services/induction/JobResponsibilityService";
import { JobResponsibilityContext } from "../../../context/induction/JobResponsibilityContext";
import { toast, ToastContainer } from "react-toastify";
import Modal from "../../../components/common/Modal";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "../../../components/common/Spinner";
const JobResponsibility = () => {
  const navigate = useNavigate();
  const tableContainerRef = useRef(null);
  const { setJobResponsibilityId, setJobResponsibilityDetails } = useContext(JobResponsibilityContext);

  const [jobResponsibilities, setJobResponsibilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedJobResponsibility, setSelectedJobResponsibility] = useState(null);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalRecords / itemsPerPage);

  useEffect(() => {
    loadJobResponsibilities();
  }, [currentPage]);

  const loadJobResponsibilities = async () => {
    try {
      const response = await fetchAllJobResponsibilities(currentPage, itemsPerPage);
      if (response.jobResponsibilities) {
        setJobResponsibilities(response.jobResponsibilities);
        setTotalRecords(response.totalRecord || 0);
      }
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load job responsibilities");
      setLoading(false);
    }
  };

  const handleAddJobResponsibility = () => {
    navigate("/induction/job-responsibility/add-job-responsibility");
  };

  const handleEditJobResponsibility = (item) => {
    if (!item || !item.jobResponsibilityID) {
      toast.error("Invalid job responsibility data");
      return;
    }

    const formData = {
      jobResponsibilityID: item.jobResponsibilityID,
      userID: item.userID,
      inductionID: item.inductionID,
      jobTitle: item.jobTitle,
      title: item.title,
      description: item.description,
      responsibilities: item.responsibilities,
      firstName: item.firstName,
      lastName: item.lastName,
      plantName: item.plantName,
      userName: `${item.firstName} ${item.lastName}`,
    };

    setJobResponsibilityId(item.jobResponsibilityID);
    setJobResponsibilityDetails(item);
    localStorage.setItem("editJobResponsibilityFormData", JSON.stringify(formData));
    navigate("/induction/job-responsibility/edit-job-responsibility");
  };

  const handleDeactivateClick = (item) => {
    setSelectedJobResponsibility(item);
    setShowDeactivateModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedJobResponsibility) return;

    setLoading(true);
    try {
      const response = await deleteJobResponsibility(selectedJobResponsibility.jobResponsibilityID);
      if (response.header?.errorCount === 0) {
        toast.success(response.header?.messages?.[0]?.messageText || "Deactivated successfully");
        loadJobResponsibilities();
      } else {
        toast.error(response.header?.messages?.[0]?.messageText || "Failed to deactivate");
      }
    } catch (error) {
      toast.error("Error occurred while deactivating");
    } finally {
      setLoading(false);
      setShowDeactivateModal(false);
      setSelectedJobResponsibility(null);
    }
  };

  const cancelDelete = () => {
    setShowDeactivateModal(false);
    setSelectedJobResponsibility(null);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={1500} />
      {showDeactivateModal && (
        <Modal
          title="Confirm Deactivate"
          message={`Are you sure you want to deactivate ${selectedJobResponsibility?.firstName} ${selectedJobResponsibility?.lastName}'s job responsibility?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

    <div className="main-container">
        {/* White card container */}
        <div className="tableWhiteCardContainer">
          <div className="tableHeaderLayout">
            <h2 className="heading">Job Responsibility</h2>
          <SearchAddBar
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            onAddClick={handleAddJobResponsibility}
            placeholder="Search"
          />
        </div>

        <TableContainer component={Paper} ref={tableContainerRef}>
          <Table>
            <TableHead>
              <StyledTableRow>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>Plant Name</StyledTableCell>
                <StyledTableCell>Title</StyledTableCell>
                <StyledTableCell>Description</StyledTableCell>
                <StyledTableCell>Responsibilities</StyledTableCell>
                <StyledTableCell>Actions</StyledTableCell>
              </StyledTableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={6}>
                      <Spinner />
                  </StyledTableCell>
                </StyledTableRow>
              ) : jobResponsibilities.length === 0 ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={6} className="text-center text-gray-500 py-6">
                    No job responsibilities found.
                  </StyledTableCell>
                </StyledTableRow>
              ) : (
                jobResponsibilities.map((item, index) => (
                  <StyledTableRow key={`${item.jobResponsibilityID}-${index}`}>
                    <StyledTableCell>{`${item.firstName} ${item.lastName}`}</StyledTableCell>
                    <StyledTableCell>{item.plantName || "-"}</StyledTableCell>
                    <StyledTableCell>{item.title}</StyledTableCell>
                    <StyledTableCell>{item.description}</StyledTableCell>
                    <StyledTableCell>{item.responsibilities}</StyledTableCell>
                    <StyledTableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditJobResponsibility(item)}
                        className="icon-btn edit"
                          title="Edit"
                        >
                          <FaEdit className="text-base" />
                        
                        </button>
                        <button
                          onClick={() => handleDeactivateClick(item)}
                          className="icon-btn delete"
                          title="Deactivate"
                        >
                          <FcCancel className="text-base" />
                        
                        </button>
                      </div>
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              )}
            </TableBody>

            <TableFooter>
              <StyledTableRow>
                <TablePagination
                  rowsPerPageOptions={[]}
                  colSpan={6}
                  count={totalRecords}
                  rowsPerPage={itemsPerPage}
                  page={currentPage - 1}
                  onPageChange={(_, newPage) => setCurrentPage(newPage + 1)}
                  ActionsComponent={TablePaginationActions}
                />
              </StyledTableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </div>
         </div>
    </>
  );
};

export default JobResponsibility;

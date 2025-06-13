import React, { useState, useEffect, useContext, useRef } from "react";
import { FaEdit, FaEye, FaDownload } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { DocumentContext } from "../../../context/sopOjt-Management/DocumentContext";
import {
  fetchDocumentsByUserId,
  deleteDocument,
  fetchDocumentById,
} from "../../../services/sopojt-Management/DocumentRegistrationService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "../../../components/common/Modal";
import { downloadFileToBrowserById } from "../../../services/DownloadService";
import FileViewer from "../../../components/common/fileViewer/FileViewer";
import Spinner from "../../../components/common/Spinner";
import SearchAddBar from "../../../components/common/ui/SearchButton";
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
const statusClasses = {
  underreview: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  returned: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  draft: "bg-gray-100 text-gray-800",
};

const DocumentMaster = () => {
  const navigate = useNavigate();
  const { setDocumentDetails } = useContext(DocumentContext);

  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [pdfFileId, setPdfFileId] = useState(null);
  const [pdfFileType, setPdfFileType] = useState(null);
  const [pdfFileExtension, setPdfFileExtension] = useState(null);
  const [viewerKey, setViewerKey] = useState(Date.now());

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userID = sessionStorage.getItem("userID");
        const payload = {
          userID: userID ? parseInt(userID) : 0,
          page: {
            offset: page * rowsPerPage,
            fetch: rowsPerPage,
          },
          searchText: debouncedSearchTerm,
        };
        const res = await fetchDocumentsByUserId(payload);
        setDocuments(res.documentMasters || []);
        setTotalRecords(res.totalRecord || 0);
      } catch {
        setDocuments([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [debouncedSearchTerm, page, rowsPerPage]);

  const handleAddDocClick = () => {
    navigate("/document-management/document-registration/register-document");
  };

  const handleEditDocClick = async (doc) => {
    try {
      const response = await fetchDocumentById(doc.documentID);

      if (response?.documentMaster) {
        setDocumentDetails(response.documentMaster);
        localStorage.setItem(
          "editDocumentData",
          JSON.stringify(response.documentMaster)
        );
        navigate("/document-management/document-registration/edit-document");
      } else {
        toast.error("Failed to fetch document details");
      }
    } catch (error) {
      console.error("Error fetching document details:", error);
      toast.error("Failed to prepare document for editing");
    }
  };

  const handleDeleteClick = (doc) => {
    setSelectedDoc(doc);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const userId = sessionStorage.getItem("userID");
      const response = await deleteDocument(selectedDoc.documentID, userId);

      if (response.header.errorCount === 0) {
        toast.success(
          response.header.messages[0].messageText ||
            "Document deactivated successfully"
        );
        // Refresh the data
        const userID = sessionStorage.getItem("userID");
        const payload = {
          userID: userID ? parseInt(userID) : 0,
          page: {
            offset: page * rowsPerPage,
            fetch: rowsPerPage,
          },
          searchText: debouncedSearchTerm,
        };
        const fetchRes = await fetchDocumentsByUserId(payload);
        setDocuments(fetchRes.documentMasters || []);
        setTotalRecords(fetchRes.totalRecord || 0);
      } else {
        toast.error(
          response.header.messages[0].messageText ||
            "Failed to deactivate document"
        );
      }
    } catch (error) {
      console.error("Error deactivating document:", error);
      toast.error("Failed to deactivate document");
    } finally {
      setShowDeleteModal(false);
      setSelectedDoc(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedDoc(null);
  };

  const handleDownloadDocument = async (documentId) => {
    try {
      await downloadFileToBrowserById("document", documentId);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document");
    }
  };

  const handleView = (doc) => {
    setShowFileViewer(false);
    setTimeout(() => {
      setPdfFileId(doc.documentID);
      setPdfFileType("document");
      setPdfFileExtension(doc.documentExtention);
      setViewerKey(Date.now());
      setShowFileViewer(true);
    }, 100);
  };

  const handleCloseFileViewer = () => {
    setShowFileViewer(false);
    setPdfFileId(null);
    setPdfFileType(null);
    setPdfFileExtension(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusClass = (status) => {
    const statusKey = (status || "").toLowerCase();
    return statusClasses[statusKey] || statusClasses.draft;
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
            <h2 className="heading">Document Registration</h2>
            <SearchAddBar
              searchTerm={searchTerm}
              onSearchChange={(e) => setSearchTerm(e.target.value)}
              onAddClick={handleAddDocClick}
            />
          </div>

          <TableContainer component={Paper} className="shadow-none">
            <Table stickyHeader aria-label="document table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Document Name</StyledTableCell>
                  <StyledTableCell>Document Code</StyledTableCell>
                  <StyledTableCell>Document Type</StyledTableCell>
                  <StyledTableCell>Version</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell>Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <StyledTableRow>
                    <StyledTableCell colSpan={6} className="text-center py-5">
                      <Spinner />
                    </StyledTableCell>
                  </StyledTableRow>
                ) : documents.length > 0 ? (
                  documents.map((doc) => (
                    <StyledTableRow key={doc.documentID}>
                      <StyledTableCell>{doc.documentName}</StyledTableCell>
                      <StyledTableCell>{doc.documentCode}</StyledTableCell>
                      <StyledTableCell>{doc.documentType}</StyledTableCell>
                      <StyledTableCell>{doc.documentVersion}</StyledTableCell>
                      <StyledTableCell>
                        <div className="relative group">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                              doc.documentStatus
                            )}`}
                          >
                            {doc.documentStatus}
                          </span>
                          <div className="absolute z-10 hidden group-hover:block bg-white p-2 border rounded shadow-lg text-xs max-w-xs">
                            {doc.remark ||
                              doc.approvalRemarks ||
                              "No remarks available"}
                          </div>
                        </div>
                      </StyledTableCell>
                      <StyledTableCell>
                        <div className="flex gap-3 items-center h-full">
                          <button
                            onClick={() => handleView(doc)}
                            className="icon-btn view"
                            title="View Document"
                          >
                            <FaEye className="icon-md" />
                          </button>
                          <button
                            onClick={() =>
                              handleDownloadDocument(doc.documentID)
                            }
                            className="icon-btn download"
                            title="Download Document"
                          >
                            <FaDownload className="icon-md" />
                          </button>
                          <button
                            onClick={() => handleEditDocClick(doc)}
                            className="icon-btn edit"
                            title="Edit Document"
                            disabled={
                              doc.documentStatus === "Approved" ||
                              doc.documentStatus === "Rejected"
                            }
                          >
                            <FaEdit
                              className={`icon-md ${
                                doc.documentStatus === "Approved" ||
                                doc.documentStatus === "Rejected"
                                  ? "opacity-50"
                                  : ""
                              }`}
                            />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(doc)}
                            className="icon-btn delete"
                            title="Deactivate Document"
                          >
                            <FcCancel className="icon-md" />
                          </button>
                        </div>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <StyledTableRow>
                    <StyledTableCell colSpan={6} className="noData">
                      No documents found.
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
          title="Confirm Deactivate"
          message={`Are you sure you want to deactivate document "${selectedDoc?.documentName}"?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
      {showFileViewer && pdfFileId && (
        <FileViewer
          key={viewerKey}
          id={pdfFileId}
          type={pdfFileType}
          extension={pdfFileExtension}
          onClose={handleCloseFileViewer}
        />
      )}
    </>
  );
};

export default DocumentMaster;

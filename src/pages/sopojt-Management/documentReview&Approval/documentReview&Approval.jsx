import { useState, useEffect } from "react";
import {
  StyledTableCell,
  StyledTableRow,
  TablePaginationActions,
} from "../../../components/common/Table/CustomTablePagination";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableFooter,
  TablePagination,
  Paper,
} from "@mui/material";
import Spinner from "../../../components/common/Spinner";
import SearchAddBar from "../../../components/common/ui/SearchButton";
import Modal from "../../../components/common/Modal";
import FileViewer from "../../../components/common/fileViewer/FileViewer";
import {
  fetchPendingDocuments,
  updateDocumentStatus,
} from "../../../services/sopojt-Management/documentReview&ApprovalService";
import { downloadFileToBrowserById } from "../../../services/DownloadService";
import { FaEye, FaCheck, FaUndo, FaTimes, FaDownload } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TableRow from "@mui/material/TableRow";
const itemsPerPage = 10;

const DocumentReviewApproval = () => {
  const [documents, setDocuments] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed for MUI TablePagination
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [rejectionRemarks, setRejectionRemarks] = useState("");
  const [returnRemarks, setReturnRemarks] = useState("");
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [pdfFileId, setPdfFileId] = useState(null);
  const [pdfFileType, setPdfFileType] = useState(null);
  const [pdfFileExtension, setPdfFileExtension] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm.trim() === "") {
      setDocuments(allDocuments);
      setTotalRecords(allDocuments.length);
    } else {
      const filtered = allDocuments.filter((doc) =>
        [doc.documentName, doc.documentCode]
          .join(" ")
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase())
      );
      setDocuments(filtered);
      setTotalRecords(filtered.length);
    }
    setCurrentPage(0);
  }, [debouncedSearchTerm, allDocuments]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetchPendingDocuments();
      if (response.header.errorCount === 0) {
        const docs = response.documentMasters || [];
        setAllDocuments(docs);
        setDocuments(docs);
        setTotalRecords(docs.length);
      } else {
        toast.error(response.header.messages[0].messageText);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status, remarks) => {
    if (!remarks.trim()) {
      toast.error(`Please provide ${status.toLowerCase()} remarks`);
      return;
    }
    try {
      const response = await updateDocumentStatus({
        documentID: selectedDoc.documentID,
        documentStatus: status,
        modifiedBy: sessionStorage.getItem("userID"),
        reasonForChange: remarks,
      });

      if (response.header.errorCount === 0) {
        toast.success(response.header.messages[0].messageText);
        closeAllModals();
        loadDocuments();
      } else {
        toast.error(response.header.messages[0].messageText);
      }
    } catch (error) {
      toast.error(`Failed to ${status.toLowerCase()} document`);
    }
  };

  const closeAllModals = () => {
    setShowApproveModal(false);
    setShowRejectModal(false);
    setShowReturnModal(false);
    setSelectedDoc(null);
    setApprovalRemarks("");
    setRejectionRemarks("");
    setReturnRemarks("");
  };

  const getCurrentItems = () => {
    const start = currentPage * itemsPerPage;
    return documents.slice(start, start + itemsPerPage);
  };

  return (
    <div className="p-6">
      <ToastContainer />
      {showApproveModal && (
        <Modal
          title="Confirm Approval"
          message={
            <div>
              <p>
                Approve document <strong>{selectedDoc?.documentName}</strong> (
                {selectedDoc?.documentCode})?
              </p>
              <textarea
                className="mt-2 w-full p-2 border rounded"
                value={approvalRemarks}
                onChange={(e) => setApprovalRemarks(e.target.value)}
                placeholder="Reason for approval"
              />
            </div>
          }
          onConfirm={() => handleStatusUpdate("Approved", approvalRemarks)}
          onCancel={closeAllModals}
        />
      )}

      {showRejectModal && (
        <Modal
          title="Confirm Rejection"
          message={
            <div>
              <p>
                Reject document <strong>{selectedDoc?.documentName}</strong> (
                {selectedDoc?.documentCode})?
              </p>
              <textarea
                className="mt-2 w-full p-2 border rounded"
                value={rejectionRemarks}
                onChange={(e) => setRejectionRemarks(e.target.value)}
                placeholder="Reason for rejection"
              />
            </div>
          }
          onConfirm={() => handleStatusUpdate("Rejected", rejectionRemarks)}
          onCancel={closeAllModals}
        />
      )}

      {showReturnModal && (
        <Modal
          title="Confirm Return"
          message={
            <div>
              <p>
                Return document <strong>{selectedDoc?.documentName}</strong> (
                {selectedDoc?.documentCode})?
              </p>
              <textarea
                className="mt-2 w-full p-2 border rounded"
                value={returnRemarks}
                onChange={(e) => setReturnRemarks(e.target.value)}
                placeholder="Reason for return"
              />
            </div>
          }
          onConfirm={() => handleStatusUpdate("Returned", returnRemarks)}
          onCancel={closeAllModals}
        />
      )}

      {showFileViewer && (
        <FileViewer
          id={pdfFileId}
          type={pdfFileType}
          extension={pdfFileExtension}
          onClose={() => setShowFileViewer(false)}
        />
      )}

      <div className="main-container">
        <div className="tableWhiteCardContainer">
          <div className="body-container">
            <h2 className="heading">Document Approval</h2>
            <SearchAddBar
              searchValue={searchTerm}
              onSearchChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or code"
            />
          </div>
          <TableContainer>
  <Table size="small">
    <TableHead>
      <StyledTableRow>
        <StyledTableCell>Document Name</StyledTableCell>
        <StyledTableCell>Document Code</StyledTableCell>
        <StyledTableCell>Type</StyledTableCell>
        <StyledTableCell>Version</StyledTableCell>
        <StyledTableCell>Actions</StyledTableCell>
      </StyledTableRow>
    </TableHead>

    <TableBody>
      {loading ? (
        <StyledTableRow>
          <StyledTableCell colSpan={5}>
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          </StyledTableCell>
        </StyledTableRow>
      ) : getCurrentItems().length === 0 ? (
        <StyledTableRow>
          <StyledTableCell colSpan={5}>
            <div className="noData">No documents found.</div>
          </StyledTableCell>
        </StyledTableRow>
      ) : (
        getCurrentItems().map((doc) => (
          <StyledTableRow key={doc.documentID}>
            <StyledTableCell>{doc.documentName}</StyledTableCell>
            <StyledTableCell>{doc.documentCode}</StyledTableCell>
            <StyledTableCell>{doc.documentType}</StyledTableCell>
            <StyledTableCell>{doc.documentVersion}</StyledTableCell>
            <StyledTableCell>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setPdfFileId(doc.documentID);
                    setPdfFileType("document");
                    setPdfFileExtension(doc.documentExtention);
                    setShowFileViewer(true);
                  }}
                  className="icon-btn view"
                >
                  <FaEye />
                </button>
                <button
                  onClick={() =>
                    downloadFileToBrowserById("document", doc.documentID)
                  }
                  className="icon-btn download"
                >
                  <FaDownload />
                </button>
                <button
                  onClick={() => {
                    setSelectedDoc(doc);
                    setShowApproveModal(true);
                  }}
                  className="icon-btn check"
                >
                  <FaCheck />
                </button>
                <button
                  onClick={() => {
                    setSelectedDoc(doc);
                    setShowReturnModal(true);
                  }}
                  className="icon-btn undo"
                >
                  <FaUndo />
                </button>
                <button
                  onClick={() => {
                    setSelectedDoc(doc);
                    setShowRejectModal(true);
                  }}
                  className="icon-btn reject"
                >
                  <FaTimes />
                </button>
              </div>
            </StyledTableCell>
          </StyledTableRow>
        ))
      )}
    </TableBody>

    <TableFooter>
      <TableRow>
        <TablePagination
          count={totalRecords}
          page={currentPage}
          onPageChange={(_, page) => setCurrentPage(page)}
          rowsPerPage={itemsPerPage}
          rowsPerPageOptions={[]}
          ActionsComponent={TablePaginationActions}
        />
      </TableRow>
    </TableFooter>
  </Table>
</TableContainer>

        </div>
      </div>
    </div>
  );
};

export default DocumentReviewApproval;

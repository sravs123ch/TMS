import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "../../../components/common/Modal";
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

import {
  fetchQuestions,
  deleteQuestion,
} from "../../../services/sopojt-Management/QuestionPrepareGridService";
import TableRow from "@mui/material/TableRow";
import { QuestionPrepareContext } from "../../../context/sopOjt-Management/QuestionPrepareContext";

const QuestionPrepareGrid = () => {
  const navigate = useNavigate();
  const { loadQuestionForEdit } = useContext(QuestionPrepareContext);

  const [questions, setQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Debounce effect for search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch questions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userID = sessionStorage.getItem("userID");
        const payload = {
          userID: userID ? parseInt(userID) : 0,
          page: {
            offset: currentPage * rowsPerPage,
            fetch: rowsPerPage,
          },
          searchText: debouncedSearchTerm,
        };
        const data = await fetchQuestions(payload);
        const message = data.header?.messages?.[0];

        if (message?.messageLevel?.toLowerCase() === "warning") {
          toast.warning(message.messageText);
        } else if (message?.messageLevel?.toLowerCase() === "error") {
          toast.error(message.messageText);
        }

        if (data.header?.errorCount === 0 && Array.isArray(data.questions)) {
          setQuestions(data.questions);
          setTotalRecords(data.totalRecord);
        } else {
          setQuestions([]);
          setTotalRecords(0);
        }
      } catch (err) {
        toast.error("Failed to fetch questions");
        setQuestions([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedSearchTerm, currentPage, rowsPerPage]);

  const handleAdd = () =>
    navigate("/document-management/questioner-preparation/add");

  const handleEdit = async (question) => {
    try {
      await loadQuestionForEdit(
        question.preparationID,
        question.documentID,
        question.requiredQuestions,
        question.documentName
      );
      navigate(
        `/document-management/questioner-preparation/edit/${question.preparationID}`
      );
    } catch (err) {
      toast.error("Failed to load question for editing");
    }
  };

  const handleDeleteClick = (question) => {
    setSelectedQuestion(question);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedQuestion.questionStatus === "Approved") {
      toast.warning("Cannot delete approved questions");
      return cancelDelete();
    }

    try {
      const res = await deleteQuestion(selectedQuestion.preparationID);
      if (res?.header?.errorCount === 0) {
        toast.success("Question deleted successfully");
        setSelectedQuestion(null);
        setShowDeleteModal(false);
        // Refresh data
        const userID = sessionStorage.getItem("userID");
        const payload = {
          userID: userID ? parseInt(userID) : 0,
          page: {
            offset: currentPage * rowsPerPage,
            fetch: rowsPerPage,
          },
          searchText: debouncedSearchTerm,
        };
        const data = await fetchQuestions(payload);
        setQuestions(data.questions || []);
        setTotalRecords(data.totalRecord || 0);
      } else {
        throw new Error(
          res?.header?.messages?.[0]?.messageText || "Failed to delete"
        );
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete question");
    } finally {
      cancelDelete();
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedQuestion(null);
  };

  const handleChangePage = (_, newPage) => setCurrentPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const getStatusStyle = (status) => {
    const base = "px-3 py-1 rounded text-xs font-semibold";
    switch (status?.toLowerCase()) {
      case "approved":
        return `${base} bg-green-100 text-green-700`;
      case "draft":
        return `${base} bg-yellow-100 text-yellow-800`;
      case "rejected":
        return `${base} bg-red-100 text-red-700`;
      case "returned":
        return `${base} bg-blue-100 text-blue-700`;
      default:
        return `${base} bg-gray-200 text-gray-800`;
    }
  };

  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={1500} />
      {showDeleteModal && (
        <Modal
          title="Confirm Delete"
          message={`Are you sure you want to delete questions for document "${selectedQuestion?.documentName}"?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="heading">Questioner Preparation</h2>
          <SearchAddBar
            searchValue={searchTerm}
            onSearchChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
            onAddClick={handleAdd}
            placeholder="Search..."
          />
        </div>

     <TableContainer component={Paper}>
  <Table>
    <TableHead>
      <StyledTableRow>
        <StyledTableCell>Document Name</StyledTableCell>
        <StyledTableCell>Document Code</StyledTableCell>
        <StyledTableCell>Total Questions</StyledTableCell>
        <StyledTableCell>Status</StyledTableCell>
        <StyledTableCell>Actions</StyledTableCell>
      </StyledTableRow>
    </TableHead>

    <TableBody>
      {loading ? (
        <StyledTableRow>
          <StyledTableCell colSpan={5}>
            <Spinner />
          </StyledTableCell>
        </StyledTableRow>
      ) : questions.length > 0 ? (
        questions.map((question, idx) => (
          <StyledTableRow key={idx}>
            <StyledTableCell>{question.documentName}</StyledTableCell>
            <StyledTableCell>{question.documentCode}</StyledTableCell>
            <StyledTableCell>{question.requiredQuestions}</StyledTableCell>
            <StyledTableCell>
              <span
                className={`${getStatusStyle(
                  question.questionStatus
                )} inline-block text-center w-28 rounded-md px-2 py-1`}
              >
                {question.questionStatus}
              </span>
            </StyledTableCell>
            <StyledTableCell>
              <div className="flex gap-2">
                <button
                  className="icon-btn edit"
                  onClick={() => handleEdit(question)}
                  disabled={question.questionStatus === "Rejected"}
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  className="icon-btn delete"
                  onClick={() => handleDeleteClick(question)}
                  disabled={question.questionStatus === "Approved"}
                  title="Delete"
                >
                  <FcCancel />
                </button>
              </div>
            </StyledTableCell>
          </StyledTableRow>
        ))
      ) : (
        <StyledTableRow>
          <StyledTableCell colSpan={5} className="text-center py-4">
            No questions found.
          </StyledTableCell>
        </StyledTableRow>
      )}
    </TableBody>

    <TableFooter>
      <TableRow>
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          count={totalRecords}
          rowsPerPage={rowsPerPage}
          page={currentPage}
          SelectProps={{
            inputProps: { "aria-label": "rows per page" },
            native: true,
          }}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          ActionsComponent={TablePaginationActions}
        />
      </TableRow>
    </TableFooter>
  </Table>
</TableContainer>

      </div>
    </div>
  );
};

export default QuestionPrepareGrid;

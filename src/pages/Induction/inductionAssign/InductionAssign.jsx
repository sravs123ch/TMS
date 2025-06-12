import React, { useEffect, useState, useRef } from "react";
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
import { useNavigate } from "react-router-dom";
import { fetchAllInductionAssignments } from "../../../services/induction/InductionAssignService";
import { FaEdit } from "react-icons/fa";
import TableRow from "@mui/material/TableRow";
import Spinner from "../../../components/common/Spinner";
const InductionAssign = () => {
  const navigate = useNavigate();
  const [inductionAssignments, setInductionAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const tableRef = useRef(null);

  useEffect(() => {
    loadAssignments(currentPage);
  }, [currentPage]);

  const loadAssignments = async (page) => {
    setLoading(true);
    try {
      const data = await fetchAllInductionAssignments(page + 1, rowsPerPage);
      setInductionAssignments(data.inductionAssignments || []);
      setTotalRecords(data.totalRecord || 0);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_, newPage) => setCurrentPage(newPage);

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(0);
  };

  const handleEdit = (data) => {
    navigate("/induction/induction-assign/edit-induction-assign", {
      state: { inductionData: data },
    });
  };

  return (
    <div className="main-container">
      <div className="tableWhiteCardContainer">
        <div className="tableHeaderLayout">
          <h2 className="heading">Induction Assign</h2>
          <SearchAddBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onAddClick={() =>
              navigate("/induction/induction-assign/add-induction-assign")
            }
            placeholder="Search by user..."
          />
        </div>

        <TableContainer component={Paper} className="shadow rounded-lg">
          <Table ref={tableRef}>
            <TableHead>
              <StyledTableRow>
                <StyledTableCell>User Name</StyledTableCell>
                <StyledTableCell>Due Date</StyledTableCell>
                <StyledTableCell>Induction Status</StyledTableCell>
                <StyledTableCell>Remarks</StyledTableCell>
                <StyledTableCell>Assigned By</StyledTableCell>
                <StyledTableCell>Assigned On</StyledTableCell>
                <StyledTableCell>Action</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={7}>
                    <Spinner />
                  </StyledTableCell>
                </StyledTableRow>
              ) : inductionAssignments.length === 0 ? (
                <StyledTableRow>
                  <StyledTableCell
                    colSpan={7}
                    className="text-center py-6 text-gray-500"
                  >
                    No assignments found.
                  </StyledTableCell>
                </StyledTableRow>
              ) : (
                inductionAssignments.map((item, index) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell>{`${item.firstName} ${item.lastName}`}</StyledTableCell>
                    <StyledTableCell>
                      {item.dueDate
                        ? new Date(item.dueDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : "N/A"}
                    </StyledTableCell>
                    <StyledTableCell>
                      <StatusChip status={item.inductionStatus} />
                    </StyledTableCell>
                    <StyledTableCell>{item.remarks || "-"}</StyledTableCell>
                    <StyledTableCell>{item.assignedBy || "-"}</StyledTableCell>
                    <StyledTableCell>
                      {item.assignedDate
                        ? new Date(item.assignedDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "N/A"}
                    </StyledTableCell>
                    <StyledTableCell>
                      <button
                        className="icon-btn edit"
                        onClick={() => handleEdit(item)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50]}
                  count={totalRecords}
                  rowsPerPage={rowsPerPage}
                  page={currentPage}
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

export default InductionAssign;

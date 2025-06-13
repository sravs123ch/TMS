import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import profile from "../../../assets/images/profile.png";

import Spinner from "../../../components/common/Spinner";
import SearchAddBar from "../../../components/common/ui/SearchButton";
import {
  StyledTableCell,
  StyledTableRow,
  TablePaginationActions,
} from "../../../components/common/Table/CustomTablePagination";

import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import TableRow from "@mui/material/TableRow";

import { getRoleAssignments } from "../../../services/systemAdmin/RoleAssignmentService";

const RoleAssignment = () => {
  const navigate = useNavigate();
  const [roleAssignments, setRoleAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0); // Note: MUI uses 0-based indexing
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const rowsPerPage = 10;
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(0); // reset to first page
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const response = await getRoleAssignments(
          currentPage + 1,
          rowsPerPage,
          debouncedSearchTerm
        );
        if (response.header?.errorCount === 0) {
          setRoleAssignments(response.roleAssignments || []);
          setTotalRecords(response.totalRecord || 0);
        } else {
          toast.error(
            response.header?.messages?.[0]?.messageText || "Failed to load data"
          );
          setRoleAssignments([]);
        }
      } catch (err) {
        toast.error("Something went wrong!");
        setRoleAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [currentPage, debouncedSearchTerm, refreshKey]);

  const handleEdit = (assignment) => {
    navigate("/system-admin/role-assignment/edit-role-assignment", {
      state: { assignmentData: assignment },
    });
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="main-container">
      <ToastContainer />
      <div className="tableWhiteCardContainer">
        <div className="tableHeaderLayout">
          <h3 className="heading">Role Assignment</h3>
          <SearchAddBar
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            onAddClick={() =>
              navigate("/system-admin/role-assignment/add-role-assignment")
            }
            addLabel="+ Add"
          />
        </div>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Full Name</StyledTableCell>
                <StyledTableCell>Role Name</StyledTableCell>
                <StyledTableCell>Plant Name</StyledTableCell>
                <StyledTableCell>Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={4} align="center">
                    <Spinner />
                  </StyledTableCell>
                </StyledTableRow>
              ) : roleAssignments.length > 0 ? (
                roleAssignments.map((assignment, index) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell>
                      <div className="flex items-center gap-2">
                        <div >
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
                        <span>{`${assignment.firstName} ${assignment.lastName}`}</span>
                      </div>
                    </StyledTableCell>
                    <StyledTableCell>{assignment.roleName}</StyledTableCell>
                    <StyledTableCell>{assignment.plantName}</StyledTableCell>
                    <StyledTableCell>
                      <button
                        onClick={() => handleEdit(assignment)}
                        className="icon-btn edit"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              ) : (
                <StyledTableRow>
                  <StyledTableCell
                    className="noData"
                    colSpan={4}
                    align="center"
                  >
                    No role assignments found.
                  </StyledTableCell>
                </StyledTableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[rowsPerPage]}
                  count={totalRecords}
                  rowsPerPage={rowsPerPage}
                  page={currentPage}
                  onPageChange={handleChangePage}
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

export default RoleAssignment;

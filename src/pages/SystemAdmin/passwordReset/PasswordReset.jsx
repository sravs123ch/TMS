import React, { useState, useEffect, useContext } from "react";
import { MdResetTv } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

import Spinner from "../../../components/common/Spinner";
import { UserContext } from "../../../context/UserContext";
import {
  fetchPasswordResetRequests,
  acceptPasswordReset,
} from "../../../services/systemAdmin/PasswordResetService";

const PasswordReset = () => {
  const { userDetails } = useContext(UserContext);
  const [requests, setRequests] = useState([]);
  const [passwords, setPasswords] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const data = await fetchPasswordResetRequests();
        if (
          data.header?.errorCount === 0 &&
          Array.isArray(data.passwordReset)
        ) {
          setRequests(data.passwordReset);
        } else {
          console.error(
            "Error fetching reset requests:",
            data?.header?.messages
          );
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handlePasswordChange = (transactionID, value) => {
    setPasswords((prev) => ({ ...prev, [transactionID]: value }));
  };

  const handleReset = async (transactionID) => {
    const password = passwords[transactionID];
    const plantID = userDetails?.plantID || 0;
    const acceptedBy =
      userDetails?.userID?.toString() || userDetails?.firstName || "Admin";

    if (!password) {
      toast.error("Please enter a password.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const result = await acceptPasswordReset(
        transactionID,
        password,
        acceptedBy,
        plantID
      );
      const messages = result.header?.messages || [];
      const errorMessages = messages
        .filter((msg) => msg.messageLevel === "Error")
        .map((msg) => msg.messageText);
      const infoMessages = messages
        .filter((msg) => msg.messageLevel === "Information")
        .map((msg) => msg.messageText);

      if (result.header?.errorCount === 0) {
        infoMessages.forEach((msg, idx) =>
          toast.success(msg, {
            position: "top-right",
            autoClose: 1500 + idx * 500,
          })
        );
        setRequests((prev) =>
          prev.filter((r) => r.transactionID !== transactionID)
        );
      } else {
        errorMessages.forEach((msg, idx) =>
          toast.error(msg, {
            position: "top-right",
            autoClose: 3000 + idx * 500,
          })
        );
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("An error occurred while resetting password.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={1500} />
    <div className="main-container">
       <div className="body-container">
      <h2 className="heading">Password Reset Requests</h2>
   </div>
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell>Employee ID</StyledTableCell>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>New Password</StyledTableCell>
              <StyledTableCell>Action</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <StyledTableRow>
                <StyledTableCell colSpan={4} className="text-center py-5">
                  <Spinner />
                </StyledTableCell>
              </StyledTableRow>
            ) : requests.length > 0 ? (
              (rowsPerPage > 0
                ? requests.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : requests
              ).map((req) => (
                <StyledTableRow key={req.transactionID}>
                  <StyledTableCell>{req.employeeID}</StyledTableCell>
                  <StyledTableCell>{`${req.firstName} ${req.lastName}`}</StyledTableCell>
                  <StyledTableCell>
                    <input
                      type="password"
                      className="border border-gray-300 px-2 py-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      value={passwords[req.transactionID] || ""}
                      onChange={(e) =>
                        handlePasswordChange(req.transactionID, e.target.value)
                      }
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <button
                      className="bg-cyan-600 text-white p-2 rounded hover:bg-cyan-700"
                      onClick={() => handleReset(req.transactionID)}
                    >
                      <MdResetTv size={20} />
                    </button>
                  </StyledTableCell>
                </StyledTableRow>
              ))
            ) : (
              <StyledTableRow>
                <StyledTableCell colSpan={4}>
                  <div className="flex justify-center items-center w-full h-full">
                    No password reset requests.
                  </div>
                </StyledTableCell>
              </StyledTableRow>
            )}
          </TableBody>
          <TableFooter>
            <StyledTableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                count={requests.length}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  inputProps: { "aria-label": "rows per page" },
                  native: true,
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </StyledTableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </div>
 
    </>
  );
};

export default PasswordReset;

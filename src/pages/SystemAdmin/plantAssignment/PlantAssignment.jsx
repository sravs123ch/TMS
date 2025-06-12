import { useState, useEffect, useContext } from "react";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Spinner from "../../../components/common/Spinner";
import SearchAddBar from "../../../components/common/ui/SearchButton";
import {
  StyledTableCell,
  StyledTableRow,
  TablePaginationActions,
} from "../../../components/common/Table/CustomTablePagination";
import {
  Table,
  TableBody,
  TableHead,
  TableFooter,
  TableContainer,
  TablePagination,
  Paper,
} from "@mui/material";
import { fetchAllPlantsAssign } from "../../../services/systemAdmin/PlantAssignService";
import { PlantAssignContext } from "../../../context/PlantAssignContext";

const PlantAssignment = () => {
  const navigate = useNavigate();
  const { setPlantAssignDetails } = useContext(PlantAssignContext);
  const [plants, setPlants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAllPlantsAssign(
          currentPage + 1,
          rowsPerPage,
          debouncedSearchTerm
        );
        if (data?.header?.errorCount === 0) {
          setPlants(data.plantAssignments || []);
          setTotalRecords(data.totalRecord || 0);
        } else {
          const messages = data?.header?.messages || [];
          messages.forEach((msg) => toast.error(msg.messageText));
        }
      } catch (error) {
        toast.error("Error fetching plant assignments");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, rowsPerPage, debouncedSearchTerm]);

  const handleEdit = (plant) => {
    const fullName = `${plant.firstName} ${plant.lastName}`;
    setPlantAssignDetails(
      plant.plantAssignmentID,
      plant.userID,
      fullName,
      plant.plantIDs
    );
    navigate("/system-admin/plant-assignment/edit-plant-assignment");
  };

  const handleChangePage = (event, newPage) => setCurrentPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={1500} />
      <div className="main-container">
        {/* White card container */}
        <div className="tableWhiteCardContainer">
          <div className="tableHeaderLayout">
            <h3 className="heading">Plant Assignment</h3>
            <SearchAddBar
              searchValue={searchTerm}
              onSearchChange={(e) => setSearchTerm(e.target.value)}
              onAddClick={() =>
                navigate("/system-admin/plant-assignment/add-plant-assignment")
              }
            />
          </div>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell>Full Name</StyledTableCell>
                  <StyledTableCell>Plant Name</StyledTableCell>
                  <StyledTableCell>Actions</StyledTableCell>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <StyledTableRow>
                    <StyledTableCell colSpan={3}>
                      <Spinner />
                    </StyledTableCell>
                  </StyledTableRow>
                ) : plants.length > 0 ? (
                  plants.map((assignment, index) => (
                    <StyledTableRow key={index}>
                      <StyledTableCell>
                        {`${assignment.firstName || "N/A"} ${
                          assignment.lastName || "N/A"
                        }`}
                      </StyledTableCell>
                      <StyledTableCell>
                        {assignment.plantName || "Not Assigned"}
                      </StyledTableCell>
                      <StyledTableCell>
                        <button
                          onClick={() => handleEdit(assignment)}
                          className="icon-btn edit"
                          title="Edit Plant Assignment"
                        >
                          <FaEdit size={18} />
                        </button>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <StyledTableRow>
                    <StyledTableCell className="noData" colSpan={3} align="center">
                      No records found.
                    </StyledTableCell>
                  </StyledTableRow>
                )}
              </TableBody>
              <TableFooter>
                <StyledTableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    count={totalRecords}
                    rowsPerPage={rowsPerPage}
                    page={currentPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
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

export default PlantAssignment;

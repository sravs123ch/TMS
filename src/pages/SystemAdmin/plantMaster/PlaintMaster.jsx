import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchAllPlants,
  deletePlant,
} from "../../../services/systemAdmin/PlantMasterService";
import { PlantContext } from "../../../context/PlantContext";
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
import TableRow from "@mui/material/TableRow";
const PlantMaster = () => {
  const navigate = useNavigate();
  const { setPlantDetails } = useContext(PlantContext);
  const [plants, setPlants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);

  // Debounce searchTerm input
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    const loadPlants = async () => {
      try {
        setIsLoading(true);
        const currentPage = page + 1; // MUI pagination is 0-indexed, API is 1-indexed
        const data = await fetchAllPlants(
          currentPage,
          rowsPerPage,
          debouncedSearchTerm
        );

        if (data.header?.errorCount === 0 && Array.isArray(data.plants)) {
          setPlants(data.plants);
          setTotalRecords(data.totalRecord || 0);
        } else {
          toast.error(
            data.header?.messages?.[0]?.messageText || "Failed to load plants"
          );
        }
      } catch (error) {
        console.error("Error fetching plants:", error);
        toast.error("An error occurred while fetching plants");
      } finally {
        setIsLoading(false);
      }
    };

    loadPlants();
  }, [page, rowsPerPage, debouncedSearchTerm]);

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

  const handleAddPlantClick = () =>
    navigate("/system-admin/plant-master/add-plant");

  const handleEditPlant = (plant) => {
    setPlantDetails(plant.plantID, plant.plantName);
    navigate("/system-admin/plant-master/edit-plant", {
      state: { plantData: plant },
    });
  };

  const handleDeletePlant = (plant) => {
    setSelectedPlant(plant);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await deletePlant({
        plantID: selectedPlant.plantID,
        modifiedBy: "admin",
      });
      if (res.header?.errorCount === 0) {
        toast.success(
          res.header?.messages?.[0]?.messageText || "Deleted successfully"
        );
        setPage(0);
        // Reload plants after deletion
        const data = await fetchAllPlants(
          page + 1,
          rowsPerPage,
          debouncedSearchTerm
        );
        setPlants(data.plants);
        setTotalRecords(data.totalRecord);
      } else {
        toast.error(res.header?.messages?.[0]?.messageText || "Delete failed");
      }
    } catch (error) {
      toast.error("Error while deleting plant");
      console.error(error);
    } finally {
      setShowDeleteModal(false);
      setSelectedPlant(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedPlant(null);
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
        {/* White card container */}
        <div className="tableWhiteCardContainer">
          <div className="tableHeaderLayout">
            <h2 className="heading">Plant Master</h2>
            <SearchAddBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onAddClick={handleAddPlantClick}
            />
          </div>

          <TableContainer component={Paper} className="shadow-none">
            <Table stickyHeader aria-label="plant table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Plant Name</StyledTableCell>
                  <StyledTableCell>Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <StyledTableRow>
                    <StyledTableCell colSpan={2} className="text-center py-5">
                      <Spinner />
                    </StyledTableCell>
                  </StyledTableRow>
                ) : plants.length > 0 ? (
                  plants.map((item) => (
                    <StyledTableRow key={item.plantID}>
                      <StyledTableCell>{item.plantName}</StyledTableCell>
                      <StyledTableCell>
                        <div className="flex gap-3 items-center h-full">
                          <button
                            onClick={() => handleEditPlant(item)}
                            className="icon-btn edit"
                            title="Edit Plant"
                          >
                            <FaEdit className="icon-md" />
                          </button>
                          <button
                            onClick={() => handleDeletePlant(item)}
                            className="icon-btn delete"
                            title="Delete Plant"
                          >
                            <FcCancel className="icon-md" />
                          </button>
                        </div>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <StyledTableRow>
                    <StyledTableCell colSpan={2} className="text-center py-5">
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
          message={`Are you sure you want to delete plant "${selectedPlant?.plantName}"?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </>
  );
};

export default PlantMaster;

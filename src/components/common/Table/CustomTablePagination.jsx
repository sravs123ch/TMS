import React from "react";
import PropTypes from "prop-types";
import {
  styled,
  useTheme,
  TableCell,
  TableRow,
  Box,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableFooter,
  Paper,
  TablePagination,
} from "@mui/material";

import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
     backgroundColor: 'var(--primary-color)',
    color: theme.palette.common.white,
    fontWeight: 'bold',
    fontSize: 14,
    padding: 10,
  },
  '&.MuiTableCell-body': {
    fontSize: 14,
    padding: 10,
  },
}));


// Styled table row
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(even)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

// Pagination Actions
function TablePaginationActions({ count, page, rowsPerPage, onPageChange }) {
  const theme = useTheme();

  const handleFirstPage = (e) => onPageChange(e, 0);
  const handleBack = (e) => onPageChange(e, page - 1);
  const handleNext = (e) => onPageChange(e, page + 1);
  const handleLastPage = (e) =>
    onPageChange(e, Math.max(0, Math.ceil(count / rowsPerPage) - 1));

  return (
    <Box
      sx={{ flexShrink: 0, ml: 2.5, display: "flex", justifyContent: "center" }}
    >
      <IconButton onClick={handleFirstPage} disabled={page === 0}>
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBack} disabled={page === 0}>
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNext}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPage}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

export {
  StyledTableCell,
  StyledTableRow,
  TablePaginationActions,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableFooter,
  Paper,
  TablePagination,
};

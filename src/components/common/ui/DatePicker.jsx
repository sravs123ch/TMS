import React from "react";
import { LocalizationProvider, DatePicker as MuiDatePicker } from "@mui/x-date-pickers";
import { TextField } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const DatePicker = ({ label, value, onChange, ...props }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MuiDatePicker
        label={label}
        value={value}
        onChange={onChange}
        renderInput={(params) => <TextField fullWidth {...params} />}
        {...props}
      />
    </LocalizationProvider>
  );
};

export default DatePicker;

export const phoneInputStyles = {
  container: {
    width: "100%",
  },
  input: {
    width: "100%",
    height: "48px",
    fontSize: "1rem",
    borderRadius: "0.5rem",
    border: "1px solid #d1d5db",
    paddingLeft: "48px",
  },
  button: {
    border: "none",
    background: "transparent",
  },
};

// import React from "react";
// import { LocalizationProvider, DatePicker as MuiDatePicker } from "@mui/x-date-pickers";
// import { TextField } from "@mui/material";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// const DatePicker = ({ label, value, onChange, ...props }) => {
//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <MuiDatePicker
//         label={label}
//         value={value}
//         onChange={onChange}
//         renderInput={(params) => <TextField fullWidth {...params} />}
//         {...props}
//       />
//     </LocalizationProvider>
//   );
// };

// export default DatePicker;

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
        {...props}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "black",
                },
                "&:hover fieldset": {
                  borderColor: "black",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "black",
                },
              },
              "& .MuiInputBase-input": {
                fontSize: "0.875rem",
                padding: "10px 12px",
              },
              "& .MuiInputLabel-root": {
                fontSize: "0.875rem",
              },
            }}
          />
        )}
      />
    </LocalizationProvider>
  );
};

export default DatePicker;

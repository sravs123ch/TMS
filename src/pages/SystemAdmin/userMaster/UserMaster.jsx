import { useState, useEffect, useContext } from "react";
import profile from "../../../assets/images/profile.png";
import { FaEdit } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/UserContext";
import {
  fetchUsersBasicInfo,
  deleteUser,
} from "../../../services/systemAdmin/UserMasterService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "../../../components/common/Modal";
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
import SearchAddBar from "../../../components/common/ui/SearchButton";

const UserMaster = () => {
  const navigate = useNavigate();
  const { setUserId, setUserDetails } = useContext(UserContext);

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0); 
    }, 500); 

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const currentPage = page + 1;
        const data = await fetchUsersBasicInfo(
          currentPage,
          rowsPerPage,
          debouncedSearchTerm
        );

        const message = data.header?.messages?.[0];
        if (message?.messageLevel?.toLowerCase() === "warning") {
          toast.warning(message.messageText);
        } else if (message?.messageLevel?.toLowerCase() === "error") {
          toast.error(message.messageText);
        }

        if (
          data.header?.errorCount === 0 &&
          Array.isArray(data.usersBasicInfo)
        ) {
          setUsers(data.usersBasicInfo);
          setTotalRecords(data.totalRecord || 0);
        } else {
          console.error("Failed to load users:", data.header?.message);
        }
      } catch (error) {
        toast.error("Error fetching users");
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [page, rowsPerPage, debouncedSearchTerm, refreshKey]);

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

  const handleAddUserClick = () =>
    navigate("/system-admin/user-master/add-user");

  const handleEditUserClick = (user) => {
    try {
      if (!user || !user.userID) {
        toast.error("Invalid user data");
        return;
      }

      setUserId(user.userID);
      setUserDetails(user);

      const userDataToStore = {
        userID: user.userID,
        employeeID: user.employeeID,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        categoryType: user.categoryType,
        roleID: user.roleID,
        departmentID: user.departmentID,
        designationID: user.designationID,
        reportsTo: user.reportsTo,
        emailID: user.emailID,
        loginID: user.loginID,
        inductionRequire: user.inductionRequire,
        userProfileID: user.userProfileID,
      };

      localStorage.setItem("editUserFormData", JSON.stringify(userDataToStore));
      navigate("/system-admin/user-master/edit-user");
    } catch (error) {
      console.error("Error preparing user data for edit:", error);
      toast.error("Failed to prepare user data for editing");
    }
  };

  const handleDeactivateClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const response = await deleteUser(selectedUser.userID);

      if (response.header?.errorCount === 0) {
        const successMsg =
          response.header?.messages?.[0]?.messageText ||
          "User deactivated successfully.";
        toast.success(successMsg);
        setShowDeleteModal(false);
        setSelectedUser(null);
        setRefreshKey((prev) => prev + 1);
      } else {
        const errorMsg =
          response.header?.messages?.[0]?.messageText ||
          "Failed to deactivate user.";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error deactivating user:", error);
      toast.error("An error occurred while deactivating user.");
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
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

      {showDeleteModal && (
        <Modal
          title="Confirm Deactivate"
          message={
            <div>
              <p>
                Are you sure you want to deactivate user "
                {selectedUser?.firstName} {selectedUser?.lastName}"?
              </p>
            </div>
          }
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      <div className="main-container ">
        <div className="flex justify-between items-center mb-4">
          <h2 className="heading">User Master</h2>
          <SearchAddBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onAddClick={handleAddUserClick}
          />
        </div>

        <TableContainer component={Paper}>
          <Table className="min-w-full">
            <TableHead>
              <TableRow>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>Department</StyledTableCell>
                <StyledTableCell>Designation</StyledTableCell>
                <StyledTableCell>Role</StyledTableCell>
                <StyledTableCell>Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={5}>
                    <div className="flex justify-center p-4">
                      <div className="loader"></div>
                    </div>
                  </StyledTableCell>
                </StyledTableRow>
              ) : users.length > 0 ? (
                users.map((user, index) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell>
                      <div className="flex items-center gap-2">
                        <div className="shrink-0 relative">
                          <img
                            src={profile}
                            alt="profile"
                            className="h-8 w-8 rounded-full object-cover border border-[var(--primary-color)]"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "default-profile.png";
                            }}
                          />
                        </div>
                        <span>{`${user.firstName} ${user.lastName}`}</span>
                      </div>
                    </StyledTableCell>
                    <StyledTableCell>{user.departmentName}</StyledTableCell>
                    <StyledTableCell>{user.designationName}</StyledTableCell>
                    <StyledTableCell>{user.roleName || "-"}</StyledTableCell>
                    <StyledTableCell>
                      <div className="flex space-x-2 items-center h-10">
                        <button
                          onClick={() => handleEditUserClick(user)}
                          className="icon-btn edit"
                          title="Edit User"
                        >
                          <FaEdit className="icon-md" />
                        </button>
                        <button
                          onClick={() => handleDeactivateClick(user)}
                          className="icon-btn delete"
                          title="Deactivate User"
                        >
                          <FcCancel className="icon-md" />
                        </button>
                      </div>
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              ) : (
                <StyledTableRow>
                  <StyledTableCell colSpan={5}>
                    <div className="text-center py-4 text-sm text-gray-500">
                      No users found.
                    </div>
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
                  colSpan={5}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </div>
    </>
  );
};

export default UserMaster;


// import { useState, useEffect, useContext } from "react";
// import profile from "../../../assets/images/profile.png";
// import { FaEdit } from "react-icons/fa";
// import { FcCancel } from "react-icons/fc";
// import { useNavigate } from "react-router-dom";
// import { UserContext } from "../../../context/UserContext";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Modal from "../../../components/common/Modal";
// import {
//   StyledTableCell,
//   StyledTableRow,
//   TablePaginationActions,
//   TableContainer,
//   Table,
//   TableHead,
//   TableBody,
//   TableFooter,
//   TablePagination,
//   Paper,
// } from "../../../components/common/Table/CustomTablePagination";
// import TableRow from "@mui/material/TableRow";
// import SearchAddBar from "../../../components/common/ui/SearchButton";

// // Static data
// const staticData = {
//   usersBasicInfo: [
//     {
//       userID: 97,
//       employeeID: "E1478",
//       firstName: "Jignesh",
//       lastName: "Trivedi",
//       gender: "M",
//       categoryType: "test",
//       roleID: 68,
//       roleName: "Training & Development Manager",
//       departmentID: 11,
//       departmentName: "Human Resources",
//       designationID: 39,
//       designationName: "Medical Representative",
//       reportsTo: "80",
//       emailID: "test@gmail.com1",
//       loginID: "L1478",
//       inductionRequire: "False",
//       userProfileID: "0",
//       active: true,
//       plantID: 1,
//       plantName: "Mumbai New",
//       isReset: false
//     },
//     {
//       userID: 98,
//       employeeID: "E1479",
//       firstName: "Samar",
//       lastName: "Doshi",
//       gender: "M",
//       categoryType: "Test",
//       roleID: 68,
//       roleName: "Training & Development Manager",
//       departmentID: 26,
//       departmentName: "Legal & Compliance",
//       designationID: 15,
//       designationName: "Clinical Data Manager",
//       reportsTo: "12",
//       emailID: "test@gmail.com",
//       loginID: "L1479",
//       inductionRequire: "True",
//       userProfileID: "0",
//       active: true,
//       plantID: 1,
//       plantName: "Mumbai New",
//       isReset: false
//     },
//     {
//       userID: 96,
//       employeeID: "T0005",
//       firstName: "test",
//       lastName: "user5",
//       gender: "M",
//       categoryType: "test",
//       roleID: 67,
//       roleName: "Talent Acquisition Specialist",
//       departmentID: 16,
//       departmentName: "IT",
//       designationID: 49,
//       designationName: "Data Analyst",
//       reportsTo: "95",
//       emailID: "test@gmail.com",
//       loginID: "T0001",
//       inductionRequire: "True",
//       userProfileID: "0",
//       active: true,
//       plantID: 1,
//       plantName: "Mumbai New",
//       isReset: false
//     },
//     {
//       userID: 95,
//       employeeID: "T003",
//       firstName: "test",
//       lastName: "user3",
//       gender: "M",
//       categoryType: "test uesr",
//       roleID: 68,
//       roleName: "Training & Development Manager",
//       departmentID: 26,
//       departmentName: "Legal & Compliance",
//       designationID: 15,
//       designationName: "Clinical Data Manager",
//       reportsTo: "95",
//       emailID: "test@gmail.com",
//       loginID: "T0003",
//       inductionRequire: "True",
//       userProfileID: "0",
//       active: true,
//       plantID: 1,
//       plantName: "Mumbai New",
//       isReset: false
//     },
//     {
//       userID: 94,
//       employeeID: "T002",
//       firstName: "test",
//       lastName: "user2",
//       gender: "M",
//       categoryType: "test",
//       roleID: 68,
//       roleName: "Training & Development Manager",
//       departmentID: 11,
//       departmentName: "Human Resources",
//       designationID: 15,
//       designationName: "Clinical Data Manager",
//       reportsTo: "93",
//       emailID: "test@gmail.com",
//       loginID: "T0002",
//       inductionRequire: "False",
//       userProfileID: "0",
//       active: true,
//       plantID: 1,
//       plantName: "Mumbai New",
//       isReset: false
//     },
//     {
//       userID: 93,
//       employeeID: "test0001",
//       firstName: "test",
//       lastName: "user",
//       gender: "M",
//       categoryType: "test",
//       roleID: 68,
//       roleName: "Training & Development Manager",
//       departmentID: 21,
//       departmentName: "Manufacturing",
//       designationID: 15,
//       designationName: "Clinical Data Manager",
//       reportsTo: "92",
//       emailID: "test@gmail.com",
//       loginID: "T001",
//       inductionRequire: "True",
//       userProfileID: "0",
//       active: true,
//       plantID: 1,
//       plantName: "Mumbai New",
//       isReset: false
//     },
//     {
//       userID: 92,
//       employeeID: "EMP1050",
//       firstName: "Chloe",
//       lastName: "Brooks",
//       gender: "F",
//       categoryType: "",
//       roleID: 67,
//       roleName: "Talent Acquisition Specialist",
//       departmentID: 9,
//       departmentName: "Quality Assurance",
//       designationID: 49,
//       designationName: "Data Analyst",
//       reportsTo: "88",
//       emailID: "chloe.brooks@example.com",
//       loginID: "cbrooks",
//       inductionRequire: "False",
//       userProfileID: "0",
//       active: true,
//       plantID: 1,
//       plantName: "Mumbai New",
//       isReset: false
//     },
//     {
//       userID: 91,
//       employeeID: "EMP1049",
//       firstName: "Alok",
//       lastName: "Sen",
//       gender: "M",
//       categoryType: "",
//       roleID: 67,
//       roleName: "Talent Acquisition Specialist",
//       departmentID: 9,
//       departmentName: "Quality Assurance",
//       designationID: 49,
//       designationName: "Data Analyst",
//       reportsTo: "88",
//       emailID: "alok.sen@example.com",
//       loginID: "asen",
//       inductionRequire: "False",
//       userProfileID: "0",
//       active: true,
//       plantID: 1,
//       plantName: "Mumbai New",
//       isReset: false
//     },
//     {
//       userID: 90,
//       employeeID: "EMP1048",
//       firstName: "Lily",
//       lastName: "Hughes",
//       gender: "F",
//       categoryType: "",
//       roleID: 67,
//       roleName: "Talent Acquisition Specialist",
//       departmentID: 9,
//       departmentName: "Quality Assurance",
//       designationID: 49,
//       designationName: "Data Analyst",
//       reportsTo: "87",
//       emailID: "lily.hughes@example.com",
//       loginID: "lhughes",
//       inductionRequire: "False",
//       userProfileID: "0",
//       active: true,
//       plantID: 1,
//       plantName: "Mumbai New",
//       isReset: false
//     },
//     {
//       userID: 89,
//       employeeID: "EMP1047",
//       firstName: "Naveen",
//       lastName: "Chandra",
//       gender: "M",
//       categoryType: "",
//       roleID: 67,
//       roleName: "Talent Acquisition Specialist",
//       departmentID: 9,
//       departmentName: "Quality Assurance",
//       designationID: 49,
//       designationName: "Data Analyst",
//       reportsTo: "86",
//       emailID: "naveen.chandra@example.com",
//       loginID: "nchandra",
//       inductionRequire: "False",
//       userProfileID: "0",
//       active: true,
//       plantID: 1,
//       plantName: "Mumbai New",
//       isReset: false
//     }
//   ],
//   totalRecord: 67,
//   header: {
//     errorCount: 0,
//     warningCount: 0,
//     informationCount: 1,
//     messages: [
//       {
//         messageLevel: "Information",
//         messageText: "User information has been fetched successfully."
//       }
//     ]
//   }
// };

// const UserMaster = () => {
//   const navigate = useNavigate();
//   const { setUserId, setUserDetails } = useContext(UserContext);

//   const [users, setUsers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
//   const [page, setPage] = useState(0); 
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [loading, setLoading] = useState(false); // Changed to false since we're using static data
//   const [totalRecords, setTotalRecords] = useState(0);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [refreshKey, setRefreshKey] = useState(0);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm);
//       setPage(0); 
//     }, 500); 

//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   useEffect(() => {
//     // Load static data instead of API call
//     const loadUsers = () => {
//       try {
//         setLoading(true);
        
//         // Filter users based on search term if provided
//         let filteredUsers = staticData.usersBasicInfo;
//         if (debouncedSearchTerm) {
//           const searchLower = debouncedSearchTerm.toLowerCase();
//           filteredUsers = staticData.usersBasicInfo.filter(user => 
//             `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower) ||
//             user.employeeID.toLowerCase().includes(searchLower) ||
//             user.departmentName.toLowerCase().includes(searchLower) ||
//             user.designationName.toLowerCase().includes(searchLower) ||
//             user.roleName.toLowerCase().includes(searchLower)
//           );
//         }

//         // Pagination logic
//         const startIndex = page * rowsPerPage;
//         const paginatedUsers = filteredUsers.slice(startIndex, startIndex + rowsPerPage);

//         setUsers(paginatedUsers);
//         setTotalRecords(filteredUsers.length);
        
//         // Show success message from static data
//         const message = staticData.header?.messages?.[0];
//         if (message?.messageLevel?.toLowerCase() === "warning") {
//           toast.warning(message.messageText);
//         } else if (message?.messageLevel?.toLowerCase() === "information") {
//           // toast.info(message.messageText); // Uncomment if you want to show the info message
//         }
//       } catch (error) {
//         toast.error("Error loading users");
//         console.error("Error loading users:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadUsers();
//   }, [page, rowsPerPage, debouncedSearchTerm, refreshKey]);

//   // Rest of the component remains the same...
//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0); 
//   };

//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const handleAddUserClick = () =>
//     navigate("/system-admin/user-master/add-user");

//   const handleEditUserClick = (user) => {
//     try {
//       if (!user || !user.userID) {
//         toast.error("Invalid user data");
//         return;
//       }

//       setUserId(user.userID);
//       setUserDetails(user);

//       const userDataToStore = {
//         userID: user.userID,
//         employeeID: user.employeeID,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         gender: user.gender,
//         categoryType: user.categoryType,
//         roleID: user.roleID,
//         departmentID: user.departmentID,
//         designationID: user.designationID,
//         reportsTo: user.reportsTo,
//         emailID: user.emailID,
//         loginID: user.loginID,
//         inductionRequire: user.inductionRequire,
//         userProfileID: user.userProfileID,
//       };

//       localStorage.setItem("editUserFormData", JSON.stringify(userDataToStore));
//       navigate("/system-admin/user-master/edit-user");
//     } catch (error) {
//       console.error("Error preparing user data for edit:", error);
//       toast.error("Failed to prepare user data for editing");
//     }
//   };

//   const handleDeactivateClick = (user) => {
//     setSelectedUser(user);
//     setShowDeleteModal(true);
//   };

//   const confirmDelete = async () => {
//     if (!selectedUser) return;
//     setLoading(true);
//     try {
//       // Simulate API call with timeout
//       setTimeout(() => {
//         toast.success("User deactivated successfully.");
//         setShowDeleteModal(false);
//         setSelectedUser(null);
//         setRefreshKey((prev) => prev + 1);
//       }, 500);
//     } catch (error) {
//       console.error("Error deactivating user:", error);
//       toast.error("An error occurred while deactivating user.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const cancelDelete = () => {
//     setShowDeleteModal(false);
//     setSelectedUser(null);
//   };

//   return (
//     <>
//       <ToastContainer
//         position="top-right"
//         autoClose={1500}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//       />

//       {showDeleteModal && (
//         <Modal
//           title="Confirm Deactivate"
//           message={
//             <div>
//               <p>
//                 Are you sure you want to deactivate user "
//                 {selectedUser?.firstName} {selectedUser?.lastName}"?
//               </p>
//             </div>
//           }
//           onConfirm={confirmDelete}
//           onCancel={cancelDelete}
//         />
//       )}

//       <div className="main-container ">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="heading">User Master</h2>
//           <SearchAddBar
//             searchTerm={searchTerm}
//             onSearchChange={handleSearchChange}
//             onAddClick={handleAddUserClick}
//           />
//         </div>

//         <TableContainer component={Paper}>
//           <Table className="min-w-full">
//             <TableHead>
//               <TableRow>
//                 <StyledTableCell>Name</StyledTableCell>
//                 <StyledTableCell>Department</StyledTableCell>
//                 <StyledTableCell>Designation</StyledTableCell>
//                 <StyledTableCell>Role</StyledTableCell>
//                 <StyledTableCell>Actions</StyledTableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {loading ? (
//                 <StyledTableRow>
//                   <StyledTableCell colSpan={5}>
//                     <div className="flex justify-center p-4">
//                       <div className="loader"></div>
//                     </div>
//                   </StyledTableCell>
//                 </StyledTableRow>
//               ) : users.length > 0 ? (
//                 users.map((user, index) => (
//                   <StyledTableRow key={index}>
//                     <StyledTableCell>
//                       <div className="flex items-center gap-2">
//                         <div className="shrink-0 relative">
//                           <img
//                             src={profile}
//                             alt="profile"
//                             className="h-8 w-8 rounded-full object-cover border border-[var(--primary-color)]"
//                             onError={(e) => {
//                               e.target.onerror = null;
//                               e.target.src = "default-profile.png";
//                             }}
//                           />
//                         </div>
//                         <span>{`${user.firstName} ${user.lastName}`}</span>
//                       </div>
//                     </StyledTableCell>
//                     <StyledTableCell>{user.departmentName}</StyledTableCell>
//                     <StyledTableCell>{user.designationName}</StyledTableCell>
//                     <StyledTableCell>{user.roleName || "-"}</StyledTableCell>
//                     <StyledTableCell>
//                       <div className="flex space-x-2 items-center h-10">
//                         <button
//                           onClick={() => handleEditUserClick(user)}
//                           className="icon-btn edit"
//                           title="Edit User"
//                         >
//                           <FaEdit className="icon-md" />
//                         </button>
//                         <button
//                           onClick={() => handleDeactivateClick(user)}
//                           className="icon-btn delete"
//                           title="Deactivate User"
//                         >
//                           <FcCancel className="icon-md" />
//                         </button>
//                       </div>
//                     </StyledTableCell>
//                   </StyledTableRow>
//                 ))
//               ) : (
//                 <StyledTableRow>
//                   <StyledTableCell colSpan={5}>
//                     <div className="text-center py-4 text-sm text-gray-500">
//                       No users found.
//                     </div>
//                   </StyledTableCell>
//                 </StyledTableRow>
//               )}
//             </TableBody>

//             <TableFooter>
//               <TableRow>
//                 <TablePagination
//                   rowsPerPageOptions={[5, 10, 25]}
//                   count={totalRecords}
//                   rowsPerPage={rowsPerPage}
//                   page={page}
//                   onPageChange={handleChangePage}
//                   onRowsPerPageChange={handleChangeRowsPerPage}
//                   ActionsComponent={TablePaginationActions}
//                   colSpan={5}
//                 />
//               </TableRow>
//             </TableFooter>
//           </Table>
//         </TableContainer>
//       </div>
//     </>
//   );
// };

// export default UserMaster;
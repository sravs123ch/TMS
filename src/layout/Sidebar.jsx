// import { useState, useEffect } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { FiMenu } from "react-icons/fi";
// import { HiOutlineLogout } from "react-icons/hi";
// import { ChevronDown } from "lucide-react";
// import profile from "../assets/images/profile.png";
// import logo from "../assets/images/logo.png";
// import {
//   Shield,
//   FileText,
//   Book,
//   LayoutDashboard,
//   Users,
//   BookOpen,
// } from "lucide-react";

// const userNavigation = [
//   { name: "Your profile", href: "/Profile" },
//   { name: "Change Password", href: "/profile/password-change" },
//   { name: "Sign out", href: "/" },
// ];

// const Navigation = ({ isNavbarOpen, toggleNavbar }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [logindata, setLogindata] = useState(null);
//   const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
//   const [plantName, setPlantName] = useState("");
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [openItems, setOpenItems] = useState([]);

//   const menuItems = [
//     {
//       name: "Dashboard",
//       icon: <LayoutDashboard size={16} />,
//     },
//     {
//       name: "System Admin",
//       icon: <Shield size={16} />,
//       subItems: [
//         "Module Central Configuration",
//         "User Master",
//         "Department Master",
//         "Designation Master",
//         "Role Master",
//         "Plant Master",
//         "User Personal Details",
//         "Role Assignment",
//         "Plant Assignment",
//         "Password Configuration",
//         "User Status",
//         "Password Reset",
//       ],
//     },
//     {
//       name: "Induction",
//       icon: <Users size={16} />,
//       subItems: [
//         "Module Central Configuration",
//         "Induction Assign",
//         "Job Responsibility",
//         "Induction Sign",
//       ],
//     },
//     {
//       name: "Document Management",
//       icon: <FileText size={16} />,
//       subItems: [
//         "Document Registration",
//         "Document Approval",
//         "Questioner Preparation",
//         "Questioner Approval",
//         "OJT Master",
//         "OJT Approval",
//       ],
//     },
//     {
//       name: "Course Code",
//       icon: <Book size={16} />,
//       subItems: [
//         "Course Code Registration",
//         "Course Code Approval",
//         "Course Code Assignment",
//       ],
//     },
//     {
//       name: "Training Session",
//       icon: <BookOpen size={16} />,
//       subItems: [
//         "Module Central Configuration",
//         "Trainer Registration",
//         "Trainer Approval",
//         "Yearly Planning",
//         "Schedule Training",
//         "Un-schedule Training",
//         "On-Job Training",
//         "Self-Training",
//         "Document Reading",
//         "Training Attendance",
//         "Question Preparation",
//         "Evaluation",
//         "Retraining",
//         "Training Completion",
//         "Training Certificate",
//       ],
//     },
//   ];

//   useEffect(() => {
//     const userData = localStorage.getItem("userData");
//     if (userData) {
//       setLogindata(JSON.parse(userData));
//     }

//     // Get plant name from localStorage
//     const selectedPlant = localStorage.getItem("selectedPlant");
//     if (selectedPlant) {
//       try {
//         setPlantName(JSON.parse(selectedPlant).plantName || "");
//       } catch {
//         setPlantName("");
//       }
//     }
//   }, []);

//   const handleSignOut = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("userData");
//     localStorage.removeItem("selectedPlant");
//     navigate("/");
//   };

//   useEffect(() => {
//     document.body.classList.toggle("body-pd", isNavbarOpen);
//   }, [isNavbarOpen]);

//   const formatTime = (seconds) => {
//     const m = String(Math.floor(seconds / 60)).padStart(2, "0");
//     const s = String(seconds % 60).padStart(2, "0");
//     return `${m}:${s}`;
//   };

//   const handleItemClick = (itemName) => {
//     if (openItems.includes(itemName)) {
//       setOpenItems(openItems.filter((name) => name !== itemName));
//     } else {
//       setOpenItems([...openItems, itemName]);
//     }
//   };

//   const handleSubItemClick = (main, sub) => {
//     const mainSlug = main
//       .toLowerCase()
//       .replace(/\s+/g, "-")
//       .replace(/[^a-z0-9-]/g, "");
//     const subSlug = sub
//       .toLowerCase()
//       .replace(/\s+/g, "-")
//       .replace(/[^a-z0-9-]/g, "");
//     const route = `/${mainSlug}/${subSlug}`;
//     navigate(route);
//   };

//   return (
//     <>
//       <header className="fixed top-0 left-0 w-full bg-white shadow-md flex items-center justify-between px-4 h-16 z-50">
//         <div className="flex items-center">
//           <button
//             className="text-xl text-[var(--primary-color)] mr-4"
//             onClick={toggleNavbar}
//           >
//             <FiMenu />
//           </button>
//           <div className="w-36 h-12 flex items-center">
//             <img
//               src={logo}
//               alt="Logo"
//               className="w-full h-full object-contain"
//             />
//           </div>
//         </div>

//         <div className="flex items-center gap-6">
//           <div className="flex items-center gap-4">
//             <div className="text-right hidden md:block">
//               <div className="text-sm font-medium text-gray-700">
//                 {plantName || "No Plant Selected"}
//               </div>
//               <div className="text-xs text-gray-500">
//                 Session ends in: {formatTime(timeLeft)}
//               </div>
//             </div>

//             <div className="text-right hidden md:block">
//               <div className="text-sm font-medium text-gray-700">
//                 {logindata
//                   ? `${logindata.FirstName} ${logindata.LastName}`
//                   : "User"}
//               </div>
//               <div className="text-xs text-gray-500">
//                 {logindata?.RoleName || "Role"}
//               </div>
//             </div>
//           </div>

//           <div className="relative">
//             <button
//               onClick={() => setDropdownOpen(!dropdownOpen)}
//               className="flex items-center gap-2"
//             >
//               <img
//                 src={logindata?.ProfileImage || profile}
//                 alt="Profile"
//                 className="w-8 h-8 rounded-full border border-[#1995AD] object-cover"
//               />
//               <ChevronDown className="w-5 h-5 text-gray-400" />
//             </button>

//             {dropdownOpen && (
//               <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
//                 {userNavigation.map((item) => (
//                   <button
//                     key={item.name}
//                     onClick={() => {
//                       setDropdownOpen(false);
//                       item.name === "Sign out"
//                         ? handleSignOut()
//                         : navigate(item.href);
//                     }}
//                     className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#8B4513]/10 hover:text-[var(--primary-color)]"
//                   >
//                     {item.name}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </header>

//       <div
//         className={`fixed top-0 left-0 h-full transition-all ${
//           isNavbarOpen ? "w-60" : "w-16"
//         } bg-[var(--primary-color)]`}
//       >
//         <nav className="flex flex-col h-full mt-16">
//           <div className="flex flex-col flex-1 overflow-y-auto">
//             {menuItems.map((item) => {
//               const isOpen = openItems.includes(item.name);

//               return (
//                 <div key={item.name} className="text-white">
//                   {/* <button
//                     onClick={() => {
//                       if (item.subItems) {
//                         handleItemClick(item.name);
//                       } else {
//                         navigate("/dashboard");
//                       }
//                     }}
//                     className={`w-full flex items-center gap-3 p-3 bg-[var(--primary-color)] ${
//                       isOpen ? "bg-[var(--primary-color)]" : ""
//                     }`}
//                   >
//                     <span className="text-xl">{item.icon}</span>

//                     {isNavbarOpen && (
//                       <>
//                         <span className="text-sm font-medium">{item.name}</span>
//                         {item.subItems && (
//                           <span
//                             className={`ml-auto text-xs transition-transform ${
//                               isOpen ? "rotate-90" : ""
//                             }`}
//                           >
//                             ▶
//                           </span>
//                         )}
//                       </>
//                     )}
//                   </button> */}
//                   <div key={item.name} className="text-white mb-1">
//                     <button
//                       onClick={() => {
//                         if (item.subItems) {
//                           handleItemClick(item.name);
//                         } else {
//                           navigate("/dashboard");
//                         }
//                       }}
//                       className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-[var(--secondary-color)] transition ${
//                         isOpen
//                           ? "bg-[var(--secondary-color)]"
//                           : "bg-[var(--primary-color)]"
//                       }`}
//                     >
//                       <span className="text-xl">{item.icon}</span>

//                       {isNavbarOpen && (
//                         <>
//                           <span className="text-sm font-medium">
//                             {item.name}
//                           </span>
//                           {item.subItems && (
//                             <span
//                               className={`ml-auto text-[10px] transition-transform ${
//                                 isOpen ? "rotate-90" : ""
//                               }`}
//                             >
//                               ▶
//                             </span>
//                           )}
//                         </>
//                       )}
//                     </button>

//                     {isOpen && item.subItems && isNavbarOpen && (
//                       <div className="bg-[var(--secondary-color)]">
//                         {item.subItems.map((sub, i) => (
//                           <button
//                             key={i}
//                             onClick={() => handleSubItemClick(item.name, sub)}
//                             className="w-full text-left px-8 py-2 text-sm hover:bg-[var(--light-color)] transition"
//                           >
//                             {sub}
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   {isOpen && item.subItems && isNavbarOpen && (
//                     <div className="pl-8 bg-[var(--primary-color)]">
//                       {item.subItems.map((sub, i) => (
//                         <button
//                           key={i}
//                           onClick={() => handleSubItemClick(item.name, sub)}
//                           className="w-full text-left p-2 text-sm bg-[var(--primary-color)]"
//                         >
//                           {sub}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>

//           <div className="mt-auto mb-14 border-t border-[#8B4513]/30">
//             <button
//               onClick={handleSignOut}
//               className="w-full flex items-center gap-3 p-3 text-white text-left bg-[var(--primary-color)]"
//             >
//               <HiOutlineLogout className="text-xl" />
//               {isNavbarOpen && (
//                 <span className="text-sm font-medium">Sign Out</span>
//               )}
//             </button>
//           </div>
//         </nav>
//       </div>
//     </>
//   );
// };

// export default Navigation;
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Book,
  BookOpen,
  Shield,
  Users,
  X,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={16} />,
    path: "/dashboard",
  },
  {
    name: "System Admin",
    icon: <Shield size={16} />,
    subItems: [
      "Module Central Configuration",
      "User Master",
      "Department Master",
      "Designation Master",
      "Role Master",
      "Plant Master",
      "User Personal Details",
      "Role Assignment",
      "Plant Assignment",
      "Password Configuration",
      "User Status",
      "Password Reset",
    ],
  },
  {
    name: "Induction",
    icon: <Users size={16} />,
    subItems: [
      "Module Central Configuration",
      "Induction Assign",
      "Job Responsibility",
      "Induction Sign",
    ],
  },
  {
    name: "Document Management",
    icon: <FileText size={16} />,
    subItems: [
      "Document Registration",
      "Document Approval",
      "Questioner Preparation",
      "Questioner Approval",
      "OJT Master",
      "OJT Approval",
    ],
  },
  {
    name: "Course Code",
    icon: <Book size={16} />,
    subItems: [
      "Course Code Registration",
      "Course Code Approval",
      "Course Code Assignment",
    ],
  },
  {
    name: "Training Session",
    icon: <BookOpen size={16} />,
    subItems: [
      "Module Central Configuration",
      "Trainer Registration",
      "Trainer Approval",
      "Yearly Planning",
      "Schedule Training",
      "Un-schedule Training",
      "On-Job Training",
      "Self-Training",
      "Document Reading",
      "Training Attendance",
      "Question Preparation",
      "Evaluation",
      "Retraining",
      "Training Completion",
      "Training Certificate",
    ],
  },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && isOpen) {
        toggleSidebar();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, toggleSidebar]);

  const toggleSubmenu = (name) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  const handleSubItemClick = (main, sub = null) => {
    const mainSlug = main.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    let route = `/${mainSlug}`;
    if (sub) {
      const subSlug = sub.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      route += `/${subSlug}`;
    }
    navigate(route);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      <aside
        className={`rounded-lg fixed inset-y-0 left-0 z-30 transform bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isMinimized ? "w-16" : "w-64"}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
            {!isMinimized && (
              <Link
                to="/"
              >
              </Link>
            )}
            <div className="flex space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                {isMinimized ? (
                  <ChevronRight size={20} />
                ) : (
                  <ChevronLeft size={20} />
                )}
              </button>
              <button
                onClick={toggleSidebar}
                className="p-1 md:hidden hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isSubmenuOpen = openSubmenu === item.name;
              return (
                <div key={item.name}>
                  <div
                    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 cursor-pointer ${
                      isSubmenuOpen
                        ? "bg-indigo-50 text-[var(--primary-color)] dark:bg-gray-700 dark:text-indigo-300"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                    onClick={() =>
                      item.subItems
                        ? toggleSubmenu(item.name)
                        : handleSubItemClick(item.name)
                    }
                  >
                    <div className={`h-5 w-5 ${isMinimized ? "mx-auto" : "mr-3"}`}>
                      {item.icon}
                    </div>
                    {!isMinimized && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        {item.subItems && (
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isSubmenuOpen ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </>
                    )}
                  </div>

                  {!isMinimized && item.subItems && (
                    <AnimatePresence>
                      {isSubmenuOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="ml-6 overflow-hidden"
                        >
                          {item.subItems.map((subItem) => (
                            <div
                              key={subItem}
                              onClick={() => handleSubItemClick(item.name, subItem)}
                              className="cursor-pointer px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg"
                            >
                              {subItem}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="p-4 border-t dark:border-gray-700">
            <button className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg">
              <LogOut
                className={`h-5 w-5 ${
                  isMinimized ? "mx-auto" : "mr-3"
                } text-gray-500 dark:text-gray-400`}
              />
              {!isMinimized && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

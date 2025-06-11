import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { motion } from "framer-motion";


const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    name: "System Admin",
    icon: Shield,
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
    icon: Users,
    subItems: [
      "Module Central Configuration",
      "Induction Assign",
      "Job Responsibility",
      "Induction Sign",
    ],
  },
  {
    name: "Document Management",
    icon: FileText,
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
    icon: Book,
    subItems: [
      "Course Code Registration",
      "Course Code Approval",
      "Course Code Assignment",
    ],
  },
  {
    name: "Training Session",
    icon: BookOpen,
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
  const location = useLocation();
  const navigate = useNavigate();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
const [timeLeft, setTimeLeft] = useState(0); 

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      setLogindata(JSON.parse(userData));
    }

    const selectedPlant = localStorage.getItem("selectedPlant");
    if (selectedPlant) {
      try {
        setPlantName(JSON.parse(selectedPlant).plantName || "");
      } catch {
        setPlantName("");
      }
    }
  }, []);


  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && isOpen) {
        toggleSidebar();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, toggleSidebar]);

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.subItems) {
        const mainSlug = item.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        const activeSubItem = item.subItems.find((subItem) => {
          const subSlug = subItem
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
          const subPath = `/${mainSlug}/${subSlug}`;
          return location.pathname.startsWith(subPath);
        });
        if (activeSubItem) {
          setOpenSubmenu(item.name);
        }
      }
    });
  }, [location.pathname]);


  const toggleSubmenu = (name) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("selectedPlant");
    navigate("/");
  };

  const getPath = (main, sub = null) => {
    const mainSlug = main
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    if (sub) {
      const subSlug = sub
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      return `/${mainSlug}/${subSlug}`;
    }
    return `/${mainSlug}`;
  };

  const submenuVariants = {
    open: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="bg-white bg-opacity-50 dark:bg-black dark:bg-opacity-50 md:hidden fixed inset-0 z-20"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`rounded-lg fixed top-0 left-0 z-30 bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isMinimized ? "w-16" : "w-72"} h-full md:static md:inset-auto md:z-auto md:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between h-16 px-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="flex gap-2">
              <button
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <ChevronRight size={20} />
                ) : (
                  <ChevronLeft size={20} />
                )}
              </button>
              <button
                className="p-2 rounded md:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={toggleSidebar}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-2 py-4 overflow-auto">
            {menuItems.map((item) => {
              const IconComponent = item.icon; 
              const mainSlug = item.name
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');
              const isActive =
                location.pathname === item.path ||
                (item.subItems &&
                  item.subItems.some((subItem) => {
                    const subSlug = subItem
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^a-z0-9-]/g, '');
                    const subPath = `/${mainSlug}/${subSlug}`;
                    return location.pathname.startsWith(subPath);
                  }));
              const isSubmenuOpen = openSubmenu === item.name;

              if (isMinimized) {
                return (
                  <div key={item.name} className="relative">
                    <button
                      onClick={() => {
                        if (item.subItems) {
                          toggleSubmenu(item.name);
                        } else {
                          navigate(item.path || getPath(item.name));
                        }
                      }}
                      className={`flex items-center justify-center p-3 mx-auto rounded-lg transition-colors duration-150 ${
                        isActive
                          ? 'bg-[--light-color] text-[--primary-color] dark:bg-gray-700 dark:text-blue-300'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                      title={item.name} 
                    >
                      <IconComponent
                        className={`h-5 w-5 ${
                          isActive
                            ? 'text-[--primary-color] dark:text-[--primary-color]'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      />
                    </button>

                    {/* Show submenu indicator if open in minimized mode */}
                    {isSubmenuOpen && item.subItems && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-[--primary-color] rounded-full"></div>
                    )}
                  </div>
                );
              }

              return (
                <div key={item.name}>
                  <div
                    className={`flex items-center px-4 py-2.5 text-md font-medium rounded-lg transition-colors duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-[--light-color] text-[--primary-color] dark:bg-gray-700 dark:text-blue-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                    onClick={() =>
                      item.subItems
                        ? toggleSubmenu(item.name)
                        : navigate(item.path || getPath(item.name))
                    }
                  >
                    <IconComponent
                      className={`h-5 w-5 mr-3 ${
                        isActive
                          ? 'text-[--primary-color] dark:text-[--primary-color]'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    />
                    {item.path && !item.subItems ? (
                      <Link to={item.path} className="flex-1">
                        {item.name}
                      </Link>
                    ) : (
                      <span className="flex-1">{item.name}</span>
                    )}
                    {item.subItems && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isSubmenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>

                  {item.subItems && (
                    <motion.div
                      variants={submenuVariants}
                      initial="closed"
                      animate={isSubmenuOpen ? 'open' : 'closed'}
                      className="ml-6 overflow-hidden border-l-2 border-gray-300 dark:border-gray-600"
                    >
                      {item.subItems.map((subItem) => {
                        const subSlug = subItem
                          .toLowerCase()
                          .replace(/\s+/g, '-')
                          .replace(/[^a-z0-9-]/g, '');
                        const subPath = `/${mainSlug}/${subSlug}`;
                        const isSubActive = location.pathname.startsWith(subPath);
                        return (
                          <Link
                            key={subItem}
                            to={subPath}
                            className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-150 ${
                              isSubActive
                                ? 'text-[--primary-color] dark:text-[--primary-color] font-medium bg-[--light-color] dark:bg-gray-600'
                                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => {
                              if (window.innerWidth < 768) toggleSidebar();
                            }}
                          >
                            <span className="ml-2">{subItem}</span>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="p-4 border-t dark:border-gray-700">
            <button
              className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-150"
              onClick={handleSignOut}
            >
              <LogOut
                className={`h-5 w-5 ${
                  isMinimized ? 'mx-auto' : 'mr-3'
                } text-gray-500 dark:text-gray-400`}
              />
              {!isMinimized && <span>Sign out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

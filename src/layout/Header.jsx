import { Menu, Bell, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from '../assets/images/logo.png';
const TopBar = ({ toggleSidebar }) => {

  const [darkMode, setDarkMode] = useState(false);
 const [logindata, setLogindata] = useState(null);
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));

    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      setLogindata(JSON.parse(userData));
    }

    // Get plant name from localStorage
    const selectedPlant = localStorage.getItem('selectedPlant');
    if (selectedPlant) {
      try {
        setPlantName(JSON.parse(selectedPlant).plantName || '');
      } catch {
        setPlantName('');
      }
    }
  }, []);
  return (
    <header className="z-10 py-4 bg-white shadow-sm dark:bg-gray-800">
      <div className="w-full flex items-center justify-between h-full px-4 md:px-6 mx-auto">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            className="p-1 mr-2 -ml-1 rounded-md md:hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-gray-600"
            onClick={toggleSidebar}
            aria-label="Menu"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </button>

          <Link to="/">
            <img
              src={logo}
              alt="Logo"
              className="align-left w-100 h-12 object-cover rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm"
            />
          </Link>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4 ml-auto">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            )}
          </button>

          <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          </button>

          <div className="relative">
            <button className="flex items-center space-x-2 focus:outline-none">
              {/* <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium uppercase">
                {user?.name?.charAt(0) || "U"}
              </div> */}
              <span className="hidden md:inline-block text-sm font-medium text-gray-700 dark:text-gray-200">
                {logindata ? `${logindata.FirstName} ${logindata.LastName}` : 'User'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;

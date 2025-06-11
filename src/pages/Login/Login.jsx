import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiMail, HiLockClosed } from "react-icons/hi";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../assets/images/logo.png";
import { getIpAndLocation } from "../../utils/locationUtils";
import {
  login,
  resetPassword,
  forgotPassword,
} from "../../services/auth/LoginService";
import AnimationFile from "../../assets/Animation.lottie";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    general: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUsername, setResetUsername] = useState("");
  const [resetSubmitted, setResetSubmitted] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [locationData, setLocationData] = useState({
    ip: "127.0.0.1",
    lat: "0",
    long: "0",
  });
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Delay animation load after initial render
    const timer = setTimeout(() => setShowAnimation(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Fetch location data when component mounts
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const data = await getIpAndLocation();
        setLocationData({
          ip: data.ip || "127.0.0.1",
          lat: data.lat?.toString() || "0",
          long: data.long?.toString() || "0",
        });
      } catch (error) {
        console.error("Error fetching location:", error);
        // Keep default values if location fetch fails
      }
    };

    fetchLocationData();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({ username: "", password: "", general: "" });

    const newErrors = {};
    if (!username.trim()) newErrors.username = "Username is required";
    if (!password) newErrors.password = "Password is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await login(
        username,
        password,
        locationData.ip,
        locationData.lat,
        locationData.long
      );

      if (response) {
        sessionStorage.setItem("userData", JSON.stringify(response.userMaster));
        sessionStorage.setItem("authToken", response.token);
        sessionStorage.setItem("plantId", response.userMaster.plantID);
        sessionStorage.setItem("userId", response.userMaster.userID);

        toast.success("Login successful!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Check if password reset is required
        if (response.userMaster.isReset === true) {
          setTimeout(() => navigate("/profile/password-change"), 2000);
        } else {
          setTimeout(() => navigate("/dashboard"), 2000);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.header?.messages?.[0]?.messageText ||
        "Login failed";
      const currentFailedAttempts = error.response?.data?.failedAttempts || 0;

      setFailedAttempts(currentFailedAttempts);
      setErrors((prev) => ({ ...prev, general: errorMessage }));

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: currentFailedAttempts < 0 ? 5000 : 3000,
        hideProgressBar: false,
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setErrors((prev) => ({ ...prev, general: "" }));

    try {
      const res = await forgotPassword(forgotUsername);
      const messages = res.header?.messages || [];
      const errorMessages = messages
        .filter((msg) => msg.messageLevel === "Error")
        .map((msg) => msg.messageText);
      const infoMessages = messages
        .filter((msg) => msg.messageLevel === "Information")
        .map((msg) => msg.messageText);

      if (res.header?.errorCount === 0) {
        infoMessages.forEach((msg, idx) =>
          toast.success(msg, {
            position: "top-right",
            autoClose: 1500 + idx * 500,
            hideProgressBar: false,
          })
        );
        setShowForgotModal(false);
        setForgotUsername("");
      } else {
        errorMessages.forEach((msg, idx) =>
          toast.error(msg, {
            position: "top-right",
            autoClose: 3000 + idx * 500,
            hideProgressBar: false,
          })
        );
        setErrors((prev) => ({
          ...prev,
          general: errorMessages[0] || "Forgot password failed",
        }));
      }
    } catch (error) {
      const errorMessage = "An error occurred while processing your request.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
      });
      setErrors((prev) => ({ ...prev, general: errorMessage }));
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors((prev) => ({ ...prev, reset: "" }));

    try {
      const response = await resetPassword(resetUsername);

      const errorCount = response?.header?.errorCount;
      const errorMsg = response?.header?.messages?.[0]?.messageText;

      if (errorCount && errorCount > 0) {
        setErrors((prev) => ({
          ...prev,
          reset:
            errorMsg || "An error occurred while submitting the reset request.",
        }));
        toast.error(errorMsg || "Failed to submit reset request.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
        });
      } else {
        setResetSubmitted(true);
        toast.success("Your password reset request has been submitted.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
        });
        setTimeout(() => {
          setShowResetModal(false);
          setResetSubmitted(false);
          setResetUsername("");
        }, 3000);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.header?.messages?.[0]?.messageText ||
        error.response?.data?.message ||
        "Failed to submit reset request. Please try again.";
      setErrors((prev) => ({ ...prev, reset: errorMsg }));
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin(e);
  };

  return (
    <div
      className="min-h-screen w-screen relative flex flex-col overflow-hidden bg-primary"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={1}
      />
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[var(--color-white)] opacity-90" />
        {showAnimation && (
          <div className="absolute top-0 -left-10 z-10 opacity-50 w-3/4 h-full">
            <DotLottieReact
              src={AnimationFile}
              loop={true}
              autoplay={true}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Mobile Top Logo */}
      <div className="w-full flex justify-center py-4 md:hidden z-20 relative">
        <img src={logo} alt="Logo" className="h-16" />
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex flex-1 gap-80 w-full">
        
        <div className="flex-1 pl-8 -mt-7  hidden md:block ">
          <div className="flex flex-col h-full">
           
            <div className="mb-0">
              <div className="h-32 w-32 rounded-lg flex items-center  font-bold">
                <img src={logo} alt="Logo" />
              </div>
            </div>

           
            <div className="max-w-xl">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-primary">
                Welcome to <br />
                Training Management
              </h1>
              <p className="text-lg text-[var(--color-gray-dark)] mb-12">
                Streamline your organization's learning and development programs
              </p>
            </div>

          </div>
        </div>

        

        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-primary md:bg-transparent">
          <div className="bg-primary rounded-2xl p-8 w-full max-w-md shadow-lg border border-[var(--color-gray-medium)]">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-white">
                Sign In to Your Account
              </h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiMail className="h-5 w-5 text-[var(--color-gray-dark)]" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-[var(--color-gray-medium)] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter Username"
                    required
                    autoFocus
                  />
                </div>
                {errors.username && (
                  <div className="p-3 bg-[var(--color-error-light)] text-[var(--color-error-dark)] rounded-lg text-sm">
                    ⚠ {errors.username}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-white">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiLockClosed className="h-5 w-5 text-[var(--color-gray-dark)]" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-[var(--color-gray-medium)] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="••••••••"
                    required
                  />
                  <span
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {/* {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-[var(--color-gray-dark)]" />
                    ) : (
                      <FaEye className="h-5 w-5 text-[var(--color-gray-dark)]" />
                    )} */}
                  </span>
                </div>
                {errors.password && (
                  <div className="p-3 bg-[var(--color-error-light)] text-[var(--color-error-dark)] rounded-lg text-sm">
                    ⚠ {errors.password}
                  </div>
                )}
              </div>

              {errors.general && (
                <div className="p-3 bg-[var(--color-error-light)] text-[var(--color-error-dark)] rounded-lg text-sm">
                  {errors.general}
                </div>
              )}
              {failedAttempts > 0 && (
                <div className="p-3 bg-[var(--color-error-light)] text-[var(--color-error-dark)] rounded-lg text-sm">
                  ⚠️ {failedAttempts}{" "}
                  {failedAttempts === 1 ? "attempt" : "attempts"} remaining
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-sm font-medium text-white hover:underline"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-white text-primary font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary isabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>

              {failedAttempts < 0 && (
                <button
                  type="button"
                  className="w-full py-3 px-4 bg-[var(--color-gray-medium)] hover:bg-[var(--color-gray-dark)] text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                  onClick={() => setShowResetModal(true)}
                  disabled={isLoading}
                >
                  Request Password Reset
                </button>
              )}
            </form>

            <div className="mt-8 text-center text-sm text-white">
              <p>
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="font-medium text-white hover:underline"
                >
                  Request access
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-white)] rounded-2xl p-8 w-full max-w-md shadow-lg border border-[var(--color-gray-medium)]">
            <button
              className="absolute top-4 right-4 text-[var(--color-gray-dark)]"
              onClick={() => setShowForgotModal(false)}
            >
              <FaTimes className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-primary mb-6 text-center">
              Forgot Password
            </h2>
            <form onSubmit={handleForgotSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-gray-dark)]">
                  Username
                </label>
                <input
                  type="text"
                  value={forgotUsername}
                  onChange={(e) => setForgotUsername(e.target.value)}
                  className="w-full px-3 py-3 border border-[var(--color-gray-medium)] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter your username"
                  required
                  disabled={forgotLoading}
                />
              </div>
              {errors.general && (
                <div className="p-3 bg-[var(--color-error-light)] text-[var(--color-error-dark)] rounded-lg text-sm">
                  {errors.general}
                </div>
              )}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-[var(--color-gray-medium)] hover:bg-[var(--color-gray-dark)] text-[var(--color-white)] font-medium rounded-lg transition-colors disabled:opacity-50"
                  onClick={() => setShowForgotModal(false)}
                  disabled={forgotLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-[var(--color-white)] font-medium rounded-lg transition-colors disabled:opacity-50"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-white)] rounded-2xl p-8 w-full max-w-md shadow-lg border border-[var(--color-gray-medium)]">
            <button
              className="absolute top-4 right-4 text-[var(--color-gray-dark)]"
              onClick={() => setShowResetModal(false)}
            >
              <FaTimes className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-primary mb-6 text-center">
              Password Reset Request
            </h2>
            {resetSubmitted ? (
              <div className="text-center">
                <p className="text-[var(--color-gray-dark)]">
                  Your password reset request has been submitted to the
                  administrator.
                </p>
                <p className="text-[var(--color-gray-dark)]">
                  You will be notified once your password has been reset.
                </p>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-gray-dark)]">
                    Username
                  </label>
                  <input
                    type="text"
                    value={resetUsername}
                    onChange={(e) => setResetUsername(e.target.value)}
                    className="w-full px-3 py-3 border border-[var(--color-gray-medium)] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter your username"
                    required
                    disabled={isLoading}
                  />
                </div>
                {errors.reset && (
                  <div className="p-3 bg-[var(--color-error-light)] text-[var(--color-error-dark)] rounded-lg text-sm">
                    {errors.reset}
                  </div>
                )}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="px-4 py-2 bg-[var(--color-gray-medium)] hover:bg-[var(--color-gray-dark)] text-[var(--color-white)] font-medium rounded-lg transition-colors disabled:opacity-50"
                    onClick={() => setShowResetModal(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary- text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

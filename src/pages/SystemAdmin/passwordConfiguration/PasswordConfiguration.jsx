import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  fetchPasswordConfiguration,
  upsertPasswordConfiguration,
} from "../../../services/systemAdmin/PasswordConfigurationService";

const complexityDefaults = {
  Low: {
    minPwdLength: 6,
    maxPwdTenure: 90,
    pwdHistory: 5,
    wrongAttemptLimit: 3,
    pwdComplexity: "Low",
    pwdChangeAlert: 7,
    idealSessionTime: 15,
  },
  Medium: {
    minPwdLength: 8,
    maxPwdTenure: 90,
    pwdHistory: 5,
    wrongAttemptLimit: 3,
    pwdComplexity: "Medium",
    pwdChangeAlert: 7,
    idealSessionTime: 15,
  },
  High: {
    minPwdLength: 12,
    maxPwdTenure: 90,
    pwdHistory: 5,
    wrongAttemptLimit: 3,
    pwdComplexity: "High",
    pwdChangeAlert: 7,
    idealSessionTime: 15,
  },
};

const defaultConfig = complexityDefaults.Low;

const PasswordConfiguration = () => {
  const [config, setConfig] = useState(defaultConfig);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleComplexityChange = (value) => {
    setConfig((prev) => ({ ...prev, pwdComplexity: value }));
    setErrors((prev) => ({ ...prev, pwdComplexity: "" }));
  };

  const loadConfigData = async () => {
    try {
      const data = await fetchPasswordConfiguration();
      const configData = data?.passwordConfiguration;
      if (configData && Object.keys(configData).length > 0) {
        setConfig({
          minPwdLength: configData.minimumPasswordLength,
          maxPwdTenure: configData.maximumPasswordTenure,
          pwdHistory: configData.passwordHistory,
          wrongAttemptLimit: configData.wrongAttemptLimit,
          pwdComplexity: configData.passwordComplexity,
          pwdChangeAlert: configData.passwordChangeAlert,
          idealSessionTime: configData.idealSessionTime,
        });
      } else {
        setConfig(defaultConfig);
      }
    } catch (error) {
      console.error("Error fetching configuration:", error);
      toast.error("Error fetching configuration.");
      setConfig(defaultConfig);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.entries(config).forEach(([key, value]) => {
      if (!value && value !== 0) {
        newErrors[key] = "This field is required";
      }
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    const payload = {
      minimumPasswordLength: +config.minPwdLength,
      maximumPasswordTenure: +config.maxPwdTenure,
      passwordHistory: +config.pwdHistory,
      wrongAttemptLimit: +config.wrongAttemptLimit,
      passwordComplexity: config.pwdComplexity,
      passwordChangeAlert: +config.pwdChangeAlert,
      idealSessionTime: +config.idealSessionTime,
      createdBy: "Admin",
      plantID: 0,
      reasonForChange: config.reasonForChange || "",
      electronicSignature: "AdminSignature",
      signatureDate: new Date().toISOString(),
    };

    try {
      await upsertPasswordConfiguration(payload);
      toast.success("Configuration saved successfully!");
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error("Failed to save configuration.");
    }
  };

  useEffect(() => {
    loadConfigData();
  }, []);

  const fieldMeta = [
    {
      name: "minPwdLength",
      label: "Minimum Password Length",
      desc: "Minimum number of characters required",
    },
    {
      name: "maxPwdTenure",
      label: "Password Expiry (in days)",
      desc: "Duration password stays valid",
    },
    {
      name: "pwdHistory",
      label: "Password History",
      desc: "Number of old passwords remembered to prevent reuse",
    },
    {
      name: "wrongAttemptLimit",
      label: "Wrong Attempt Limit",
      desc: "Number of wrong login attempts allowed before account lock",
    },
    {
      name: "pwdChangeAlert",
      label: "Password Change Alert (days before expiry)",
      desc: "Alert user before password expires",
    },
    {
      name: "idealSessionTime",
      label: "Ideal Session Time (in minutes)",
      desc: "Time before user is auto-logged out",
    },
  ];

  return (
    <div className="main-container">
      {/* White card container */}
      <div className="tableWhiteCardContainer">
        {isLoading ? (
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4">Loading Password Configuration...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3 className="heading">Password Configuration</h3>

            {fieldMeta.map(({ name, label, desc }) => (
              <div key={name} className="mb-6 flex items-start gap-6">
                <div className="w-1/2">
                  <label className="block font-medium">
                    {label}
                    <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">{desc}</p>
                </div>
                <div className="w-1/2">
                  <input
                    type="number"
                    name={name}
                    value={config[name]}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md text-center ${
                      errors[name] ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors[name] && (
                    <p className="text-sm text-red-600 mt-1">{errors[name]}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="mb-6 flex gap-6">
              <div className="w-1/2">
                <label className="block font-medium">
                  Password Complexity<span className="text-red-500">*</span>
                </label>
              </div>
              <div className="w-1/2">
                <div className="flex justify-between">
                  {["Low", "Medium", "High"].map((level) => (
                    <label
                      key={level}
                      className="flex flex-col items-center gap-1 cursor-pointer w-full text-center"
                    >
                      <div className="flex items-center gap-2 justify-center">
                        <div className="relative">
                          <input
                            type="checkbox"
                            name="pwdComplexity"
                            value={level}
                            checked={config.pwdComplexity?.includes(level)}
                            onChange={() => handleComplexityChange(level)}
                            className="peer appearance-none w-5 h-5 rounded-full border border-gray-400 checked:bg-cyan-600 checked:border-cyan-600 cursor-pointer"
                          />
                          <svg
                            className="absolute top-0 left-0 w-5 h-5 text-white scale-75 hidden peer-checked:block pointer-events-none"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className="font-medium">{level}</span>
                      </div>
                      <div className="text-xs text-gray-500 px-1">
                        {
                          {
                            Low: "Only letters & numbers",
                            Medium: "Letters, numbers & one special char",
                            High: "Upper, lower, numbers & special char",
                          }[level]
                        }
                      </div>
                    </label>
                  ))}
                </div>
                {errors.pwdComplexity && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.pwdComplexity}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-60 bg-cyan-700 hover:bg-cyan-900 text-white py-3 rounded-lg transition duration-200"
            >
              Save Configuration
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordConfiguration;

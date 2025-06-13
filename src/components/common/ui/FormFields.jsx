import AsyncSelect from "react-select/async";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  error,
  pattern,
  title,
  placeholder,
}) => (
  <div className="flex flex-col mb-4">
    <label className="text-inputFieldLabelSize font-medium text-inputFieldLabelColor">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      pattern={pattern}
      title={title}
      placeholder={placeholder}
      className={`w-full p-2 border ${
        error ? "border-red-500" : "border-gray-300"
      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 text-sm ${
        error ? "ring-1 ring-red-500" : ""
      }`}
    />
    {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
  </div>
);

export const PasswordInput = ({
  label,
  name,
  value,
  onChange,

  showPassword,
  toggleShowPassword,
  required,
  error,
}) => (
  <div className="flex flex-col mb-4">
    <label className="text-inputFieldLabelSize font-medium text-inputFieldLabelColor">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        minLength={8}
        className={`w-full p-2 pr-10 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 text-sm ${
          error ? "ring-1 ring-red-500" : ""
        }`}
      />
      <span
        onClick={toggleShowPassword}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer"
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </span>
    </div>
    {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
  </div>
);

export const CustomAsyncSelect = ({
  label,
  options,
  value,
  loadOptions,
  onChange,
  onMenuOpen,
  onMenuScrollToBottom,
  onInputChange,
  isLoading,
  placeholder,
  required,
}) => (
  <div className="flex flex-col mb-4">
    <label className="text-inputFieldLabelSize font-medium text-inputFieldLabelColor">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <AsyncSelect
      cacheOptions
      defaultOptions={options}
      value={value}
      loadOptions={loadOptions}
      onChange={onChange}
      onMenuOpen={onMenuOpen}
      onMenuScrollToBottom={onMenuScrollToBottom}
      onInputChange={onInputChange}
      isLoading={isLoading}
      placeholder={placeholder}
      className="text-sm"
      styles={{
        control: (base, state) => ({
    ...base,
    minHeight: "40px",
    height: "40px",
    fontSize: "0.875rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    padding: "0 0.5rem",
    boxShadow: state.isFocused ? "0 0 0 2px #3b82f6" : "none",
    "&:hover": {
      borderColor: "#3b82f6",
    },
  }),
        menu: (base) => ({
          ...base,
          maxHeight: "200px",
          zIndex: 10,
        }),
        menuList: (base) => ({
          ...base,
          maxHeight: "200px",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#888",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#555",
          },
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isFocused ? "#e6f3ff" : "white",
          color: "#333",
          padding: "8px 12px",
          "&:hover": { backgroundColor: "#e6f3ff" },
        }),
      }}
      components={{
        LoadingMessage: () => (
          <div className="p-2 text-center text-sm">Loading...</div>
        ),
        NoOptionsMessage: () => (
          <div className="p-2 text-center text-sm">
            {options.length === 0 ? "No options found" : "Loading more..."}
          </div>
        ),
      }}
      menuPortalTarget={document.body}
    />
  </div>
);

export const RadioGroup = ({ label, name, value, onChange, options }) => (
  <div className="flex flex-col mb-4">
    <label className="text-inputFieldLabelSize font-medium text-gray-900 mb-1">
      {label}
    </label>
    <div className="flex items-center gap-4">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center text-inputFieldLabelSize font-medium text-gray-900 cursor-pointer"
        >
          <input
            type="radio"
            name={name}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="w-5 h-5 border-2 border-blue-600 rounded-full cursor-pointer focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 appearance-none checked:bg-blue-600 checked:before:content-['✔'] checked:before:text-white checked:before:flex checked:before:items-center checked:before:justify-center checked:before:text-xs"
          />
          <span className="ml-2">{option.label}</span>
        </label>
      ))}
    </div>
  </div>
);

export const EnhancedInputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  error,
  pattern,
  title,
  placeholder,
  readOnly,
  asTextarea,
  rows = 4,
}) => (
  <div className="flex flex-col mb-4">
    <label className="text-inputFieldLabelSize font-medium text-gray-900 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {asTextarea ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className={`w-full p-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 text-sm ${
          error ? "ring-1 ring-red-500" : ""
        }`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        pattern={pattern}
        title={title}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full p-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 text-sm ${
          error ? "ring-1 ring-red-500" : ""
        } ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
      />
    )}
    {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
  </div>
);


export const FileUploadField = ({ label, name, onChange, accept, file, description, currentFile }) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="file"
        name={name}
        onChange={onChange}
        accept={accept}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      {currentFile && (
        <p className="mt-1 text-sm text-gray-500">Current file: {currentFile}</p>
      )}
      {file && (
        <p className="mt-1 text-sm text-gray-500">New file: {file.name}</p>
      )}
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
};
export const CheckboxField = ({
  label,
  checked,
  onChange,
  className = '',
  disabled = false,
  name = '',
  id = '',
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        name={name}
        id={id || name}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      {label && (
        <label htmlFor={id || name} className="ml-2 block text-sm text-gray-700">
          {label}
        </label>
      )}
    </div>
  );
};
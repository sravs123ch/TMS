const Spinner = ({ size = "w-10 h-10", className = "" }) => {
  return (
    <div className={`border-4 border-gray-200 border-t-[var(--primary-color)] rounded-full animate-spin mx-auto ${size} ${className}`}></div>
  );
};

export default Spinner;

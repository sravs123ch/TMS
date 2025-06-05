import PropTypes from "prop-types";

const SearchAddBar = ({
  searchTerm,
  onSearchChange,
  onAddClick,
  searchPlaceholder = "Search...",
  addButtonText = "+ Add",
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={searchTerm}
        onChange={onSearchChange}
        className="w-full sm:w-64 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        onClick={onAddClick}
        className="w-full sm:w-auto bg-[--primary-color] transition-colors text-white text-sm px-5 py-2 rounded-md font-medium"
      >
        {addButtonText}
      </button>
    </div>
  );
};

SearchAddBar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onAddClick: PropTypes.func.isRequired,
  searchPlaceholder: PropTypes.string,
  addButtonText: PropTypes.string,
};

export default SearchAddBar;

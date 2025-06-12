import React, { useState, useRef, useEffect } from 'react';
import StatusChip from '../../StatusChip/StatusChip';

const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={selectRef}>
      <div
        className="flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 bg-white min-h-[40px] cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value ? (
          <StatusChip status={value} />
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <span
          className={`ml-2 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </div>

      {isOpen && (
        <div className="absolute z-50 bg-white border border-gray-300 rounded-md mt-1 shadow-md w-full flex flex-wrap gap-2 p-2">
          {options.map((option) => (
            <div
              key={option}
              className={`cursor-pointer transition-transform flex-none ${
                value === option ? 'scale-105 shadow' : ''
              }`}
              onClick={() => handleSelect(option)}
            >
              <StatusChip status={option} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;

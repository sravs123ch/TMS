import React from 'react';

const STATUS_STYLES = {
  completed: 'bg-green-100 text-green-800 border border-green-300',
  approved: 'bg-green-100 text-green-800 border border-green-300',
  assigned: 'bg-green-100 text-green-800 border border-green-300',
  overdue: 'bg-red-100 text-red-800 border border-red-300',
  rejected: 'bg-red-100 text-red-800 border border-red-300',
  inprogress: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  'in progress': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  returned: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  underreview: 'bg-gray-200 text-gray-700 border border-gray-300',
  'under review': 'bg-gray-200 text-gray-700 border border-gray-300',
  default: 'bg-gray-100 text-gray-600 border border-gray-300',
};

const StatusChip = ({ status = '' }) => {
  const lowerStatus = status.toLowerCase();
  const statusStyle = STATUS_STYLES[lowerStatus] || STATUS_STYLES.default;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize min-w-[80px] text-center inline-block ${statusStyle}`}>
      {status}
    </span>
  );
};

export default StatusChip;

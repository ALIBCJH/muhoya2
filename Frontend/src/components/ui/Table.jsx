import React from 'react';
import Badge from './Badge';

/**
 * Modern Table Component with advanced features
 */
const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({ children, className = '' }) => (
  <thead className={`bg-gradient-to-r from-gray-50 to-gray-100 ${className}`}>
    {children}
  </thead>
);

const TableBody = ({ children, className = '' }) => (
  <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
    {children}
  </tbody>
);

const TableRow = ({ children, className = '', hoverable = true, ...props }) => (
  <tr 
    className={`${hoverable ? 'hover:bg-gray-50 transition-colors' : ''} ${className}`}
    {...props}
  >
    {children}
  </tr>
);

const TableHead = ({ children, className = '', sortable = false, ...props }) => (
  <th
    className={`px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider ${
      sortable ? 'cursor-pointer select-none hover:bg-gray-200' : ''
    } ${className}`}
    {...props}
  >
    {children}
  </th>
);

const TableCell = ({ children, className = '', ...props }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`} {...props}>
    {children}
  </td>
);

const EmptyState = ({ message = 'No data available', icon, action }) => (
  <tr>
    <td colSpan="100" className="px-6 py-12 text-center">
      <div className="flex flex-col items-center justify-center space-y-3">
        {icon || (
          <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
        <p className="text-gray-500 font-medium">{message}</p>
        {action}
      </div>
    </td>
  </tr>
);

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;
Table.EmptyState = EmptyState;

// Helper component for status badges in tables
export const StatusBadge = ({ status }) => {
  const statusMap = {
    completed: { variant: 'success', label: 'Completed' },
    pending: { variant: 'warning', label: 'Pending' },
    'in-progress': { variant: 'info', label: 'In Progress' },
    cancelled: { variant: 'danger', label: 'Cancelled' },
    paid: { variant: 'success', label: 'Paid' },
    unpaid: { variant: 'warning', label: 'Unpaid' },
    overdue: { variant: 'danger', label: 'Overdue' },
  };

  const statusConfig = statusMap[status?.toLowerCase()] || { variant: 'default', label: status };

  return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
};

export default Table;

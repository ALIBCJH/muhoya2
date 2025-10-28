import React from 'react';

/**
 * Skeleton Loader Component for loading states
 */
const Skeleton = ({ className = '', variant = 'text', count = 1 }) => {
  const baseStyles = 'animate-pulse bg-gray-200 rounded';
  
  const variants = {
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24',
    card: 'h-64 w-full',
    table: 'h-12 w-full',
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${baseStyles} ${variants[variant]} ${className}`}
        />
      ))}
    </>
  );
};

export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="table" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
      <Skeleton variant="title" />
      <Skeleton variant="text" count={3} className="mb-2" />
      <Skeleton variant="button" />
    </div>
  );
};

export default Skeleton;

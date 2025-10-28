import React from 'react';

/**
 * Modern Card Component with hover effects
 */
const Card = ({ 
  children, 
  className = '', 
  hoverable = false,
  gradient = false,
  ...props 
}) => {
  const baseStyles = 'bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300';
  const hoverStyles = hoverable ? 'hover:shadow-2xl hover:-translate-y-1' : '';
  const gradientStyles = gradient ? 'bg-gradient-to-br from-white to-gray-50' : '';
  
  return (
    <div 
      className={`${baseStyles} ${hoverStyles} ${gradientStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 bg-gray-50 ${className}`}>
    {children}
  </div>
);

const CardBody = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;

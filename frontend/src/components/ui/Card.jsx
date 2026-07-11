import React from 'react';

export default function Card({
  children,
  className = '',
  ...props
}) {
  return (
    <div
      className={`bg-white border border-gray-100 rounded-lg shadow-sm p-6 transition-all duration-200 hover:shadow-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

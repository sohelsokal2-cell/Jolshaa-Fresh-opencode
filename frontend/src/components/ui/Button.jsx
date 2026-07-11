import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  onClick,
  disabled = false,
  ...props
}) {
  const baseStyle = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm px-4 py-2.5 rounded-md';

  const variants = {
    primary: 'bg-primary hover:bg-teal-800 text-white shadow-sm border border-transparent',
    secondary: 'bg-transparent hover:bg-primary/5 text-primary border border-primary',
    accent: 'bg-accent hover:bg-orange-700 text-white shadow-sm border border-transparent',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-transparent',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

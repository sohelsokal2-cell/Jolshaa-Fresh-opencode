import React from 'react';

export default function Input({
  label,
  type = 'text',
  id,
  placeholder,
  value,
  onChange,
  className = '',
  error,
  required = false,
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-accent">*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-md text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 ${
          error ? 'border-accent' : 'border-gray-200'
        }`}
        {...props}
      />
      {error && (
        <span className="text-xs text-accent mt-0.5">{error}</span>
      )}
    </div>
  );
}

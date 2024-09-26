// components/Select.js

import React from 'react';

export const Select = ({ children, onValueChange }) => {
  return (
    <div className="relative">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { onValueChange })
      )}
    </div>
  );
};

export const SelectTrigger = ({ children, className }) => {
  return (
    <button className={`border border-gray-300 rounded px-3 py-2 w-full ${className}`}>
      {children}
    </button>
  );
};

export const SelectValue = ({ placeholder }) => {
  return <span>{placeholder}</span>;
};

export const SelectContent = ({ children }) => {
  return <div className="absolute bg-white border border-gray-300 rounded mt-1">{children}</div>;
};

export const SelectItem = ({ value, children, onValueChange }) => {
  return (
    <div
      className="px-3 py-2 cursor-pointer hover:bg-gray-100"
      onClick={() => onValueChange(value)}
    >
      {children}
    </div>
  );
};
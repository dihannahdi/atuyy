// components/UserDataInput.js

import React from 'react';

const UserDataInput = ({ field, label, value, onChange }) => {
  return (
    <div className="space-y-2 mb-4">
      <label htmlFor={field} className="block font-medium text-gray-700">
        {label}
      </label>
      <input
        type="text"
        id={field}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default UserDataInput;
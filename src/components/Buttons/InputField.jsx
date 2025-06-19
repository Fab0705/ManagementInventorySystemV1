import React from 'react'

export default function InputField({ label, type, placeholder, maxlength, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-green-300"
        maxlength={maxlength}
        required
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

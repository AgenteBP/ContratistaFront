// src/components/ui/Label.jsx
import React from 'react';

const Label = ({ children, required, className = "" }) => (
  <label className={`block font-medium text-secondary-dark ${className || 'mb-2 text-sm'}`}>
    {children} {required && <span className="text-danger ml-1">*</span>}
  </label>
);

export default Label;
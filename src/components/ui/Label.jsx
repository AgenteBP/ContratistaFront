// src/components/ui/Label.jsx
import React from 'react';

const Label = ({ children, required }) => (
  <label className="block mb-2 text-sm font-medium text-secondary-dark">
    {children} {required && <span className="text-danger ml-1">*</span>}
  </label>
);

export default Label;
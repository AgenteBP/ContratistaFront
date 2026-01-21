import React from 'react';
import Label from '../../components/ui/Label';

const Select = ({ label, options, ...props }) => (
  <div className="w-full">
    {label && <Label>{label}</Label>}
    <select
      {...props}
      className="bg-white border border-secondary/30 text-secondary-dark text-sm rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary block w-full p-2.5 outline-none"
    >
      {options.map((opt, i) => <option key={i}>{opt}</option>)}
    </select>
  </div>
);

export default Select;
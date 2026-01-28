import React from 'react';

const Toggle = ({ label, checked, onChange, disabled = false }) => (
  <label className={`inline-flex items-center group ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
    <input
      type="checkbox"
      className="sr-only peer"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
    />
    <div className="relative w-11 h-6 bg-secondary/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer 
    peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] 
    after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-secondary/20 after:border after:rounded-full after:h-5 after:w-5 
    after:transition-all peer-checked:bg-primary"></div>
    <span className="ms-3 text-sm font-medium text-secondary-dark group-hover:text-primary transition-colors">{label}</span>
  </label>
);

export default Toggle;
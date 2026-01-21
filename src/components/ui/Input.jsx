import React from 'react';
import Label from '../../components/ui/Label';

const Input = ({ label, icon, ...props }) => (
  <div className="w-full">
    {label && <Label>{label}</Label>}
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-secondary">
          <i className={`pi ${icon}`}></i>
        </div>
      )}
      <input
        {...props}
        className={`bg-white border border-secondary/30 text-secondary-dark text-sm rounded-lg 
        focus:ring-2 focus:ring-primary/20 focus:border-primary block w-full p-2.5 outline-none transition-all 
        ${icon ? 'ps-10' : ''} ${props.disabled ? 'bg-secondary-light cursor-not-allowed text-secondary' : ''}`}
      />
    </div>
  </div>
);

// const Label = ({ children, required }) => (
//   <label className="block mb-2 text-sm font-medium text-secondary-dark">
//     {children} {required && <span className="text-danger ml-1">*</span>}
//   </label>
// );

export default Input;
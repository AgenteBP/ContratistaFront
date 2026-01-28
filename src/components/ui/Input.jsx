import React from 'react';
import Label from '../../components/ui/Label';

const Input = ({ label, icon, size = 'md', ...props }) => {
  const sizeClasses = {
    sm: 'p-1.5 text-xs rounded-md',
    md: 'p-2.5 text-sm rounded-lg'
  };

  return (
    <div className="w-full">
      {label && <Label className={size === 'sm' ? 'mb-1 text-xs' : 'mb-2 text-sm'}>{label}</Label>}
      <div className="relative">
        {icon && (
          <div className={`absolute inset-y-0 start-0 flex items-center ${size === 'sm' ? 'ps-2.5' : 'ps-3.5'} pointer-events-none text-secondary`}>
            <i className={`pi ${icon} ${size === 'sm' ? 'text-xs' : ''}`}></i>
          </div>
        )}
        <input
          {...props}
          className={`bg-white border border-secondary/30 text-secondary-dark outline-none transition-all block w-full
          focus:ring-2 focus:ring-primary/20 focus:border-primary
          ${sizeClasses[size] || sizeClasses.md}
          ${icon ? (size === 'sm' ? 'ps-8' : 'ps-10') : ''} 
          ${props.disabled ? 'bg-gray-50 opacity-90 cursor-not-allowed text-secondary-dark/70 border-secondary/20' : ''}
          ${props.className || ''}`}
        />
      </div>
    </div>
  );
};

// const Label = ({ children, required }) => (
//   <label className="block mb-2 text-sm font-medium text-secondary-dark">
//     {children} {required && <span className="text-danger ml-1">*</span>}
//   </label>
// );

export default Input;
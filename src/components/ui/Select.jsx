import React from 'react';
import Label from '../../components/ui/Label';

const Select = ({ label, options, size = 'md', ...props }) => {
  const sizeClasses = {
    sm: 'p-1.5 text-xs rounded-md pr-7',
    md: 'p-2.5 text-sm rounded-lg pr-8'
  };

  const isPlaceholderSelected = props.value && typeof props.value === 'string' && props.value.toLowerCase().includes('seleccione');

  return (
    <div className="w-full">
      {label && <Label className={size === 'sm' ? 'mb-1 text-xs' : 'mb-2 text-sm'}>{label}</Label>}
      <div className="relative">
        <select
          {...props}
          className={`appearance-none bg-white border border-secondary/30 outline-none transition-all block w-full uppercase
          focus:ring-2 focus:ring-primary/20 focus:border-primary
          ${sizeClasses[size] || sizeClasses.md}
          ${props.disabled ? 'bg-secondary-light cursor-not-allowed text-secondary border-secondary/10' : ''}
          ${isPlaceholderSelected ? 'text-gray-400 font-medium' : 'text-secondary-dark'}
          ${props.className || ''}`}
        >
          {options.map((opt, i) => {
            const isPlaceholder = typeof opt === 'string' && opt.toLowerCase().includes('seleccione');
            return <option key={i} value={opt} disabled={isPlaceholder} hidden={isPlaceholder} className="uppercase text-secondary-dark">{opt}</option>;
          })}
        </select>
        <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-secondary`}>
          <svg className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} fill-current`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Select;
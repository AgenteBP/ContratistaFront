import React from 'react';

const SelectionToggle = ({ options, value, onChange, className = '' }) => {
    return (
        <div className={`flex p-1 bg-gray-100 rounded-lg mb-6 ${className}`}>
            {options.map((option) => {
                const isSelected = value === option.value;
                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={`
              flex-1 py-3 text-sm font-bold rounded-md transition-all duration-200 focus:outline-none
              ${isSelected
                                ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                                : 'text-secondary hover:text-secondary-dark hover:bg-gray-200/50'}
            `}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};

export default SelectionToggle;

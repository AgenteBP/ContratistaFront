import React from 'react';
import { Dropdown as PRDropdown } from 'primereact/dropdown';

const Dropdown = ({ value, pt, className, placeholder, error, ...props }) => {

    // Determine if we have a value selected (to style text color)
    const hasValue = value !== null && value !== undefined && value !== '';

    // Standardized styles using PrimeReact PassThrough (pt)
    const defaultPt = {
        root: {
            className: `w-full border ${error ? 'border-red-500' : 'border-secondary/30'} rounded-lg h-[42px] flex items-center hover:border-primary focus-within:border-primary transition-colors bg-white`
        },
        input: {
            className: `w-full text-sm px-3 uppercase font-sans ${hasValue ? 'text-secondary-dark' : 'text-gray-400'}`
        },
        item: {
            className: 'text-sm p-3 hover:bg-secondary-light text-secondary-dark uppercase font-sans'
        },
        panel: {
            className: 'bg-white border border-secondary/20 shadow-lg rounded-lg mt-1 font-sans'
        },
        wrapper: {
            className: 'max-h-[300px] overflow-auto' // Standardize max height
        },
        trigger: {
            className: 'w-10 text-secondary flex items-center justify-center'
        },
        // Filter input styles if filter is enabled
        filterInput: {
            className: 'p-2 text-sm border border-secondary/20 rounded-md w-full mb-2 uppercase text-secondary-dark'
        },
        filterContainer: {
            className: 'p-2 bg-gray-50 border-b border-secondary/10'
        }
    };

    // Merge custom pt if provided (shallow merge for root keys)
    const mergedPt = pt ? { ...defaultPt, ...pt } : defaultPt;

    return (
        <PRDropdown
            value={value}
            pt={mergedPt}
            className={className}
            placeholder={placeholder}
            emptyMessage="NO HAY OPCIONES DISPONIBLES"
            {...props}
        />
    );
};

export default Dropdown;

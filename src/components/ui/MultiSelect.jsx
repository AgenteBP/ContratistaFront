import React from 'react';
import { MultiSelect as PRMultiSelect } from 'primereact/multiselect';

const MultiSelect = ({ value, pt, className, placeholder, error, ...props }) => {

    const hasValue = Array.isArray(value) && value.length > 0;

    const defaultPt = {
        root: {
            className: `w-full border ${error ? 'border-red-500' : 'border-secondary/40'} rounded-lg min-h-[42px] flex items-center hover:border-primary focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all bg-white shadow-sm hover:shadow-md`
        },
        labelContainer: {
            className: 'flex-1 overflow-hidden'
        },
        label: {
            className: `text-sm px-3 uppercase font-sans ${hasValue ? 'text-secondary-dark' : 'text-gray-400'}`
        },
        token: {
            className: 'bg-primary/10 text-primary font-bold text-[10px] py-1 px-2 rounded-md mr-1 inline-flex items-center gap-1 border border-primary/20 max-w-max'
        },
        tokenLabel: {
            className: 'leading-none'
        },
        removeTokenIcon: {
            className: 'text-[10px] ml-1 hover:text-primary-hover transition-colors cursor-pointer'
        },
        item: {
            className: 'text-sm p-3 hover:bg-primary/5 text-secondary-dark uppercase font-sans transition-colors'
        },
        checkboxContainer: {
            className: 'mr-3'
        },
        checkbox: {
            className: 'w-5 h-5 rounded flex items-center justify-center transition-all'
        },
        checkboxIcon: {
            className: 'p-checkbox-icon'
        },
        panel: {
            className: 'bg-white border border-secondary/20 shadow-lg rounded-lg mt-1 font-sans animate-fade-in'
        },
        header: {
            className: 'p-3 border-b border-secondary/10 bg-secondary-light/20'
        },
        filterInput: {
            className: 'p-2 text-sm border border-secondary/20 rounded-md w-full uppercase text-secondary-dark font-sans'
        },
        trigger: {
            className: 'w-10 text-secondary flex items-center justify-center border-l border-secondary/10'
        }
    };

    const mergedPt = pt ? { ...defaultPt, ...pt } : defaultPt;

    return (
        <PRMultiSelect
            value={value}
            pt={mergedPt}
            className={className}
            placeholder={placeholder}
            emptyMessage="NO HAY OPCIONES DISPONIBLES"
            {...props}
        />
    );
};

export default MultiSelect;

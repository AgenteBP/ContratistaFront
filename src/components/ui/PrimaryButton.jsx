import React from 'react';

/**
 * PrimaryButton Component
 * 
 * Standard primary action button for the application.
 * 
 * @param {string} label - The text to display on the button.
 * @param {string} mobileLabel - Short text to display on mobile devices (optional).
 * @param {string} icon - Icon class for the button (default: "pi pi-plus").
 * @param {function} onClick - Click handler for the button.
 * @param {string} className - Additional classes to apply to the button.
 */
const PrimaryButton = ({ label, mobileLabel = "Nuevo", icon = "pi pi-plus", onClick, className = "" }) => {
    return (
        <button
            onClick={onClick}
            className={`text-white bg-primary hover:bg-primary-hover font-bold rounded-lg text-xs px-4 py-2 shadow-md shadow-primary/30 transition-all flex items-center justify-center gap-2 w-full md:w-auto ${className}`}
        >
            <i className={icon}></i>
            <span className={mobileLabel ? "hidden md:inline" : ""}>{label}</span>
            {mobileLabel && <span className="md:hidden">{mobileLabel}</span>}
        </button>
    );
};

export default PrimaryButton;

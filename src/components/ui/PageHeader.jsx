import React from 'react';

/**
 * PageHeader Component
 * 
 * Standard header for list pages or main views.
 * 
 * @param {string} title - The main title of the page.
 * @param {string} icon - Optional icon (string for PrimeIcons or ReactNode).
 * @param {ReactNode} actionButton - Optional button (or any node) to render on the right.
 */
const PageHeader = ({ title, subtitle, icon, actionButton }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-4">
            <div className="flex items-center gap-3">
                {icon && (
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm transition-transform hover:scale-105">
                        {typeof icon === 'string' ? <i className={`${icon} text-2xl md:text-3xl`}></i> : icon}
                    </div>
                )}
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-secondary-dark tracking-tight leading-none">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-secondary mt-1 text-xs">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {actionButton && (
                <div className="flex gap-2 w-full md:w-auto">
                    {actionButton}
                </div>
            )}
        </div>
    );
};

export default PageHeader;

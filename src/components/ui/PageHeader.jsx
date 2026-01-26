import React from 'react';

/**
 * PageHeader Component
 * 
 * Standard header for list pages or main views.
 * 
 * @param {string} title - The main title of the page.
 * @param {string} subtitle - A short description below the title.
 * @param {ReactNode} actionButton - Optional button (or any node) to render on the right.
 */
const PageHeader = ({ title, subtitle, actionButton }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-secondary-dark tracking-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-secondary mt-1 text-xs">
                        {subtitle}
                    </p>
                )}
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

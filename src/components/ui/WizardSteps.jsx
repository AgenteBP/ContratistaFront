import React from 'react';

/**
 * WizardSteps Component
 * 
 * Displays a step progress indicator.
 * 
 * @param {number} currentStep - The current active step (1-based).
 * @param {Array<number|string>} steps - Array of steps (e.g., [1, 2, 3]).
 * @param {string} id - Optional ID to determine if we are in "edit" or specific mode (affects styling).
 */
const WizardSteps = ({ currentStep, steps = [1, 2, 3], id = null }) => {
    return (
        <div className="flex justify-center mb-10">
            {steps.map((step) => (
                <div key={step} className={`flex items-center ${step < steps.length ? 'after:content-[""] after:w-12 after:h-0.5 after:bg-gray-200 after:mx-2' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500
                            ${currentStep >= step ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 'bg-gray-100 text-gray-400'}
                            ${id && step === 1 ? 'opacity-50 cursor-not-allowed' : ''} 
                        `}>
                        {currentStep > step || (id && step === 1) ? <i className="pi pi-check"></i> : step}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default WizardSteps;

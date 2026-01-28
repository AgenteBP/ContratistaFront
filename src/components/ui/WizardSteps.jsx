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
        <div className="flex justify-center mb-10 w-full">
            <div className="flex items-start w-full max-w-3xl justify-between relative">
                {/* Línea de fondo conectora (absoluta para que quede detrás) */}
                <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-10" style={{ width: '90%', left: '5%' }}></div>

                {steps.map((stepItem, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = currentStep > stepNumber || (id && stepNumber === 1);
                    const isActive = currentStep === stepNumber;

                    // Normalizar input: si es objeto usa sus props, si no, usa defaults
                    const label = typeof stepItem === 'object' ? stepItem.label : `Paso ${stepNumber}`;
                    const context = typeof stepItem === 'object' ? stepItem.context : null;

                    return (
                        <div key={stepNumber} className="flex flex-col items-center relative z-10 bg-white dark:bg-transparent px-2">
                            {/* Círculo */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 mb-2 border-2
                                    ${isActive || isCompleted
                                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-110'
                                    : 'bg-white border-gray-300 text-gray-400'}
                                `}>
                                {isCompleted ? <i className="pi pi-check text-xs"></i> : stepNumber}
                            </div>

                            {/* Textos */}
                            <div className="flex flex-col items-center text-center">
                                <span className={`text-xs font-bold uppercase tracking-wide transition-colors duration-300 ${isActive ? 'text-primary' : 'text-secondary'}`}>
                                    {label}
                                </span>
                                {context && (
                                    <span className="text-[10px] items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold mt-1 shadow-sm animate-fade-in inline-flex">
                                        <i className="pi pi-check-circle text-[9px]"></i> {context}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WizardSteps;

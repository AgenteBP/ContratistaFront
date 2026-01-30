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
        <div className="flex justify-center mb-6 md:mb-10 w-full flex-col items-center">

            {/* --- VISTA MÓVIL (Barra de Progreso Simple) --- */}
            <div className="md:hidden w-full px-1 mb-2">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">
                        PASO {currentStep} / {steps.length}
                    </span>
                    <span className="text-xs font-bold text-primary truncate max-w-[60%] text-right">
                        {typeof steps[currentStep - 1] === 'object' ? steps[currentStep - 1].label : steps[currentStep - 1]}
                    </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="bg-primary h-full rounded-full transition-all duration-500 ease-out shadow-sm"
                        style={{ width: `${(currentStep / steps.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* --- VISTA DESKTOP (Stepper Completo) --- */}
            <div className="hidden md:flex items-start w-full max-w-3xl justify-between relative">
                {steps.map((stepItem, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = currentStep > stepNumber || (id && stepNumber === 1);
                    const isActive = currentStep === stepNumber;

                    // Normalizar input
                    const label = typeof stepItem === 'object' ? stepItem.label : `Paso ${stepNumber}`;
                    const context = typeof stepItem === 'object' ? stepItem.context : null;

                    return (
                        <div key={stepNumber} className="flex flex-1 flex-col items-center relative z-10 px-2 group">

                            {/* Línea conectora segmentada (Gap Style) */}
                            {index < steps.length - 1 && (
                                <div className="absolute top-5 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-0.5 bg-gray-300 -z-10"></div>
                            )}

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
                                <span className={`text-xs font-bold uppercase tracking-wide transition-colors duration-300 ${isActive ? 'text-primary' : 'text-secondary'} whitespace-normal break-words`}>
                                    {label}
                                </span>
                                {context && (
                                    <span className="text-[10px] items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold mt-1 shadow-sm animate-fade-in inline-flex whitespace-nowrap">
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

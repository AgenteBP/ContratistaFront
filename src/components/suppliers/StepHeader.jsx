import React from 'react';
import SectionTitle from '../ui/SectionTitle';

/**
 * StepHeader
 * 
 * Reusable header for form steps that includes a title, subtitle, 
 * and optional action buttons (like Modify/Save for partial edits).
 */
const StepHeader = ({ 
    title, 
    subtitle, 
    extra, 
    partialEdit, 
    isEditingStep, 
    handleStartEdit, 
    handleCancelEdit,
    handleStopEdit 
}) => (
    <div className="flex justify-between items-center mb-6">
        <SectionTitle title={title} subtitle={subtitle} />
        <div className="flex items-center gap-4">
            {extra}
            {partialEdit && (
                <div>
                    {!isEditingStep ? (
                        <button
                            onClick={handleStartEdit}
                            className="text-secondary hover:text-primary transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-secondary-light"
                        >
                            <i className="pi pi-pencil"></i> <span className="text-sm font-bold">Modificar</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="border border-primary text-primary hover:bg-primary/5 px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
                            >
                                <i className="pi pi-times"></i> Cancelar
                            </button>
                            <button
                                onClick={handleStopEdit}
                                className="bg-primary hover:bg-primary-hover text-white flex items-center gap-2 px-4 py-1.5 rounded-lg shadow-sm transition-all"
                            >
                                <i className="pi pi-check"></i> <span className="text-sm font-bold">Guardar</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
);

export default StepHeader;

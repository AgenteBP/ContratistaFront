import React from 'react';
import { Button } from 'primereact/button';

const UnsavedChangesModal = ({ visible, onConfirm, onCancel }) => {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 ring-1 ring-black/5">

                {/* Header with Warning Icon */}
                <div className="bg-amber-50 px-6 py-6 border-b border-amber-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                        <i className="pi pi-exclamation-triangle text-amber-500 text-xl"></i>
                    </div>
                    <h3 className="font-bold text-lg text-secondary-dark">¿Salir sin guardar?</h3>
                    <p className="text-secondary text-sm mt-1">
                        Tienes cambios pendientes de guardar. Si sales ahora, los perderás.
                    </p>
                </div>

                {/* Actions */}
                <div className="p-6 bg-white flex flex-col gap-3">
                    <button
                        onClick={onCancel}
                        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                        <i className="pi pi-save"></i>
                        Vovler para Guardar
                    </button>

                    <button
                        onClick={onConfirm}
                        className="w-full bg-white hover:bg-gray-50 text-secondary hover:text-red-500 font-medium py-3 px-4 rounded-xl border border-secondary/20 transition-all flex items-center justify-center gap-2"
                    >
                        <i className="pi pi-times"></i>
                        Salir y perder cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnsavedChangesModal;

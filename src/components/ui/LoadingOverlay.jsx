import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';

/**
 * Premium Loading Overlay Component
 * Designed to show a clear, non-intrusive loading state or success confirmation.
 */
const LoadingOverlay = ({ isVisible, status = 'loading', message }) => {
    if (!isVisible) return null;

    const displayMessage = message || (status === 'success' ? '¡Cambios guardados!' : 'Guardando cambios...');

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-secondary/20 backdrop-blur-[2px] animate-fade-in pl-0 lg:pl-[280px]">
            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-secondary/10 flex flex-col items-center gap-4 max-w-xs w-full mx-4 transform animate-scale-in">
                {status === 'loading' ? (
                    <ProgressSpinner
                        style={{ width: '50px', height: '50px' }}
                        strokeWidth="4"
                        fill="transparent"
                        animationDuration=".8s"
                    />
                ) : status === 'error' ? (
                    <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center animate-scale-in">
                        <i className="pi pi-times text-4xl text-danger"></i>
                    </div>
                ) : (
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center animate-scale-in">
                        <i className="pi pi-check text-4xl text-success"></i>
                    </div>
                )}
                <div className="text-center">
                    <h3 className={`text-lg font-bold mb-1 ${status === 'error' ? 'text-danger' : 'text-secondary'}`}>{displayMessage}</h3>
                    <p className="text-sm text-gray-400 font-medium">
                        {status === 'loading' ? 'Espere un momento, estamos aplicando sus cambios...' : 
                         status === 'error' ? 'Ocurrió un problema al procesar la solicitud.' : 
                         'La operación se completó con éxito.'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlay;

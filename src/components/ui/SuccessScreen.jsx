import React from 'react';

/**
 * SuccessScreen Component
 * A premium confirmation view shown after successful operations.
 */
const SuccessScreen = ({ title = '¡Listo!', message = 'La operación se realizó con éxito.', onClose }) => {
    return (
        <div className="bg-white p-8 md:p-12 rounded-2xl border border-success/20 shadow-lg animate-fade-in flex flex-col items-center text-center max-w-2xl mx-auto my-12">
            <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mb-8 animate-scale-in">
                <i className="pi pi-check text-5xl text-success drop-shadow-sm"></i>
            </div>

            <h2 className="text-3xl font-bold text-secondary mb-4">{title}</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md">
                {message}
            </p>

            <button
                onClick={onClose}
                className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
                Entendido
            </button>
        </div>
    );
};

export default SuccessScreen;

import React from 'react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmación',
    message = '¿Está seguro de realizar esta acción?',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'warning' // warning, danger, info
}) => {
    if (!isOpen) return null;

    const styles = {
        warning: {
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-500',
            icon: 'pi-exclamation-triangle',
            confirmBtn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
        },
        danger: {
            bg: 'bg-red-50',
            border: 'border-red-100',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-500',
            icon: 'pi-exclamation-circle',
            confirmBtn: 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-500',
            icon: 'pi-info-circle',
            confirmBtn: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'
        }
    };

    const currentStyle = styles[type] || styles.warning;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 ring-1 ring-black/5"
                onClick={e => e.stopPropagation()}
            >
                {/* Header with Icon */}
                <div className={`${currentStyle.bg} px-6 py-6 border-b ${currentStyle.border} flex flex-col items-center text-center`}>
                    <div className={`w-12 h-12 rounded-full ${currentStyle.iconBg} flex items-center justify-center mb-3`}>
                        <i className={`pi ${currentStyle.icon} ${currentStyle.iconColor} text-xl`}></i>
                    </div>
                    <h3 className="font-bold text-lg text-secondary-dark">{title}</h3>
                    <p className="text-secondary text-sm mt-1 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="p-4 bg-white flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-white hover:bg-gray-50 text-secondary hover:text-secondary-dark font-medium py-2.5 px-4 rounded-lg border border-secondary/20 transition-all text-sm"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className={`flex-1 ${currentStyle.confirmBtn} text-white font-bold py-2.5 px-4 rounded-lg shadow-lg transition-all text-sm`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;

import React, { createContext, useContext, useRef } from 'react';
import { Toast } from 'primereact/toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const toast = useRef(null);

    // severity: 'success', 'info', 'warn', 'error'
    const showNotification = ({ severity = 'info', summary = '', detail = '', life = 3000 }) => {
        toast.current?.show({
            severity,
            summary,
            detail,
            life
        });
    };

    const showSuccess = (summary, detail) => showNotification({ severity: 'success', summary, detail });
    const showError = (summary, detail) => showNotification({ severity: 'error', summary, detail });
    const showInfo = (summary, detail) => showNotification({ severity: 'info', summary, detail });
    const showWarn = (summary, detail) => showNotification({ severity: 'warn', summary, detail });

    return (
        <NotificationContext.Provider value={{ showSuccess, showError, showInfo, showWarn }}>
            <Toast ref={toast} position="top-right" className="custom-toast" />
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

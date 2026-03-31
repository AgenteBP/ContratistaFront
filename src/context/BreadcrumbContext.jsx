import { createContext, useContext, useState } from 'react';

const BreadcrumbContext = createContext();

export const BreadcrumbProvider = ({ children }) => {
    const [labels, setLabels] = useState({});

    const setLabel = (path, label) => {
        setLabels(prev => ({ ...prev, [path]: label }));
    };

    const clearLabel = (path) => {
        setLabels(prev => {
            const next = { ...prev };
            delete next[path];
            return next;
        });
    };

    return (
        <BreadcrumbContext.Provider value={{ labels, setLabel, clearLabel }}>
            {children}
        </BreadcrumbContext.Provider>
    );
};

export const useBreadcrumb = () => useContext(BreadcrumbContext);

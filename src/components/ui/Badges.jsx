import React from 'react';

export const StatusBadge = ({ status }) => {
    const getStatusStyles = (status) => {
        const normalizedStatus = status?.toUpperCase() || '';

        switch (normalizedStatus) {
            case 'ACTIVO':
            case 'HABILITADO':
            case 'APROBADO':
            case 'PAGADO':
            case 'COMPLETA':
            case 'VIGENTE':
                // Success: Lime (Brand) or Emerald
                return 'bg-success-light text-success-hover border-success/30';

            case 'INACTIVO':
            case 'DESHABILITADO':
            case 'ANULADO':
                // Secondary: Slate
                return 'bg-secondary-light text-secondary border-secondary/30';

            case 'DADO DE BAJA':
                // Secondary: Slate (Explicit)
                return 'bg-secondary-light text-secondary border-secondary/30';

            case 'SUSPENDIDO':
            case 'BLOQUEADO':
            case 'RECHAZADO':
            case 'VENCIDO':
            case 'OBSERVADO':
            case 'CON OBSERVACIÓN':
                // Danger: Red
                return 'bg-danger-light text-danger-hover border-danger/30';

            case 'PENDIENTE':
            case 'EN PROCESO':
            case 'SIN COMPLETAR':
            case 'INCOMPLETA':
            case 'POR VENCER':
                // Warning: Amber
                return 'bg-warning-light text-warning-hover border-warning/30';

            case 'EN REVISIÓN':
            case 'EN REVISION':
            default:
                // Info: Sky
                return 'bg-info-light text-info-hover border-info/30';
        }
    };

    if (!status) return null;

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-bold border ${getStatusStyles(status)} inline-flex items-center justify-center uppercase tracking-wide whitespace-nowrap`}>
            {status}
        </span>
    );
};

export const RiskBadge = ({ nivel }) => {
    const getRiskStyles = (level) => {
        const normalizedLevel = level?.toUpperCase() || '';

        switch (normalizedLevel) {
            case 'BAJO':
                // Success
                return 'bg-success-light text-success-hover border-success/30';
            case 'MEDIO':
                // Warning
                return 'bg-warning-light text-warning-hover border-warning/30';
            case 'ALTO':
                // Danger
                return 'bg-danger-light text-danger-hover border-danger/30';
            case 'CRÍTICO':
                // Danger Darker
                return 'bg-danger/20 text-danger border-danger font-extrabold';
            default:
                return 'bg-secondary-light text-secondary border-secondary/30';
        }
    };

    if (!nivel) return null;

    return (
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getRiskStyles(nivel)} inline-block`}>
            {nivel}
        </span>
    );
};

export const BooleanBadge = ({ value, trueLabel = 'SÍ', falseLabel = 'NO' }) => {
    const styles = value
        ? 'bg-success-light text-success-hover border-success/30'
        : 'bg-danger-light text-danger-hover border-danger/30';

    const icon = value ? 'pi-check' : 'pi-times';

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles} inline-flex items-center gap-1`}>
            <i className={`pi ${icon} text-[8px]`}></i>
            {value ? trueLabel : falseLabel}
        </span>
    );
};

export default StatusBadge;

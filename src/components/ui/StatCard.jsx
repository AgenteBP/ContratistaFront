import React from 'react';

const STYLES = {
    primary: { iconBg: 'bg-primary-light', iconText: 'text-primary', borderTop: 'border-t-primary', ring: 'ring-primary' },
    success:  { iconBg: 'bg-success-light', iconText: 'text-success', borderTop: 'border-t-success', ring: 'ring-success' },
    warning:  { iconBg: 'bg-warning-light', iconText: 'text-warning', borderTop: 'border-t-warning', ring: 'ring-warning' },
    info:     { iconBg: 'bg-info-light',    iconText: 'text-info',    borderTop: 'border-t-info',    ring: 'ring-info'    },
    danger:   { iconBg: 'bg-danger-light',  iconText: 'text-danger',  borderTop: 'border-t-danger',  ring: 'ring-danger'  },
};

const renderIcon = (icon, className = '') => {
    if (typeof icon === 'string')
        return <i className={`pi ${icon} ${className}`} />;
    if (React.isValidElement(icon))
        return React.cloneElement(icon, { className: `${icon.props.className || ''} ${className}`.trim() });
    return icon;
};

/**
 * Shell compartido para stat cards.
 *
 * Props:
 *   title        — label pequeño encima del número
 *   value        — número principal (grande)
 *   valueSuffix  — sufijo junto al número (p.ej. "/ 45")
 *   subtitle     — texto pequeño debajo del número
 *   icon         — string 'pi-users' o componente React
 *   type         — 'primary' | 'success' | 'warning' | 'info' | 'danger'
 *   onClick      — handler de click (agrega cursor-pointer)
 *   isActive     — resalta la card con ring de color
 *   loading      — muestra skeleton animate-pulse
 *   watermark    — muestra el ícono grande semitransparente de fondo
 *   children     — contenido debajo del header
 */
const StatCard = ({
    title,
    value,
    valueSuffix,
    subtitle,
    icon,
    type = 'primary',
    onClick,
    isActive,
    loading = false,
    watermark = false,
    children,
}) => {
    const style = STYLES[type] || STYLES.primary;
    const base = `bg-white rounded-xl p-5 shadow-md border border-secondary/15 border-t-[3px] ${style.borderTop}`;

    if (loading) return (
        <div className={`${base} animate-pulse flex flex-col h-full`}>
            <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                    <div className="h-3 w-20 bg-secondary/10 rounded" />
                    <div className="h-8 w-14 bg-secondary/10 rounded-md" />
                    <div className="h-3 w-24 bg-secondary/10 rounded" />
                </div>
                <div className={`p-2.5 rounded-xl ${style.iconBg} opacity-50 w-10 h-10`} />
            </div>
            <div className="space-y-2 mt-2">
                <div className="h-2 w-full bg-secondary/10 rounded-full" />
                <div className="h-2 w-full bg-secondary/10 rounded-full" />
            </div>
        </div>
    );

    return (
        <div
            onClick={onClick}
            className={`${base} hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col h-full
                ${onClick ? 'cursor-pointer' : ''}
                ${isActive ? `ring-2 ring-offset-1 ${style.ring}` : ''}`}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-secondary text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-secondary-dark">{value ?? '—'}</h3>
                        {valueSuffix && (
                            <span className="text-secondary/60 text-xs font-semibold">{valueSuffix}</span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-secondary/60 text-[10px] uppercase tracking-wider mt-0.5">{subtitle}</p>
                    )}
                </div>
                <div className={`p-2.5 rounded-xl ${style.iconBg} ${style.iconText} flex items-center justify-center`}>
                    {renderIcon(icon, 'text-lg')}
                </div>
            </div>

            {/* Ícono de marca de agua (opcional) */}
            {watermark && (
                <div className={`absolute -bottom-4 -right-4 opacity-[0.08] pointer-events-none select-none ${style.iconText}`}>
                    {renderIcon(icon, 'text-[9rem]')}
                </div>
            )}

            {/* Contenido específico de cada página */}
            {children}
        </div>
    );
};

export default StatCard;

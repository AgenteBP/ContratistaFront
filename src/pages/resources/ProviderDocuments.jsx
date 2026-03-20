import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TbBackhoe } from 'react-icons/tb';

import PageHeader from '../../components/ui/PageHeader';
import DocumentEntityTable from '../../components/resources/DocumentEntityTable';

// --- MOCK DATA FOR METRICS ---
// Defined as source of truth to ensure Total = Sum(States)
const METRICS_SOURCE = {
    suppliers: { valid: 15, pending: 3, expiring: 2, observed: 1, review: 4 },
    employees: { valid: 42, pending: 8, expiring: 5, observed: 3, review: 7 },
    vehicles: { valid: 18, pending: 4, expiring: 3, observed: 2, review: 5 },
    machinery: { valid: 7, pending: 1, expiring: 1, observed: 0, review: 2 }
};

// Helper to calculate totals dynamically
const calculateTotal = (category) => Object.values(category).reduce((a, b) => a + b, 0);

const MOCK_METRICS = {
    general: {
        suppliers: calculateTotal(METRICS_SOURCE.suppliers),
        employees: calculateTotal(METRICS_SOURCE.employees),
        vehicles: calculateTotal(METRICS_SOURCE.vehicles),
        machinery: calculateTotal(METRICS_SOURCE.machinery)
    },
    pending: {
        suppliers: METRICS_SOURCE.suppliers.pending,
        employees: METRICS_SOURCE.employees.pending,
        vehicles: METRICS_SOURCE.vehicles.pending,
        machinery: METRICS_SOURCE.machinery.pending
    },
    expiring: {
        suppliers: METRICS_SOURCE.suppliers.expiring,
        employees: METRICS_SOURCE.employees.expiring,
        vehicles: METRICS_SOURCE.vehicles.expiring,
        machinery: METRICS_SOURCE.machinery.expiring
    },
    observed: {
        suppliers: METRICS_SOURCE.suppliers.observed,
        employees: METRICS_SOURCE.employees.observed,
        vehicles: METRICS_SOURCE.vehicles.observed,
        machinery: METRICS_SOURCE.machinery.observed
    },
    review: {
        suppliers: METRICS_SOURCE.suppliers.review,
        employees: METRICS_SOURCE.employees.review,
        vehicles: METRICS_SOURCE.vehicles.review,
        machinery: METRICS_SOURCE.machinery.review
    },
    valid: {
        suppliers: METRICS_SOURCE.suppliers.valid,
        employees: METRICS_SOURCE.employees.valid,
        vehicles: METRICS_SOURCE.vehicles.valid,
        machinery: METRICS_SOURCE.machinery.valid
    }
};

// --- STAT CARD COMPONENT (Enhanced & Context Aware) ---
const StatCard = ({ title, icon, type = 'primary', metrics, activeFilter }) => {
    const styles = {
        primary: { iconBg: 'bg-primary-light', iconText: 'text-primary' },
        success: { iconBg: 'bg-success-light', iconText: 'text-success' },
        warning: { iconBg: 'bg-warning-light', iconText: 'text-warning' },
        info: { iconBg: 'bg-blue-100', iconText: 'text-blue-600' }
    };
    const style = styles[type] || styles.primary;

    const renderIcon = (iconClassOrComponent, className = "") => {
        if (typeof iconClassOrComponent === 'string') return <i className={`pi ${iconClassOrComponent} ${className}`}></i>;
        if (React.isValidElement(iconClassOrComponent)) return React.cloneElement(iconClassOrComponent, { className: `${iconClassOrComponent.props.className || ''} ${className}`.trim() });
        return iconClassOrComponent;
    };

    // Determine what number to show based on active filter
    const total = metrics.total || 0;
    const compliant = metrics.valid || 0;
    const percentage = total > 0 ? Math.round((compliant / total) * 100) : 0;

    let displayValue = total;
    let label = "Total";

    // Logic: If filter is specific, show that specific count. Else show total.
    if (activeFilter === 'pending_upload') {
        displayValue = metrics.pending;
        label = "Pendientes";
    } else if (activeFilter === 'expiring') {
        displayValue = metrics.expiring;
        label = "Por Vencer";
    } else if (activeFilter === 'observed') {
        displayValue = metrics.observed;
        label = "Observados";
    } else if (activeFilter === 'in_review') {
        displayValue = metrics.review;
        label = "En Revisión";
    } else if (activeFilter === 'valid') {
        displayValue = metrics.valid;
        label = "Vigentes";
    }

    return (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-secondary/10 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full">
            {/* Header */}
            <div className="flex justify-between items-start z-10 relative mb-4">
                <div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-secondary-dark mb-1">{displayValue}</h3>
                        {activeFilter !== 'general' && (
                            <span className="text-secondary/60 text-xs font-semibold">/ {total}</span>
                        )}
                    </div>
                    <p className="text-secondary text-xs font-bold uppercase tracking-wider">{title}</p>
                    {activeFilter !== 'general' && (
                        <p className={`text-[10px] font-bold mt-1 ${style.iconText}`}>{label}</p>
                    )}
                </div>
                <div className={`p-2.5 rounded-xl ${style.iconBg} ${style.iconText} flex items-center justify-center`}>
                    {renderIcon(icon, "text-lg")}
                </div>
            </div>

            {/* Compliance Bar */}
            <div className="mb-4">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-bold text-secondary/60 uppercase">Cumplimiento</span>
                    <span className={`text-xs font-bold ${percentage === 100 ? 'text-success' : percentage < 50 ? 'text-danger' : 'text-warning'}`}>
                        {percentage}%
                    </span>
                </div>
                <div className="h-1.5 w-full bg-secondary-light/30 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${percentage === 100 ? 'bg-success' : percentage < 50 ? 'bg-danger' : 'bg-warning'}`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Mini Dashboard Badges */}
            <div className="flex items-center gap-2 mt-auto">
                <div className={`px-2 py-1 bg-red-50 text-red-600 rounded-md text-[10px] font-bold flex items-center gap-1 ${activeFilter === 'expiring' ? 'ring-1 ring-red-200 bg-red-100' : ''}`} title={`${metrics.expiring} ${title} con documentos vencidos o por vencer`}>
                    <i className="pi pi-exclamation-circle text-[10px]"></i> {metrics.expiring}
                </div>
                <div className={`px-2 py-1 bg-orange-50 text-orange-600 rounded-md text-[10px] font-bold flex items-center gap-1 ${activeFilter === 'pending_upload' ? 'ring-1 ring-orange-200 bg-orange-100' : ''}`} title={`${metrics.pending} ${title} con documentación pendiente`}>
                    <i className="pi pi-clock text-[10px]"></i> {metrics.pending}
                </div>
                <div className="px-2 py-1 bg-green-50 text-green-600 rounded-md text-[10px] font-bold flex items-center gap-1 ml-auto" title={`${metrics.valid} ${title} con toda la documentación al día`}>
                    <i className="pi pi-check-circle text-[10px]"></i> {metrics.valid}
                </div>
            </div>
        </div>
    );
};

const ProviderDocuments = () => {
    const { status } = useParams();

    const [activeIndex, setActiveIndex] = useState(0);
    // Tracks which tabs have been visited — once mounted, never unmount (preserves loaded data)
    const [mountedTabs, setMountedTabs] = useState(new Set([0]));
    // Refresh counter per tab — incrementing triggers a silent background re-fetch
    const [refreshKeys, setRefreshKeys] = useState({ 0: 0, 1: 0, 2: 0, 3: 0 });

    // Filter Logic
    const getFilterFromParam = (param) => {
        switch (param) {
            case 'general': return 'general';
            case 'pendientes': return 'pending_upload';
            case 'por-vencer': return 'expiring';
            case 'observados': return 'observed';
            case 'en-revision': return 'in_review';
            case 'vigentes': return 'valid';
            default: return 'general';
        }
    };
    const currentFilter = getFilterFromParam(status || 'general');

    // Handler to sync external cards/tabs when internal table categories are clicked
    const handleTabChange = (index) => {
        if (mountedTabs.has(index)) {
            // Tab already loaded — trigger silent background re-fetch
            setRefreshKeys(prev => ({ ...prev, [index]: prev[index] + 1 }));
        }
        setActiveIndex(index);
        setMountedTabs(prev => new Set([...prev, index]));
    };

    // Pivot Data for Cards (Aggregate by Type)
    const cardMetrics = {
        suppliers: {
            total: MOCK_METRICS.general.suppliers,
            pending: MOCK_METRICS.pending.suppliers,
            expiring: MOCK_METRICS.expiring.suppliers,
            valid: MOCK_METRICS.valid.suppliers,
            observed: MOCK_METRICS.observed.suppliers,
            review: MOCK_METRICS.review.suppliers
        },
        employees: {
            total: MOCK_METRICS.general.employees,
            pending: MOCK_METRICS.pending.employees,
            expiring: MOCK_METRICS.expiring.employees,
            valid: MOCK_METRICS.valid.employees,
            observed: MOCK_METRICS.observed.employees,
            review: MOCK_METRICS.review.employees
        },
        vehicles: {
            total: MOCK_METRICS.general.vehicles,
            pending: MOCK_METRICS.pending.vehicles,
            expiring: MOCK_METRICS.expiring.vehicles,
            valid: MOCK_METRICS.valid.vehicles,
            observed: MOCK_METRICS.observed.vehicles,
            review: MOCK_METRICS.review.vehicles
        },
        machinery: {
            total: MOCK_METRICS.general.machinery,
            pending: MOCK_METRICS.pending.machinery,
            expiring: MOCK_METRICS.expiring.machinery,
            valid: MOCK_METRICS.valid.machinery,
            observed: MOCK_METRICS.observed.machinery,
            review: MOCK_METRICS.review.machinery
        }
    };

    const getPageTitle = () => {
        switch (status) {
            case 'general': return { title: 'Documentación General', subtitle: 'Vista completa de todos los documentos.' };
            case 'pendientes': return { title: 'Pendientes de Carga', subtitle: 'Documentos obligatorios faltantes.' };
            case 'por-vencer': return { title: 'Documentos Por Vencer', subtitle: 'Alertas de vencimiento próximo (10 días).' };
            case 'observados': return { title: 'Documentos Observados', subtitle: 'Rechazados por auditoría que requieren corrección.' };
            case 'en-revision': return { title: 'En Revisión', subtitle: 'Documentos bajo análisis del equipo auditor.' };
            case 'vigentes': return { title: 'Documentación Vigente', subtitle: 'Documentos válidos y aprobados.' };
            default: return { title: 'Documentación', subtitle: 'Gestión de documentos.' };
        }
    };
    const headerInfo = getPageTitle();

    return (
        <div className="p-4 md:p-8 space-y-8 animate-fade-in bg-slate-50 min-h-screen">
            <PageHeader
                title={headerInfo.title}
                subtitle={headerInfo.subtitle}
                icon="pi pi-folder-open"
            />

            {/* Stat Cards — display only, no navigation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Proveedores" icon="pi-briefcase" type="primary" metrics={cardMetrics.suppliers} activeFilter={currentFilter} />
                <StatCard title="Empleados"   icon="pi-users"     type="info"    metrics={cardMetrics.employees} activeFilter={currentFilter} />
                <StatCard title="Vehículos"   icon="pi-car"       type="warning" metrics={cardMetrics.vehicles}  activeFilter={currentFilter} />
                <StatCard title="Maquinaria"  icon={<TbBackhoe />} type="success" metrics={cardMetrics.machinery} activeFilter={currentFilter} />
            </div>

            {/* Tab navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-secondary/10 overflow-hidden">
                <div className="flex border-b border-secondary/10">
                    {[
                        { index: 0, label: 'Proveedores', icon: 'pi-briefcase' },
                        { index: 1, label: 'Empleados',   icon: 'pi-users' },
                        { index: 2, label: 'Vehículos',   icon: 'pi-car' },
                        { index: 3, label: 'Maquinaria',  icon: null },
                    ].map(({ index, label, icon }) => (
                        <button
                            key={index}
                            onClick={() => handleTabChange(index)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 -mb-px
                                ${activeIndex === index
                                    ? 'border-primary text-primary bg-primary/5'
                                    : 'border-transparent text-secondary/50 hover:text-secondary hover:bg-slate-50'
                                }`}
                        >
                            {icon ? <i className={`pi ${icon} text-xs`}></i> : <TbBackhoe className="text-sm" />}
                            {label}
                        </button>
                    ))}
                </div>

                {/* Tab Panels — stay mounted once visited, never unmount = no re-fetch on tab switch */}
                <div>
                    {[
                        { index: 0, type: 'suppliers', label: 'Proveedores' },
                        { index: 1, type: 'employees', label: 'Empleados' },
                        { index: 2, type: 'vehicles',  label: 'Vehículos' },
                        { index: 3, type: 'machinery', label: 'Maquinaria' },
                    ].map(({ index, type, label }) => (
                        <div key={type} className={activeIndex === index ? 'block' : 'hidden'}>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-secondary-dark mb-4 border-b border-secondary/10 pb-2">
                                    Listado de {label} - {headerInfo.title}
                                </h3>
                                {mountedTabs.has(index) && (
                                    <DocumentEntityTable type={type} filterStatus={currentFilter} hideCategoryNav refreshKey={refreshKeys[index]} />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProviderDocuments;

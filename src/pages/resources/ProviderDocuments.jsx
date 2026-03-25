import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TbBackhoe } from 'react-icons/tb';

import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import DocumentEntityTable from '../../components/resources/DocumentEntityTable';
import { useAuth } from '../../context/AuthContext';

const EMPTY_STATS = { total: 0, valid: 0, pending: 0, expiring: 0, observed: 0, review: 0, entityCount: 0 };

const FILTER_MAP = {
    pending_upload: { key: 'pending',  name: 'Pendientes'  },
    expiring:       { key: 'expiring', name: 'Por Vencer'  },
    observed:       { key: 'observed', name: 'Observados'  },
    in_review:      { key: 'review',   name: 'En Revisión' },
    valid:          { key: 'valid',    name: 'Vigentes'    },
};

/** Calcula los valores de display según el filtro activo */
const getDisplayInfo = (metrics, activeFilter) => {
    const total = metrics.total || 0;
    if (activeFilter === 'general' || !FILTER_MAP[activeFilter]) {
        return { displayValue: total, valueSuffix: undefined, filterLabel: null };
    }
    const { key, name } = FILTER_MAP[activeFilter];
    return {
        displayValue: metrics[key] ?? 0,
        valueSuffix: `/ ${total}`,
        filterLabel: name,
    };
};

/** Barras de progreso + mini badges — contenido específico de documento */
const DocCardBody = ({ metrics, activeFilter, iconText }) => {
    const total = metrics.total || 0;
    const cargaPct   = total > 0 ? Math.round(((metrics.uploaded ?? 0) / total) * 100) : 0;
    const compliance = total > 0 ? Math.round(((metrics.valid   ?? 0) / total) * 100) : 0;

    const barColor = (pct) =>
        pct === 100 ? 'bg-success' : pct < 50 ? 'bg-danger' : 'bg-warning';

    return (
        <>
            {/* Filtro activo label */}
            {activeFilter !== 'general' && FILTER_MAP[activeFilter] && (
                <p className={`text-[10px] font-bold mb-3 ${iconText}`}>
                    {FILTER_MAP[activeFilter].name}
                </p>
            )}

            {/* Carga */}
            <div className="mb-3">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-bold text-secondary/60 uppercase">
                        Carga
                        {activeFilter !== 'general' && (
                            <span className="font-normal normal-case text-secondary/40 ml-1">del total</span>
                        )}
                    </span>
                    <span className="text-xs font-bold text-secondary/70">{cargaPct}%</span>
                </div>
                <div className="h-1.5 w-full bg-secondary-light/30 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${barColor(cargaPct)}`}
                        style={{ width: `${cargaPct}%` }} />
                </div>
            </div>

            {/* Cumplimiento */}
            <div className="mb-4">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-bold text-secondary/60 uppercase">
                        Cumplimiento
                        {activeFilter !== 'general' && (
                            <span className="font-normal normal-case text-secondary/40 ml-1">del total</span>
                        )}
                    </span>
                    <span className={`text-xs font-bold ${barColor(compliance).replace('bg-', 'text-')}`}>
                        {compliance}%
                    </span>
                </div>
                <div className="h-1.5 w-full bg-secondary-light/30 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${barColor(compliance)}`}
                        style={{ width: `${compliance}%` }} />
                </div>
            </div>

            {/* Mini badges */}
            <div className="flex items-center gap-2 mt-auto">
                <div className={`px-2 py-1 bg-red-50 text-red-600 rounded-md text-[10px] font-bold flex items-center gap-1 ${activeFilter === 'expiring' ? 'ring-1 ring-red-200 bg-red-100' : ''}`}>
                    <i className="pi pi-exclamation-circle text-[10px]" /> {metrics.expiring}
                </div>
                <div className={`px-2 py-1 bg-orange-50 text-orange-600 rounded-md text-[10px] font-bold flex items-center gap-1 ${activeFilter === 'pending_upload' ? 'ring-1 ring-orange-200 bg-orange-100' : ''}`}>
                    <i className="pi pi-clock text-[10px]" /> {metrics.pending}
                </div>
                <div className="px-2 py-1 bg-green-50 text-green-600 rounded-md text-[10px] font-bold flex items-center gap-1 ml-auto">
                    <i className="pi pi-check-circle text-[10px]" /> {metrics.valid}
                </div>
            </div>
        </>
    );
};

const ICON_TEXT = {
    primary: 'text-primary',
    info:    'text-info',
    warning: 'text-warning',
    success: 'text-success',
};

const ProviderDocuments = () => {
    const { status } = useParams();
    const { currentRole } = useAuth();
    const isProveedor = currentRole?.role === 'PROVEEDOR';

    const [activeIndex, setActiveIndex] = useState(0);
    const [refreshKeys, setRefreshKeys] = useState({ 0: 0, 1: 0, 2: 0, 3: 0 });

    const [supplierStats,  setSupplierStats]  = useState(EMPTY_STATS);
    const [employeeStats,  setEmployeeStats]  = useState(EMPTY_STATS);
    const [vehicleStats,   setVehicleStats]   = useState(EMPTY_STATS);
    const [machineryStats, setMachineryStats] = useState(EMPTY_STATS);

    const [loadingStats, setLoadingStats] = useState({ 0: true, 1: true, 2: true, 3: true });
    const makeLoadingHandler = (index) => (isLoading) =>
        setLoadingStats(prev => ({ ...prev, [index]: isLoading }));

    const getFilterFromParam = (param) => {
        switch (param) {
            case 'general':    return 'general';
            case 'pendientes': return 'pending_upload';
            case 'por-vencer': return 'expiring';
            case 'observados': return 'observed';
            case 'en-revision':return 'in_review';
            case 'vigentes':   return 'valid';
            default:           return 'general';
        }
    };
    const currentFilter = getFilterFromParam(status || 'general');

    const handleTabChange = (index) => {
        setRefreshKeys(prev => ({ ...prev, [index]: prev[index] + 1 }));
        setActiveIndex(index);
    };

    const getPageTitle = () => {
        switch (status) {
            case 'general':    return { title: 'Documentación General',    subtitle: 'Vista completa de todos los documentos.' };
            case 'pendientes': return { title: 'Pendientes de Carga',      subtitle: 'Documentos obligatorios faltantes.' };
            case 'por-vencer': return { title: 'Documentos Por Vencer',    subtitle: 'Alertas de vencimiento próximo (10 días).' };
            case 'observados': return { title: 'Documentos Observados',    subtitle: 'Rechazados por auditoría que requieren corrección.' };
            case 'en-revision':return { title: 'En Revisión',              subtitle: 'Documentos bajo análisis del equipo auditor.' };
            case 'vigentes':   return { title: 'Documentación Vigente',    subtitle: 'Documentos válidos y aprobados.' };
            default:           return { title: 'Documentación',            subtitle: 'Gestión de documentos.' };
        }
    };
    const headerInfo = getPageTitle();

    const CARDS = [
        { index: 0, title: 'Legajo',     entityLabel: 'proveedores', icon: 'pi-briefcase', type: 'primary', metrics: supplierStats,  onStats: setSupplierStats,  onLoading: makeLoadingHandler(0), tableType: 'suppliers' },
        { index: 1, title: 'Empleados',  entityLabel: 'empleados',   icon: 'pi-users',     type: 'info',    metrics: employeeStats,  onStats: setEmployeeStats,  onLoading: makeLoadingHandler(1), tableType: 'employees' },
        { index: 2, title: 'Vehículos',  entityLabel: 'vehículos',   icon: 'pi-car',       type: 'warning', metrics: vehicleStats,   onStats: setVehicleStats,   onLoading: makeLoadingHandler(2), tableType: 'vehicles'  },
        { index: 3, title: 'Maquinaria', entityLabel: 'maquinaria',  icon: <TbBackhoe />,  type: 'success', metrics: machineryStats, onStats: setMachineryStats, onLoading: makeLoadingHandler(3), tableType: 'machinery' },
    ];

    return (
        <div className="p-4 md:p-8 space-y-8 animate-fade-in bg-slate-50 min-h-screen">
            <PageHeader
                title={headerInfo.title}
                subtitle={headerInfo.subtitle}
                icon="pi pi-folder-open"
            />

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {CARDS.map(({ index, title, entityLabel, icon, type, metrics }) => {
                    const { displayValue, valueSuffix } = getDisplayInfo(metrics, currentFilter);
                    const isLegajoCard = index === 0;
                    const subtitle = (isLegajoCard && isProveedor)
                        ? 'documentos'
                        : metrics.entityCount > 0
                            ? `documentos de ${metrics.entityCount} ${entityLabel}`
                            : null;
                    return (
                        <StatCard
                            key={index}
                            title={title}
                            value={displayValue}
                            valueSuffix={valueSuffix}
                            subtitle={subtitle}
                            icon={icon}
                            type={type}
                            loading={loadingStats[index]}
                            onClick={() => handleTabChange(index)}
                            isActive={activeIndex === index}
                        >
                            <DocCardBody
                                metrics={metrics}
                                activeFilter={currentFilter}
                                iconText={ICON_TEXT[type]}
                            />
                        </StatCard>
                    );
                })}
            </div>

            {/* Tab navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-secondary/10 overflow-hidden">
                <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 border-b border-secondary/5">
                    {CARDS.map(({ index, title, icon }) => (
                        <button
                            key={index}
                            onClick={() => handleTabChange(index)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all
                                ${activeIndex === index
                                    ? 'bg-white text-primary shadow-sm border border-primary/10'
                                    : 'text-secondary/60 hover:text-secondary hover:bg-white/50'
                                }`}
                        >
                            <span className={activeIndex === index ? 'text-primary' : 'text-secondary/40'}>
                                {typeof icon === 'string'
                                    ? <i className={`pi ${icon} text-xs`} />
                                    : <TbBackhoe className="text-sm" />}
                            </span>
                            {title}
                        </button>
                    ))}
                </div>

                {/* Tab Panels */}
                <div>
                    {CARDS.map(({ index, title, tableType, onStats, onLoading }) => (
                        <div key={tableType} className={activeIndex === index ? 'block' : 'hidden'}>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-secondary-dark mb-4 border-b border-secondary/10 pb-2">
                                    Listado de {title} - {headerInfo.title}
                                </h3>
                                <DocumentEntityTable
                                    type={tableType}
                                    filterStatus={currentFilter}
                                    hideCategoryNav
                                    refreshKey={refreshKeys[index]}
                                    onStatsChange={onStats}
                                    onLoadingChange={onLoading}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProviderDocuments;

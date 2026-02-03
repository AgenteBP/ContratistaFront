import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import SelectionToggle from '../../components/ui/SelectionToggle';

const TechnicalAudit = () => {
    const navigate = useNavigate();
    const [params, setParams] = useState(() => {
        const saved = localStorage.getItem('technical_audit_params_v2');
        // A FUTURO: Aquí podrías inicializar con valores vacíos y dejar que el useEffect 
        // de carga inicial (ver abajo) rellene los datos desde la Base de Datos.
        return saved ? JSON.parse(saved) : {
            jornada: {
                horasDiaria: 8,
                diasMes: 22.5,
                mesesAnio: 12
            },
            afectacion: {
                personal: 5,
                vehiculo: 5,
                camion: 0.2,
                grua25: 4,
                gruaMas25: 0.1
            },
            baremos: {
                personal: 1366320,
                vehiculo: 1870000,
                camion: 4165000,
                grua25: 5100000,
                gruaMas25: 7000000
            }
        };
    });

    // A FUTURO: CARGA DESDE BD
    // useEffect(() => {
    //     const fetchParams = async () => {
    //         try {
    //             const response = await fetch('/api/config/technical-audit');
    //             const data = await response.json();
    //             setParams(data);
    //         } catch (error) {
    //             console.error("Error cargando configuración:", error);
    //         }
    //     };
    //     fetchParams();
    // }, []);

    const [tempParams, setTempParams] = useState(params);
    const [viewMode, setViewMode] = useState('Mensual');
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [isResourcesOpen, setIsResourcesOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('technical_audit_params_v2', JSON.stringify(params));
    }, [params]);

    // Al abrir el modal, cargamos los params actuales al borrador
    const handleOpenConfig = () => {
        setTempParams(params);
        setIsConfigOpen(true);
    };

    const handleSaveConfig = () => {
        // A FUTURO: GUARDADO EN BD
        // const saveToBackend = async () => {
        //     try {
        //         await fetch('/api/config/technical-audit', {
        //             method: 'PUT',
        //             body: JSON.stringify(tempParams),
        //             headers: { 'Content-Type': 'application/json' }
        //         });
        //         setParams(tempParams);
        //         setIsConfigOpen(false);
        //     } catch (err) { alert("Error al guardar"); }
        // };
        // saveToBackend();

        setParams(tempParams);
        setIsConfigOpen(false);
    };

    const activeParams = isConfigOpen ? tempParams : params;

    const providers = [
        { id: 1, name: 'Prana', resources: { personal: 2, vehiculo: 1, camion: 0, grua25: 1, gruaMas25: 0 } },
        { id: 2, name: 'Ingelmec', resources: { personal: 8, vehiculo: 2, camion: 0, grua25: 3, gruaMas25: 0 } },
        { id: 3, name: 'Proton', resources: { personal: 5, vehiculo: 0, camion: 0, grua25: 1, gruaMas25: 2 } },
        { id: 4, name: 'Origen', resources: { personal: 2, vehiculo: 0, camion: 0, grua25: 1, gruaMas25: 5 } },
        { id: 5, name: 'AV Avance', resources: { personal: 11, vehiculo: 6, camion: 1, grua25: 2, gruaMas25: 0 } },
        { id: 6, name: 'Paven', resources: { personal: 6, vehiculo: 2, camion: 0, grua25: 0, gruaMas25: 0 } },
        { id: 7, name: 'Toto', resources: { personal: 8, vehiculo: 1, camion: 0, grua25: 1, gruaMas25: 1 } },
        { id: 8, name: 'Fenix', resources: { personal: 7, vehiculo: 1, camion: 0, grua25: 1, gruaMas25: 0 } },
        { id: 9, name: 'Ohm SRL', resources: { personal: 7, vehiculo: 1, camion: 0, grua25: 1, gruaMas25: 3 } },
        { id: 10, name: 'Ohm SAS', resources: { personal: 4, vehiculo: 0, camion: 0, grua25: 2, gruaMas25: 0 } },
    ];

    const calculatedData = useMemo(() => {
        return providers.map(p => {
            // BaremoHora = BaremoMensual / (DíasMesConfig * HorasConfig)
            const getHourlyRef = (key) => {
                const mesConfig = activeParams.jornada.diasMes || 22.5;
                const hsConfig = activeParams.jornada.horasDiaria || 8;
                return (activeParams.baremos[key] || 0) / (mesConfig * hsConfig);
            };

            // Cálculo Diario (Base): Cantidad * BaremoHora * hsAfectacion
            const itemDailyCosts = {
                personal: p.resources.personal * getHourlyRef('personal') * activeParams.afectacion.personal,
                vehiculo: p.resources.vehiculo * getHourlyRef('vehiculo') * activeParams.afectacion.vehiculo,
                camion: p.resources.camion * getHourlyRef('camion') * activeParams.afectacion.camion,
                grua25: p.resources.grua25 * getHourlyRef('grua25') * activeParams.afectacion.grua25,
                gruaMas25: p.resources.gruaMas25 * getHourlyRef('gruaMas25') * activeParams.afectacion.gruaMas25
            };

            const subTotalDiario = Object.values(itemDailyCosts).reduce((a, b) => a + b, 0);

            // Subtotal Mensual: Diario * Días Config
            const subTotalMensual = subTotalDiario * (activeParams.jornada.diasMes || 22.5);

            // Subtotal Anual: Mensual * 12
            const subTotalAnual = subTotalMensual * 12;

            return {
                ...p,
                itemDailyCosts,
                subTotalDiario,
                subTotalMensual,
                subTotalAnual
            };
        });
    }, [activeParams]);

    const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

    const handleParamChange = (section, key, value) => {
        setTempParams(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: parseFloat(value) || 0
            }
        }));
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-fade-in bg-slate-50 min-h-screen">
            {/* MODAL DE CONFIGURACIÓN */}
            {isConfigOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-secondary-dark/40 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden border border-secondary/20 flex flex-col max-h-[90vh]">
                        <div className="px-8 py-6 flex justify-between items-center border-b border-secondary/10 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <i className="pi pi-cog text-primary text-xl"></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-secondary-dark tracking-tight">Configuración Técnica</h3>
                                    <p className="text-secondary text-sm">Ajuste de parámetros y baremos de costo.</p>
                                </div>
                            </div>
                            <button onClick={() => setIsConfigOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-secondary">
                                <i className="pi pi-times"></i>
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8">
                            {/* Jornada */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {Object.entries(tempParams.jornada).map(([key, val]) => (
                                    <div key={key} className="bg-slate-50 p-4 rounded-xl border border-secondary/10">
                                        <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">{key.replace('horasDiaria', 'h / Día').replace('diasMes', 'Días / Mes').replace('mesesAnio', 'Meses / Año')}</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={val}
                                            onChange={(e) => handleParamChange('jornada', key, e.target.value)}
                                            className="w-full text-xl font-bold text-secondary-dark bg-transparent border-b border-secondary/20 focus:border-primary outline-none transition-all py-1"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Afectación */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-secondary-dark flex items-center gap-2 px-1 text-sm uppercase tracking-wide">
                                        <i className="pi pi-bolt text-primary"></i>
                                        h Afectación Diaria
                                    </h4>
                                    <div className="bg-white rounded-xl border border-secondary/10 p-6 space-y-4 shadow-sm">
                                        {Object.entries(tempParams.afectacion).map(([key, val]) => (
                                            <div key={key} className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-secondary capitalize">{key.replace('grua25', 'Grúas hasta 25Tn').replace('gruaMas25', 'Grúas > 25Tn').replace('personal', 'Personal').replace('vehiculo', 'Vehículos').replace('camion', 'Camiones')}</label>
                                                <div className="relative w-24">
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        value={val}
                                                        onChange={(e) => handleParamChange('afectacion', key, e.target.value)}
                                                        className="w-full font-bold text-secondary-dark py-1.5 px-3 bg-slate-50 rounded-lg border border-secondary/10 text-right focus:border-primary outline-none transition-all text-sm"
                                                    />
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-secondary/30 italic">hs</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Baremos */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-secondary-dark flex items-center gap-2 px-1 text-sm uppercase tracking-wide">
                                        <i className="pi pi-wallet text-success"></i>
                                        Baremos Mensuales
                                    </h4>
                                    <div className="bg-white rounded-xl border border-secondary/10 p-6 space-y-4 shadow-sm">
                                        {Object.entries(tempParams.baremos).map(([key, val]) => (
                                            <div key={key} className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-secondary capitalize">{key.replace('grua25', 'Grúas hasta 25Tn').replace('gruaMas25', 'Grúas > 25Tn').replace('personal', 'Personal').replace('vehiculo', 'Vehículos').replace('camion', 'Camiones')}</label>
                                                <div className="relative w-32">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary/30 font-bold text-xs">$</span>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        value={val}
                                                        onChange={(e) => handleParamChange('baremos', key, e.target.value)}
                                                        className="w-full font-bold text-secondary-dark py-1.5 pl-5 pr-2 bg-slate-50 rounded-lg border border-secondary/10 text-right focus:border-primary outline-none transition-all text-sm"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-secondary/10 flex justify-end shrink-0 gap-3">
                            <button
                                onClick={() => setIsConfigOpen(false)}
                                className="px-6 py-2 rounded-lg border border-secondary/20 text-secondary font-bold hover:bg-white transition-all text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveConfig}
                                className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-8 rounded-lg shadow-md shadow-primary/20 transition-all text-sm"
                            >
                                Guardar Configuración
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <PageHeader
                title="Auditoría Técnica"
                subtitle="Determinación de tamaño relativo y supervisión de activos e-contratista."
                actionButton={
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-secondary/10 shadow-sm">
                            <div className="text-right">
                                <span className="block text-[8px] font-bold text-secondary/60 uppercase">Jornada Actual</span>
                                <span className="font-bold text-secondary-dark text-xs">{activeParams.jornada.horasDiaria}h × {activeParams.jornada.diasMes}d</span>
                            </div>
                        </div>
                        <button
                            onClick={handleOpenConfig}
                            className="flex items-center gap-2 bg-white border border-secondary/20 px-4 py-2 rounded-lg shadow-sm hover:border-primary/50 text-secondary-dark transition-all text-sm font-bold"
                        >
                            <i className="pi pi-cog text-primary"></i>
                            <span>Configurar</span>
                        </button>
                    </div>
                }
            />

            {/* TABLA DE RECURSOS */}
            <div className="bg-white rounded-xl border border-secondary/20 shadow-sm overflow-hidden transition-all duration-300">
                <button
                    onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                    className="w-full px-6 py-4 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors text-left"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary-dark/5 flex items-center justify-center text-secondary-dark">
                            <i className="pi pi-users text-sm"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-secondary-dark text-sm">Cantidades por Proveedor</h3>
                            <p className="text-[10px] text-secondary">Recursos activos sincronizados de e-contratista.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <i className={`pi pi-chevron-down transition-transform duration-300 text-secondary/40 text-xs ${isResourcesOpen ? 'rotate-180' : ''}`}></i>
                    </div>
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${isResourcesOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="overflow-x-auto border-t border-secondary/5">
                        <table className="w-full text-left border-collapse">
                            <thead className="text-[10px] uppercase font-bold text-secondary bg-secondary-light/50 border-b border-secondary/10">
                                <tr>
                                    <th className="px-6 py-3">Proveedor</th>
                                    <th className="px-4 py-3 text-center">Personas</th>
                                    <th className="px-4 py-3 text-center">Vehículos</th>
                                    <th className="px-4 py-3 text-center">Camiones</th>
                                    <th className="px-4 py-3 text-center">Grúas hasta 25Tn</th>
                                    <th className="px-4 py-3 text-center">Grúas {'>'} 25Tn</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary/5">
                                {providers.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td
                                            className="px-6 py-3 font-bold text-primary hover:underline cursor-pointer text-sm"
                                            onClick={() => navigate(`/proveedores/${p.id}`)}
                                        >
                                            {p.name}
                                        </td>
                                        {Object.values(p.resources).map((resVal, idx) => (
                                            <td key={idx} className="px-4 py-3 text-center">
                                                <span className={`text-sm font-bold ${resVal > 0 ? 'text-secondary-dark' : 'text-secondary/20'}`}>
                                                    {resVal}
                                                </span>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* TABLA DE RESULTADOS */}
            <div className="bg-white rounded-xl border border-secondary/20 shadow-md overflow-hidden">
                <div className="px-8 py-6 flex flex-col lg:flex-row justify-between items-center gap-6 border-b border-secondary/10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <i className="pi pi-chart-bar text-xl"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-secondary-dark text-lg tracking-tight">Tamaño Relativo de Empresa</h3>
                            <p className="text-xs text-secondary">Distribución proporcional del costo operativo.</p>
                        </div>
                    </div>

                    <div className="w-full lg:w-72">
                        <SelectionToggle
                            options={[
                                { label: 'Diario', value: 'Hora' },
                                { label: 'Mensual', value: 'Mensual' },
                                { label: 'Anual', value: 'Anual' }
                            ]}
                            value={viewMode}
                            onChange={setViewMode}
                            className="!p-1 !mb-0 bg-slate-100"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] uppercase font-bold text-secondary bg-secondary-light/50 border-b border-secondary/10">
                            <tr>
                                <th className="px-3 py-3 sticky left-0 bg-secondary-light/50 z-20 w-32 whitespace-normal leading-tight">Proveedor</th>
                                <th className="px-1.5 py-3 text-right leading-tight">Personas</th>
                                <th className="px-1.5 py-3 text-right leading-tight">Vehículo</th>
                                <th className="px-1.5 py-3 text-right leading-tight">Camión</th>
                                <th className="px-1.5 py-3 text-right leading-tight">Grúas hasta<br />25Tn</th>
                                <th className="px-1.5 py-3 text-right leading-tight">Grúas<br />{'>'} 25Tn</th>
                                <th className="px-2 py-3 text-right bg-primary/5 text-primary">SUBTOTAL</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary/5 font-medium">
                            {calculatedData.map(p => {
                                // Factor de escala para celdas individuales (Base es el día)
                                const scaleFactor = viewMode === 'Anual' ? (activeParams.jornada.diasMes || 22.5) * 12 :
                                    viewMode === 'Mensual' ? (activeParams.jornada.diasMes || 22.5) :
                                        1;

                                const totalRow = viewMode === 'Anual' ? p.subTotalAnual :
                                    viewMode === 'Mensual' ? p.subTotalMensual :
                                        p.subTotalDiario;

                                return (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                                        <td
                                            className="px-3 py-3 font-bold text-primary hover:underline cursor-pointer sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-20 border-r border-secondary/5 text-sm whitespace-normal leading-snug"
                                            onClick={() => navigate(`/proveedores/${p.id}`)}
                                        >
                                            {p.name}
                                        </td>
                                        <td className="px-1.5 py-3 text-right text-secondary/70 text-xs tabular-nums">{formatCurrency(p.itemDailyCosts.personal * scaleFactor)}</td>
                                        <td className="px-1.5 py-3 text-right text-secondary/70 text-xs tabular-nums">{formatCurrency(p.itemDailyCosts.vehiculo * scaleFactor)}</td>
                                        <td className="px-1.5 py-3 text-right text-secondary/70 text-xs tabular-nums">{formatCurrency(p.itemDailyCosts.camion * scaleFactor)}</td>
                                        <td className="px-1.5 py-3 text-right text-secondary/70 text-xs tabular-nums">{formatCurrency(p.itemDailyCosts.grua25 * scaleFactor)}</td>
                                        <td className="px-1.5 py-3 text-right text-secondary/70 text-xs tabular-nums">{formatCurrency(p.itemDailyCosts.gruaMas25 * scaleFactor)}</td>
                                        <td className="px-2 py-3 text-right bg-primary/[0.02] font-bold text-primary group-hover:bg-primary/[0.04] text-sm tabular-nums">
                                            {formatCurrency(totalRow)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-secondary-dark text-white font-bold">
                            <tr>
                                <td className="px-4 py-4 sticky left-0 bg-secondary-dark text-[10px] tracking-widest uppercase">TOTAL CONSOLIDADO</td>
                                <td colSpan={5} className="md:table-cell hidden"></td>
                                <td className="px-2 py-4 text-right text-base bg-primary/20 border-l border-white/5 tabular-nums">
                                    {formatCurrency(calculatedData.reduce((acc, p) => acc + (viewMode === 'Anual' ? p.subTotalAnual : viewMode === 'Mensual' ? p.subTotalMensual : p.subTotalDiario), 0))}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Metodología */}
            <div className="bg-white rounded-xl p-8 border border-secondary/10 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                <div className="w-14 h-14 rounded-xl bg-info-light flex items-center justify-center text-info">
                    <i className="pi pi-info-circle text-2xl"></i>
                </div>
                <div className="space-y-4">
                    <p className="font-bold text-secondary-dark text-base">Metodología de Supervisión</p>
                    <p className="text-secondary text-sm leading-relaxed max-w-4xl">
                        El sistema normaliza el tamaño de cada proveedor basándose en el Baremo de Costo y la Afectación Diaria por recurso.
                        Este análisis permite comparar proveedores de diferentes naturalezas operativas bajo una misma métrica económica consolidada.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {[`Días: ${activeParams.jornada.diasMes}`, `h/Día: ${activeParams.jornada.horasDiaria}`, `Personal: ${formatCurrency(activeParams.baremos.personal)}`].map(tag => (
                            <span key={tag} className="text-[10px] font-bold bg-slate-100 text-secondary-dark px-3 py-1 rounded-md uppercase">{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TechnicalAudit;

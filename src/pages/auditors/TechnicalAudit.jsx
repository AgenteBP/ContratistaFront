import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import SelectionToggle from '../../components/ui/SelectionToggle';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { StatusBadge } from '../../components/ui/Badges';

const AUDIT_VALIDITY_DAYS = 30;

const TechnicalAudit = () => {
    const navigate = useNavigate();

    // Configuración de Baremos
    const [params, setParams] = useState(() => {
        const saved = localStorage.getItem('technical_audit_params_v2');
        return saved ? JSON.parse(saved) : {
            jornada: { horasDiaria: 8, diasMes: 22.5, mesesAnio: 12 },
            afectacion: { personal: 5, vehiculo: 5, camion: 0.2, grua25: 4, gruaMas25: 0.1 },
            baremos: { personal: 1366320, vehiculo: 1870000, camion: 4165000, grua25: 5100000, gruaMas25: 7000000 }
        };
    });

    // Auditorías (Simulando Backend)
    const [audits, setAudits] = useState(() => {
        const saved = localStorage.getItem('technical_audits_v1');
        return saved ? JSON.parse(saved) : {};
    });

    const [tempParams, setTempParams] = useState(params);
    const [viewMode, setViewMode] = useState('Mensual');
    const [statusFilter, setStatusFilter] = useState('TODOS');
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [isResourcesOpen, setIsResourcesOpen] = useState(false);

    // Modal de Auditoría
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [auditForm, setAuditForm] = useState({ status: 'APROBADO', observations: '' });
    const [modalPeriod, setModalPeriod] = useState('Mensual');
    const [modalTab, setModalTab] = useState('personal');
    const [isResourceTableOpen, setIsResourceTableOpen] = useState(true);

    useEffect(() => {
        localStorage.setItem('technical_audit_params_v2', JSON.stringify(params));
    }, [params]);

    useEffect(() => {
        localStorage.setItem('technical_audits_v1', JSON.stringify(audits));
    }, [audits]);

    const handleOpenAudit = (provider) => {
        setSelectedProvider(provider);
        const existingAudit = audits[provider.id];
        if (existingAudit) {
            setAuditForm({
                status: existingAudit.status,
                observations: existingAudit.observations || ''
            });
        } else {
            setAuditForm({ status: 'APROBADO', observations: '' });
        }
        setModalPeriod('Mensual');
        setModalTab('personal');
        setIsResourceTableOpen(true);
        setIsAuditModalOpen(true);
    };

    // --- PERSISTENCIA (BACKEND READY) ---
    // A FUTURO: Reemplazar localStorage por llamadas a API (auditorService)
    const saveAuditToBackend = async (providerId, auditData) => {
        // const response = await auditorService.saveTechnicalAudit(providerId, auditData);
        setAudits(prev => ({
            ...prev,
            [providerId]: {
                ...auditData,
                date: new Date().toISOString()
            }
        }));
    };

    const handleSaveAudit = () => {
        saveAuditToBackend(selectedProvider.id, auditForm);
        setIsAuditModalOpen(false);
    };

    const getAuditStatus = (providerId) => {
        const audit = audits[providerId];
        if (!audit) return { label: 'PENDIENTE', icon: 'pi-circle', color: 'text-secondary/40' };

        const auditDate = new Date(audit.date);
        const daysSince = (new Date() - auditDate) / (1000 * 60 * 60 * 24);

        if (daysSince > AUDIT_VALIDITY_DAYS) {
            return { label: 'VENCIDO', icon: 'pi-clock', color: 'text-warning' };
        }

        if (audit.status === 'OBSERVADO') {
            return { label: 'OBSERVADO', icon: 'pi-exclamation-triangle', color: 'text-warning' };
        }

        return { label: 'APROBADO', icon: 'pi-check-circle', color: 'text-success' };
    };

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
        let data = providers.map(p => {
            const getHourlyRef = (key) => {
                const mesConfig = params.jornada.diasMes || 22.5;
                const hsConfig = params.jornada.horasDiaria || 8;
                return (params.baremos[key] || 0) / (mesConfig * hsConfig);
            };

            const itemDailyCosts = {
                personal: p.resources.personal * getHourlyRef('personal') * params.afectacion.personal,
                vehiculo: p.resources.vehiculo * getHourlyRef('vehiculo') * params.afectacion.vehiculo,
                camion: p.resources.camion * getHourlyRef('camion') * params.afectacion.camion,
                grua25: p.resources.grua25 * getHourlyRef('grua25') * params.afectacion.grua25,
                gruaMas25: p.resources.gruaMas25 * getHourlyRef('gruaMas25') * params.afectacion.gruaMas25
            };

            const subTotalDiario = Object.values(itemDailyCosts).reduce((a, b) => a + b, 0);
            const subTotalMensual = subTotalDiario * (params.jornada.diasMes || 22.5);
            const subTotalAnual = subTotalMensual * 12;

            return {
                ...p,
                itemDailyCosts,
                subTotalDiario,
                subTotalMensual,
                subTotalAnual,
                audit: getAuditStatus(p.id)
            };
        });

        if (statusFilter !== 'TODOS') {
            data = data.filter(d => d.audit.label === statusFilter);
        }

        return data;
    }, [params, audits, statusFilter]);

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

    // Al abrir el modal de configuración, cargamos los params actuales al borrador
    const handleOpenConfig = () => {
        setTempParams(params);
        setIsConfigOpen(true);
    };

    const handleSaveConfig = () => {
        setParams(tempParams);
        setIsConfigOpen(false);
    };

    // Usamos tempParams si el modal está abierto para "Live Preview", de lo contrario params
    const activeParams = isConfigOpen ? tempParams : params;

    return (
        <div className="p-4 md:p-8 space-y-8 animate-fade-in bg-slate-50 min-h-screen">
            {/* MODAL DE AUDITORÍA (SOBER REDESIGN) */}
            <Dialog
                visible={isAuditModalOpen}
                onHide={() => setIsAuditModalOpen(false)}
                header={null}
                closable={false}
                className="audit-dialog-sober transition-all duration-300"
                breakpoints={{ '1200px': isResourceTableOpen ? '85vw' : '40rem', '960px': isResourceTableOpen ? '95vw' : '40rem', '641px': '100vw' }}
                style={{ width: isResourceTableOpen ? '64rem' : '32rem', maxWidth: '100%' }}
                pt={{
                    root: { className: 'rounded-xl overflow-hidden border-none shadow-2xl transition-all duration-300' },
                    header: { className: 'hidden' },
                    content: { className: 'p-0 bg-white' }
                }}
            >
                <div className="flex flex-col md:flex-row h-full bg-white max-h-[90vh]">
                    {/* PANEL IZQUIERDO: DETALLES DE RECURSOS (COLAPSABLE) */}
                    {isResourceTableOpen && (
                        <div className="w-full md:w-2/3 border-r border-secondary/10 flex flex-col bg-slate-50/30 overflow-hidden animate-fade-in">
                            {/* Header Izquierdo */}
                            <div className="bg-white border-b border-secondary/10">
                                {/* Tabs de Recursos */}
                                <div className="flex overflow-x-auto hide-scrollbar border-b border-secondary/5">
                                    {[
                                        { id: 'personal', label: 'PERSONAS' },
                                        { id: 'vehiculo', label: 'VEHÍCULO' },
                                        { id: 'camion', label: 'CAMIÓN' },
                                        { id: 'grua25', label: 'GRÚAS HASTA 25TN' },
                                        { id: 'gruaMas25', label: 'GRÚAS > 25TN' }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setModalTab(tab.id)}
                                            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 ${modalTab === tab.id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-secondary/60 hover:text-secondary-dark hover:bg-slate-50'}`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                                {/* Controles y Subtotal */}
                                <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                                    <div className="w-64">
                                        <SelectionToggle
                                            options={[
                                                { label: 'Diario', value: 'Hora' },
                                                { label: 'Mensual', value: 'Mensual' },
                                                { label: 'Anual', value: 'Anual' }
                                            ]}
                                            value={modalPeriod}
                                            onChange={setModalPeriod}
                                            className="!p-1 !mb-0 bg-slate-100"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase text-secondary/50">Subtotal:</span>
                                        <span className="text-sm font-bold text-secondary-dark tabular-nums">
                                            {formatCurrency(selectedProvider ? (() => {
                                                const daily = selectedProvider.itemDailyCosts[modalTab] || 0;
                                                const diasMes = activeParams.jornada.diasMes || 22.5;
                                                if (modalPeriod === 'Anual') return daily * diasMes * 12;
                                                if (modalPeriod === 'Mensual') return daily * diasMes;
                                                return daily;
                                            })() : 0)}
                                        </span>
                                    </div>
                                </div>
                                {/* Filtros de Tabla Mockeada */}
                                <div className="px-6 py-3 bg-slate-50 border-y border-secondary/5 flex items-center justify-between gap-4">
                                    <div className="relative flex-1 max-w-sm">
                                        <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40 text-xs"></i>
                                        <input type="text" placeholder="Buscar..." disabled className="w-full pl-8 pr-4 py-2 bg-white border border-secondary/10 rounded-lg text-xs outline-none" />
                                    </div>
                                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-secondary/10">
                                        <span className="text-secondary/40 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2">
                                            <i className="pi pi-filter"></i> Filtros
                                        </span>
                                    </div>
                                </div>
                                <div className="px-6 py-2 bg-white flex text-[9px] uppercase font-bold text-secondary/50 items-center">
                                    <span className="flex-1">MARCA <i className="pi pi-angle-down ml-1"></i></span>
                                    <span className="flex-1">MODELO <i className="pi pi-angle-down ml-1"></i></span>
                                    <span className="flex-1">ESTADO <i className="pi pi-angle-down ml-1"></i></span>
                                    <div className="w-20 text-center flex flex-col items-center justify-center border-l border-secondary/10 pl-4 ml-4">
                                        <span className="text-secondary-dark text-sm font-black leading-none">{selectedProvider?.resources[modalTab] || 0}</span>
                                        <span className="text-[8px] tracking-wider mt-0.5">ITEMS</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tabla Mockeada Body */}
                            <div className="flex-1 overflow-y-auto p-0 bg-white min-h-[250px]">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50 text-[10px] text-secondary font-bold uppercase sticky top-0 border-y border-secondary/10 z-10">
                                        <tr>
                                            <th className="px-6 py-3 font-bold">{modalTab === 'personal' ? 'DNI' : 'PATENTE'} <i className="pi pi-sort-alt ml-1 text-secondary/40"></i></th>
                                            <th className="px-4 py-3 font-bold">MARCA <i className="pi pi-sort-alt ml-1 text-secondary/40"></i></th>
                                            <th className="px-4 py-3 font-bold">MODELO <i className="pi pi-sort-alt ml-1 text-secondary/40"></i></th>
                                            <th className="px-4 py-3 font-bold">TIPO <i className="pi pi-sort-alt ml-1 text-secondary/40"></i></th>
                                            <th className="px-4 py-3 font-bold text-center">ESTADO <i className="pi pi-sort-alt ml-1 text-secondary/40"></i></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-secondary/5">
                                        {selectedProvider && (() => {
                                            const count = selectedProvider.resources[modalTab] || 0;
                                            if (count === 0) {
                                                return (
                                                    <tr>
                                                        <td colSpan="5" className="py-12 text-center text-secondary/40 text-xs">
                                                            No hay registros para este recurso.
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                            return Array.from({ length: count }).map((_, i) => (
                                                <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                                    <td className="px-6 py-3 flex items-center gap-3">
                                                        <i className="pi pi-angle-right text-secondary/30 group-hover:text-primary transition-colors text-xs"></i>
                                                        <span className="font-bold text-secondary-dark text-sm">{modalTab === 'personal' ? `2${Math.floor(1000000 + Math.random() * 9000000)}` : `AF${Math.floor(10 + Math.random() * 90)}${String.fromCharCode(65 + Math.random() * 26)}${String.fromCharCode(65 + Math.random() * 26)}`}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-secondary text-xs">{modalTab === 'personal' ? 'N/A' : (['Toyota', 'Ford', 'Chevrolet', 'Volkswagen', 'Mercedes-Benz', 'Scania'][i % 6])}</td>
                                                    <td className="px-4 py-3 text-secondary text-xs">{modalTab === 'personal' ? 'Operario' : (['Hilux', 'Ranger', 'Amarok', 'Actros', 'FH'][i % 5])}</td>
                                                    <td className="px-4 py-3 text-[10px] text-secondary/50 font-bold uppercase tracking-wider">{modalTab === 'personal' ? 'PERSONA' : modalTab === 'vehiculo' ? 'CAMIONETA' : 'PESADO'}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-success/10 text-success border border-success/20">ACTIVO</span>
                                                    </td>
                                                </tr>
                                            ));
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                            {/* Paginación simple footer */}
                            <div className="px-6 py-3 border-t border-secondary/10 flex justify-between items-center text-secondary/40 text-xs bg-white shrink-0">
                                <i className="pi pi-angle-double-left cursor-not-allowed"></i>
                                <i className="pi pi-angle-left cursor-not-allowed"></i>
                                <span className="text-secondary-dark font-bold">1</span>
                                <i className="pi pi-angle-right cursor-not-allowed"></i>
                                <i className="pi pi-angle-double-right cursor-not-allowed"></i>
                                <div className="border border-secondary/20 rounded-md px-2 py-1 flex items-center gap-2">
                                    <span className="text-secondary-dark">5</span>
                                    <i className="pi pi-angle-down"></i>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PANEL DERECHO: ACCIONES DE AUDITORÍA */}
                    <div className={`${isResourceTableOpen ? 'w-full md:w-1/3' : 'w-full'} flex flex-col bg-white transition-all duration-300`}>
                        {/* Header Minimalista */}
                        <div className="px-6 py-4 border-b border-secondary/10 flex justify-between items-center bg-slate-50/50 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <i className="pi pi-shield text-primary"></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-secondary-dark leading-tight">Ejecutar Auditoría</h3>
                                    <p className="text-secondary text-[10px] font-medium leading-none mt-1 uppercase tracking-wider">{selectedProvider?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsResourceTableOpen(!isResourceTableOpen)}
                                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${isResourceTableOpen ? 'bg-white border-secondary/20 text-secondary hover:bg-slate-50' : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'}`}
                                    title={isResourceTableOpen ? 'Ocultar desglose de recursos' : 'Ver desglose de recursos y tabla'}
                                >
                                    <i className={`pi ${isResourceTableOpen ? 'pi-angle-right' : 'pi-table'}`}></i>
                                    <span className="hidden sm:inline">{isResourceTableOpen ? 'Ocultar panel' : 'Ver Recursos'}</span>
                                </button>
                                <button onClick={() => setIsAuditModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-200/50 flex items-center justify-center transition-all text-secondary ml-2">
                                    <i className="pi pi-times text-[10px]"></i>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                            {/* Subtotal General */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary/60 uppercase tracking-widest px-1">Subtotal General</label>
                                <div className="bg-slate-50 border border-secondary/10 rounded-xl px-4 py-3 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{modalPeriod}</span>
                                    <span className="text-lg font-black text-primary tabular-nums">
                                        {formatCurrency(selectedProvider ? (() => {
                                            if (modalPeriod === 'Anual') return selectedProvider.subTotalAnual;
                                            if (modalPeriod === 'Mensual') return selectedProvider.subTotalMensual;
                                            return selectedProvider.subTotalDiario;
                                        })() : 0)}
                                    </span>
                                </div>
                            </div>

                            {/* Estado Selector - Compacto */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-secondary/60 uppercase tracking-widest px-1">Estado de Auditoría</label>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setAuditForm({ ...auditForm, status: 'APROBADO' })}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${auditForm.status === 'APROBADO' ? 'border-success bg-success/5 text-success' : 'border-slate-50 text-secondary/40 hover:border-success/20 hover:text-success/60'}`}
                                    >
                                        <i className="pi pi-check-circle text-lg"></i>
                                        <span className="font-bold uppercase tracking-wider text-[11px]">Aprobado</span>
                                    </button>
                                    <button
                                        onClick={() => setAuditForm({ ...auditForm, status: 'OBSERVADO' })}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${auditForm.status === 'OBSERVADO' ? 'border-warning bg-warning/5 text-warning-hover' : 'border-slate-50 text-secondary/40 hover:border-warning/20 hover:text-warning/60'}`}
                                    >
                                        <i className="pi pi-exclamation-triangle text-lg"></i>
                                        <span className="font-bold uppercase tracking-wider text-[11px]">Observado</span>
                                    </button>
                                </div>
                            </div>

                            {/* Observaciones - Compacto */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-secondary/60 uppercase tracking-widest px-1">Detalles y Observaciones</label>
                                <InputTextarea
                                    value={auditForm.observations}
                                    onChange={(e) => setAuditForm({ ...auditForm, observations: e.target.value })}
                                    rows={4}
                                    className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all p-4 text-secondary-dark text-sm bg-slate-50 border outline-none"
                                    placeholder="Describa los hallazgos aquí..."
                                />
                            </div>

                            {selectedProvider && audits[selectedProvider.id] && (
                                <div className="text-[10px] text-secondary/50 font-medium px-1 flex items-center gap-2">
                                    <i className="pi pi-info-circle"></i>
                                    Última auditoría realizada el {new Date(audits[selectedProvider.id].date).toLocaleDateString()}
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-slate-50/50 border-t border-secondary/10 flex gap-3 mt-auto shrink-0">
                            <button
                                onClick={() => setIsAuditModalOpen(false)}
                                className="flex-1 py-3 bg-white border border-secondary/20 rounded-xl text-secondary font-bold hover:bg-slate-100 transition-all text-xs uppercase tracking-wider"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveAudit}
                                className="flex-[1.5] py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/10 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                            >
                                <i className="pi pi-save"></i>
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            </Dialog>

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
                <div className="px-8 py-6 border-b border-secondary/10 bg-slate-50/50">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <i className="pi pi-chart-bar text-xl"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-secondary-dark text-lg tracking-tight">Tamaño Relativo de Empresa</h3>
                                <p className="text-xs text-secondary">Distribución proporcional del costo operativo.</p>
                            </div>
                        </div>

                        <div className="w-full sm:w-64">
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
                </div>

                {/* BARRA DE FILTROS DEDICADA */}
                <div className="px-6 py-4 bg-white border-b border-secondary/5 flex flex-wrap items-center gap-4 justify-between">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <span className="hidden sm:block text-[10px] font-bold text-secondary uppercase tracking-wider mr-2">Filtrar por Auditoría:</span>

                        {/* VISTA DESKTOP: Pills */}
                        <div className="hidden sm:flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-secondary/5">
                            {[
                                { id: 'TODOS', label: 'Todos', icon: 'pi-filter-slash' },
                                { id: 'PENDIENTE', label: 'Pendientes', icon: 'pi-circle' },
                                { id: 'APROBADO', label: 'Aprobados', icon: 'pi-check-circle' },
                                { id: 'OBSERVADO', label: 'Observados', icon: 'pi-exclamation-triangle' },
                            ].map(stat => (
                                <button
                                    key={stat.id}
                                    onClick={() => setStatusFilter(stat.id)}
                                    className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-2 ${statusFilter === stat.id ? 'bg-white text-primary shadow-sm border border-secondary/10' : 'text-secondary hover:text-secondary-dark hover:bg-white/50'}`}
                                >
                                    <i className={`pi ${stat.icon} text-[10px]`}></i>
                                    {stat.label}
                                </button>
                            ))}
                        </div>

                        {/* VISTA MOBILE: Selector de Filtro Limpio */}
                        <div className="sm:hidden flex items-center w-full bg-white rounded-xl border border-secondary/10 shadow-sm overflow-hidden h-11">
                            <div className="px-3 border-r border-secondary/5 bg-slate-50/50 h-full flex items-center shrink-0">
                                <span className="text-[9px] font-black text-secondary/40 uppercase tracking-tighter">Filtrar</span>
                            </div>
                            <Dropdown
                                value={statusFilter}
                                options={[
                                    { id: 'TODOS', label: 'Todos los registros', icon: 'pi-filter-slash' },
                                    { id: 'PENDIENTE', label: 'Pendientes', icon: 'pi-circle' },
                                    { id: 'APROBADO', label: 'Aprobados', icon: 'pi-check-circle' },
                                    { id: 'OBSERVADO', label: 'Observados', icon: 'pi-exclamation-triangle' },
                                ]}
                                onChange={(e) => setStatusFilter(e.value)}
                                optionLabel="label"
                                optionValue="id"
                                className="flex-1 border-none bg-transparent"
                                pt={{
                                    root: { className: 'h-full flex items-center px-3 border-none shadow-none focus-within:ring-0 outline-none' },
                                    label: { className: 'text-secondary-dark font-bold text-[9px] p-0 uppercase' },
                                    trigger: { className: 'text-primary' },
                                    input: { className: 'outline-none border-none border-0' }
                                }}
                                valueTemplate={(option) => {
                                    const selected = [
                                        { id: 'TODOS', label: 'Todos', icon: 'pi-filter-slash' },
                                        { id: 'PENDIENTE', label: 'Pendientes', icon: 'pi-circle' },
                                        { id: 'APROBADO', label: 'Aprobados', icon: 'pi-check-circle' },
                                        { id: 'OBSERVADO', label: 'Observados', icon: 'pi-exclamation-triangle' },
                                    ].find(o => o.id === statusFilter);
                                    return (
                                        <div className="flex items-center gap-2">
                                            <i className={`pi ${selected?.icon || 'pi-filter'} text-[10px] text-primary`}></i>
                                            <span className="text-secondary-dark text-[9px] font-bold uppercase">{selected?.label || 'Todos'}</span>
                                        </div>
                                    );
                                }}
                            />
                        </div>
                    </div>

                    <div className="text-[11px] font-bold text-secondary flex items-center gap-2 ml-auto sm:ml-0">
                        <i className="pi pi-info-circle"></i>
                        Vencimiento: {AUDIT_VALIDITY_DAYS} días
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] uppercase font-bold text-secondary bg-slate-50 border-b border-secondary/10 sticky top-0 z-30">
                            <tr>
                                <th className="px-3 py-3 sticky left-0 bg-white z-40 w-32 whitespace-normal leading-tight shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-secondary/5">Proveedor</th>
                                <th className="px-1.5 py-3 text-right leading-tight">Personas</th>
                                <th className="px-1.5 py-3 text-right leading-tight">Vehículo</th>
                                <th className="px-1.5 py-3 text-right leading-tight">Camión</th>
                                <th className="px-1.5 py-3 text-right leading-tight">Grúas hasta<br />25Tn</th>
                                <th className="px-1.5 py-3 text-right leading-tight">Grúas<br />{'>'} 25Tn</th>
                                <th className="px-2 py-3 text-right bg-primary/5 text-primary">SUBTOTAL</th>
                                <th className="px-4 py-3 text-center">AUDITORÍA</th>
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
                                            className="px-3 py-3 font-bold text-primary hover:underline cursor-pointer sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-20 border-r border-secondary/5 text-sm whitespace-normal leading-snug shadow-[2px_0_5px_rgba(0,0,0,0.05)]"
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
                                        <td className="px-4 py-3">
                                            <div
                                                className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-white border border-secondary/5 hover:border-primary/30 rounded-lg p-1.5 transition-all cursor-pointer group/audit shadow-sm"
                                                onClick={() => handleOpenAudit(p)}
                                                title={p.audit.label === 'OBSERVADO' ? audits[p.id]?.observations : 'Realizar Auditoría'}
                                            >
                                                <i className={`pi ${p.audit.icon} ${p.audit.color} text-base`}></i>
                                                <div className="flex flex-col items-center">
                                                    {audits[p.id] && <span className="text-[9px] text-secondary font-bold mb-0.5">{new Date(audits[p.id].date).toLocaleDateString()}</span>}
                                                    <span className={`text-[9px] font-black uppercase leading-none ${p.audit.color}`}>{p.audit.label}</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* BARRA DE TOTALES FIJA (COMPACTA) */}
                <div className="bg-secondary-dark text-white px-6 py-3 flex flex-row justify-between items-center gap-4 shadow-[0_-4px_15px_rgba(0,0,0,0.15)] z-30 sticky bottom-0 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                            <i className="pi pi-calculator text-sm"></i>
                        </div>
                        <div>
                            <span className="text-[8px] tracking-[0.2em] uppercase font-black text-white/40 block leading-none mb-0.5">Resultado Final</span>
                            <span className="text-[11px] font-black tracking-widest uppercase text-white/90">Total Consolidado</span>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2 bg-white/5 px-4 py-1.5 rounded-lg border border-white/10 shadow-inner">
                        <span className="text-[9px] text-white/30 font-black tracking-tighter uppercase">ARS</span>
                        <span className="text-base font-bold tabular-nums tracking-normal text-white/90">
                            {formatCurrency(calculatedData.reduce((acc, p) => acc + (viewMode === 'Anual' ? p.subTotalAnual : viewMode === 'Mensual' ? p.subTotalMensual : p.subTotalDiario), 0))}
                        </span>
                    </div>
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
                    {/* <div className="flex flex-wrap gap-2 pt-2">
                        {[`Días: ${activeParams.jornada.diasMes}`, `h/Día: ${activeParams.jornada.horasDiaria}`].map(tag => (
                            <span key={tag} className="text-[10px] font-bold bg-slate-100 text-secondary-dark px-3 py-1 rounded-md uppercase">{tag}</span>
                        ))}
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default TechnicalAudit;

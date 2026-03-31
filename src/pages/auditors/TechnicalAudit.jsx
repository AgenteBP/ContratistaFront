import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { auditorService } from '../../services/auditorService';
import { supplierService } from '../../services/supplierService';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import SelectionToggle from '../../components/ui/SelectionToggle';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { StatusBadge } from '../../components/ui/Badges';
import { TbBackhoe } from 'react-icons/tb';

const AUDIT_VALIDITY_DAYS = 30;

const JORNADA_LABELS = {
    hour: 'Horas / Día',
    dayMonth: 'Días / Mes',
    monthYear: 'Meses / Año',
};

const AFECTACION_LABELS = {
    staff: 'Personal',
    vehicle: 'Vehículo',
    truck: 'Camión',
    craneUnder25t: 'Grúa hasta 25Tn',
    craneOver25t: 'Grúa > 25Tn',
};

const BAREMOS_ROOT_LABELS = {
    staff: 'Personal',
    vehicle: 'Vehículo',
    truck: 'Camión',
    craneUnder25t: 'Grúa hasta 25Tn',
    craneOver25t: 'Grúa > 25Tn',
};

const DOC_STATUS_BADGE = {
    EN_REVISION:     { label: 'EN REVISIÓN',  cls: 'bg-warning/10 text-warning border-warning/20' },
    HABILITADO:      { label: 'HABILITADO',   cls: 'bg-success/10 text-success border-success/20' },
    CON_OBSERVACION: { label: 'OBSERVADO',    cls: 'bg-warning/10 text-warning border-warning/20' },
    COMPLETA:        { label: 'COMPLETO',     cls: 'bg-success/10 text-success border-success/20' },
    PENDIENTE:       { label: 'PENDIENTE',    cls: 'bg-secondary/10 text-secondary border-secondary/20' },
};
const getDocStatusBadge = (status) =>
    DOC_STATUS_BADGE[status] || { label: status || '—', cls: 'bg-slate-100 text-secondary border-secondary/10' };

const TechnicalAudit = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Configuración de Baremos
    const [params, setParams] = useState({
        jornada: { hour: 8, dayMonth: 22.5, monthYear: 12 },
        afectacion: { staff: 5, vehicle: 5, truck: 0.2, craneUnder25t: 4, craneOver25t: 0.1 },
        baremos: {
            staffMonth: 1366320, vehicleMonth: 1870000, truckMonth: 4165000,
            craneUnder25tMonth: 5100000, craneOver25tMonth: 7000000,
            staffHour: 7590.67, vehicleHour: 10388.89, truckHour: 23138.89,
            craneUnder25tHour: 28333.33, craneOver25tHour: 38888.89,
            staffAnnual: 16395840, vehicleAnnual: 22440000, truckAnnual: 49800000,
            craneUnder25tAnnual: 61200000, craneOver25tAnnual: 84000000,
        }
    });
    const [paramsLoading, setParamsLoading] = useState(true);
    const [providers, setProviders] = useState([]);

    // Auditorías (Simulando Backend)
    const [audits, setAudits] = useState(() => {
        const saved = localStorage.getItem('technical_audits_v1');
        return saved ? JSON.parse(saved) : {};
    });

    const [tempParams, setTempParams] = useState(params);
    const [baremosTab, setBaremosTab] = useState('Mensual');
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
    const [supplierResources, setSupplierResources] = useState(null);
    const [supplierResourcesLoading, setSupplierResourcesLoading] = useState(false);
    const [isLastAuditOpen, setIsLastAuditOpen] = useState(false);
    const [expandedModalItems, setExpandedModalItems] = useState(new Set());

    const toggleModalItem = (id) => setExpandedModalItems(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    const loadConfig = useCallback(async () => {
        setParamsLoading(true);
        try {
            const [workingDay, dailyAffect, costScale, suppliersRaw, allSuppliers] = await Promise.all([
                auditorService.getTypicalWorkingDay(),
                auditorService.getDailyAffect(),
                auditorService.getCostScale(),
                auditorService.getWithAuditTecReq(),
                supplierService.getAll().catch(() => []),
            ]);
            setParams({
                jornada: workingDay,
                afectacion: dailyAffect,
                baremos: costScale,
            });
            const cuitMap = {};
            (allSuppliers || []).forEach(s => {
                if (s.id_supplier || s.idSupplier) {
                    cuitMap[(s.id_supplier || s.idSupplier)] = s.cuit;
                }
            });
            setProviders(suppliersRaw.map(s => ({
                id: s.id_supplier,
                name: s.fantasy_name || s.company_name,
                // Ficha fields
                companyName: s.company_name,
                cuit: s.cuit || cuitMap[s.id_supplier],
                tipoPersona: s.type_person,
                clasificacionAFIP: s.classification_afip,
                servicio: s.category_service,
                email: s.email_corporate,
                telefono: s.phone,
                empleadorAFIP: !!s.is_an_afip_employer,
                esTemporal: !!s.is_temporary_hiring,
                estado: s.active === 0 ? 'ACTIVO' : (s.active === 1 ? 'INACTIVO' : 'SUSPENDIDO'),
                provincia: s.province,
                localidad: s.city,
                resources: {
                    personal: s.amount_employees || 0,
                    vehiculo: s.amount_vehicles_no_trucks || 0,
                    camion: s.amount_trucks || 0,
                    grua25: s.amount_cranes_small || 0,
                    gruaMas25: s.amount_cranes_large || 0,
                },
                lastAudit: s.date_history_tec ? {
                    date: s.date_history_tec,
                    techniqueSurpassed: s.technique_surpassed,
                    commentary: s.commentary,
                } : null,
            })));
        } catch (err) {
            console.error('Error cargando configuración técnica:', err);
        } finally {
            setParamsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadConfig();
    }, [loadConfig]);

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
        setIsLastAuditOpen(false);
        setExpandedModalItems(new Set());
        setIsAuditModalOpen(true);

        setSupplierResources(null);
        setSupplierResourcesLoading(true);
        auditorService.getElementsBySupplierForAuditTec(provider.id)
            .then(data => setSupplierResources(data))
            .catch(err => console.error('Error cargando recursos del proveedor:', err))
            .finally(() => setSupplierResourcesLoading(false));
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

    const handleSaveAudit = async () => {
        const payload = {
            idCompany: supplierResources?.id_group,
            idSupplier: selectedProvider.id,
            idAuditor: user?.auditors?.[0]?.id_auditor,
            techniqueSurpassed: auditForm.status === 'APROBADO',
            commentary: auditForm.observations,
            dateHistoryTec: new Date().toISOString(),
        };
        console.log('[AuditTec] payload:', payload);
        try {
            await auditorService.saveAuditTechnique(payload);
        } catch (err) {
            console.error('Error guardando auditoría técnica:', err);
        }
        saveAuditToBackend(selectedProvider.id, auditForm);
        setIsAuditModalOpen(false);
    };

    const getAuditStatus = (provider) => {
        const local = audits[provider.id];
        const backend = provider.lastAudit;

        let source = null;
        if (local && backend) {
            source = new Date(local.date) >= new Date(backend.date)
                ? { date: local.date, status: local.status }
                : { date: backend.date, status: backend.techniqueSurpassed ? 'APROBADO' : 'OBSERVADO' };
        } else if (local) {
            source = { date: local.date, status: local.status };
        } else if (backend) {
            source = { date: backend.date, status: backend.techniqueSurpassed ? 'APROBADO' : 'OBSERVADO' };
        }

        if (!source) return { label: 'PENDIENTE', icon: 'pi-circle', color: 'text-secondary/40', date: null };

        const daysSince = (new Date() - new Date(source.date)) / (1000 * 60 * 60 * 24);
        if (daysSince > AUDIT_VALIDITY_DAYS) return { label: 'VENCIDO', icon: 'pi-clock', color: 'text-warning', date: source.date };
        if (source.status === 'OBSERVADO') return { label: 'OBSERVADO', icon: 'pi-exclamation-triangle', color: 'text-warning', date: source.date };
        return { label: 'APROBADO', icon: 'pi-check-circle', color: 'text-success', date: source.date };
    };

    const calculatedData = useMemo(() => {
        let data = providers.map(p => {
            const getHourlyRef = (monthKey) => {
                const mesConfig = params.jornada.dayMonth || 22.5;
                const hsConfig = params.jornada.hour || 8;
                return (params.baremos[monthKey] || 0) / (mesConfig * hsConfig);
            };

            const itemDailyCosts = {
                personal: p.resources.personal * getHourlyRef('staffMonth') * (params.afectacion.staff || 0),
                vehiculo: p.resources.vehiculo * getHourlyRef('vehicleMonth') * (params.afectacion.vehicle || 0),
                camion: p.resources.camion * getHourlyRef('truckMonth') * (params.afectacion.truck || 0),
                grua25: p.resources.grua25 * getHourlyRef('craneUnder25tMonth') * (params.afectacion.craneUnder25t || 0),
                gruaMas25: p.resources.gruaMas25 * getHourlyRef('craneOver25tMonth') * (params.afectacion.craneOver25t || 0),
            };

            const subTotalDiario = Object.values(itemDailyCosts).reduce((a, b) => a + b, 0);
            const subTotalMensual = subTotalDiario * (params.jornada.dayMonth || 22.5);
            const subTotalAnual = subTotalMensual * 12;

            return {
                ...p,
                itemDailyCosts,
                subTotalDiario,
                subTotalMensual,
                subTotalAnual,
                audit: getAuditStatus(p)
            };
        });

        if (statusFilter !== 'TODOS') {
            data = data.filter(d => d.audit.label === statusFilter);
        }

        return data;
    }, [params, audits, statusFilter, providers]);

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

    const handleSaveConfig = async () => {
        try {
            await Promise.all([
                auditorService.updateTypicalWorkingDay(tempParams.jornada),
                auditorService.updateDailyAffect(tempParams.afectacion),
                auditorService.updateCostScale(tempParams.baremos),
            ]);
            setParams(tempParams);
            setIsConfigOpen(false);
        } catch (err) {
            console.error('Error guardando configuracion tecnica:', err);
        }
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
                                                const diasMes = activeParams.jornada.dayMonth || 22.5;
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
                                        <span className="text-secondary-dark text-sm font-black leading-none">
                                            {supplierResources
                                                ? ({ personal: supplierResources.personas, vehiculo: supplierResources.vehiculos, camion: supplierResources.camiones, grua25: supplierResources.gruas_hasta_25tn, gruaMas25: supplierResources.gruas_mayores_25tn }[modalTab] || []).length
                                                : selectedProvider?.resources[modalTab] || 0}
                                        </span>
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
                                            <th className="px-4 py-3 font-bold">{modalTab === 'personal' ? 'NOMBRE' : 'MARCA'} <i className="pi pi-sort-alt ml-1 text-secondary/40"></i></th>
                                            <th className="px-4 py-3 font-bold">{modalTab === 'personal' ? 'CATEGORÍA' : 'MODELO'} <i className="pi pi-sort-alt ml-1 text-secondary/40"></i></th>
                                            <th className="px-4 py-3 font-bold">TIPO <i className="pi pi-sort-alt ml-1 text-secondary/40"></i></th>
                                            <th className="px-4 py-3 font-bold text-center">ESTADO <i className="pi pi-sort-alt ml-1 text-secondary/40"></i></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-secondary/5">
                                        {(() => {
                                            if (supplierResourcesLoading) {
                                                return (
                                                    <tr>
                                                        <td colSpan="5" className="py-12 text-center text-secondary/40 text-xs">
                                                            <i className="pi pi-spin pi-spinner mr-2"></i>Cargando recursos...
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                            const tabDataMap = {
                                                personal: supplierResources?.personas || [],
                                                vehiculo: supplierResources?.vehiculos || [],
                                                camion: supplierResources?.camiones || [],
                                                grua25: supplierResources?.gruas_hasta_25tn || [],
                                                gruaMas25: supplierResources?.gruas_mayores_25tn || [],
                                            };
                                            const items = tabDataMap[modalTab] || [];
                                            if (items.length === 0) {
                                                return (
                                                    <tr>
                                                        <td colSpan="5" className="py-12 text-center text-secondary/40 text-xs">
                                                            No hay registros para este recurso.
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                            const isPersonal = modalTab === 'personal';
                                            const isMachinery = modalTab === 'grua25' || modalTab === 'gruaMas25';
                                            return items.flatMap((item) => {
                                                const badge = getDocStatusBadge(item.data?.docStatus);
                                                const isItemExpanded = expandedModalItems.has(item.id_elements);
                                                const docStatus = item.data?.docStatus;
                                                const estado = item.data?.estado || 'ACTIVO';

                                                // Ficha panel — rendered per resource type
                                                const fichaPanel = isPersonal ? (
                                                    // ---- EMPLEADO ----
                                                    <div className="bg-secondary-light/30 border-t border-secondary/10 p-5 shadow-inner animate-fade-in">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-secondary/10 text-primary">
                                                                <i className="pi pi-user text-xl"></i>
                                                            </div>
                                                            <div>
                                                                <h5 className="font-bold text-secondary-dark text-sm">Ficha de Legajo</h5>
                                                                <p className="text-[10px] text-secondary uppercase tracking-wider font-medium">
                                                                    {`${item.data?.nombre || ''} ${item.data?.apellido || ''}`.trim()} | Legajo {item.data?.legajo || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            <div className="space-y-3">
                                                                <h6 className="text-[10px] font-bold text-secondary-dark/40 uppercase tracking-widest border-b border-secondary/10 pb-1">Datos Personales</h6>
                                                                <div><span className="block text-[10px] text-secondary font-bold uppercase">Nombre Completo</span><span className="text-sm font-medium text-secondary-dark">{`${item.data?.nombre || ''} ${item.data?.apellido || ''}`.trim() || 'N/A'}</span></div>
                                                                <div><span className="block text-[10px] text-secondary font-bold uppercase">DNI</span><span className="text-sm font-mono text-secondary-dark">{item.data?.dni || 'N/A'}</span></div>
                                                                <div><span className="block text-[10px] text-secondary font-bold uppercase">Puesto</span><span className="text-sm font-medium text-secondary-dark">{item.data?.servicio || item.data?.puesto || item.active?.description || 'N/A'}</span></div>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <h6 className="text-[10px] font-bold text-secondary-dark/40 uppercase tracking-widest border-b border-secondary/10 pb-1">Estado de Control</h6>
                                                                <div className="flex flex-col gap-2.5 pt-1">
                                                                    <div>
                                                                        <span className="block text-[10px] text-secondary font-bold uppercase mb-1">Estado Adm:</span>
                                                                        <StatusBadge status={estado} />
                                                                    </div>
                                                                    <div>
                                                                        <span className="block text-[10px] text-secondary font-bold uppercase mb-1">Documentación:</span>
                                                                        <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-white border border-secondary/10">
                                                                            <span className={`w-1.5 h-1.5 rounded-full ${docStatus === 'HABILITADO' ? 'bg-success shadow-[0_0_5px_rgba(34,197,94,0.4)]' : 'bg-danger'}`}></span>
                                                                            <span className={`text-[10px] font-bold ${docStatus === 'HABILITADO' ? 'text-success' : 'text-danger'}`}>{docStatus || 'NO HABILITADO'}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <h6 className="text-[10px] font-bold text-secondary-dark/40 uppercase tracking-widest border-b border-secondary/10 pb-1">Vinculación</h6>
                                                                <div><span className="block text-[10px] text-secondary font-bold uppercase">Área Operativa</span><span className="text-sm font-medium text-secondary-dark">{item.data?.area || 'N/A'}</span></div>
                                                                <div><span className="block text-[10px] text-secondary font-bold uppercase">Teléfono</span><span className="text-sm font-medium text-secondary-dark">{item.data?.telefono || 'N/A'}</span></div>
                                                                <div><span className="block text-[10px] text-secondary font-bold uppercase">¿Es Chofer?</span><span className="text-sm font-medium text-secondary-dark">{item.data?.esChofer ? 'SÍ' : 'NO'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : isMachinery ? (
                                                    // ---- MAQUINARIA / GRÚA ----
                                                    <div className="bg-secondary-light/30 border-t border-secondary/10 p-5 shadow-inner animate-fade-in">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-secondary/10 text-primary">
                                                                <TbBackhoe className="text-4xl" />
                                                            </div>
                                                            <div>
                                                                <h5 className="font-bold text-secondary-dark text-sm">Ficha Técnica de Maquinaria</h5>
                                                                <p className="text-[10px] text-secondary uppercase tracking-wider font-medium">
                                                                    {item.data?.nombre || item.active?.description} | Serie {item.data?.serie || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            <div className="space-y-3">
                                                                <h6 className="text-[10px] font-bold text-secondary-dark/40 uppercase tracking-widest border-b border-secondary/10 pb-1">Identificación Técnica</h6>
                                                                <div><span className="block text-[10px] text-secondary font-bold uppercase">Descripción</span><span className="text-sm font-medium text-secondary-dark">{item.data?.nombre || item.active?.description || 'N/A'}</span></div>
                                                                <div><span className="block text-[10px] text-secondary font-bold uppercase">Marca / Modelo</span><span className="text-sm font-medium text-secondary-dark">{item.data?.marca || 'N/A'} {item.data?.modelo || ''}</span></div>
                                                                <div><span className="block text-[10px] text-secondary font-bold uppercase">Nº Serie</span><span className="text-sm font-mono text-secondary-dark">{item.data?.serie || 'N/A'}</span></div>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <h6 className="text-[10px] font-bold text-secondary-dark/40 uppercase tracking-widest border-b border-secondary/10 pb-1">Estado de Control</h6>
                                                                <div className="flex flex-col gap-2.5 pt-1">
                                                                    <div>
                                                                        <span className="block text-[10px] text-secondary font-bold uppercase mb-1">Estado Adm:</span>
                                                                        <StatusBadge status={estado} />
                                                                    </div>
                                                                    <div>
                                                                        <span className="block text-[10px] text-secondary font-bold uppercase mb-1">Documentación:</span>
                                                                        <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-white border border-secondary/10">
                                                                            <span className={`w-1.5 h-1.5 rounded-full ${docStatus === 'HABILITADO' ? 'bg-success shadow-[0_0_5px_rgba(34,197,94,0.4)]' : 'bg-danger'}`}></span>
                                                                            <span className={`text-[10px] font-bold ${docStatus === 'HABILITADO' ? 'text-success' : 'text-danger'}`}>{docStatus || 'NO HABILITADO'}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <h6 className="text-[10px] font-bold text-secondary-dark/40 uppercase tracking-widest border-b border-secondary/10 pb-1">Pertenencia</h6>
                                                                <div><span className="block text-[10px] text-secondary font-bold uppercase">Tipo de Equipo</span><span className="text-sm font-medium text-secondary-dark">{item.active?.description || 'N/A'}</span></div>
                                                                <div><span className="block text-[10px] text-secondary font-bold uppercase">ID Interno</span><span className="text-xs font-mono text-secondary-dark bg-white px-1.5 py-0.5 rounded border border-secondary/10">MAQ-{String(item.id_elements).padStart(4, '0')}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // ---- VEHÍCULO / CAMIÓN ----
                                                    <div className="bg-secondary-light/30 border-t border-secondary/10 p-5 shadow-inner animate-fade-in">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-secondary/10 text-primary">
                                                                <i className="pi pi-car text-xl"></i>
                                                            </div>
                                                            <div>
                                                                <h5 className="font-bold text-secondary-dark text-sm">Ficha Técnica del Vehículo</h5>
                                                                <p className="text-[10px] text-secondary uppercase tracking-wider font-medium">
                                                                    Patente {item.data?.patente || 'N/A'} | {item.data?.marca || ''} {item.data?.modelo || ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            <div className="space-y-3">
                                                                <h6 className="text-[10px] font-bold text-secondary-dark/40 uppercase tracking-widest border-b border-secondary/10 pb-1">Especificaciones</h6>
                                                                <div><span className="block text-[10px] text-secondary font-bold uppercase">Marca / Modelo</span><span className="text-sm font-medium text-secondary-dark">{item.data?.marca || 'N/A'} {item.data?.modelo || ''}</span></div>
                                                                <div><span className="block text-[10px] text-secondary font-bold uppercase">Año fabricación</span><span className="text-sm font-medium text-secondary-dark">{item.data?.anio || 'N/A'}</span></div>
                                                                <div><span className="block text-[10px] text-secondary font-bold uppercase">Tipo de unidad</span><span className="text-sm font-medium text-secondary-dark">{item.active?.description || 'N/A'}</span></div>
                                                                <div><span className="block text-[10px] text-secondary font-bold uppercase">Combustible</span><span className="text-sm font-medium text-secondary-dark">{item.data?.tipoCombustible || 'N/A'}</span></div>
                                                                {item.data?.categoriaVehiculo && <div><span className="block text-[10px] text-secondary font-bold uppercase">Categoría</span><span className="text-sm font-medium text-secondary-dark">{item.data.categoriaVehiculo}</span></div>}
                                                                {item.data?.capacidadCarga && <div><span className="block text-[10px] text-secondary font-bold uppercase">Capacidad de Carga</span><span className="text-sm font-medium text-secondary-dark">{item.data.capacidadCarga}</span></div>}
                                                                {item.data?.cantidadAsientos && <div><span className="block text-[10px] text-secondary font-bold uppercase">Cant. Asientos</span><span className="text-sm font-medium text-secondary-dark">{item.data.cantidadAsientos}</span></div>}
                                                            </div>
                                                            <div className="space-y-3">
                                                                <h6 className="text-[10px] font-bold text-secondary-dark/40 uppercase tracking-widest border-b border-secondary/10 pb-1">Estado de Control</h6>
                                                                <div className="flex flex-col gap-2.5 pt-1">
                                                                    <div>
                                                                        <span className="block text-[10px] text-secondary font-bold uppercase mb-1">Estado Adm:</span>
                                                                        <StatusBadge status={estado} />
                                                                    </div>
                                                                    <div>
                                                                        <span className="block text-[10px] text-secondary font-bold uppercase mb-1">Documentación:</span>
                                                                        <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-white border border-secondary/10">
                                                                            <span className={`w-1.5 h-1.5 rounded-full ${docStatus === 'HABILITADO' ? 'bg-success shadow-[0_0_5px_rgba(34,197,94,0.4)]' : 'bg-danger'}`}></span>
                                                                            <span className={`text-[10px] font-bold ${docStatus === 'HABILITADO' ? 'text-success' : 'text-danger'}`}>{docStatus || 'NO HABILITADO'}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <h6 className="text-[10px] font-bold text-secondary-dark/40 uppercase tracking-widest border-b border-secondary/10 pb-1">Aplicación</h6>
                                                                <div><span className="block text-[10px] text-secondary font-bold uppercase">Servicio</span><span className="text-sm font-medium text-secondary-dark uppercase">{item.data?.servicio || 'N/A'}</span></div>
                                                                <div><span className="block text-[10px] text-secondary font-bold uppercase">Chofer Asignado</span><span className="text-sm font-medium text-secondary-dark">{item.data?.choferAsignado?.nombre || 'S/A'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );

                                                return [
                                                    <tr key={item.id_elements} className="hover:bg-slate-50 transition-colors group">
                                                        <td className="px-6 py-3 flex items-center gap-3">
                                                            <button
                                                                onClick={() => toggleModalItem(item.id_elements)}
                                                                className="w-4 h-4 flex items-center justify-center text-secondary/30 hover:text-primary transition-colors shrink-0"
                                                            >
                                                                <i className={`pi pi-chevron-right text-[9px] transition-transform duration-200 ${isItemExpanded ? 'rotate-90' : ''}`}></i>
                                                            </button>
                                                            <span className="font-bold text-secondary-dark text-sm">
                                                                {isPersonal ? item.data?.dni : item.data?.patente}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-secondary text-xs">
                                                            {isPersonal
                                                                ? `${item.data?.nombre || ''} ${item.data?.apellido || ''}`.trim()
                                                                : item.data?.marca}
                                                        </td>
                                                        <td className="px-4 py-3 text-secondary text-xs">
                                                            {isPersonal ? item.data?.categoria : item.data?.modelo}
                                                        </td>
                                                        <td className="px-4 py-3 text-[10px] text-secondary/50 font-bold uppercase tracking-wider">
                                                            {item.active?.description}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${badge.cls}`}>
                                                                {badge.label}
                                                            </span>
                                                        </td>
                                                    </tr>,
                                                    isItemExpanded && (
                                                        <tr key={`${item.id_elements}_detail`}>
                                                            <td colSpan="5" className="p-0">
                                                                {fichaPanel}
                                                            </td>
                                                        </tr>
                                                    )
                                                ].filter(Boolean);
                                            });
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

                            {(() => {
                                const local = selectedProvider && audits[selectedProvider.id];
                                const backend = selectedProvider?.lastAudit;
                                let auditInfo = null;
                                if (local && backend) {
                                    auditInfo = new Date(local.date) >= new Date(backend.date)
                                        ? { date: local.date, status: local.status, commentary: local.observations }
                                        : { date: backend.date, status: backend.techniqueSurpassed ? 'APROBADO' : 'OBSERVADO', commentary: backend.commentary };
                                } else if (local) {
                                    auditInfo = { date: local.date, status: local.status, commentary: local.observations };
                                } else if (backend) {
                                    auditInfo = { date: backend.date, status: backend.techniqueSurpassed ? 'APROBADO' : 'OBSERVADO', commentary: backend.commentary };
                                }
                                if (!auditInfo) return null;
                                return (
                                    <div className="border border-secondary/10 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setIsLastAuditOpen(v => !v)}
                                            className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <i className="pi pi-history text-primary text-xs"></i>
                                                <span className="text-[10px] font-black text-secondary/60 uppercase tracking-widest">Última auditoría</span>
                                            </div>
                                            <i className={`pi pi-chevron-down text-secondary/40 text-xs transition-transform duration-200 ${isLastAuditOpen ? 'rotate-180' : ''}`}></i>
                                        </button>
                                        {isLastAuditOpen && (
                                            <div className="px-4 py-3 bg-white space-y-3 border-t border-secondary/10">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-secondary/50 font-bold uppercase">Fecha</span>
                                                    <span className="text-xs font-bold text-secondary-dark">{new Date(auditInfo.date).toLocaleDateString('es-AR')}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-secondary/50 font-bold uppercase">Estado</span>
                                                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${auditInfo.status === 'APROBADO' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                                                        {auditInfo.status}
                                                    </span>
                                                </div>
                                                {auditInfo.commentary && (
                                                    <div>
                                                        <span className="text-[10px] text-secondary/50 font-bold uppercase block mb-1">Comentario</span>
                                                        <p className="text-xs text-secondary bg-slate-50 rounded-lg p-2 leading-relaxed">{auditInfo.commentary}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
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
            {isConfigOpen && createPortal(
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
                                {Object.entries(tempParams.jornada)
                                    .filter(([key]) => key !== 'idTypicalWorkingDay')
                                    .map(([key, val]) => (
                                    <div key={key} className="bg-slate-50 p-4 rounded-xl border border-secondary/10">
                                        <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">
                                            {JORNADA_LABELS[key] || key}
                                        </label>
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
                                        {Object.entries(tempParams.afectacion)
                                            .filter(([key]) => key !== 'idDailyAffect')
                                            .map(([key, val]) => (
                                            <div key={key} className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-secondary capitalize">
                                                    {AFECTACION_LABELS[key] || key}
                                                </label>
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
                                    <div className="flex items-center justify-between px-1">
                                        <h4 className="font-bold text-secondary-dark flex items-center gap-2 text-sm uppercase tracking-wide">
                                            <i className="pi pi-wallet text-success"></i>
                                            Baremos
                                        </h4>
                                        <select
                                            value={baremosTab}
                                            onChange={(e) => setBaremosTab(e.target.value)}
                                            className="text-xs font-bold text-secondary-dark bg-slate-50 border border-secondary/20 rounded-lg px-3 py-1.5 outline-none focus:border-primary transition-all cursor-pointer"
                                        >
                                            <option value="Mensual">Mensual</option>
                                            <option value="Hora">Por Hora</option>
                                            <option value="Anual">Anual</option>
                                        </select>
                                    </div>
                                    {baremosTab !== 'Mensual' && (
                                        <p className="text-[10px] text-secondary/50 px-1 flex items-center gap-1">
                                            <i className="pi pi-lock text-[9px]"></i>
                                            Solo lectura — modificar desde Mensual
                                        </p>
                                    )}
                                    <div className="bg-white rounded-xl border border-secondary/10 p-6 space-y-4 shadow-sm">
                                        {Object.entries(tempParams.baremos)
                                            .filter(([key]) => {
                                                if (key === 'idCostScale') return false;
                                                if (baremosTab === 'Mensual') return key.endsWith('Month');
                                                if (baremosTab === 'Hora') return key.endsWith('Hour');
                                                if (baremosTab === 'Anual') return key.endsWith('Annual');
                                                return false;
                                            })
                                            .map(([key, val]) => {
                                                const rootKey = key.replace(/Month$/, '').replace(/Hour$/, '').replace(/Annual$/, '');
                                                const isReadOnly = baremosTab !== 'Mensual';
                                                return (
                                                    <div key={key} className="flex items-center justify-between">
                                                        <label className="text-sm font-medium text-secondary">
                                                            {BAREMOS_ROOT_LABELS[rootKey] || rootKey}
                                                        </label>
                                                        <div className="relative w-32">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary/30 font-bold text-xs">$</span>
                                                            <input
                                                                type="number"
                                                                step="any"
                                                                value={val}
                                                                readOnly={isReadOnly}
                                                                onChange={isReadOnly ? undefined : (e) => handleParamChange('baremos', key, e.target.value)}
                                                                className={`w-full font-bold py-1.5 pl-5 pr-2 rounded-lg border text-right outline-none transition-all text-sm ${isReadOnly ? 'bg-slate-100 border-secondary/5 text-secondary/50 cursor-not-allowed' : 'bg-slate-50 border-secondary/10 text-secondary-dark focus:border-primary'}`}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
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
            , document.body)}

            <PageHeader
                title="Auditoría Técnica"
                subtitle="Determinación de tamaño relativo y supervisión de activos e-contratista."
                actionButton={
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-secondary/10 shadow-sm">
                            <div className="text-right">
                                <span className="block text-[8px] font-bold text-secondary/60 uppercase">Jornada Actual</span>
                                <span className="font-bold text-secondary-dark text-xs">{activeParams.jornada.hour}h × {activeParams.jornada.dayMonth}d</span>
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
                                            onClick={() => navigate(`/proveedores/${p.cuit}`)}
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
                                const scaleFactor = viewMode === 'Anual' ? (activeParams.jornada.dayMonth || 22.5) * 12 :
                                    viewMode === 'Mensual' ? (activeParams.jornada.dayMonth || 22.5) :
                                        1;

                                const totalRow = viewMode === 'Anual' ? p.subTotalAnual :
                                    viewMode === 'Mensual' ? p.subTotalMensual :
                                        p.subTotalDiario;

                                return (
                                    <React.Fragment key={p.id}>
                                    <tr className="hover:bg-slate-50 transition-colors group">
                                        <td
                                            className="px-3 py-3 font-bold sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-20 border-r border-secondary/5 text-sm whitespace-normal leading-snug shadow-[2px_0_5px_rgba(0,0,0,0.05)]"
                                        >
                                            <span
                                                className="text-primary hover:underline cursor-pointer"
                                                onClick={() => navigate(`/proveedores/${p.cuit}`)}
                                            >{p.name}</span>
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
                                                    {p.audit.date && <span className="text-[9px] text-secondary font-bold mb-0.5">{new Date(p.audit.date).toLocaleDateString('es-AR')}</span>}
                                                    <span className={`text-[9px] font-black uppercase leading-none ${p.audit.color}`}>{p.audit.label}</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    </React.Fragment>
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

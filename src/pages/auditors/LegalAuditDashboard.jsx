import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { supplierService } from '../../services/supplierService';
import { auditorService } from '../../services/auditorService';
import { StatusBadge } from '../../components/ui/Badges';
import AppTable from '../../components/ui/AppTable';
import { Column } from 'primereact/column';
import { Sidebar } from 'primereact/sidebar';

import { TbBackhoe } from 'react-icons/tb';
import DocumentEntityTable from '../../components/resources/DocumentEntityTable';
import { useAuth } from '../../context/AuthContext';

const LegalAuditDashboard = () => {
    const navigate = useNavigate();
    const { user, currentRole } = useAuth();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, observed: 0 });

    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [selectedSupplierCuit, setSelectedSupplierCuit] = useState(null);
    const [selectedSupplierName, setSelectedSupplierName] = useState('');
    const [activeModalType, setActiveModalType] = useState('suppliers');
    const [viewMode, setViewMode] = useState('operative'); // 'operative' or 'monthly'
    const [evolutionPerspective, setEvolutionPerspective] = useState('upload'); // 'upload' or 'compliance'

    // --- State for resizeable sidebar ---
    const [sidebarWidth, setSidebarWidth] = useState(null);
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth > 400 && newWidth < window.innerWidth - 50) {
                setSidebarWidth(newWidth);
            }
        };
        const handleMouseUp = () => {
            if (isResizing) {
                setIsResizing(false);
                document.body.style.cursor = 'default';
            }
        };
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async (isRetry = false) => {
        console.log("LegalAuditDashboard: Loading data...", isRetry ? "(Retry)" : "");
        setLoading(true);
        try {
            const data = await supplierService.getAuthorizedSuppliers(user.id, currentRole?.role || currentRole?.name);
            console.log("LegalAuditDashboard: Raw data from API:", data?.length, "suppliers");
            if (data?.length > 0) {
                console.log("LegalAuditDashboard: First supplier raw structure:", JSON.stringify(data[0], null, 2).substring(0, 1000));
            }

            const processedData = data.map(s => {
                // Results to be collected for this supplier
                const results = {
                    legajo: { total: 0, valid: 0, pending: 0 },
                    empleados: { total: 0, valid: 0, pending: 0 },
                    vehiculos: { total: 0, valid: 0, pending: 0 },
                    maquinaria: { total: 0, valid: 0, pending: 0 },
                    pendingAuditDocs: []
                };

                const getCategoryFromType = (typeId, label = '') => {
                    const tid = String(typeId || '');

                    // 1. Strict ID Priorities mapping id_active_type to category
                    if (tid === '5') return 'legajo';
                    if (tid === '1') return 'empleados';
                    if (tid === '2') return 'vehiculos';
                    if (tid === '4') return 'maquinaria';

                    return null;
                };

                const addDocResult = (catKey, status, label, hasFile) => {
                    if (!catKey || !results[catKey]) return;
                    results[catKey].total++;

                    const normalizedStatus = String(status || 'PENDIENTE').toUpperCase().trim();
                    const isApproved = ['APROBADO', 'VIGENTE', 'COMPLETA', 'OK', 'VALIDO', 'ACEPTADO', 'VERIFICADO', 'CONFORME'].some(kw =>
                        normalizedStatus.includes(kw)
                    );

                    if (isApproved) {
                        results[catKey].valid++;
                    } else {
                        results[catKey].pending++;
                        results.pendingAuditDocs.push({ label, status: normalizedStatus, catKey });
                    }

                    if (hasFile) {
                        if (!results[catKey].uploaded) results[catKey].uploaded = 0;
                        results[catKey].uploaded++;
                    }
                };

                const processedDocs = new Set();

                const processDoc = (doc, defaultCat = null) => {
                    if (!doc || processedDocs.has(doc)) return;
                    processedDocs.add(doc);

                    const docTypeId = doc.id_active_type || doc.idActiveType;
                    const docLabel = doc.label || doc.tipo || doc.name || doc.attribute_name || 'Documento sin nombre';
                    const status = doc.audit_info?.audit_status || doc.auditInfo?.auditStatus || doc.estado || doc.status || 'PENDIENTE';
                    const hasFile = !!(doc.archivo || doc.id_file_submitted || doc.idFileSubmitted || doc.file_name || doc.fileName);

                    const finalCat = getCategoryFromType(docTypeId) || defaultCat;
                    if (finalCat) {
                        addDocResult(finalCat, status, docLabel, hasFile);
                    }
                };

                // 1. Process Legajo Documents 
                const legajoDocs = Array.isArray(s.document_supplier?.list) ? s.document_supplier.list : (Array.isArray(s.document_supplier) ? s.document_supplier : []);
                legajoDocs.forEach(doc => processDoc(doc, 'legajo'));

                // 2. Process Resource Documents 
                const elementsArray = Array.isArray(s.elements) ? s.elements : (Array.isArray(s.data?.elements) ? s.data.elements : []);
                elementsArray.forEach(el => {
                    const elType = el.active?.idActiveType || el.active?.id_active_type || el.id_active_type || el.idActiveType;
                    const elLabel = el.active?.label || el.label || el.name || '';
                    const catKey = getCategoryFromType(elType, elLabel);

                    const subDocs = el.files_submitted || el.docs || el.documentos || el.list_requirements || el.listRequirements || [];

                    if (subDocs.length > 0) {
                        subDocs.forEach(doc => processDoc(doc, catKey));
                    } else if (catKey) {
                        // Recurso vacío sin documentos subidos, registramos como pendiente global para la categoría correspondiente
                        addDocResult(catKey, 'PENDIENTE', `Documentación de ${elLabel || 'Recurso'}`, false);
                    }
                });

                // 3. Fallback for any other floating data
                const otherDocs = [];
                if (Array.isArray(s.documentacion)) otherDocs.push(...s.documentacion);
                if (Array.isArray(s.requirements)) otherDocs.push(...s.requirements);
                if (Array.isArray(s.docs)) otherDocs.push(...s.docs);

                otherDocs.forEach(doc => processDoc(doc));

                // Calculate Percentages
                const getPct = (cat) => results[cat].total > 0
                    ? Math.floor((results[cat].valid / results[cat].total) * 100)
                    : null; // Null means N/A

                const getUploadPct = (cat) => results[cat].total > 0
                    ? Math.floor(((results[cat].uploaded || 0) / results[cat].total) * 100)
                    : null;

                const cLegajo = getPct('legajo');
                const cEmpleados = getPct('empleados');
                const cVehiculos = getPct('vehiculos');
                const cMaquinaria = getPct('maquinaria');

                const uLegajo = getUploadPct('legajo');
                const uEmpleados = getUploadPct('empleados');
                const uVehiculos = getUploadPct('vehiculos');
                const uMaquinaria = getUploadPct('maquinaria');

                let totalValidDocs = results.legajo.valid + results.empleados.valid + results.vehiculos.valid + results.maquinaria.valid;
                let totalUploadedDocs = (results.legajo.uploaded || 0) + (results.empleados.uploaded || 0) + (results.vehiculos.uploaded || 0) + (results.maquinaria.uploaded || 0);
                let totalDocs = results.legajo.total + results.empleados.total + results.vehiculos.total + results.maquinaria.total;

                // Weighted Global Score based on absolute docs
                const globalScore = totalDocs > 0 ? Math.floor((totalValidDocs / totalDocs) * 100) : 0;
                const globalUpload = totalDocs > 0 ? Math.floor((totalUploadedDocs / totalDocs) * 100) : 0;

                const hasDebts = results.legajo.pending > 0 || results.empleados.pending > 0 || results.vehiculos.pending > 0 || results.maquinaria.pending > 0;

                if (s.company_name?.includes('Lalo') || s.company_name?.includes('Lucia') || s.company_name?.includes('Lex') || s.company_name?.includes('Prueba')) {
                    console.log(`Debug Supplier ${s.company_name}:`, {
                        results,
                        pcts: { cLegajo, cEmpleados, cVehiculos, cMaquinaria },
                        globalScore,
                        globalUpload,
                        rawSupplierDocs: {
                            doc_supplier: s.document_supplier,
                            docs: s.docs,
                            documentacion: s.documentacion,
                            elements: s.elements
                        }
                    });
                }

                return {
                    ...s,
                    complianceLegajo: cLegajo,
                    complianceEmpleados: cEmpleados,
                    complianceVehiculos: cVehiculos,
                    complianceMaquinaria: cMaquinaria,
                    uploadLegajo: uLegajo,
                    uploadEmpleados: uEmpleados,
                    uploadVehiculos: uVehiculos,
                    uploadMaquinaria: uMaquinaria,
                    global: globalScore,
                    globalUpload: globalUpload,
                    hasDebts,
                    pendingDocuments: results.pendingAuditDocs
                };
            });
            console.log("LegalAuditDashboard: Processed data:", processedData.length);

            setSuppliers(processedData);
            setStats({
                total: processedData.length,
                pending: processedData.filter(s => s.hasDebts).length,
                observed: processedData.filter(s => s.global < 50).length,
                avgCompliance: processedData.length > 0 
                    ? Math.floor(processedData.reduce((acc, s) => acc + s.global, 0) / processedData.length) 
                    : 0,
                avgUpload: processedData.length > 0 
                    ? Math.floor(processedData.reduce((acc, s) => acc + s.globalUpload, 0) / processedData.length) 
                    : 0
            });
        } catch (error) {
            console.error("Error loading dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = {
        compliance: '#10b981', // Emerald 500
        upload: '#0ea5e9',     // Sky 500
        danger: '#ef4444',     // Red 500
        warning: '#f59e0b',    // Amber 500
        success: '#10b981',    // Emerald 500
        info: '#0ea5e9',       // Sky 500
        secondary: '#94a3b8'   // Slate 400
    };

    const getStatusColor = (val, raw = false) => {
        if (val === null || val === undefined) return raw ? '#94a3b8' : 'bg-secondary/20';
        if (val >= 85) return raw ? '#84cc16' : 'bg-[#84cc16]'; // System Success (Lima)
        if (val >= 50) return raw ? '#f59e0b' : 'bg-[#f59e0b]'; // System Warning (Orange)
        return raw ? '#ef4444' : 'bg-[#ef4444]'; // System Danger (Red)
    };

    const getStatusTextColor = (val) => {
        if (val === null || val === undefined) return 'text-secondary';
        if (val >= 85) return 'text-[#84cc16]';
        if (val >= 50) return 'text-[#f59e0b]';
        return 'text-[#ef4444]';
    };

    /**
     * LOGICA DE CALCULOS DE ESTADISTICAS:
     * 1. % CARGA (globalUpload): Representa la cantidad de documentos SUBIDOS vs REQUERIDOS.
     *    Es un indicador de gestión operativa del proveedor (cumplimiento de entrega).
     * 2. % CUMPLIMIENTO (global): Representa la cantidad de documentos APROBADOS vs REQUERIDOS.
     *    Es el indicador real de auditoría legal (validez normativa).
     * 
     * Estos datos provienen del objeto `supplier` (mapeado desde el backend) como:
     * - r.globalUpload: Porcentaje total de carga.
     * - r.global: Porcentaje total de cumplimiento.
     * - r.compliance[Categoria]: Porcentajes específicos por Legajo, Personal, etc.
     */
    const dualComplianceTemplate = (compliance, upload) => {
        if (compliance === null && upload === null) {
            return (
                <div className="flex items-center justify-center opacity-40">
                    <span className="text-[10px] sm:text-xs font-bold text-secondary">N/A</span>
                </div>
            );
        }
        
        const cColor = getStatusColor(compliance, true);
        const uColor = getStatusColor(upload, true);
        const cTextColor = getStatusTextColor(compliance);
        const uTextColor = getStatusTextColor(upload);

        return (
            <div className="flex flex-col gap-1.5 py-1">
                {/* Upload Bar (Carga) - TOP */}
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-secondary/10 rounded-full overflow-hidden min-w-[50px]">
                        <div className="h-full transition-all duration-700" style={{ width: `${upload || 0}%`, backgroundColor: uColor }}></div>
                    </div>
                    <span className={`text-[9px] font-black w-6 text-right ${uTextColor}`}>{upload || 0}%</span>
                </div>
                {/* Compliance Bar (Cumplimiento) - BOTTOM */}
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-secondary/10 rounded-full overflow-hidden min-w-[50px]">
                        <div className="h-full transition-all duration-700" style={{ width: `${compliance || 0}%`, backgroundColor: cColor }}></div>
                    </div>
                    <span className={`text-[9px] font-black w-6 text-right ${cTextColor}`}>{compliance || 0}%</span>
                </div>
            </div>
        );
    };


    const nameTemplate = (rowData) => (
        <div className="flex flex-col">
            <span className="font-bold text-secondary-dark text-sm">{rowData.company_name || rowData.name}</span>
            <span className="text-xs text-secondary font-mono">{rowData.cuit}</span>
        </div>
    );

    const actionTemplate = (rowData) => (
        <button
            onClick={() => {
                setSelectedSupplierCuit(rowData.cuit || rowData.id_supplier || rowData.id);
                setSelectedSupplierName(rowData.company_name || rowData.name || 'Proveedor');
                setActiveModalType('suppliers');
                setSidebarVisible(true);
            }}
            className="text-primary hover:text-white hover:bg-primary border border-primary/20 bg-primary/5 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2"
        >
            <i className="pi pi-folder-open"></i> GESTIONAR
        </button>
    );

    const MonthlyEvolutionTable = () => {
        const months = useMemo(() => {
            const arr = [];
            const date = new Date();
            for (let i = 0; i < 12; i++) {
                const tempDate = new Date(date.getFullYear(), date.getMonth() - i, 1);
                const monthName = tempDate.toLocaleString('es-ES', { month: 'short' }).toUpperCase();
                const yearShort = tempDate.getFullYear().toString().slice(-2);
                arr.push(`${monthName} ${yearShort}`);
            }
            return arr.reverse();
        }, []);
        
        const getCellColor = (val) => {
            if (val === 100) return 'bg-[#84cc16]/10 text-[#84cc16] border-[#84cc16]/20';
            if (val >= 85) return 'bg-[#84cc16]/5 text-[#84cc16] border-[#84cc16]/10';
            if (val >= 50) return 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20';
            if (val === 0) return 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20';
            return 'bg-slate-50 text-slate-400 border-slate-100';
        };

        /**
         * NOTA PARA INTEGRACIÓN FUTURA (DATOS REALES):
         * Cuando el backend proporcione historial real, la estructura esperada por proveedor debería ser:
         * {
         *   ...supplierInfo,
         *   history: [
         *     { month: '2023-10', upload: 85, compliance: 80 },
         *     { month: '2023-11', upload: 90, compliance: 85 },
         *     ... (últimos 12 meses)
         *   ]
         * }
         * 
         * El mapeo en `processedMonthlyData` deberá cambiar de la proyección mock actual 
         * a una búsqueda (find) sobre `s.history` comparando el mes (`m`) con `item.month`.
         */
        const processedMonthlyData = useMemo(() => {
            return suppliers.map(s => ({
                ...s,
                evolution: months.map((m, i) => {
                    const base = evolutionPerspective === 'upload' ? (s.globalUpload || 0) : (s.global || 0);
                    // Proyección hacia atrás (i=0 es el mes más antiguo, i=11 es el actual)
                    const val = Math.max(0, Math.min(100, base - (months.length - 1 - i) * 5 + Math.floor(Math.random() * 5)));
                    return val;
                })
            }));
        }, [suppliers, months, evolutionPerspective]);

        // Evolution table using AppTable for consistency
        return (
            <div className="bg-white rounded-2xl border border-secondary/10 shadow-sm overflow-hidden min-w-0">
                <AppTable
                    value={processedMonthlyData}
                    loading={loading}
                    rows={10}
                    paginator
                    scrollable
                    rowsPerPageOptions={[10, 20, 50]}
                    header={
                        <div className="px-6 py-5 border-b border-secondary/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div>
                                    <span className="font-bold text-secondary-dark uppercase tracking-wider text-xs">Histórico de Evolución</span>
                                    <p className="text-[10px] text-secondary mt-1">Variación mensual de carga y cumplimiento.</p>
                                </div>
                                <div className="flex items-center p-1 bg-secondary/10 rounded-lg border border-secondary/10 whitespace-nowrap">
                                    <button 
                                        onClick={() => setEvolutionPerspective('upload')}
                                        className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${evolutionPerspective === 'upload' ? 'bg-white text-primary shadow-sm' : 'text-secondary hover:text-secondary-dark'}`}
                                    >
                                        <i className="pi pi-cloud-upload mr-1"></i> Carga
                                    </button>
                                    <button 
                                        onClick={() => setEvolutionPerspective('compliance')}
                                        className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${evolutionPerspective === 'compliance' ? 'bg-white text-primary shadow-sm' : 'text-secondary hover:text-secondary-dark'}`}
                                    >
                                        <i className="pi pi-shield mr-1"></i> Cumplimiento
                                    </button>
                                </div>
                            </div>
                            <button className="flex-1 md:flex-none text-secondary-dark bg-white border border-secondary/20 hover:bg-secondary-light font-bold rounded-lg text-xs px-4 py-2.5 transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
                                <i className="pi pi-file-excel text-success"></i> <span className="hidden lg:inline">Exportar Excel</span>
                            </button>
                        </div>
                    }
                    emptyMessage="No hay historial disponible."
                    tableClassName="text-xs"
                    pt={{
                        wrapper: { className: 'overflow-x-auto min-w-0' },
                        table: { className: 'min-w-[1200px]' }
                    }}
                >
                    <Column 
                        header="Proveedor" 
                        body={(r) => (
                            <div className="flex flex-col min-w-[250px]">
                                <span className="font-bold text-secondary-dark text-sm truncate">{r.company_name || r.name}</span>
                                <span className="text-xs text-secondary font-mono tracking-tight">{r.cuit}</span>
                            </div>
                        )}
                        frozen
                        alignFrozen="left"
                        className="sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)] px-6"
                        headerClassName="sticky left-0 bg-slate-50/50 z-20 px-6 border-b border-secondary/5 font-black text-xs text-secondary-dark uppercase tracking-widest"
                    />
                    {months.map((m, monthIdx) => (
                        <Column 
                            key={m}
                            header={m}
                            headerClassName="text-center font-black text-[10px]"
                            body={(r) => (
                                <div className="flex justify-center">
                                    <div className={`px-2 py-1 rounded-lg border text-[10px] font-black min-w-[45px] transition-all text-center ${getCellColor(r.evolution[monthIdx])}`}>
                                        {r.evolution[monthIdx]}%
                                    </div>
                                </div>
                            )}
                            className="text-center"
                        />
                    ))}
                </AppTable>
            </div>
        );
    };

    const navigateSupplier = (direction) => {
        if (!suppliers.length) return;
        const currentIndex = suppliers.findIndex(s => s.cuit === selectedSupplierCuit);
        if (currentIndex === -1) return;

        let nextIndex = currentIndex + direction;

        // Circular navigation
        if (nextIndex < 0) nextIndex = suppliers.length - 1;
        if (nextIndex >= suppliers.length) nextIndex = 0;

        const nextSupplier = suppliers[nextIndex];
        setSelectedSupplierCuit(nextSupplier.cuit);
        setSelectedSupplierName(nextSupplier.company_name || nextSupplier.razonSocial || nextSupplier.name);
        console.log("LegalAuditDashboard: Navigating to", nextSupplier.cuit);
    };

    return (
        <div className="p-4 md:p-8 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
            <PageHeader
                title="Auditoría Legal"
                subtitle="Seguimiento de cumplimiento normativo y documental por proveedor."
                actionButton={
                    <button
                        onClick={() => navigate('/auditoria-legal/inbox')}
                        className="flex items-center gap-2 bg-info h-11 px-5 rounded-xl text-white font-bold shadow-lg shadow-info/20 hover:bg-info-hover transition-all text-xs uppercase"
                    >
                        <i className="pi pi-inbox"></i>
                        <span>Inbox Global</span>
                        <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full">{stats.pending}</span>
                    </button>
                }
            />

            {/* Dashboards View Switcher */}
            <div className="flex items-center p-1 bg-secondary/5 rounded-xl w-fit border border-secondary/10">
                <button 
                    onClick={() => setViewMode('operative')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${viewMode === 'operative' ? 'bg-white text-primary shadow-sm' : 'text-secondary hover:text-secondary-dark'}`}
                >
                    <i className="pi pi-th-large"></i> Tablero Operativo
                </button>
                <button 
                    onClick={() => setViewMode('monthly')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${viewMode === 'monthly' ? 'bg-white text-primary shadow-sm' : 'text-secondary hover:text-secondary-dark'}`}
                >
                    <i className="pi pi-calendar"></i> Evolución Mensual
                </button>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Proveedores', val: stats.total, icon: 'pi-building', color: '#6366f1' }, // Indigo
                    { label: 'Promedio Cumplimiento', val: `${stats.avgCompliance || 0}%`, icon: 'pi-shield', color: stats.avgCompliance >= 85 ? '#84cc16' : stats.avgCompliance >= 50 ? '#f59e0b' : '#ef4444' },
                    { label: 'Promedio Carga', val: `${stats.avgUpload || 0}%`, icon: 'pi-cloud-upload', color: stats.avgUpload >= 85 ? '#84cc16' : stats.avgUpload >= 50 ? '#f59e0b' : '#ef4444' },
                    { label: 'Empresas Críticas', val: stats.observed, icon: 'pi-exclamation-triangle', color: '#ef4444' }
                ].map((s, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-secondary/10 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl text-white flex items-center justify-center text-xl" style={{ backgroundColor: s.color }}>
                            <i className={`pi ${s.icon}`}></i>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-secondary uppercase tracking-widest">{s.label}</span>
                            <span className="text-2xl font-black text-secondary-dark leading-none">{s.val}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Note: Charts were migrated to Home Dashboard per requirement */}

            {/* Main Content Area */}
            {viewMode === 'operative' ? (
                <div className="bg-white rounded-2xl border border-secondary/10 shadow-sm overflow-hidden animate-slide-up">
                    <AppTable
                        value={suppliers}
                        loading={loading}
                        rows={10}
                        paginator
                        header={
                            <div className="px-6 py-4 border-b border-secondary/5 flex items-center justify-between">
                                <span className="font-bold text-secondary-dark uppercase tracking-wider text-xs">Estado de Cumplimiento Legal</span>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-red-500">
                                        <i className="pi pi-circle-fill text-[8px]"></i>
                                        <span className="text-[9px] font-bold uppercase">Crítico</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-amber-500">
                                        <i className="pi pi-circle-fill text-[8px]"></i>
                                        <span className="text-[9px] font-bold uppercase">Atención</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-emerald-500">
                                        <i className="pi pi-circle-fill text-[8px] text-[#84cc16]"></i>
                                        <span className="text-[9px] font-bold uppercase text-[#84cc16]">Al Día</span>
                                    </div>
                                </div>
                            </div>
                        }
                        emptyMessage="No hay proveedores registrados."
                    >
                        <Column header="Proveedor" body={nameTemplate} sortable className="w-[22%] px-6" headerClassName="px-6"></Column>
                        <Column 
                            header={<span className="flex items-center justify-center whitespace-nowrap"><i className="pi pi-briefcase md:hidden text-lg"></i> <span className="hidden md:inline">Legajo</span></span>} 
                            body={(r) => dualComplianceTemplate(r.complianceLegajo, r.uploadLegajo)} 
                            sortable 
                            className="text-center"
                        ></Column>
                        <Column 
                            header={<span className="flex items-center justify-center whitespace-nowrap"><i className="pi pi-users md:hidden text-lg"></i> <span className="hidden md:inline">Personal</span></span>} 
                            body={(r) => dualComplianceTemplate(r.complianceEmpleados, r.uploadEmpleados)} 
                            sortable 
                            className="text-center"
                        ></Column>
                        <Column 
                            header={<span className="flex items-center justify-center whitespace-nowrap"><i className="pi pi-car md:hidden text-lg"></i> <span className="hidden md:inline">Vehículos</span></span>} 
                            body={(r) => dualComplianceTemplate(r.complianceVehiculos, r.uploadVehiculos)} 
                            sortable 
                            className="text-center"
                        ></Column>
                        <Column 
                            header={<span className="flex items-center justify-center whitespace-nowrap"><TbBackhoe className="md:hidden text-xl" /> <span className="hidden md:inline">Maquinaria</span></span>} 
                            body={(r) => dualComplianceTemplate(r.complianceMaquinaria, r.uploadMaquinaria)} 
                            sortable 
                            className="text-center"
                        ></Column>
                        <Column header="Semáforo" body={(r) => {
                            const cHex = getStatusColor(r.global, true);
                            const uHex = getStatusColor(r.globalUpload, true);
                            return (
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-lg border w-full text-center transition-all duration-300 opacity-90"
                                          style={{ backgroundColor: `${uHex}15`, color: uHex, borderColor: `${uHex}30` }}>
                                        {r.globalUpload}% CARGA
                                    </span>
                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-lg border w-full text-center transition-all duration-300 opacity-90"
                                          style={{ backgroundColor: `${cHex}15`, color: cHex, borderColor: `${cHex}30` }}>
                                        {r.global}% CUMP.
                                    </span>
                                </div>
                            );
                        }} sortable className="text-center w-[120px]"></Column>
                        <Column header="Acciones" body={actionTemplate} className="text-right pr-6" headerClassName="text-right pr-6"></Column>
                    </AppTable>
                </div>
            ) : (
                <div className="animate-slide-up">
                    <MonthlyEvolutionTable />
                </div>
            )}

            {/* Sidebar for Documents */}
            <Sidebar
                visible={sidebarVisible}
                position="right"
                onHide={() => setSidebarVisible(false)}
                className={`transition-none ${!sidebarWidth ? 'w-full md:w-[85vw] lg:w-[75vw] xl:w-[65vw]' : ''}`}
                style={sidebarWidth ? { width: `${sidebarWidth}px`, maxWidth: '100vw' } : {}}
                showCloseIcon={true}
                blockScroll={true}
                pt={{
                    root: { className: '!rounded-l-2xl shadow-2xl border-l border-secondary/10 flex flex-col' },
                    content: { className: 'p-0 overflow-y-auto w-full relative' },
                    header: { className: 'px-4 py-3 border-b border-secondary/10 shrink-0' }
                }}
                header={
                    <div className="flex items-center justify-between w-full pr-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <i className="pi pi-building text-xl"></i>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-secondary-dark leading-tight">{selectedSupplierName}</span>
                                <span className="text-secondary text-[10px] uppercase tracking-widest font-bold">Documentación Adjunta</span>
                            </div>
                        </div>

                        {/* Navigation Arrows */}
                        <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-xl border border-secondary/10">
                            <button
                                onClick={() => navigateSupplier(-1)}
                                className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-secondary hover:text-primary hover:shadow-sm transition-all shadow-none border border-secondary/5"
                                title="Proveedor Anterior"
                            >
                                <i className="pi pi-chevron-left text-xs"></i>
                            </button>
                            <div className="px-2 text-[10px] font-black text-secondary/40 uppercase tracking-tighter">
                                Navegar
                            </div>
                            <button
                                onClick={() => navigateSupplier(1)}
                                className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-secondary hover:text-primary hover:shadow-sm transition-all shadow-none border border-secondary/5"
                                title="Siguiente Proveedor"
                            >
                                <i className="pi pi-chevron-right text-xs"></i>
                            </button>
                        </div>
                    </div>
                }
            >
                {/* Drag handle */}
                <div
                    className="absolute top-0 left-0 w-3 h-full cursor-col-resize hover:bg-info/10 z-[100] flex items-center justify-center group"
                    onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
                >
                    <div className="w-1 h-12 bg-secondary/20 rounded-full group-hover:bg-info/50 transition-colors"></div>
                </div>

                <div className="px-2 pb-6 w-full pl-4">
                    {selectedSupplierCuit && (
                        <DocumentEntityTable
                            type={activeModalType}
                            filterStatus="general"
                            explicitCuit={selectedSupplierCuit}
                            onTypeChange={(newType) => setActiveModalType(newType)}
                            onAuditComplete={async () => {
                                console.log("LegalAuditDashboard: Audit recorded, waiting for refresh...");
                                setTimeout(() => {
                                    loadData();
                                }, 800);
                            }}
                        />
                    )}
                </div>
            </Sidebar>
        </div>
    );
};

export default LegalAuditDashboard;

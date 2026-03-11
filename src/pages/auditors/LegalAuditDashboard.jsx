import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { supplierService } from '../../services/supplierService';
import { auditorService } from '../../services/auditorService';
import { StatusBadge } from '../../components/ui/Badges';
import AppTable from '../../components/ui/AppTable';
import { Column } from 'primereact/column';
import { Sidebar } from 'primereact/sidebar';
import { requirementService } from '../../services/requirementService';
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

                const addDocResult = (catKey, status, label) => {
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
                };

                const processedDocs = new Set();

                const processDoc = (doc, defaultCat = null) => {
                    if (!doc || processedDocs.has(doc)) return;
                    processedDocs.add(doc);

                    const docTypeId = doc.id_active_type || doc.idActiveType;
                    const docLabel = doc.label || doc.tipo || doc.name || doc.attribute_name || 'Documento sin nombre';
                    const status = doc.audit_info?.audit_status || doc.auditInfo?.auditStatus || doc.estado || doc.status || 'PENDIENTE';

                    const finalCat = getCategoryFromType(docTypeId) || defaultCat;
                    if (finalCat) {
                        addDocResult(finalCat, status, docLabel);
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
                        addDocResult(catKey, 'PENDIENTE', `Documentación de ${elLabel || 'Recurso'}`);
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

                const cLegajo = getPct('legajo');
                const cEmpleados = getPct('empleados');
                const cVehiculos = getPct('vehiculos');
                const cMaquinaria = getPct('maquinaria');

                let totalValidDocs = results.legajo.valid + results.empleados.valid + results.vehiculos.valid + results.maquinaria.valid;
                let totalDocs = results.legajo.total + results.empleados.total + results.vehiculos.total + results.maquinaria.total;

                // Weighted Global Score based on absolute docs
                const globalScore = totalDocs > 0 ? Math.floor((totalValidDocs / totalDocs) * 100) : 0;

                const hasDebts = results.legajo.pending > 0 || results.empleados.pending > 0 || results.vehiculos.pending > 0 || results.maquinaria.pending > 0;

                if (s.company_name?.includes('Lalo') || s.company_name?.includes('Lucia') || s.company_name?.includes('Lex') || s.company_name?.includes('Prueba')) {
                    console.log(`Debug Supplier ${s.company_name}:`, {
                        results,
                        pcts: { cLegajo, cEmpleados, cVehiculos, cMaquinaria },
                        globalScore,
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
                    global: globalScore,
                    hasDebts,
                    pendingDocuments: results.pendingAuditDocs
                };
            });

            setSuppliers(processedData);
            setStats({
                total: processedData.length,
                pending: processedData.filter(s => s.hasDebts).length,
                observed: processedData.filter(s => s.global < 50).length
            });
        } catch (error) {
            console.error("Error loading dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const complianceTemplate = (val) => {
        if (val === null || val === undefined) {
            return (
                <div className="flex items-center justify-center opacity-40">
                    <span className="text-[10px] sm:text-xs font-bold text-secondary">N/A</span>
                </div>
            );
        }
        const color = val > 80 ? 'bg-success' : val > 50 ? 'bg-warning' : 'bg-danger';
        return (
            <div className="flex items-center justify-center gap-2">
                <div className="hidden md:block flex-1 h-1.5 w-16 bg-secondary/10 rounded-full overflow-hidden">
                    <div className={`h-full ${color}`} style={{ width: `${val}%` }}></div>
                </div>
                <span className={`text-[10px] sm:text-xs font-bold ${color.replace('bg-', 'text-')}`}>{val}%</span>
            </div>
        );
    };

    const nameTemplate = (rowData) => (
        <div className="flex flex-col">
            <span className="font-bold text-secondary-dark text-sm">{rowData.company_name || rowData.name}</span>
            <span className="text-[10px] text-secondary font-mono">{rowData.cuit}</span>
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

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Proveedores', val: stats.total, icon: 'pi-building', color: 'bg-primary' },
                    { label: 'Con Pendientes', val: stats.pending, icon: 'pi-clock', color: 'bg-info' },
                    { label: 'Bajo Cumplimiento', val: stats.observed, icon: 'pi-exclamation-circle', color: 'bg-danger' }
                ].map((s, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-secondary/10 shadow-sm flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${s.color} text-white flex items-center justify-center text-xl`}>
                            <i className={`pi ${s.icon}`}></i>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-secondary uppercase tracking-widest">{s.label}</span>
                            <span className="text-2xl font-black text-secondary-dark leading-none">{s.val}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-2xl border border-secondary/10 shadow-sm overflow-hidden">
                <AppTable
                    value={suppliers}
                    loading={loading}
                    rows={10}
                    paginator
                    header={<div className="px-6 py-4 border-b border-secondary/5 font-bold text-secondary-dark uppercase tracking-wider text-xs">Estado de Cumplimiento Legal</div>}
                    emptyMessage="No hay proveedores registrados."
                >
                    <Column header="Proveedor" body={nameTemplate} sortable className="w-[20%]"></Column>
                    <Column header={<span className="flex items-center justify-center whitespace-nowrap"><i className="pi pi-briefcase md:hidden text-lg"></i> <span className="hidden md:inline">Legajo</span></span>} body={(r) => complianceTemplate(r.complianceLegajo)} sortable className="text-center"></Column>
                    <Column header={<span className="flex items-center justify-center whitespace-nowrap"><i className="pi pi-users md:hidden text-lg"></i> <span className="hidden md:inline">Personal</span></span>} body={(r) => complianceTemplate(r.complianceEmpleados)} sortable className="text-center"></Column>
                    <Column header={<span className="flex items-center justify-center whitespace-nowrap"><i className="pi pi-car md:hidden text-lg"></i> <span className="hidden md:inline">Vehículos</span></span>} body={(r) => complianceTemplate(r.complianceVehiculos)} sortable className="text-center"></Column>
                    <Column header={<span className="flex items-center justify-center whitespace-nowrap"><TbBackhoe className="md:hidden text-xl" /> <span className="hidden md:inline">Maquinaria</span></span>} body={(r) => complianceTemplate(r.complianceMaquinaria)} sortable className="text-center"></Column>
                    <Column header="Semáforo" body={(r) => (
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${r.global > 80 ? 'bg-success/5 text-success border-success/20' :
                            r.global > 50 ? 'bg-warning/5 text-warning border-warning/20' :
                                'bg-danger/5 text-danger border-danger/20'
                            }`}>
                            {r.global > 80 ? 'ÓPTIMO' : r.global > 50 ? 'REGULAR' : 'CRÍTICO'}
                        </span>
                    )} sortable className="text-center"></Column>
                    <Column header="Acciones" body={actionTemplate} className="text-right pr-6" headerClassName="text-right pr-6"></Column>
                </AppTable>
            </div>

            {/* Sidebar for Documents */}
            <Sidebar
                visible={sidebarVisible}
                position="right"
                onHide={() => setSidebarVisible(false)}
                className="w-full md:w-[85vw] lg:w-[75vw] xl:w-[65vw]"
                showCloseIcon={true}
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
                <div className="px-2 pb-6">
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

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { supplierService } from '../../services/supplierService';
import { auditorService } from '../../services/auditorService';
import { StatusBadge } from '../../components/ui/Badges';
import AppTable from '../../components/ui/AppTable';
import { Column } from 'primereact/column';

const LegalAuditDashboard = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, observed: 0 });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // In a real scenario, we might have a specialized endpoint for legal audit dashboard
            // For now, we fetch suppliers and mock compliance data or use existing if available
            const data = await supplierService.getAll();

            // Mocking compliance data for visualization
            const processedData = data.map(s => {
                const complianceEmpresa = Math.floor(Math.random() * 100);
                const complianceRecursos = Math.floor(Math.random() * 100);
                const global = Math.floor((complianceEmpresa + complianceRecursos) / 2);

                return {
                    ...s,
                    complianceEmpresa,
                    complianceRecursos,
                    global,
                    pendingDocuments: Math.floor(Math.random() * 5)
                };
            });

            setSuppliers(processedData);
            setStats({
                total: processedData.length,
                pending: processedData.filter(s => s.pendingDocuments > 0).length,
                observed: processedData.filter(s => s.global < 50).length
            });
        } catch (error) {
            console.error("Error loading dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const complianceTemplate = (val) => {
        const color = val > 80 ? 'bg-success' : val > 50 ? 'bg-warning' : 'bg-danger';
        return (
            <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 w-16 bg-secondary/10 rounded-full overflow-hidden">
                    <div className={`h-full ${color}`} style={{ width: `${val}%` }}></div>
                </div>
                <span className="text-[10px] font-bold text-secondary-dark">{val}%</span>
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
            onClick={() => navigate(`/proveedores/${rowData.cuit || rowData.id_supplier || rowData.id}`)}
            className="text-primary hover:text-white hover:bg-primary border border-primary/20 bg-primary/5 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2"
        >
            <i className="pi pi-folder-open"></i> GESTIONAR
        </button>
    );

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
                    <Column header="Proveedor" body={nameTemplate} sortable className="w-[30%]"></Column>
                    <Column header="Empresa (%)" body={(r) => complianceTemplate(r.complianceEmpresa)} sortable className="text-center"></Column>
                    <Column header="Recursos (%)" body={(r) => complianceTemplate(r.complianceRecursos)} sortable className="text-center"></Column>
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
        </div>
    );
};

export default LegalAuditDashboard;

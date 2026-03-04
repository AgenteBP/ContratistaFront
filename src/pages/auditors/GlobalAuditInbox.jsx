import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { auditorService } from '../../services/auditorService';
import AppTable from '../../components/ui/AppTable';
import { Column } from 'primereact/column';
import { StatusBadge } from '../../components/ui/Badges';

const GlobalAuditInbox = () => {
    const navigate = useNavigate();
    const [pendingDocs, setPendingDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await auditorService.getPendingFiles();
            // Assuming data is an array of objects that include provider info and file info
            // For now, if getPendingFiles returns all audits, we might need to filter for those that need review
            // For mock purposes, we'll map the results to a useful structure

            // MOCK DATA for visualization
            const mockPending = [
                { id: 1, provider: 'Lalo Industries', resource: 'Empresa', doc: 'Seguro de Caución', date: '2024-03-01', waitTime: '2 días', fileId: 101 },
                { id: 2, provider: 'Pepito Holdings', resource: 'Juan Perez (Empleado)', doc: 'Registro Conducir', date: '2024-03-02', waitTime: '1 día', fileId: 102 },
                { id: 3, provider: 'Lalo Industries', resource: 'Camion IVECO', doc: 'VTV', date: '2024-03-03', waitTime: '4 horas', fileId: 103 },
            ];

            setPendingDocs(mockPending);
        } catch (error) {
            console.error("Error loading pending audits", error);
        } finally {
            setLoading(false);
        }
    };

    const actionTemplate = (rowData) => (
        <button
            onClick={() => navigate(`/proveedores/${rowData.providerId || 1}`)} // In a real app we'd target the specific file
            className="bg-info hover:bg-info-hover text-white px-5 py-1.5 rounded-lg text-[10px] font-extrabold transition-all uppercase flex items-center gap-2"
        >
            <i className="pi pi-shield"></i> Auditar
        </button>
    );

    return (
        <div className="p-4 md:p-8 space-y-6 animate-fade-in bg-slate-50 min-h-screen">
            <PageHeader
                title="Inbox de Auditoría Legal"
                subtitle="Todos los documentos pendientes de revisión en un solo lugar."
                backButton={() => navigate('/auditoria-legal')}
            />

            <div className="bg-white rounded-2xl border border-secondary/10 shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-info/5 border-b border-secondary/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <i className="pi pi-info-circle text-info"></i>
                        <span className="text-xs font-bold text-info-dark uppercase tracking-wider">Documentos esperando intervención</span>
                    </div>
                </div>

                <AppTable
                    value={pendingDocs}
                    loading={loading}
                    paginator
                    rows={15}
                    emptyMessage="No hay documentos pendientes de auditoría."
                >
                    <Column field="provider" header="Proveedor" sortable className="font-bold text-secondary-dark"></Column>
                    <Column field="resource" header="Recursos/Ámbito" sortable className="text-secondary"></Column>
                    <Column field="doc" header="Documento" sortable></Column>
                    <Column field="waitTime" header="Tiempo de Espera" body={(r) => (
                        <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100 italic">
                            {r.waitTime}
                        </span>
                    )} sortable></Column>
                    <Column header="Acción" body={actionTemplate} className="text-right pr-6" headerClassName="text-right pr-6"></Column>
                </AppTable>
            </div>
        </div>
    );
};

export default GlobalAuditInbox;

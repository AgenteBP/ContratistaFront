import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { auditorService } from '../../services/auditorService';
import AppTable from '../../components/ui/AppTable';
import { Column } from 'primereact/column';
import { StatusBadge } from '../../components/ui/Badges';
import AuditDocumentModal from '../../components/ui/AuditDocumentModal';

const GlobalAuditInbox = () => {
    const navigate = useNavigate();
    const [pendingDocs, setPendingDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [auditModalVisible, setAuditModalVisible] = useState(false);
    const [auditingDoc, setAuditingDoc] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await auditorService.getPendingFiles();
            setPendingDocs(data);
        } catch (error) {
            console.error("Error loading pending audits", error);
        } finally {
            setLoading(false);
        }
    };

    const openAuditModal = (rowData) => {
        setAuditingDoc(rowData);
        setAuditModalVisible(true);
    };

    const actionTemplate = (rowData) => (
        <button
            onClick={() => openAuditModal(rowData)}
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

            <div className="px-6 py-4 bg-info/5 border border-info/20 rounded-2xl mb-4 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <i className="pi pi-info-circle text-info"></i>
                    <span className="text-xs font-bold text-info-dark uppercase tracking-wider">Documentos esperando intervención</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-secondary/10 shadow-md overflow-hidden">
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
                    <Column field="waitTime" sortField="waitTimeRaw" header="Tiempo de Espera" body={(r) => (
                        <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100 italic">
                            {r.waitTime}
                        </span>
                    )} sortable></Column>
                    <Column header="Acción" body={actionTemplate} className="text-right pr-6" headerClassName="text-right pr-6"></Column>
                </AppTable>
            </div>

            <AuditDocumentModal
                visible={auditModalVisible}
                onHide={() => setAuditModalVisible(false)}
                docData={auditingDoc}
                onAuditComplete={loadData}
            />
        </div>
    );
};

export default GlobalAuditInbox;

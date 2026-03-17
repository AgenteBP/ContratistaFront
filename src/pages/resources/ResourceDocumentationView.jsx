import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import elementService from '../../services/elementService';
import { groupService } from '../../services/groupService';
import { fileService } from '../../services/fileService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import PageHeader from '../../components/ui/PageHeader';
import { DOC_TYPE_LABELS } from '../../data/documentConstants';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

const ResourceDocumentationView = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const { user, isAuditorLegal } = useAuth();
    const { showSuccess, showError, showWarn } = useNotification();
    
    const [resource, setResource] = useState(null);
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingDocs, setLoadingDocs] = useState({});

    // Mapping type to active category ID
    const typeMap = {
        'empleado': 1,
        'vehiculo': 2,
        'maquinaria': 3
    };

    const categoryId = typeMap[type] || 2;

    useEffect(() => {
        loadData();
    }, [id, type]);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Get resource details
            const resData = await elementService.getById(id);
            setResource(resData);

            // 2. Get requirements and files for this specific element
            const groupReqs = await groupService.getByElement(id);
            
            const mappedReqs = groupReqs.map(req => {
                const listReq = req.list_requirements || req.listRequirements;
                const attrTempl = listReq?.attribute_template || listReq?.attributeTemplate;
                const attrId = attrTempl?.attributes?.id_attributes || attrTempl?.attributes?.idAttributes;
                
                // The new endpoint returns files directly in req.list_requirements.files
                const submittedFiles = listReq?.files || [];
                // We show the latest non-forwarded file (already filtered and sorted in backend)
                const submittedFile = submittedFiles.length > 0 ? submittedFiles[0] : null;
                
                return {
                    ...req,
                    submittedFile,
                    label: listReq?.description || attrTempl?.attributes?.description || 'Documento',
                    attributeId: attrId
                };
            });
            
            setRequirements(mappedReqs);
        } catch (err) {
            console.error("Error loading resource documentation:", err);
            showError("Error al cargar la documentación del recurso.");
        } finally {
            setLoading(false);
        }
    };

    const handleViewFile = async (submittedFile) => {
        const fileId = submittedFile?.id_file_submitted || submittedFile?.idFileSubmitted;
        if (!fileId) return;

        try {
            setLoadingDocs(prev => ({ ...prev, [fileId]: true }));
            const fileBlob = await fileService.getFile(fileId);

            if (fileBlob && fileBlob.size > 0) {
                const blobUrl = URL.createObjectURL(fileBlob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(blobUrl);
                }, 1000);
            } else {
                showWarn('El archivo no tiene contenido para visualizar.');
            }
        } catch (error) {
            console.error('Error descargando documento:', error);
            showError('Error al descargar el archivo del servidor.');
        } finally {
            setLoadingDocs(prev => ({ ...prev, [fileId]: false }));
        }
    };

    const handleDeleteFile = (submittedFile) => {
        const fileId = submittedFile?.id_file_submitted || submittedFile?.idFileSubmitted;
        if (!fileId) return;

        confirmDialog({
            message: '¿Está seguro de que desea eliminar este documento? Esta acción no se puede deshacer.',
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try {
                    setLoadingDocs(prev => ({ ...prev, [fileId]: true }));
                    // Assuming fileService has a delete method or using a generic one
                    await fileService.deleteFile(fileId);
                    showSuccess("Documento eliminado correctamente.");
                    await loadData();
                } catch (error) {
                    console.error("Error deleting file:", error);
                    showError("Error al eliminar el documento.");
                } finally {
                    setLoadingDocs(prev => ({ ...prev, [fileId]: false }));
                }
            }
        });
    };

    const getStatusInfo = (submittedFile) => {
        if (!submittedFile) return { label: 'PENDIENTE', color: 'bg-secondary/5 text-secondary border-secondary/20' };
        
        const auditInfo = submittedFile.audit_info || submittedFile.auditInfo;
        const isForwarded = submittedFile.flag_forwarded || submittedFile.flagForwarded;
        const hasAudits = submittedFile.has_audits || submittedFile.hasAudits || !!auditInfo;
        
        if (hasAudits && !isForwarded && auditInfo) {
            const status = (auditInfo.audit_status || auditInfo.auditStatus || '')?.toUpperCase();
            if (status === 'APROBADO') return { label: 'VIGENTE', color: 'bg-success/5 text-success border-success/20' };
            if (status === 'OBSERVADO' || status === 'RECHAZADO') return { label: 'CON OBSERVACIÓN', color: 'bg-warning/5 text-warning border-warning/20' };
            return { label: 'EN REVISIÓN', color: 'bg-info/5 text-info border-info/20' };
        }
        
        return { label: 'EN REVISIÓN', color: 'bg-info/5 text-info border-info/20' };
    };

    const renderCard = (req) => {
        const { submittedFile, label } = req;
        const status = getStatusInfo(submittedFile);
        const fileName = submittedFile?.file_name || 'Sin archivo';
        const isExpiring = submittedFile?.expiration_date && new Date(submittedFile.expiration_date) < new Date();

        return (
            <div key={req.id_group_requirements} className="bg-white border border-secondary/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group animate-fade-in relative overflow-hidden">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${submittedFile ? 'bg-primary/5 text-primary' : 'bg-secondary/5 text-secondary'}`}>
                            <i className={`pi ${submittedFile ? 'pi-file-pdf' : 'pi-file'} text-xl`}></i>
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-bold text-secondary-dark text-sm leading-tight truncate max-w-[180px]" title={label}>{label}</h4>
                            <p className="text-[10px] text-secondary font-medium uppercase tracking-wider">{req.list_requirements?.attribute_template?.attributes?.periodicity_description || 'Única Vez'}</p>
                        </div>
                    </div>
                    <div className={`text-[9px] font-black px-2 py-1 rounded-lg border uppercase tracking-wider ${status.color}`}>
                        {status.label}
                    </div>
                </div>

                <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-[10px]">
                        <span className="text-secondary font-bold uppercase">Archivo:</span>
                        <span className="text-secondary-dark font-medium truncate max-w-[150px]" title={fileName}>{fileName}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                        <span className="text-secondary font-bold uppercase">Vencimiento:</span>
                        <span className={`font-mono font-bold ${isExpiring ? 'text-danger' : 'text-secondary-dark'}`}>
                            {submittedFile?.expiration_date ? new Date(submittedFile.expiration_date).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-secondary/5">
                    {submittedFile && (
                        <>
                            <button
                                onClick={() => handleViewFile(submittedFile)}
                                className="flex-1 bg-secondary-light/30 hover:bg-secondary-light text-secondary-dark font-bold py-2 rounded-lg text-[10px] transition-all flex items-center justify-center gap-2"
                                disabled={loadingDocs[submittedFile.id_file_submitted || submittedFile.idFileSubmitted]}
                            >
                                {(loadingDocs[submittedFile.id_file_submitted || submittedFile.idFileSubmitted]) ? <i className="pi pi-spin pi-spinner"></i> : <i className="pi pi-external-link"></i>} VER
                            </button>
                            {!isAuditorLegal && (
                                <button
                                    onClick={() => handleDeleteFile(submittedFile)}
                                    className="w-10 bg-danger/5 hover:bg-danger/10 text-danger font-bold py-2 rounded-lg text-[10px] transition-all flex items-center justify-center border border-danger/10"
                                    title="Eliminar Documento"
                                    disabled={loadingDocs[submittedFile.id_file_submitted || submittedFile.idFileSubmitted]}
                                >
                                    <i className="pi pi-trash"></i>
                                </button>
                            )}
                        </>
                    )}
                    {!submittedFile && !isAuditorLegal && (
                        <div className="flex-1 text-center py-2 text-[10px] font-bold text-secondary/40 italic">
                            Pendiente de carga
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const getResourceTitle = () => {
        if (!resource) return 'Cargando...';
        if (type === 'vehiculo') return `Vehículo: ${resource.data?.patente || resource.data?.codigo || 'N/A'}`;
        if (type === 'empleado') return `Empleado: ${resource.data?.nombre} ${resource.data?.apellido || ''}`;
        if (type === 'maquinaria') return `Maquinaria: ${resource.data?.nombre || resource.data?.serie || 'N/A'}`;
        return 'Recurso';
    };

    return (
        <div className="animate-fade-in">
            <ConfirmDialog />
            <PageHeader
                title="Documentación del Recurso"
                subtitle={getResourceTitle()}
                icon="pi pi-file-pdf"
                backButton={() => navigate(-1)}
            />

            <div className="p-4 md:p-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <i className="pi pi-spin pi-spinner text-4xl text-primary/40"></i>
                        <p className="text-sm font-bold text-secondary/60 uppercase tracking-widest">Cargando requisitos...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {requirements.length > 0 ? (
                            requirements.map(renderCard)
                        ) : (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-secondary/40">
                                <i className="pi pi-info-circle text-5xl mb-4"></i>
                                <p className="text-lg font-bold">No se encontraron requerimientos configurados.</p>
                                <p className="text-sm">Contacte al administrador para configurar la documentación de este grupo.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourceDocumentationView;

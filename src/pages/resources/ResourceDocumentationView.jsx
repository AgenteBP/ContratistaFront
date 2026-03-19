import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useBlocker, useBeforeUnload } from 'react-router-dom';
import elementService from '../../services/elementService';
import { groupService } from '../../services/groupService';
import { fileService } from '../../services/fileService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import PageHeader from '../../components/ui/PageHeader';
import DocumentCard from '../../components/ui/DocumentCard';
import ObservationModal from '../../components/ui/ObservationModal';
import UnsavedChangesModal from '../../components/ui/UnsavedChangesModal';

const ResourceDocumentationView = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const { isAuditorLegal } = useAuth();
    const { showSuccess, showError, showWarn } = useNotification();
    
    const [resource, setResource] = useState(null);
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingDocs, setLoadingDocs] = useState({});
    const [viewMode, setViewMode] = useState('grid');
    const [observationModalVisible, setObservationModalVisible] = useState(false);
    const [selectedObservation, setSelectedObservation] = useState(null);

    // Navigation and pending state
    const [pendingFiles, setPendingFiles] = useState(new Set());
    const [showLeaveModal, setShowLeaveModal] = useState(false);

    // Delete Modal state
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null);

    // Block navigation if there are pending files
    useBeforeUnload(
        React.useCallback((e) => {
            if (pendingFiles.size > 0) {
                e.preventDefault();
                return '';
            }
        }, [pendingFiles])
    );

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            pendingFiles.size > 0 && currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        if (blocker && blocker.state === "blocked") {
            setShowLeaveModal(true);
        }
    }, [blocker]);

    const handlePendingChange = React.useCallback((docId, isPending) => {
        setPendingFiles(prev => {
            const hasIt = prev.has(docId);
            if (isPending && hasIt) return prev;
            if (!isPending && !hasIt) return prev;
            
            const next = new Set(prev);
            if (isPending) next.add(docId);
            else next.delete(docId);
            return next;
        });
    }, []);

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
            // 1. Get resource details (contains supplier, group, active refs)
            const resData = await elementService.getById(id);
            setResource(resData);

            // 2. Extract IDs needed for the specific resource query
            const idSupplier = resData?.supplier?.id_supplier || resData?.supplier?.idSupplier || resData?.id_supplier;
            const idGroup    = resData?.group?.id_group    || resData?.group?.idGroup    || resData?.id_group;
            const idActive   = resData?.active?.id_active  || resData?.active?.idActive  || resData?.id_active  || categoryId;
            const idElement  = resData?.id_elements || resData?.idElements || Number(id);

            // 3. Fetch requirements scoped to this exact resource
            let groupReqs = [];
            if (idSupplier && idGroup) {
                groupReqs = await groupService.getSpecificResource(idSupplier, idGroup, idActive, idElement);
            } else {
                // Fallback: generic query by element if supplier/group not available
                groupReqs = await groupService.getByElement(idElement);
            }
            
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

    const handleFileUpload = async (file, reqId, idAttribute, idFileSubmitted, expirationDate) => {
        if (!file) return;

        // Ensure we have all necessary IDs
        const q = new URLSearchParams(location.search);
        
        const currentSupplierId = localStorage.getItem('companyFilter') || q.get('idSupplier') || resource?.supplier?.id_supplier;
        const currentIdActive = q.get('idActive') ? parseInt(q.get('idActive')) : resource?.active?.id_active;

        if (!currentSupplierId || !currentIdActive) {
            showError('Faltan datos del recurso para subir el archivo.');
            return;
        }

        try {
            setLoadingDocs(prev => ({ ...prev, [reqId]: true }));
            await fileService.uploadFileForElement(file, { 
                idElement: parseInt(id), 
                idActive: parseInt(currentIdActive), 
                idSupplier: parseInt(currentSupplierId), 
                idGroupReq: reqId,
                idAttribute: idAttribute,
                idFileSubmitted: null, // Forza que siempre nazca un nuevo registro inmaculado
                expirationDate: expirationDate
            });
            showSuccess('Documento subido correctamente.');
            await loadData();
        } catch (err) {
            console.error('Error uploading file:', err);
            showError('Error al subir el archivo.');
        } finally {
            setLoadingDocs(prev => ({ ...prev, [reqId]: false }));
        }
    };

    const handleDateChange = async (reqId, newDate, idAttribute, idFileSubmitted, fileName) => {
        if (!newDate || !idFileSubmitted) return;
        
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1).padStart(2, '0');
        const day = String(newDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        const q = new URLSearchParams(location.search);
        const currentSupplierId = localStorage.getItem('companyFilter') || q.get('idSupplier') || resource?.supplier?.id_supplier;
        const currentIdActive = q.get('idActive') ? parseInt(q.get('idActive')) : resource?.active?.id_active;

        if (!currentSupplierId || !currentIdActive) {
            showError('Faltan datos del recurso para actualizar la fecha.');
            return;
        }

        try {
             // We can use same loading state as document upload
            setLoadingDocs(prev => ({ ...prev, [reqId]: true }));
            await fileService.updateDateForElement({
                idElement: parseInt(id),
                idActive: parseInt(currentIdActive),
                idSupplier: parseInt(currentSupplierId),
                idGroupReq: reqId,
                idAttribute: idAttribute,
                idFileSubmitted: idFileSubmitted,
                fileName: fileName,
                newDate: formattedDate
            });
            showSuccess('Fecha de vencimiento actualizada correctamente.');
            await loadData();
        } catch (error) {
            console.error('Error al actualizar fecha:', error);
            showError('Error al actualizar la fecha de vencimiento.');
        } finally {
            setLoadingDocs(prev => ({ ...prev, [reqId]: false }));
        }
    };

    const handleDeleteFile = (submittedFile) => {
        setDocToDelete(submittedFile);
        setConfirmModalOpen(true);
    };

    const applyRemoveFile = async () => {
        if (!docToDelete) return;
        const fileId = docToDelete.id_file_submitted || docToDelete.idFileSubmitted;
        if (!fileId) return;

        setConfirmModalOpen(false);
        setLoadingDocs(prev => ({ ...prev, [fileId]: true }));
        try {
            await fileService.deleteFile(fileId);
            showSuccess('Documento eliminado correctamente.');
            await loadData();
        } catch (error) {
            console.error('Error deleting file:', error);
            showError('Error al eliminar el documento.');
        } finally {
            setLoadingDocs(prev => ({ ...prev, [fileId]: false }));
            setDocToDelete(null);
        }
    };

// getStatusInfo used for grid & list views
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

    const getResourceTitle = () => {
        if (!resource) return 'Cargando...';
        if (type === 'vehiculo') return `Vehículo: ${resource.data?.patente || resource.data?.codigo || 'N/A'}`;
        if (type === 'empleado') return `Empleado: ${resource.data?.nombre} ${resource.data?.apellido || ''}`;
        if (type === 'maquinaria') return `Maquinaria: ${resource.data?.nombre || resource.data?.serie || 'N/A'}`;
        return 'Recurso';
    };

    return (
        <div className="animate-fade-in">
            <ObservationModal
                visible={observationModalVisible}
                onHide={() => setObservationModalVisible(false)}
                title={selectedObservation?.title}
                content={selectedObservation?.content}
                docName={selectedObservation?.docName}
            />
            <PageHeader
                title="Documentación del Recurso"
                subtitle={getResourceTitle()}
                icon="pi pi-file-pdf"
                backButton={() => navigate(-1)}
                actionButton={
                    <div className="flex bg-secondary-light/50 p-1 rounded-xl border border-secondary/10">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:text-secondary-dark'}`}
                            title="Vista Mosaico"
                        >
                            <i className="pi pi-th-large" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:text-secondary-dark'}`}
                            title="Vista Lista"
                        >
                            <i className="pi pi-bars" />
                        </button>
                    </div>
                }
            />

            <div className="p-4 md:p-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <i className="pi pi-spin pi-spinner text-4xl text-primary/40" />
                        <p className="text-sm font-bold text-secondary/60 uppercase tracking-widest">Cargando requisitos...</p>
                    </div>
                ) : requirements.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-secondary/40">
                        <i className="pi pi-info-circle text-5xl mb-4" />
                        <p className="text-lg font-bold">No se encontraron requerimientos configurados.</p>
                        <p className="text-sm">Contacte al administrador para configurar la documentación de este grupo.</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                        {requirements.map(req => {
                            const grpReqId = req.id_group_requirements || req.idGroupRequirements;
                            const fileId = req.submittedFile?.id_file_submitted || req.submittedFile?.idFileSubmitted;
                            const idAttribute = req.attributeId;
                            const autoFrecuencia = req.list_requirements?.attribute_template?.attributes?.periodicity_description || req.list_requirements?.attributeTemplate?.attributes?.periodicity_description || 'Anual';
                            const fileStatus = req.submittedFile?.audit_info?.audit_status || req.submittedFile?.auditInfo?.auditStatus;
                            const isAuditedStatus = fileStatus === 'OBSERVADO' || fileStatus === 'CON OBSERVACIÓN' || fileStatus === 'APROBADO' || fileStatus === 'VIGENTE';

                            return (
                                <DocumentCard
                                    key={grpReqId}
                                    label={req.label}
                                    periodicity={autoFrecuencia}
                                    submittedFile={req.submittedFile}
                                    onView={() => handleViewFile(req.submittedFile)}
                                    onDelete={(!isAuditorLegal && !isAuditedStatus) ? () => handleDeleteFile(req.submittedFile) : undefined}
                                    onUpload={!isAuditorLegal ? (file, date) => handleFileUpload(file, grpReqId, idAttribute, fileId, date) : undefined}
                                    onDateChange={(date) => handleDateChange(grpReqId, date, idAttribute, fileId, req.submittedFile?.file_name)}
                                    onPendingChange={handlePendingChange}
                                    docId={grpReqId}
                                    loadingView={!!(fileId && loadingDocs[fileId])}
                                    readOnly={isAuditorLegal}
                                />
                            );
                        })}
                    </div>
                ) : (
                    /* ── List / table view ── */
                    <div className="bg-white rounded-xl border border-secondary/10 overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-secondary-light/30 border-b border-secondary/10">
                                    <th className="px-6 py-4 text-[10px] font-bold text-secondary/60 uppercase tracking-widest w-[40%]">Documento</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-secondary/60 uppercase tracking-widest text-center w-[15%]">Estado</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-secondary/60 uppercase tracking-widest text-center w-[15%]">Vencimiento</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-secondary/60 uppercase tracking-widest text-right w-[30%]">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary/5">
                                {requirements.map(req => {
                                    const grpReqId = req.id_group_requirements || req.idGroupRequirements;
                                    const { submittedFile, label } = req;
                                    const fileId = submittedFile?.id_file_submitted || submittedFile?.idFileSubmitted;
                                    const expirationDate = submittedFile?.expiration_date || submittedFile?.expirationDate;
                                    const auditInfo = submittedFile?.audit_info || submittedFile?.auditInfo;
                                    const fileStatus = auditInfo?.audit_status || auditInfo?.auditStatus;
                                    const isAuditedStatus = fileStatus === 'OBSERVADO' || fileStatus === 'CON OBSERVACIÓN' || fileStatus === 'APROBADO' || fileStatus === 'VIGENTE';
                                    const statusLabel = !submittedFile ? 'PENDIENTE' :
                                        (fileStatus === 'APROBADO' ? 'VIGENTE' :
                                         fileStatus === 'OBSERVADO' ? 'CON OBSERVACIÓN' : 'EN REVISIÓN');
                                    const badgeClass = statusLabel === 'VIGENTE' ? 'bg-success/10 text-success border-success/20' :
                                        statusLabel === 'CON OBSERVACIÓN' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                        statusLabel === 'EN REVISIÓN' ? 'bg-info/5 text-info border-info/20' :
                                        'bg-secondary/5 text-secondary border-secondary/20';
                                    const formatDate = (d) => { if (!d) return '-'; const p = String(d).split('T')[0].split('-'); return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d; };
                                    
                                    const periodicityStr = req.list_requirements?.attribute_template?.attributes?.periodicity_description || 'N/A';
                                    const isUnicaVezList = periodicityStr.toUpperCase() === 'ÚNICA VEZ' || periodicityStr.toUpperCase() === 'UNICA VEZ';

                                    return (
                                        <tr key={grpReqId} className="hover:bg-secondary-light/10 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-secondary-light p-2 rounded-lg text-secondary group-hover:text-primary group-hover:bg-primary/5 transition-all">
                                                        <i className="pi pi-file-pdf text-sm" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-secondary-dark text-xs">{label}</p>
                                                        <p className="text-[10px] text-secondary/60">{req.list_requirements?.attribute_template?.attributes?.periodicity_description || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badgeClass}`}>{statusLabel}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-[11px] font-semibold ${isUnicaVezList ? 'text-secondary/40 italic' : 'text-secondary-dark'}`}>
                                                    {isUnicaVezList ? 'N/A' : (formatDate(expirationDate))}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 pr-2">
                                                    {(auditInfo?.audit_observations || auditInfo?.auditObservations) && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedObservation({
                                                                    title: 'Observación del Auditor',
                                                                    content: auditInfo.audit_observations || auditInfo.auditObservations,
                                                                    docName: label
                                                                });
                                                                setObservationModalVisible(true);
                                                            }}
                                                            className="h-8 w-8 flex items-center justify-center text-orange-500 bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-full transition-all cursor-pointer shadow-sm"
                                                            title="Ver Observación"
                                                        >
                                                            <i className="pi pi-exclamation-triangle text-sm"></i>
                                                        </button>
                                                    )}
                                                    {submittedFile && (
                                                        <button
                                                            onClick={() => handleViewFile(submittedFile)}
                                                            disabled={!!(fileId && loadingDocs[fileId])}
                                                            className="text-secondary-dark bg-secondary-light/30 hover:bg-secondary-light hover:text-primary rounded-lg px-3 py-1.5 transition-all text-[10px] font-bold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-wait"
                                                        >
                                                            {(fileId && loadingDocs[fileId]) ? <i className="pi pi-spin pi-spinner" /> : <i className="pi pi-external-link" />} VER
                                                        </button>
                                                    )}
                                                    {!isAuditorLegal && (
                                                        <label className="relative flex items-center cursor-pointer">
                                                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleFileUpload(e, grpReqId)} />
                                                            <span className="text-primary bg-primary-light hover:bg-primary hover:text-white rounded-lg px-3 py-1.5 transition-all text-[10px] font-bold flex items-center gap-1.5 cursor-pointer">
                                                                <i className="pi pi-upload" /> {submittedFile ? 'ACTUALIZAR' : 'SUBIR'}
                                                            </span>
                                                        </label>
                                                    )}
                                                    {!isAuditorLegal && submittedFile && !isAuditedStatus && (
                                                        <button
                                                            onClick={() => handleDeleteFile(submittedFile)}
                                                            className="w-8 h-8 bg-danger/5 hover:bg-danger/10 text-danger font-bold rounded-lg flex items-center justify-center transition-all"
                                                            title="Eliminar"
                                                        >
                                                            <i className="pi pi-trash text-[10px]" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <UnsavedChangesModal 
                visible={showLeaveModal} 
                onConfirm={() => { setShowLeaveModal(false); blocker.proceed?.(); }} 
                onCancel={() => { setShowLeaveModal(false); blocker.reset?.(); }} 
            />

            {/* --- MODAL CONFIRMAR ELIMINACIÓN --- */}
            {confirmModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border-t-4 border-red-500 transform transition-all">
                        <div className="text-center mb-6">
                            <div className="bg-red-50 border border-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 shadow-sm animate-wiggle">
                                <i className="pi pi-exclamation-triangle text-3xl"></i>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">¿Eliminar documento?</h3>
                            <p className="text-slate-500 text-sm">El archivo adjunto se descartará. Esta acción no se puede deshacer.</p>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setConfirmModalOpen(false);
                                    setDocToDelete(null);
                                }}
                                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors shadow-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={applyRemoveFile}
                                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 focus:ring-4 focus:ring-red-100"
                            >
                                <i className="pi pi-trash text-sm"></i> Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourceDocumentationView;

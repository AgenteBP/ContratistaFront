import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { auditorService } from '../../services/auditorService';
import { fileService } from '../../services/fileService';
import { useAuth } from '../../context/AuthContext';
import LoadingOverlay from './LoadingOverlay';

const AuditDocumentModal = ({ visible, onHide, docData, onAuditComplete }) => {
    const { user, currentRole } = useAuth();
    
    // PDF Viewer States
    const [fileUrl, setFileUrl] = useState(null);
    const [isLoadingFile, setIsLoadingFile] = useState(false);
    const [fileError, setFileError] = useState(null);

    // Audit Form States
    const [auditForm, setAuditForm] = useState({ status: 'APROBADO', observation: '' });
    const [isSubmittingAudit, setIsSubmittingAudit] = useState(false);

    // Feedback Overlay States
    const [showOverlay, setShowOverlay] = useState(false);
    const [overlayStatus, setOverlayStatus] = useState('loading');
    const [overlayMessage, setOverlayMessage] = useState('');

    useEffect(() => {
        if (visible && docData) {
            setAuditForm({ status: 'APROBADO', observation: '' });
            loadFile();
        } else {
            // Cleanup on hide
            if (fileUrl) {
                URL.revokeObjectURL(fileUrl);
                setFileUrl(null);
            }
            setFileError(null);
        }
    }, [visible, docData]);

    const loadFile = async () => {
        if (!docData?.id_file_submitted && !docData?.fileId) {
            setFileError("Archivo no disponible.");
            return;
        }

        const idToFetch = docData.id_file_submitted || docData.fileId;

        setIsLoadingFile(true);
        setFileError(null);

        try {
            const fileBlob = await fileService.getFile(idToFetch);
            if (fileBlob && fileBlob.size > 0) {
                const blobUrl = URL.createObjectURL(fileBlob);
                setFileUrl(blobUrl);
            } else {
                setFileError("El archivo está vacío o corrupto.");
            }
        } catch (error) {
            console.error("Error cargando el PDF en el modal:", error);
            setFileError("No se pudo cargar el documento.");
        } finally {
            setIsLoadingFile(false);
        }
    };

    const handleSaveAudit = async () => {
        const idToAudit = docData?.id_file_submitted || docData?.fileId;
        if (!idToAudit) {
            alert("No hay un archivo válido para auditar.");
            return;
        }

        setIsSubmittingAudit(true);
        setShowOverlay(true);
        setOverlayStatus('loading');
        setOverlayMessage('Procesando auditoría...');

        try {
            const auditData = {
                id_company_auditor: currentRole?.id_entity || currentRole?.id_auditor || user?.id,
                id_file_submitted: idToAudit,
                status: auditForm.status,
                observation: auditForm.observation,
                date_audit: new Date().toISOString()
            };

            await auditorService.saveFileAudit(auditData);
            
            // Show Success
            setOverlayStatus('success');
            setOverlayMessage(`Documento ${auditForm.status.toLowerCase()} con éxito.`);
            
            // Propagate completion (refresh dashboard)
            if (onAuditComplete) {
                await onAuditComplete();
            }

            // Wait 2 seconds before closing
            setTimeout(() => {
                setShowOverlay(false);
                handleClose();
            }, 2000);

        } catch (error) {
            console.error("Error saving audit", error);
            const errorMessage = error.response?.data?.message || "Error al intentar guardar la auditoría.";
            
            setOverlayStatus('error');
            setOverlayMessage(errorMessage);
            
            // Wait 3 seconds for error visibility
            setTimeout(() => {
                setShowOverlay(false);
            }, 3000);

        } finally {
            setIsSubmittingAudit(false);
        }
    };

    const handleClose = () => {
        if (isSubmittingAudit) return;
        onHide();
    };

    return (
        <Dialog
            header={null}
            showHeader={false}
            visible={visible}
            onHide={handleClose}
            className="w-[98vw] max-w-[1200px] h-[95vh] md:h-[90vh]"
            closable={false}
            pt={{
                mask: { className: 'backdrop-blur-md bg-secondary-dark/60' },
                content: { className: 'p-0 rounded-2xl overflow-hidden bg-white shadow-2xl h-full flex flex-col' },
                header: { className: 'hidden' }
            }}
        >
            {/* Cabecera superior compacta */}
            <div className="px-5 py-3 border-b border-secondary/10 flex justify-between items-center bg-slate-50/80 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                        <i className="pi pi-shield text-info"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-secondary-dark text-sm leading-tight flex items-center gap-2">
                            Intervención Legal 
                            {docData?.provider && <span className="bg-secondary/10 px-2 py-0.5 rounded text-[10px] uppercase text-secondary font-bold">{docData.provider}</span>}
                        </h3>
                        <p className="text-[10px] text-secondary font-medium uppercase tracking-wider">
                            {docData?.label || docData?.doc || "Documento"}
                        </p>
                    </div>
                </div>
                <button onClick={handleClose} className="w-8 h-8 rounded-full hover:bg-slate-200/50 flex items-center justify-center transition-all bg-white border border-secondary/10 shadow-sm">
                    <i className="pi pi-times text-xs text-secondary-dark"></i>
                </button>
            </div>

            {/* Layout Dividido */}
            <div className="flex flex-col md:flex-row flex-1 min-h-0">
                
                {/* Visualizador de PDF (Izquierda) */}
                <div className="flex-1 border-r border-secondary/10 flex flex-col min-h-0 bg-[#323639]">
                    <div className="w-full h-full overflow-hidden flex flex-col relative">
                        {isLoadingFile ? (
                            <div className="flex flex-col items-center justify-center w-full h-full text-secondary">
                                <i className="pi pi-spin pi-spinner text-4xl mb-4 text-info"></i>
                                <span className="text-sm font-bold animate-pulse">Cargando documento seguro...</span>
                            </div>
                        ) : fileError ? (
                            <div className="flex flex-col items-center justify-center w-full h-full text-danger bg-danger/5">
                                <i className="pi pi-exclamation-triangle text-4xl mb-4"></i>
                                <span className="text-sm font-bold">{fileError}</span>
                            </div>
                        ) : fileUrl ? (
                            <iframe 
                                src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`} /* Disable PDF toolbars for cleaner look */
                                className="w-full h-full border-none"
                                title="Visualizador Documento Auditoría"
                            />
                        ) : null}
                        
                        {/* Overlay to prevent interaction issues with iframe when dialog closes sometimes */}
                        <div className="absolute top-0 right-0 p-2">
                             <a 
                                href={fileUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-secondary-dark hover:text-info hover:scale-105 transition-all text-xs"
                                title="Abrir en pestaña nueva"
                            >
                                <i className="pi pi-external-link"></i>
                             </a>
                        </div>
                    </div>
                </div>

                {/* Formulario de Decisión (Derecha) */}
                <div className="w-full md:w-[350px] lg:w-[400px] shrink-0 bg-white flex flex-col">
                    <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
                        
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-secondary/50 uppercase tracking-widest border-b border-secondary/10 pb-2">
                                Decisión de Auditoría
                            </h4>
                            
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setAuditForm({ ...auditForm, status: 'APROBADO' })}
                                    className={`w-full py-4 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${auditForm.status === 'APROBADO' ? 'border-success bg-success/5 text-success shadow-sm' : 'border-slate-100 text-secondary/40 hover:border-success/30 hover:bg-success/5'}`}
                                >
                                    <i className={`pi pi-check-circle text-2xl ${auditForm.status === 'APROBADO' ? 'scale-110' : ''} transition-transform`}></i>
                                    <span className="font-bold uppercase text-sm tracking-wider">Aprobar Documento</span>
                                </button>
                                
                                <button
                                    onClick={() => setAuditForm({ ...auditForm, status: 'OBSERVADO' })}
                                    className={`w-full py-4 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${auditForm.status === 'OBSERVADO' ? 'border-warning bg-warning/5 text-warning-dark shadow-sm' : 'border-slate-100 text-secondary/40 hover:border-warning/30 hover:bg-warning/5'}`}
                                >
                                    <i className={`pi pi-exclamation-triangle text-2xl ${auditForm.status === 'OBSERVADO' ? 'scale-110' : ''} transition-transform`}></i>
                                    <span className="font-bold uppercase text-sm tracking-wider">Observar / Rechazar</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4">
                            <h4 className="text-xs font-black text-secondary/50 uppercase tracking-widest flex items-center gap-2">
                                <i className="pi pi-comments text-xs"></i> 
                                Comentarios {auditForm.status === 'OBSERVADO' && <span className="text-danger">*</span>}
                            </h4>
                            <textarea
                                value={auditForm.observation}
                                onChange={(e) => setAuditForm({ ...auditForm, observation: e.target.value })}
                                rows={6}
                                className={`w-full rounded-xl border focus:ring-4 transition-all p-4 text-secondary-dark text-sm bg-slate-50 outline-none resize-none ${auditForm.status === 'OBSERVADO' && !auditForm.observation.trim() ? 'border-warning/50 focus:border-warning focus:ring-warning/10' : 'border-secondary/20 focus:border-info focus:ring-info/5'}`}
                                placeholder={auditForm.status === 'OBSERVADO' ? "Motivo obligatorio del rechazo u observación detallada..." : "Opcional. Notas o detalles adicionales de la aprobación..."}
                            />
                             {auditForm.status === 'OBSERVADO' && !auditForm.observation.trim() && (
                                <p className="text-[10px] text-danger font-bold mt-1 animate-pulse">
                                    <i className="pi pi-info-circle mr-1"></i>
                                    La observación es obligatoria para rechazar.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Footer con Acciones */}
                    <div className="p-6 bg-slate-50 border-t border-secondary/10 flex gap-3 shrink-0">
                        <button
                            onClick={handleClose}
                            className="w-[100px] py-3.5 bg-white border border-secondary/20 rounded-xl text-secondary font-bold hover:bg-slate-100 transition-all text-xs uppercase"
                            disabled={isSubmittingAudit}
                        >
                            Volver
                        </button>
                        <button
                            onClick={handleSaveAudit}
                            disabled={isSubmittingAudit || (auditForm.status === 'OBSERVADO' && !auditForm.observation.trim()) || isLoadingFile}
                            className={`flex-1 py-3.5 font-bold rounded-xl shadow-lg transition-all text-xs uppercase flex items-center justify-center gap-2 
                                ${isSubmittingAudit || isLoadingFile ? 'bg-secondary text-white opacity-70 cursor-wait' :
                                  auditForm.status === 'OBSERVADO' && !auditForm.observation.trim() ? 'bg-secondary-light text-secondary/50 cursor-not-allowed border border-secondary/20' :
                                  auditForm.status === 'APROBADO' ? 'bg-success hover:bg-success-hover text-white shadow-success/20' :
                                  'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20'
                                }
                            `}
                        >
                            {isSubmittingAudit ? <i className="pi pi-spin pi-spinner text-lg"></i> : <i className="pi pi-save text-lg"></i>}
                            Confirmar Auditoría
                        </button>
                    </div>
                </div>
            </div>
            
            <LoadingOverlay 
                isVisible={showOverlay} 
                status={overlayStatus} 
                message={overlayMessage} 
            />
        </Dialog>
    );
};

export default AuditDocumentModal;

import React, { useState, useRef } from 'react';
import StepHeader from '../../suppliers/StepHeader';
import { Calendar } from 'primereact/calendar';

const SupplierStepDocuments = ({
    formData,
    requiredDocs,
    setRequiredDocs,
    loadingDocs,
    handleFileUpload,
    handleDateChange,
    handleRemoveFile,
    handleViewFile,
    updateDocRequirement,
    toggleDocRequirement,
    isAdmin,
    isWizardMode,
    readOnly,
    partialEdit,
    isEditingStep,
    handleStartEdit,
    handleCancelEdit,
    handleStopEdit,
    availableRequirements,
    uniqueActives,
    setIsCustomConfig,
    markStepDirty,
    getStepIdx,
    groupDefinitions
}) => {
    const [docViewMode, setDocViewMode] = useState('grid');
    const [showDocModal, setShowDocModal] = useState(false);
    const [customActiveId, setCustomActiveId] = useState('');
    const [customPeriodicity, setCustomPeriodicity] = useState('ANUAL');
    const [customDocName, setCustomDocName] = useState('');
    const [obsModalVisible, setObsModalVisible] = useState(false);
    const [selectedObs, setSelectedObs] = useState({ title: '', content: '' });
    const [expandedObservations, setExpandedObservations] = useState({});
    const [docToDelete, setDocToDelete] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [auditedDeleteWarning, setAuditedDeleteWarning] = useState(false);
    const [auditedReplaceDoc, setAuditedReplaceDoc] = useState(null); // { id, label }
    const replaceFileInputRef = useRef(null);

    const toggleObservation = (id) => {
        setExpandedObservations(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const isDocsConfigReadOnly = !isWizardMode && !isAdmin;
    const isDocsActionsEnabled = partialEdit && isEditingStep && !isAdmin && !readOnly; // Proveedor edit mode
    const editDocMode = isEditingStep || isWizardMode; // Admin trying to edit config

    const resetDocConfig = () => {
        // Reset Logic to be implemented or passed as prop if needed
        setIsCustomConfig(false);
        setRequiredDocs([]); // Fallback, normally the hook re-calculates
    };

    const applyRemoveFile = () => {
        if (docToDelete) {
            handleRemoveFile(docToDelete);
            setDocToDelete(null);
            setConfirmModalOpen(false);
        }
    };

    // Calculate Step Index
    const stepIdx = getStepIdx ? getStepIdx('Documentos') : 5;

    return (
        <div className="p-8 animate-fade-in relative">
            <StepHeader
                title={`${isWizardMode ? "Configuración de Documentación" : "Documentación"}${formData.isMock ? " (MOCK)" : ""}`}
                subtitle={isWizardMode ? "Defina qué documentos se solicitarán al proveedor." : "Estado de la documentación."}
                partialEdit={partialEdit}
                isEditingStep={isEditingStep}
                handleStartEdit={handleStartEdit}
                handleCancelEdit={handleCancelEdit}
                handleStopEdit={handleStopEdit}
                extra={
                    <div className="flex items-center gap-3">
                        {!isWizardMode && (
                            <div className="flex bg-secondary-light/50 p-1 rounded-xl border border-secondary/10">
                                <button
                                    onClick={() => setDocViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${docViewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:text-secondary-dark'}`}
                                    title="Vista Mosaico"
                                >
                                    <i className="pi pi-th-large"></i>
                                </button>
                                <button
                                    onClick={() => setDocViewMode('table')}
                                    className={`p-2 rounded-lg transition-all ${docViewMode === 'table' ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:text-secondary-dark'}`}
                                    title="Vista Tabla"
                                >
                                    <i className="pi pi-bars"></i>
                                </button>
                            </div>
                        )}
                    </div>
                }
            />

            {/* Indicar de dónde viene la configuración por defecto */}
            {isWizardMode && (
                <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/20 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-3 items-center">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-white px-2 py-1 rounded shadow-sm border border-primary/10">Basado en:</span>
                        <div className="flex gap-2">
                            {formData.grupo && (
                                <span className="text-xs font-bold text-white px-2.5 py-1 bg-primary rounded-lg border border-primary/20 flex items-center gap-1.5">
                                    <i className={`pi ${(groupDefinitions || []).find(g => g.name?.toUpperCase() === formData.grupo?.toUpperCase())?.icon || 'pi-building'} text-[10px]`}></i>
                                    {formData.grupo}
                                </span>
                            )}
                            <span className="text-xs font-bold text-secondary-dark px-2.5 py-1 bg-white rounded-lg border border-secondary/20">{formData.tipoPersona}</span>
                            <span className="text-xs font-bold text-secondary-dark px-2.5 py-1 bg-white rounded-lg border border-secondary/20">{formData.clasificacionAFIP}</span>
                            <span className="text-xs font-bold text-secondary-dark px-2.5 py-1 bg-white rounded-lg border border-secondary/20">{formData.servicio}</span>
                        </div>
                    </div>
                </div>
            )}

            {!isDocsConfigReadOnly && !editDocMode && (
                <div className="mb-4 bg-warning-light/50 border border-warning/30 rounded-lg p-3 flex items-center justify-between text-xs">
                    <span className="text-warning-hover font-medium flex items-center gap-2">
                        <i className="pi pi-exclamation-triangle"></i> Configuración personalizada
                    </span>
                    <button onClick={resetDocConfig} className="text-secondary-dark hover:underline">Restablecer sugeridos</button>
                </div>
            )}

            {requiredDocs.length === 0 && (
                <div className="mb-8 p-6 bg-secondary-light/30 border-2 border-dashed border-secondary/20 rounded-2xl text-center animate-fade-in">
                    <i className="pi pi-file-excel text-4xl text-secondary/30 mb-3 block"></i>
                    <h4 className="text-secondary-dark font-bold mb-1">Sin documentación asignada</h4>
                    <p className="text-xs text-secondary font-medium italic">No hay documentación a presentar asignada a este proveedor.</p>
                </div>
            )}

            {docViewMode === 'grid' || isWizardMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Card para AGREGAR NUEVO (Solo en modo edición de CONFIGURACION) */}
                    {!isDocsConfigReadOnly && editDocMode && (
                        <button
                            onClick={() => setShowDocModal(true)}
                            className="border-2 border-dashed border-secondary/30 rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-secondary hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all h-full min-h-[140px]"
                        >
                            <div className="bg-white p-2 rounded-full shadow-sm">
                                <i className="pi pi-plus text-lg"></i>
                            </div>
                            <span className="text-xs font-bold">Agregar Requisito</span>
                        </button>
                    )}
                    {requiredDocs.map(doc => {
                        const docData = formData.documentacion?.find(d => String(d.id) === String(doc.id)) || null;

                        const status = docData ? (docData.modified && docData.oldEstado ? docData.oldEstado : docData.estado) : 'PENDIENTE';
                        const getStatusColor = (s, isExpiring) => {
                            if (s === 'VIGENTE' && isExpiring) return 'border-warning/50 bg-warning-light/10';
                            switch (s) {
                                case 'VIGENTE': return 'border-success/50 bg-success-light/10';
                                case 'VENCIDO': return 'border-danger/50 bg-danger-light/10';
                                case 'PENDIENTE': return 'border-secondary/50 bg-secondary-light/10';
                                case 'EN REVISIÓN': return 'border-info/50 bg-info-light/10';
                                case 'CON OBSERVACIÓN': return 'border-orange-500/50 bg-orange-50';
                                default: return 'border-secondary/20 bg-secondary-light/10';
                            }
                        };

                        return (
                            <div key={doc.id} className={`border rounded-lg p-4 flex flex-col justify-between transition-all hover:shadow-md ${isWizardMode ? 'border-secondary/20 bg-white' : getStatusColor(status, docData?.isExpiringSoon)} group relative h-full min-h-[150px]`}>

                                {/* Botón Eliminar Requisito (Solo edición config admin) */}
                                {!isDocsConfigReadOnly && editDocMode && (
                                    <button
                                        onClick={() => toggleDocRequirement(doc.id)}
                                        className="absolute -top-2 -right-2 bg-white text-red-500 shadow-md rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-50 hover:scale-110 transition-all z-10"
                                    >
                                        <i className="pi pi-times text-[10px] font-bold"></i>
                                    </button>
                                )}

                                <div className="flex-1 flex flex-col h-full">
                                    {/* Header: Icon + Title */}
                                    <div className="flex items-start gap-4 mb-3">
                                        <div
                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${docData?.archivo ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'} ${isWizardMode ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 text-primary' :
                                                (status === 'VIGENTE' ? 'bg-success/10 border-success/20 text-success' :
                                                    status === 'VENCIDO' ? 'bg-danger/10 border-danger/20 text-danger' :
                                                        status === 'EN REVISIÓN' ? 'bg-info/10 border-info/20 text-info' :
                                                            status === 'CON OBSERVACIÓN' ? 'bg-orange-100 border-orange-200 text-orange-600' :
                                                                'bg-secondary/10 border-secondary/20 text-secondary')}`}
                                            onClick={(e) => {
                                                if (docData?.archivo) {
                                                    e.stopPropagation();
                                                    handleViewFile(docData);
                                                }
                                            }}
                                        >
                                            <i className={`pi ${String(doc.id).includes('AFIP') ? 'pi-verified' : String(doc.id).includes('SEGURO') ? 'pi-shield' : 'pi-file-pdf'} text-xl group-hover:scale-110 transition-transform`}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-secondary-dark text-[13px] leading-tight break-words pr-2 line-clamp-2" title={docData?.label || doc.label}>{docData?.label || doc.label}</h4>
                                            </div>
                                            {doc.helpText && (
                                                <p className="text-[10px] text-secondary/70 leading-snug mb-2 font-medium uppercase">
                                                    {doc.helpText}
                                                </p>
                                            )}
                                            {!isWizardMode && (
                                                <div className="flex flex-wrap gap-1">
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border inline-block ${status === 'VIGENTE' && docData?.isExpiringSoon ? 'bg-warning/10 text-warning border-warning/20' :
                                                         status === 'VIGENTE' ? 'bg-success/10 text-success border-success/20' :
                                                             status === 'VENCIDO' ? 'bg-danger/10 text-danger border-danger/20' :
                                                                 status === 'EN REVISIÓN' ? 'bg-info/10 text-info border-info/20' :
                                                                     status === 'CON OBSERVACIÓN' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                                                         'bg-secondary/10 text-secondary border-secondary/20'
                                                        }`}>
                                                        {status}
                                                    </span>
                                                    {docData?.observacion && status !== 'CON OBSERVACIÓN' && status !== 'VIGENTE' && (
                                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border inline-block bg-orange-50 text-orange-600 border-orange-200 shadow-sm animate-pulse-subtle">
                                                            CON OBSERVACIÓN
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Divider Line */}
                                    {!isWizardMode && (
                                        <div className="w-[90%] h-px bg-secondary/10 mx-auto mb-4"></div>
                                    )}

                                    {/* Observation Alert (Card Mode) */}
                                    {docData?.observacion && (
                                        expandedObservations[doc.id] ? (
                                            <div
                                                onClick={(e) => { e.stopPropagation(); toggleObservation(doc.id); }}
                                                className="mb-4 p-2.5 bg-orange-50 border border-orange-100 rounded-lg flex flex-col gap-2 cursor-pointer hover:bg-orange-100/50 transition-colors animate-fade-in"
                                            >
                                                <div className="flex items-start gap-2 w-full">
                                                    <i className="pi pi-exclamation-circle text-orange-500 mt-0.5 shadow-sm"></i>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-bold text-orange-700 uppercase tracking-wider mb-0.5">Observación:</p>
                                                        <p className="text-[11px] text-orange-800 leading-tight italic font-medium">{docData.observacion}</p>
                                                    </div>
                                                    <i className="pi pi-chevron-up text-[10px] text-orange-400 mt-1"></i>
                                                </div>

                                                {/* Nested Audited File Info */}
                                                {status === 'CON OBSERVACIÓN' && docData?.archivo && (
                                                    <div className="p-2 border border-orange-200/50 bg-orange-100/40 rounded-lg flex items-center justify-between group/oldfile transition-all hover:bg-orange-200/40 cursor-pointer w-full"
                                                        onClick={(e) => { e.stopPropagation(); handleViewFile(docData); }} /* View on click */
                                                    >
                                                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                            <div className="bg-orange-200/50 p-1.5 rounded text-orange-600 shadow-sm">
                                                                <i className="pi pi-file-pdf text-xs"></i>
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-[8px] font-extrabold text-orange-600 uppercase tracking-wider">Archivo Auditado:</span>
                                                                <span className="text-[10px] text-orange-800 font-bold truncate pr-1" title={docData?.oldArchivo || docData?.archivo}>{docData?.oldArchivo || docData?.archivo}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div
                                                onClick={(e) => { e.stopPropagation(); toggleObservation(doc.id); }}
                                                className="mb-4 p-2 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:bg-orange-100 transition-colors group/obs"
                                            >
                                                <i className="pi pi-exclamation-circle text-orange-500 text-sm group-hover/obs:scale-110 transition-transform"></i>
                                                <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Ver Observación</span>
                                                <i className="pi pi-chevron-down text-[10px] text-orange-400 ml-1"></i>
                                            </div>
                                        )
                                    )}



                                    {/* Body: Configuration (Wizard Mode OR Admin Edit) */}
                                    {(isWizardMode || (isAdmin && editDocMode)) ? (
                                        <div className="mt-auto pt-4 border-t border-secondary/5 space-y-4">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-secondary/60 uppercase tracking-widest flex items-center gap-1.5">
                                                    <i className="pi pi-history text-[9px]"></i> Periodicidad
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={doc.frecuencia}
                                                        onChange={(e) => updateDocRequirement(doc.id, 'frecuencia', e.target.value)}
                                                        className="w-full text-xs font-semibold py-2 px-3 bg-secondary-light/30 border border-secondary/10 rounded-xl hover:border-primary/30 transition-all focus:outline-none appearance-none cursor-pointer pr-8"
                                                    >
                                                        <option value="ANUAL">Anual</option>
                                                        <option value="MENSUAL">Mensual</option>
                                                        <option value="UNICA VEZ">Única vez</option>
                                                    </select>
                                                    <i className="pi pi-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-secondary/40 pointer-events-none"></i>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-secondary/60 uppercase tracking-widest flex items-center gap-1.5">
                                                    <i className="pi pi-lock text-[9px]"></i> Requerimiento
                                                </label>
                                                <div
                                                    onClick={() => updateDocRequirement(doc.id, 'isOptional', !doc.isOptional)}
                                                    className={`flex items-center gap-2 p-1.5 rounded-xl border cursor-pointer transition-all duration-300 ${doc.isOptional
                                                        ? 'bg-gray-50 border-secondary/10 opacity-70'
                                                        : 'bg-indigo-50/50 border-indigo-100'}`}
                                                >
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${doc.isOptional ? 'bg-white text-secondary/40' : 'bg-indigo-500 text-white shadow-sm'}`}>
                                                        <i className={`pi ${doc.isOptional ? 'pi-circle' : 'pi-check-circle'} text-[11px]`}></i>
                                                    </div>
                                                    <span className={`text-[11px] font-bold ${doc.isOptional ? 'text-secondary' : 'text-indigo-700'}`}>
                                                        {doc.isOptional ? 'Opcional' : 'Obligatorio'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2.5 bg-secondary-light/30 p-2 rounded-lg border border-secondary/5">
                                                <i className="pi pi-clock text-primary text-[11px]"></i>
                                                <span className="text-xs font-medium text-secondary-dark">{docData?.frecuencia || doc.frecuencia}{doc.obligatoriedad === 'Opcional' || doc.isOptional ? ' — Opcional' : ''}</span>
                                            </div>

                                            {((docData?.fechaVencimiento || isDocsActionsEnabled) && (docData?.frecuencia || doc.frecuencia) !== 'Única vez' && (docData?.frecuencia || doc.frecuencia) !== 'UNICA VEZ') && (
                                                <div className="flex flex-col w-full">
                                                    <div className="flex items-center gap-2">
                                                        <i className="pi pi-calendar text-secondary/50 text-base"></i>
                                                        {isDocsActionsEnabled ? (
                                                            <Calendar
                                                                value={docData?.fechaVencimiento ? (() => { const p = String(docData.fechaVencimiento).split('T')[0].split('-'); return p.length === 3 ? new Date(p[0], p[1] - 1, p[2]) : null; })() : null}
                                                                onChange={(e) => handleDateChange(doc.id, e.value)}
                                                                placeholder="Vencimiento"
                                                                disabled={!docData?.archivo && !(status === 'CON OBSERVACIÓN')}
                                                                minDate={new Date()}
                                                                className={`compact-calendar-input w-full border border-secondary/50 rounded-lg ${!docData?.archivo && !(status === 'CON OBSERVACIÓN') ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                                                                panelClassName="compact-calendar-panel"
                                                                dateFormat="dd/mm/yy"
                                                            />
                                                        ) : (
                                                            <span className="text-xs font-semibold text-secondary">Vence: {docData?.fechaVencimiento ? (() => { const dateStr = String(docData.fechaVencimiento).split('T')[0]; const p = dateStr.split('-'); return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dateStr; })() : '-'}</span>
                                                        )}
                                                    </div>
                                                    {isDocsActionsEnabled && !docData?.archivo && !(status === 'CON OBSERVACIÓN') && (
                                                        <span className="text-[10px] text-warning font-medium ml-6 mt-1.5">
                                                            * Requiere archivo para editar fecha
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* ACTION AREA: Placeholder / Upload / File Info */}
                                            {/* 1. Pending + No File OR Observado => Placeholder or Upload Zone */}
                                            {(!docData?.archivo || (status === 'CON OBSERVACIÓN' && !docData?.modified)) && (
                                                isDocsActionsEnabled ? (
                                                    <div className="mt-auto pt-3 relative flex-1">
                                                        <input
                                                            type="file"
                                                            id={`file-${doc.id}`}
                                                            onChange={(e) => {
                                                                handleFileUpload(e, doc.id, doc.label);
                                                                if (typeof markStepDirty === 'function' && typeof getStepIdx === 'function') {
                                                                    markStepDirty(getStepIdx('Documentos'));
                                                                }
                                                            }}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                        />
                                                        <div className="border-2 border-dashed border-secondary/20 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-secondary hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all mt-auto flex-1 cursor-pointer min-h-[120px]">
                                                            <div className="bg-primary/10 p-2 rounded-full text-primary">
                                                                <i className="pi pi-cloud-upload text-xl"></i>
                                                            </div>
                                                            <span className="text-xs font-bold">{status === 'CON OBSERVACIÓN' || docData?.archivo ? 'Actualizar Documento' : 'Subir Documento'}</span>
                                                        </div>
                                                    </div>
                                                ) : null
                                            )}

                                            {/* 2. File Exists => File Info Row (View/Delete) - ONLY IN EDIT MODE */}
                                            {(docData?.archivo && (status !== 'CON OBSERVACIÓN' || docData?.modified) && isDocsActionsEnabled) && (
                                                <>
                                                    <div className="mt-auto group/file flex items-center justify-between p-2 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                                                        onClick={() => handleViewFile(docData)}
                                                    >
                                                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                            <div className="bg-white p-1.5 rounded-md text-primary shadow-sm">
                                                                <i className="pi pi-file-pdf text-xs"></i>
                                                            </div>
                                                            {status === 'CON OBSERVACIÓN' ? (
                                                                <div className="flex flex-col">
                                                                    <span className="text-[8px] font-bold text-primary uppercase tracking-wider">Nuevo a subir:</span>
                                                                    <span className="text-[10px] font-bold text-primary-dark truncate pr-2">{docData.archivo}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-primary-dark truncate pr-2">
                                                                    {docData.archivo}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {isDocsActionsEnabled ? (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (docData?.hasAudits && status !== 'PENDIENTE' && !docData?.modified) {
                                                                        setAuditedReplaceDoc({ id: doc.id, label: doc.label });
                                                                        setAuditedDeleteWarning(true);
                                                                    } else {
                                                                        setDocToDelete(doc.id);
                                                                        setConfirmModalOpen(true);
                                                                    }
                                                                }}
                                                                className="text-secondary/40 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all shrink-0 z-10"
                                                                title="Eliminar archivo"
                                                            >
                                                                <i className="pi pi-trash text-xs"></i>
                                                            </button>
                                                        ) : (
                                                            loadingDocs[docData?.id] ? (
                                                                <i className="pi pi-spin pi-spinner text-primary text-xs mr-1"></i>
                                                            ) : (
                                                                <i className="pi pi-external-link text-primary/50 text-xs mr-1"></i>
                                                            )
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            {/* 3. Read-Only Mode + File Exists => Absolute External Link Icon */}
                                            {(!isDocsActionsEnabled && docData?.archivo) && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewFile(docData);
                                                    }}
                                                    className="absolute bottom-3 right-3 text-secondary/40 hover:text-primary hover:scale-110 transition-all z-10 p-2"
                                                    title="Ver Documento"
                                                >
                                                    {loadingDocs[docData?.id] ? (
                                                        <i className="pi pi-spin pi-spinner text-lg text-primary"></i>
                                                    ) : (
                                                        <i className="pi pi-external-link text-lg"></i>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-secondary/10 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary-light/30 border-b border-secondary/10">
                                <th className="px-6 py-4 text-[10px] font-bold text-secondary/60 uppercase tracking-widest w-[40%]">Documento</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-secondary/60 uppercase tracking-widest text-center w-[20%]">Estado</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-secondary/60 uppercase tracking-widest text-center w-[20%]">Vigencia</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-secondary/60 uppercase tracking-widest text-right w-[20%]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary/5">
                            {requiredDocs.map(doc => {
                                const docData = formData.documentacion?.find(d => String(d.id) === String(doc.id)) || null;
                                const status = docData ? (docData.modified && docData.oldEstado ? docData.oldEstado : docData.estado) : 'PENDIENTE';

                                return (
                                    <tr key={doc.id} className="hover:bg-secondary-light/10 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-secondary-light p-2 rounded-lg text-secondary group-hover:text-primary group-hover:bg-primary/5 transition-all">
                                                    <i className={`pi ${String(doc.id).includes('AFIP') ? 'pi-verified' : String(doc.id).includes('SEGURO') ? 'pi-shield' : 'pi-file'} text-sm`}></i>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-secondary-dark text-xs">{doc.label}</p>
                                                    <p className="text-[10px] text-secondary/60">{doc.frecuencia}{doc.obligatoriedad === 'Opcional' || doc.isOptional ? ' — Opcional' : ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col gap-1 items-center">
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${status === 'VIGENTE' && docData?.isExpiringSoon ? 'bg-warning/10 text-warning border-warning/20' :
                                                    status === 'VIGENTE' ? 'bg-success/10 text-success border-success/30' :
                                                        status === 'VENCIDO' ? 'bg-danger/5 text-danger border-danger/20' :
                                                            status === 'EN REVISIÓN' ? 'bg-info/5 text-info border-info/20' :
                                                                status === 'CON OBSERVACIÓN' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                                                    'bg-secondary/5 text-secondary border-secondary/20'
                                                    }`}>
                                                    {status}
                                                </span>
                                                {docData?.observacion && status !== 'CON OBSERVACIÓN' && status !== 'VIGENTE' && (
                                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-orange-200 bg-orange-50 text-orange-600 animate-pulse-subtle">
                                                        CON OBSERVACIÓN
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {(doc.obligatoriedad === 'No aplica' || doc.frecuencia === 'Única vez' || doc.frecuencia === 'UNICA VEZ') ? (
                                                <span className="text-[11px] font-bold text-secondary/40">N/A</span>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    {isDocsActionsEnabled ? (
                                                        <Calendar
                                                            value={docData?.fechaVencimiento ? new Date(docData.fechaVencimiento) : null}
                                                            onChange={(e) => handleDateChange(doc.id, e.value)}
                                                            placeholder="dd/mm/yy"
                                                            disabled={!docData?.archivo && !(status === 'CON OBSERVACIÓN')}
                                                            minDate={new Date()}
                                                            className="compact-calendar-input scale-90 w-32"
                                                            panelClassName="compact-calendar-panel"
                                                            dateFormat="dd/mm/yy"
                                                        />
                                                    ) : (
                                                        <span className="text-[11px] font-semibold text-secondary-dark">{docData?.fechaVencimiento ? (() => { const dateStr = String(docData.fechaVencimiento).split('T')[0]; const p = dateStr.split('-'); return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dateStr; })() : '-'}</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 pr-2">
                                                {/* Ver Observación */}
                                                {docData?.observacion && status !== 'VIGENTE' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedObs({ title: doc.label, content: docData.observacion });
                                                            setObsModalVisible(true);
                                                        }}
                                                        className="h-8 w-8 flex items-center justify-center text-orange-500 bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-full transition-all cursor-pointer shadow-sm"
                                                        title="Ver Observación"
                                                    >
                                                        <i className="pi pi-exclamation-triangle text-sm"></i>
                                                    </button>
                                                )}

                                                <div className="flex items-center gap-2">
                                                    {/* Ver Button */}
                                                    {docData?.archivo && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleViewFile(docData); }}
                                                            disabled={loadingDocs[docData?.id]}
                                                            className="text-secondary-dark bg-secondary-light/30 hover:bg-secondary-light hover:text-primary rounded-lg px-3 py-1.5 transition-all text-[10px] font-bold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-wait shadow-sm border border-secondary-light/10"
                                                            title="Ver Documento"
                                                        >
                                                            {loadingDocs[docData?.id] ? <i className="pi pi-spin pi-spinner"></i> : <i className="pi pi-external-link"></i>} VER
                                                        </button>
                                                    )}

                                                    {/* Subir / Actualizar Button */}
                                                    {isDocsActionsEnabled && (
                                                        <label className="relative flex items-center cursor-pointer">
                                                            <input 
                                                                type="file" 
                                                                onChange={(e) => handleFileUpload(e, doc.id, doc.label)} 
                                                                className="hidden" 
                                                                accept=".pdf,.jpg,.jpeg,.png" 
                                                            />
                                                            <span
                                                                className={`text-primary bg-primary-light hover:bg-primary hover:text-white rounded-lg px-3 py-1.5 transition-all text-[10px] font-bold flex items-center gap-1.5 shadow-sm border border-primary-light cursor-pointer ${loadingDocs[docData?.id] ? 'opacity-50 cursor-wait' : ''}`}
                                                                title={['VIGENTE', 'VENCIDO', 'CON OBSERVACIÓN'].includes(docData?.estado) ? "Actualizar documento" : "Subir documento"}
                                                            >
                                                                {loadingDocs[docData?.id] ? <i className="pi pi-spin pi-spinner"></i> : <i className="pi pi-upload"></i>} {['VIGENTE', 'VENCIDO', 'CON OBSERVACIÓN'].includes(docData?.estado) ? 'ACTUALIZAR' : 'SUBIR'}
                                                            </span>
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}



            {/* --- MODAL AGREGAR DOCUMENTO --- */}
            {showDocModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-secondary-light px-6 py-4 border-b border-secondary/10 flex justify-between items-center shrink-0">
                            <h3 className="font-bold text-secondary-dark">Agregar Documento</h3>
                            <button onClick={() => setShowDocModal(false)} className="text-secondary hover:text-red-500 transition-colors">
                                <i className="pi pi-times"></i>
                            </button>
                        </div>
                        <div className="p-4 border-b border-secondary/10 bg-gray-50/50 shrink-0">
                            <p className="text-xs font-bold text-secondary-dark mb-2">Crear requisito personalizado</p>
                            <div className="flex flex-col gap-2">
                                <div className="relative">
                                    <select
                                        value={customActiveId}
                                        onChange={(e) => setCustomActiveId(e.target.value)}
                                        className={`w-full text-sm py-2 pl-3 pr-10 bg-white border rounded-lg appearance-none focus:outline-none focus:ring-1 shadow-sm transition-colors ${!customActiveId ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500 text-amber-900/70' : 'border-secondary/20 focus:border-primary focus:ring-primary text-secondary-dark'}`}
                                    >
                                        <option value="" disabled className="text-gray-400">Seleccione el Activo (Obligatorio)</option>
                                        {(uniqueActives || []).map(active => (
                                            <option key={active.id_active} value={active.id_active} className="text-secondary-dark">{active.description}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-secondary">
                                        <i className="pi pi-chevron-down text-xs"></i>
                                    </div>
                                </div>
                                <div className="relative">
                                    <select
                                        value={customPeriodicity}
                                        onChange={(e) => setCustomPeriodicity(e.target.value)}
                                        className="w-full text-sm py-2 px-3 bg-white border border-secondary/20 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm appearance-none pr-10 text-secondary-dark"
                                    >
                                        <option value="ANUAL">Anual</option>
                                        <option value="MENSUAL">Mensual</option>
                                        <option value="SEMANAL">Semanal</option>
                                        <option value="UNICA VEZ">Única vez</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-secondary">
                                        <i className="pi pi-clock text-xs"></i>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={customDocName}
                                        onChange={(e) => setCustomDocName(e.target.value)}
                                        placeholder="Nombre del documento..."
                                        className="flex-1 text-sm py-2 px-3 bg-white border border-secondary/20 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && customDocName.trim() && customActiveId) {
                                                e.preventDefault();
                                                const normalizedName = customDocName.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
                                                const newCustomReq = {
                                                    id: 'CUSTOM_' + Date.now(),
                                                    id_active: Number(customActiveId),
                                                    label: customDocName.trim(),
                                                    attribute_description: normalizedName,
                                                    frecuencia: customPeriodicity,
                                                    obligatoriedad: 'Manual'
                                                };
                                                setIsCustomConfig(true);
                                                setRequiredDocs(prev => [...prev, newCustomReq]);
                                                setCustomDocName('');
                                                setCustomActiveId('');
                                                setShowDocModal(false);
                                                markStepDirty(stepIdx);
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            if (!customDocName.trim() || !customActiveId) return;
                                            const normalizedName = customDocName.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
                                            const newCustomReq = {
                                                id: 'CUSTOM_' + Date.now(),
                                                id_active: Number(customActiveId),
                                                label: customDocName.trim(),
                                                attribute_description: normalizedName,
                                                frecuencia: customPeriodicity,
                                                obligatoriedad: 'Manual'
                                            };
                                            setIsCustomConfig(true);
                                            setRequiredDocs(prev => [...prev, newCustomReq]);
                                            setCustomDocName('');
                                            setCustomActiveId('');
                                            setShowDocModal(false);
                                            markStepDirty(stepIdx);
                                        }}
                                        disabled={!customDocName.trim() || !customActiveId}
                                        className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-bold shadow-sm transition-all text-sm"
                                    >
                                        Crear
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-2 overflow-y-auto flex-1">
                            {(availableRequirements && availableRequirements.length > 0) ? (
                                (() => {
                                    const available = availableRequirements.filter(req => {
                                        const reqId = req.id_list_requirements || req.idListRequirements || req.id;
                                        return !requiredDocs.some(r => String(r.id) === String(reqId));
                                    });

                                    if (available.length === 0) return null;

                                    const groups = {};
                                    available.forEach(req => {
                                        const template = req.id_attribute_template || req.attributeTemplate;
                                        const activeObj = template?.id_active || template?.actives;

                                        const activeId = activeObj?.id_active || activeObj?.idActive || 'UNCLASSIFIED';
                                        const activeName = activeObj?.description || 'Otros Requisitos';

                                        if (!groups[activeId]) {
                                            groups[activeId] = { id: activeId, name: activeName, reqs: [] };
                                        }
                                        groups[activeId].reqs.push(req);
                                    });

                                    return Object.values(groups).map(group => (
                                        <div key={group.id} className="mb-4 last:mb-0">
                                            <h4 className="text-xs font-bold text-primary mb-2 px-2 uppercase tracking-wider bg-primary/5 py-1.5 rounded-md flex items-center gap-2">
                                                <i className="pi pi-folder-open text-[10px]"></i>
                                                {group.name}
                                            </h4>
                                            <div className="space-y-1">
                                                {group.reqs.map(req => {
                                                    const reqId = req.id_list_requirements || req.idListRequirements || req.id;
                                                    return (
                                                        <button
                                                            key={reqId}
                                                            onClick={() => {
                                                                const newReq = {
                                                                    id: reqId,
                                                                    id_active: req.id_attribute_template?.id_active?.id_active || req.attributeTemplate?.id_active || req.attributeTemplate?.idActive || null,
                                                                    id_attribute: req.id_attribute_template?.id_attributes?.id_attributes || req.id_attribute_template?.id_attributes || req.attributeTemplate?.id_attributes?.id_attributes || req.attributeTemplate?.id_attributes || req.attributeTemplate?.idAttributes || null,
                                                                    label: req.description,
                                                                    frecuencia: 'ANUAL',
                                                                    obligatoriedad: 'Manual'
                                                                };
                                                                setIsCustomConfig(true);
                                                                setRequiredDocs(prev => [...prev, newReq]);
                                                                setShowDocModal(false);
                                                                markStepDirty(stepIdx);
                                                            }}
                                                            className="w-full text-left p-3 hover:bg-primary/5 rounded-lg flex items-center justify-between group transition-colors border-b border-secondary/5 last:border-0"
                                                        >
                                                            <div>
                                                                <p className="font-bold text-sm text-secondary-dark group-hover:text-primary">{req.description}</p>
                                                            </div>
                                                            <i className="pi pi-plus text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 p-1.5 rounded-full"></i>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ));
                                })()
                            ) : null}

                            {((availableRequirements || []).filter(req => {
                                const reqId = req.id_list_requirements || req.idListRequirements || req.id;
                                return !requiredDocs.some(r => String(r.id) === String(reqId));
                            }).length === 0) && (
                                    <p className="text-center text-sm text-secondary py-8 italic">No hay más documentos disponibles.</p>
                                )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL CONFIRMAR ELIMINACIÓN --- */}
            {confirmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border-t-4 border-red-500">
                        <div className="text-center mb-6">
                            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                                <i className="pi pi-exclamation-triangle text-3xl"></i>
                            </div>
                            <h3 className="text-xl font-bold text-secondary-dark mb-2">¿Eliminar documento?</h3>
                            <p className="text-secondary text-sm">El archivo adjunto se descartará. Esta acción no se puede deshacer.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setConfirmModalOpen(false);
                                    setDocToDelete(null);
                                }}
                                className="flex-1 bg-secondary-light hover:bg-secondary/20 text-secondary-dark font-bold py-2.5 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={applyRemoveFile}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg shadow-sm shadow-red-500/30 transition-all flex items-center justify-center gap-2"
                            >
                                <i className="pi pi-trash text-sm"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL VER OBSERVACIÓN (Card Mode) --- */}
            {obsModalVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setObsModalVisible(false)}>
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border-t-4 border-orange-500" onClick={e => e.stopPropagation()}>
                        <div className="flex items-start gap-4 mb-4">
                            <div className="bg-orange-100 p-3 rounded-full text-orange-500 shrink-0">
                                <i className="pi pi-exclamation-circle text-xl"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-secondary-dark leading-tight mb-1">{selectedObs.title}</h3>
                                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded border border-orange-200">Motivo de corrección</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 border border-secondary/10 p-4 rounded-lg mb-6">
                            <p className="text-sm text-secondary-dark leading-relaxed italic">"{selectedObs.content}"</p>
                        </div>
                        <button
                            onClick={() => setObsModalVisible(false)}
                            className="w-full bg-secondary-light hover:bg-secondary/20 text-secondary-dark font-bold py-2.5 rounded-lg transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
            {/* --- MODAL ADVERTENCIA DOCUMENTO AUDITADO (Card Mode) --- */}
            {auditedDeleteWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setAuditedDeleteWarning(false)}>
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border-t-4 border-amber-500" onClick={e => e.stopPropagation()}>
                        <div className="flex items-start gap-4 mb-4">
                            <div className="bg-amber-100 p-3 rounded-full text-amber-500 shrink-0">
                                <i className="pi pi-exclamation-triangle text-xl"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-secondary-dark leading-tight mb-1">Documento Auditado</h3>
                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded border border-amber-200">No se puede eliminar</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 border border-secondary/10 p-4 rounded-lg mb-4">
                            <p className="text-sm text-secondary-dark leading-relaxed italic">Este documento ya fue auditado por el equipo legal y no puede eliminarse. Puede reemplazarlo subiendo un nuevo archivo, que iniciará un nuevo ciclo de auditoría.</p>
                        </div>
                        <input
                            ref={replaceFileInputRef}
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                                if (auditedReplaceDoc) {
                                    handleFileUpload(e, auditedReplaceDoc.id, auditedReplaceDoc.label);
                                }
                                setAuditedDeleteWarning(false);
                                setAuditedReplaceDoc(null);
                            }}
                        />
                        <button
                            onClick={() => replaceFileInputRef.current?.click()}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-lg transition-colors mb-2"
                        >
                            <i className="pi pi-upload mr-2"></i>
                            Reemplazar archivo
                        </button>
                        <button
                            onClick={() => setAuditedDeleteWarning(false)}
                            className="w-full bg-secondary-light hover:bg-secondary/20 text-secondary-dark font-bold py-2.5 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SupplierStepDocuments;

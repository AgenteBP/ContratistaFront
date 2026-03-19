import React, { useState, useEffect } from 'react';
import { Calendar } from 'primereact/calendar';

/**
 * Shared DocumentCard component.
 * Displays a document requirement with its status, file info, and actions.
 *
 * Props:
 *   - label          : string  — Document name / requirement description
 *   - periodicity    : string  — e.g. "ANUAL", "MENSUAL", "UNICA VEZ"
 *   - submittedFile  : object|null — Backend file object with audit_info, expiration_date, etc.
 *   - onView         : (submittedFile) => void
 *   - onDelete       : (submittedFile) => void
 *   - onUpload       : (event, docId) => void   (optional — omit to hide upload button)
 *   - docId          : string|number           (needed when onUpload is provided)
 *   - loadingView    : bool
 *   - readOnly       : bool  — hide upload/delete, show only view
 */
const DocumentCard = ({
    label,
    periodicity,
    submittedFile,
    onView,
    onDelete,
    onUpload,
    onDateChange,
    docId,
    loadingView = false,
    readOnly = false,
    onPendingChange
}) => {
    const [expandedObs, setExpandedObs] = useState(false);
    const [localFile, setLocalFile] = useState(null);
    const [localDate, setLocalDate] = useState(null);

    // ── Derive Basic Info ──
    const isLocalPending = !!localFile;
    const fileName = localFile ? localFile.name : (submittedFile?.file_name || submittedFile?.fileName);

    // Notificar al padre sobre cambios en estado de "sin confirmar"
    useEffect(() => {
        if (onPendingChange) {
            onPendingChange(docId, isLocalPending);
        }
    }, [isLocalPending, docId, onPendingChange]);
    const _backendExpiration = submittedFile?.expiration_date || submittedFile?.expirationDate;
    const currentExpirationDate = (isLocalPending && localDate !== null) ? localDate : _backendExpiration;

    // ── Derive status from submitted file ───────────────────────────────────
    const getStatusInfo = (ignorePending = false) => {
        if (isLocalPending && !ignorePending) {
            return {
                label: 'POR GUARDAR',
                color: 'border-indigo-200 bg-indigo-50/50',
                badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
                iconBg: 'bg-indigo-100',
                iconColor: 'text-indigo-600'
            };
        }
        
        if (!submittedFile) return { label: 'PENDIENTE', color: 'border-slate-200 bg-white hover:border-slate-300', badge: 'bg-slate-100 text-slate-600 border-slate-200', iconBg: 'bg-slate-50', iconColor: 'text-slate-400' };

        const auditInfo = submittedFile.audit_info || submittedFile.auditInfo;
        const isForwarded = submittedFile.flag_forwarded || submittedFile.flagForwarded;
        const hasAudits = submittedFile.has_audits || submittedFile.hasAudits || !!auditInfo;

        if (hasAudits && !isForwarded && auditInfo) {
            const status = (auditInfo.audit_status || auditInfo.auditStatus || '').toUpperCase();
            if (status === 'APROBADO') return {
                label: 'VIGENTE',
                color: 'border-emerald-200 bg-emerald-50/30',
                badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                iconBg: 'bg-emerald-100',
                iconColor: 'text-emerald-600'
            };
            if (status === 'OBSERVADO' || status === 'RECHAZADO') return {
                label: 'CON OBSERVACIÓN',
                color: 'border-amber-300 bg-amber-50',
                badge: 'bg-amber-100 text-amber-700 border-amber-200',
                iconBg: 'bg-amber-100',
                iconColor: 'text-amber-600'
            };
        }

        return {
            label: 'EN REVISIÓN',
            color: 'border-sky-200 bg-sky-50/30',
            badge: 'bg-sky-100 text-sky-700 border-sky-200',
            iconBg: 'bg-sky-100',
            iconColor: 'text-sky-600'
        };
    };

    const status = getStatusInfo();
    const originalStatus = getStatusInfo(true);
    const observation = submittedFile?.audit_info?.audit_observations || submittedFile?.auditInfo?.auditObservations || submittedFile?.audit_info?.observation || submittedFile?.auditInfo?.observation;
    const isExpiring = !isLocalPending && currentExpirationDate && new Date(currentExpirationDate) < new Date();

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        if (dateStr instanceof Date) {
            return `${String(dateStr.getDate()).padStart(2, '0')}/${String(dateStr.getMonth() + 1).padStart(2, '0')}/${dateStr.getFullYear()}`;
        }
        const str = String(dateStr).split('T')[0];
        const p = str.split('-');
        return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dateStr;
    };

    const getSafeCalendarDate = (dateVal) => {
        if (!dateVal) return null;
        if (dateVal instanceof Date) return dateVal;
        const str = String(dateVal).split('T')[0];
        const validDate = new Date(`${str}T12:00:00`);
        return isNaN(validDate.getTime()) ? null : validDate;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLocalFile(file);
            
            const p = periodicity ? periodicity.toUpperCase() : '';
            if (p && p !== 'ÚNICA VEZ' && p !== 'UNICA VEZ' && p !== 'NO APLICA' && p !== 'N/A') {
                setLocalDate(prev => {
                    if (prev) return prev; // Keep the user's manual selection if it exists
                    
                    const now = new Date();
                    if (p.includes('ANUAL')) now.setFullYear(now.getFullYear() + 1);
                    else if (p.includes('SEMESTRAL')) now.setMonth(now.getMonth() + 6);
                    else if (p.includes('TRIMESTRAL')) now.setMonth(now.getMonth() + 3);
                    else if (p.includes('BIMESTRAL')) now.setMonth(now.getMonth() + 2);
                    else if (p.includes('MENSUAL')) now.setMonth(now.getMonth() + 1);
                    else if (p.includes('QUINCENAL')) now.setDate(now.getDate() + 15);
                    else if (p.includes('SEMANAL')) now.setDate(now.getDate() + 7);
                    else if (p.includes('DIARIO')) now.setDate(now.getDate() + 1);
                    return now;
                });
            } else {
                setLocalDate(null);
            }
        }
        e.target.value = null; // allow re-picking same file
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        if (onUpload) {
            setIsSubmitting(true);
            try {
                await onUpload(localFile, localDate);
                setLocalFile(null);
                setLocalDate(null);
            } catch (error) {
                console.error("Upload failed in DocumentCard", error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleDateChangeCustom = (e) => {
        const pickedDate = e.value;
        if (isLocalPending) {
            setLocalDate(pickedDate);
        } else if (onDateChange) {
            onDateChange(pickedDate, docId);
        }
    };

    return (
        <div className={`border rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-md h-full min-h-[160px] ${status.color}`}>

            {/* ── Header: icon + title + badge ── */}
            <div className="flex items-start gap-4 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-black/5 transition-transform duration-300 ${status.iconBg} ${status.iconColor} ${submittedFile ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}`}
                    onClick={() => submittedFile && onView && onView(submittedFile)}
                >
                    <i className={`pi ${status.label === 'VIGENTE' ? 'pi-verified' : status.label === 'POR GUARDAR' ? 'pi-file-import' : 'pi-file-pdf'} text-xl`} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-[13px] leading-snug break-words line-clamp-2 mb-1" title={label}>
                        {label}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded border ${status.badge}`}>
                            {status.label}
                        </span>
                        {periodicity && (
                            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                <i className="pi pi-clock text-[10px]" /> {periodicity}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Observation alert ── */}
            {observation && (
                <div
                    onClick={() => setExpandedObs(p => !p)}
                    className={`mb-3 p-2.5 bg-amber-50/80 border border-amber-200 rounded-lg flex flex-col ${expandedObs ? 'gap-2 items-start' : 'justify-center'} cursor-pointer hover:bg-amber-100 transition-colors`}
                >
                    <div className="flex items-center gap-2 w-full">
                        <i className="pi pi-exclamation-circle text-amber-500 text-[13px] mt-0.5" />
                        {expandedObs ? (
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Observación:</p>
                                <p className="text-[11px] text-amber-800 leading-tight italic font-medium">{observation}</p>
                            </div>
                        ) : (
                            <>
                                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Observación del Auditor</span>
                                <i className="pi pi-chevron-down text-[10px] text-amber-500 ml-auto" />
                            </>
                        )}
                        {expandedObs && <i className="pi pi-chevron-up text-[10px] text-amber-500 ml-auto mt-1 self-start" />}
                    </div>

                    {/* Nested Audited File Info */}
                    {(expandedObs && originalStatus.label === 'CON OBSERVACIÓN' && submittedFile) && (
                        <div className="p-2 border border-amber-200/50 bg-amber-100/40 rounded-lg flex items-center justify-between group/oldfile transition-all hover:bg-amber-200/40 cursor-pointer w-full mt-1"
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                if (onView) onView(submittedFile); 
                            }}
                        >
                            <div className="flex items-center gap-2 overflow-hidden flex-1">
                                <div className="bg-amber-200/50 p-1.5 rounded text-amber-600 shadow-sm">
                                    <i className="pi pi-file-pdf text-xs"></i>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[8px] font-extrabold text-amber-600 uppercase tracking-wider">Documento Auditado:</span>
                                    <span className="text-[10px] text-amber-800 font-bold truncate pr-1" title={submittedFile.file_name || submittedFile.fileName}>{submittedFile.file_name || submittedFile.fileName}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── File info section ── */}
            <div className="flex flex-col gap-3 mb-4 mt-auto">
                <div className="flex flex-col gap-1">
                    <span className="text-slate-500 font-bold text-[10px] uppercase flex items-center gap-1.5">
                        <i className="pi pi-paperclip text-[10px]" /> Archivo
                    </span>
                    <span className="text-slate-800 font-medium text-[12px] truncate w-full" title={isLocalPending ? localFile.name : (status.label === 'CON OBSERVACIÓN' ? 'Esperando nuevo archivo' : (fileName || 'Ninguno seleccionado'))}>
                        {isLocalPending ? (
                            <span className="text-indigo-600 font-semibold">{localFile.name}</span>
                        ) : status.label === 'CON OBSERVACIÓN' ? (
                            <span className="italic text-orange-600 font-semibold">Pendiente de corrección...</span>
                        ) : fileName ? (
                            <span>{fileName}</span>
                        ) : (
                            <span className="italic text-slate-400">Sin subir</span>
                        )}
                    </span>
                </div>
                
                {periodicity && periodicity.toUpperCase() !== 'ÚNICA VEZ' && periodicity.toUpperCase() !== 'UNICA VEZ' ? (
                    <div className="flex flex-col gap-1.5 w-full relative">
                        <label className="text-slate-500 font-bold text-[10px] uppercase flex items-center gap-1.5">
                            <i className="pi pi-calendar-clock text-[10px]" /> Vencimiento
                        </label>
                        <div className="relative">
                            <i className="pi pi-calendar absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] z-10 pointer-events-none" />
                            <Calendar
                                value={getSafeCalendarDate(currentExpirationDate)}
                                onChange={handleDateChangeCustom}
                                placeholder="dd/mm/aaaa"
                                disabled={isSubmitting || readOnly || (!isLocalPending && !submittedFile && status.label !== 'CON OBSERVACIÓN')}
                                minDate={new Date()}
                                className="w-full"
                                inputClassName={`p-inputtext-sm text-xs py-2 pl-8 font-semibold w-full bg-white rounded-lg border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary ${
                                    (isSubmitting || (!isLocalPending && !submittedFile && status.label !== 'CON OBSERVACIÓN')) 
                                      ? 'opacity-60 cursor-not-allowed bg-slate-50' 
                                      : 'hover:border-slate-300'
                                }`}
                                panelClassName="compact-calendar-panel max-w-[280px]"
                                dateFormat="dd/mm/yy"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1 w-full justify-end h-full">
                        <label className="text-slate-500 font-bold text-[10px] uppercase flex items-center gap-1.5 opacity-50">
                            <i className="pi pi-calendar-times text-[10px]" /> Vencimiento
                        </label>
                        <span className="font-mono text-[11px] font-bold text-slate-400 italic">
                            N/A
                        </span>
                    </div>
                )}
            </div>

            {/* ── Actions ── */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-auto">
                
                {/* 1. Ver Documento Backend (If not pending and not rejected) */}
                {(!isLocalPending && submittedFile && onView && originalStatus.label !== 'CON OBSERVACIÓN') && (
                    <button
                        onClick={() => onView(submittedFile)}
                        disabled={loadingView}
                        className="text-secondary-dark bg-secondary-light/30 hover:bg-secondary-light hover:text-primary rounded-lg px-3 py-1.5 transition-all text-[10px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-wait"
                        title="Ver Documento"
                    >
                        {loadingView ? <i className="pi pi-spin pi-spinner text-[10px]" /> : <i className="pi pi-external-link text-[10px]" />} VER
                    </button>
                )}

                {/* 2. Ver Documento Local (If pending upload) */}
                {(isLocalPending && localFile) && (
                    <button
                        onClick={() => {
                            const url = URL.createObjectURL(localFile);
                            window.open(url, '_blank');
                        }}
                        className="text-secondary-dark bg-secondary-light/30 hover:bg-secondary-light hover:text-primary rounded-lg px-3 py-1.5 transition-all text-[10px] font-bold flex items-center justify-center gap-1.5"
                        title="Previsualizar archivo a subir"
                    >
                        <i className="pi pi-external-link text-[10px]" /> VER
                    </button>
                )}

                {isLocalPending ? (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleConfirm}
                            disabled={isSubmitting || (periodicity?.toUpperCase() !== 'ÚNICA VEZ' && periodicity?.toUpperCase() !== 'UNICA VEZ' && !localDate)}
                            className={`text-primary bg-primary-light hover:bg-primary hover:text-white rounded-lg px-3 py-1.5 transition-all text-[10px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 ${(isSubmitting || (periodicity?.toUpperCase() !== 'ÚNICA VEZ' && periodicity?.toUpperCase() !== 'UNICA VEZ' && !localDate)) ? 'cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <><i className="pi pi-spin pi-spinner text-[10px]" /> GUARDANDO...</>
                            ) : (
                                <><i className="pi pi-check text-[10px]" /> GUARDAR</>
                            )}
                        </button>
                        <button
                            onClick={() => { setLocalFile(null); setLocalDate(null); }}
                            disabled={isSubmitting}
                            className={`w-8 h-8 flex-shrink-0 rounded-lg font-bold transition-all flex items-center justify-center bg-secondary-light/30 text-secondary-dark hover:bg-secondary-light hover:text-danger ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <i className="pi pi-times text-[10px]" />
                        </button>
                    </div>
                ) : (
                    !readOnly && onUpload && (
                        <label className="relative cursor-pointer">
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <div className="text-primary bg-primary-light hover:bg-primary hover:text-white rounded-lg px-3 py-1.5 transition-all text-[10px] font-bold flex items-center justify-center gap-1.5">
                                <i className="pi pi-upload text-[10px]" /> {submittedFile ? 'ACTUALIZAR' : 'SUBIR'}
                            </div>
                        </label>
                    )
                )}

                {(!isLocalPending && !readOnly && submittedFile && onDelete) && (
                    <button
                        onClick={() => onDelete(submittedFile)}
                        className="w-8 h-8 flex-shrink-0 rounded-lg font-bold transition-all flex items-center justify-center bg-danger/5 text-danger hover:bg-danger/10"
                        title="Eliminar Documento"
                    >
                        <i className="pi pi-trash text-[10px]" />
                    </button>
                )}
                {(!isLocalPending && !submittedFile && readOnly) && (
                    <div className="flex-1 text-right text-[11px] font-medium text-slate-400 italic">
                        Pendiente de carga
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentCard;

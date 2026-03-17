import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { StatusBadge } from '../../ui/Badges';
import ConfirmationModal from '../../ui/ConfirmationModal';
import ObservationModal from '../../ui/ObservationModal';
import SectionTitle from '../../ui/SectionTitle';
import { requirementService } from '../../../services/requirementService';
import { groupService } from '../../../services/groupService';

const DocumentsData = ({ data, onBack, onSubmit, type }) => {
    const [formData, setFormData] = useState(data);
    const [docViewMode, setDocViewMode] = useState('grid');
    const [expandedObservations, setExpandedObservations] = useState({});
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null);
    const [obsModalVisible, setObsModalVisible] = useState(false);
    const [selectedObs, setSelectedObs] = useState({ title: '', content: '' });
    const [draggingDocId, setDraggingDocId] = useState(null);

    const [requiredDocs, setRequiredDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    const periodicityMap = {
        1: 'Mensual',
        2: 'Anual',
        3: 'Única vez',
        4: 'Vigencia'
    };

    const typeToActiveType = {
        'EMPLOYEE': 1,
        'VEHICLE': 2,
        'MACHINERY': 4
    };

    useEffect(() => {
        const fetchRequirements = async () => {
            setLoading(true);
            try {
                const idActiveType = typeToActiveType[type];
                const idGroup = data.id_group || 1;
                const idSupplier = data.id_supplier || 1;

                console.log(`[DocumentsData] Fetching for ${type}: idGroup=${idGroup}, idActiveType=${idActiveType}, idSupplier=${idSupplier}`);

                // Use getSpecific instead of getListRequirements (matching Supplier flow)
                const groupReqs = await groupService.getSpecific(idSupplier, idGroup, idActiveType);
                
                console.log("[DocumentsData] Raw groupReqs:", groupReqs);

                const mapped = groupReqs.map(req => {
                    const listReq = req.list_requirements || req.listRequirements || {};
                    const template = listReq.attribute_template || listReq.attributeTemplate || {};
                    const attrs = template.attributes || {};
                    
                    // Robust extraction from attribute_template based on project patterns
                    const rawIdActive = template.id_active?.id_active || template.id_active || template.idActive;
                    const idActive = (rawIdActive && typeof rawIdActive === 'object') ? rawIdActive.id_active : rawIdActive;

                    
                    const idAttributes = attrs.id_attributes || attrs.idAttributes || template.id_attributes || template.idAttributes;
                    
                    return {
                        id: listReq.id_list_requirements || listReq.idListRequirements,
                        label: listReq.description,
                        frecuencia: periodicityMap[attrs.id_periodicity] || 'Única vez',
                        obligatoriedad: attrs.is_required ? 'Obligatorio' : 'Opcional',
                        id_active: idActive,
                        id_attribute: attrs.id_attributes || attrs.idAttributes || template.id_attributes || template.idAttributes
                    };
                }).filter(doc => !!doc.id); // Ensure valid objects

                console.log("[DocumentsData] Mapped requirements:", mapped);

                // Conditional filtering for specific cases
                const filtered = mapped.filter(doc => {
                    // 1. Logic-based generic filtering
                    if (doc.label.toUpperCase().includes('GNC') && !data.tieneGNC) return false;
                    if (doc.label.toUpperCase().includes('CONDUCIR') && !data.esChofer) return false;

                    // 2. Specific Active ID filtering
                    // If a requirement has a specific id_active, it MUST match the selected data.idActive
                    const selectedIdActive = Number(data.idActive);
                    const docIdActive = doc.id_active ? Number(doc.id_active) : null;

                    if (docIdActive && selectedIdActive && docIdActive !== selectedIdActive) {
                        console.log(`[DocumentsData] Filtering out ${doc.label}: docIdActive=${docIdActive} != selected=${selectedIdActive}`);
                        return false;
                    }

                    return true;
                });

                console.log("[DocumentsData] Filtered requirements:", filtered);
                setRequiredDocs(filtered);
            } catch (error) {
                console.error("Error fetching requirements in DocumentsData:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequirements();
    }, [type, data.id_group, data.id_supplier, data.tieneGNC, data.esChofer, data.idActive]);

    const toggleObservation = (id) => {
        setExpandedObservations(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleFileUpload = (docId, eOrFile) => {
        let file;
        if (eOrFile instanceof File) {
            file = eOrFile;
        } else {
            file = eOrFile.target.files?.[0];
        }

        if (file) {
            const fileUrl = URL.createObjectURL(file);
            const docReq = requiredDocs.find(d => d.id === docId);
            
            setFormData(prev => {
                const currentDocs = prev.documents || [];
                const docIndex = currentDocs.findIndex(d => d.tipo === docId);
                let newDocs;
                if (docIndex >= 0) {
                    newDocs = [...currentDocs];
                    newDocs[docIndex] = { 
                        ...newDocs[docIndex], 
                        archivo: file.name, 
                        fileUrl, 
                        rawFile: file, 
                        estado: 'EN REVISIÓN',
                        id_attribute: docReq?.id_attribute
                    };
                } else {
                    newDocs = [...currentDocs, { 
                        id: Date.now(), 
                        tipo: docId, 
                        estado: 'EN REVISIÓN', 
                        archivo: file.name, 
                        fileUrl, 
                        rawFile: file,
                        id_attribute: docReq?.id_attribute
                    }];
                }
                return { ...prev, documents: newDocs };
            });
        }
    };

    const onDragOver = (e, docId) => {
        e.preventDefault();
        setDraggingDocId(docId);
    };

    const onDragLeave = () => {
        setDraggingDocId(null);
    };

    const onDrop = (e, docId) => {
        e.preventDefault();
        setDraggingDocId(null);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileUpload(docId, file);
        }
    };

    const handleRemoveFile = (docId) => {
        setDocToDelete(docId);
        setConfirmModalOpen(true);
    };

    const confirmDeleteFile = () => {
        setFormData(prev => {
            const currentDocs = prev.documents || [];
            const newDocs = currentDocs.map(d => d.tipo === docToDelete ? { ...d, archivo: null, fileUrl: null, estado: 'PENDIENTE', fechaVencimiento: null } : d);
            return { ...prev, documents: newDocs };
        });
        setConfirmModalOpen(false);
        setDocToDelete(null);
    };

    const handleDateChange = (docId, date) => {
        if (!date) return;
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const docReq = requiredDocs.find(d => d.id === docId);

        setFormData(prev => {
            const currentDocs = prev.documents || [];
            const docIndex = currentDocs.findIndex(d => d.tipo === docId);
            let newDocs;
            if (docIndex >= 0) {
                newDocs = [...currentDocs];
                newDocs[docIndex] = { 
                    ...newDocs[docIndex], 
                    fechaVencimiento: formattedDate,
                    id_attribute: docReq?.id_attribute
                };
            } else {
                newDocs = [...currentDocs, { 
                    id: Date.now(), 
                    tipo: docId, 
                    estado: 'PENDIENTE', 
                    fechaVencimiento: formattedDate,
                    id_attribute: docReq?.id_attribute
                }];
            }
            return { ...prev, documents: newDocs };
        });
    };

    const handleFinalSubmit = () => {
        onSubmit(formData);
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-xl border border-secondary/20 shadow-sm animate-fade-in max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <SectionTitle
                    title="Documentación Requerida"
                    subtitle="Suba los archivos correspondientes para habilitar el recurso."
                />

                <div className="hidden md:flex bg-secondary-light/50 p-1 rounded-xl border border-secondary/10 w-fit">
                    <button
                        onClick={() => setDocViewMode('grid')}
                        className={`p-2 rounded-lg transition-all cursor-pointer ${docViewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:text-secondary-dark'}`}
                        title="Vista Mosaico"
                    >
                        <i className="pi pi-th-large"></i>
                    </button>
                    <button
                        onClick={() => setDocViewMode('table')}
                        className={`p-2 rounded-lg transition-all cursor-pointer ${docViewMode === 'table' ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:text-secondary-dark'}`}
                        title="Vista Tabla"
                    >
                        <i className="pi pi-bars"></i>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-secondary-light/20 rounded-2xl border-2 border-dashed border-secondary/10">
                    <i className="pi pi-spin pi-spinner text-3xl text-primary mb-4"></i>
                    <p className="text-sm font-bold text-secondary">Cargando requisitos de documentación...</p>
                </div>
            ) : docViewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {requiredDocs.map(doc => {
                        const docData = formData.documents?.find(d => d.tipo === doc.id);
                        const status = docData?.estado || 'PENDIENTE';
                        const isDragging = draggingDocId === doc.id;

                        return (
                            <div key={doc.id} className={`border rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-md bg-white group relative h-full min-h-[160px] ${isDragging ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-secondary/20'}`}>
                                <div className="flex-1 flex flex-col h-full">
                                    <div className="flex items-start gap-4 mb-3">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${status === 'VIGENTE' ? 'bg-success/10 border-success/20 text-success' :
                                            status === 'VENCIDO' ? 'bg-danger/10 border-danger/20 text-danger' :
                                                status === 'EN REVISIÓN' ? 'bg-info/10 border-info/20 text-info' :
                                                    'bg-secondary/10 border-secondary/20 text-secondary'
                                            }`}>
                                            <i className={`pi ${String(doc.id).includes('SEGURO') ? 'pi-shield' : 'pi-file-pdf'} text-xl group-hover:scale-110 transition-transform`}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-secondary-dark text-[13px] leading-tight mb-1" title={doc.label}>{doc.label}</h4>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border inline-block ${status === 'VIGENTE' && docData?.isExpiringSoon ? 'bg-warning/10 text-warning border-warning/20' :
                                                    status === 'VIGENTE' ? 'bg-success/10 text-success border-success/20' :
                                                        status === 'VENCIDO' ? 'bg-danger/10 text-danger border-danger/20' :
                                                            status === 'EN REVISIÓN' ? 'bg-info/10 text-info border-info/20' :
                                                                'bg-secondary/10 text-secondary border-secondary/20'
                                                }`}>
                                                {status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col gap-3 mt-2">
                                        <div className="flex items-center gap-2.5 bg-secondary-light/30 p-2 rounded-lg border border-secondary/5 shrink-0">
                                            <i className="pi pi-clock text-primary text-[11px]"></i>
                                            <span className="text-xs font-medium text-secondary-dark">{doc.frecuencia} — {doc.obligatoriedad}</span>
                                        </div>

                                        {doc.frecuencia !== 'Única vez' && (
                                            <div className="flex flex-col w-full shrink-0">
                                                <div className="flex items-center gap-2">
                                                    <i className={`pi pi-calendar text-base ${docData?.archivo ? 'text-primary' : 'text-secondary/30'}`}></i>
                                                    <Calendar
                                                        value={docData?.fechaVencimiento ? new Date(docData.fechaVencimiento) : null}
                                                        onChange={(e) => handleDateChange(doc.id, e.value)}
                                                        placeholder="Vencimiento"
                                                        disabled={!docData?.archivo}
                                                        minDate={new Date()}
                                                        className={`compact-calendar-input w-full ${!docData?.archivo ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                        panelClassName="compact-calendar-panel"
                                                        dateFormat="dd/mm/yy"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {!docData?.archivo ? (
                                            <div
                                                className={`flex-1 relative group/upload min-h-[100px] cursor-pointer transition-all duration-300`}
                                                onDragOver={(e) => onDragOver(e, doc.id)}
                                                onDragLeave={onDragLeave}
                                                onDrop={(e) => onDrop(e, doc.id)}
                                            >
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleFileUpload(doc.id, e)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all p-3 ${isDragging
                                                    ? 'border-primary bg-primary/10 text-primary scale-105 shadow-lg'
                                                    : 'border-secondary/20 bg-secondary/5 text-secondary/60 group-hover/upload:border-primary/50 group-hover/upload:bg-primary/5 group-hover/upload:text-primary'
                                                    }`}>
                                                    <i className={`pi ${isDragging ? 'pi-download animate-bounce' : 'pi-cloud-upload'} text-2xl mb-1`}></i>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-center">
                                                        {isDragging ? 'Soltar aquí' : 'Subir o arrastrar'}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-auto group/file flex items-center justify-between p-2 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                                                onClick={() => docData.fileUrl ? window.open(docData.fileUrl, '_blank') : null}
                                            >
                                                <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                    <div className="bg-white p-1.5 rounded-md text-primary shadow-sm">
                                                        <i className="pi pi-file-pdf text-xs"></i>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-primary-dark truncate pr-2">
                                                        {docData.archivo}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveFile(doc.id); }}
                                                    className="text-secondary/40 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all shrink-0 z-10"
                                                >
                                                    <i className="pi pi-trash text-xs"></i>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-secondary/10 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse md:table-fixed">
                        <thead className="hidden md:table-header-group">
                            <tr className="bg-secondary-light/30 border-b border-secondary/10">
                                <th className="px-6 py-4 text-[10px] font-bold text-secondary/60 uppercase tracking-widest w-[40%]">Documento</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-secondary/60 uppercase tracking-widest text-center w-[20%] md:pr-10">Estado</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-secondary/60 uppercase tracking-widest w-[25%]">Vencimiento</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-secondary/60 uppercase tracking-widest text-right w-[15%]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary/5">
                            {requiredDocs.map(doc => {
                                const docData = formData.documents?.find(d => d.tipo === doc.id);
                                const status = docData?.estado || 'PENDIENTE';

                                return (
                                    <tr key={doc.id} className="hover:bg-secondary-light/5 transition-colors group flex flex-col md:table-row p-4 md:p-0">
                                        {/* Doc Info */}
                                        <td className="md:px-6 md:py-4 md:w-[40%]">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-secondary-light p-2.5 rounded-lg text-secondary group-hover:text-primary group-hover:bg-primary/5 transition-all shrink-0">
                                                    <i className="pi pi-file text-sm"></i>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-secondary-dark text-xs truncate" title={doc.label}>{doc.label}</p>
                                                    <p className="text-[10px] text-secondary/60 truncate">{doc.frecuencia} — {doc.obligatoriedad}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="py-2 md:px-6 md:py-4 md:text-center md:w-[20%] md:pr-10">
                                            <div className="flex items-center justify-between md:justify-center">
                                                <span className="md:hidden text-[9px] font-bold text-secondary/40 uppercase tracking-wider">Estado</span>
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${status === 'VIGENTE' && docData?.isExpiringSoon ? 'bg-warning/10 text-warning border-warning/20' :
                                                        status === 'VIGENTE' ? 'bg-success/5 text-success border-success/20' :
                                                            status === 'VENCIDO' ? 'bg-danger/5 text-danger border-danger/20' :
                                                                status === 'EN REVISIÓN' ? 'bg-info/5 text-info border-info/20' :
                                                                    'bg-secondary/5 text-secondary border-secondary/20'
                                                    }`}>
                                                    {status}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Expiration */}
                                        <td className="py-2 md:px-6 md:py-4 md:w-[25%]">
                                            <div className="flex items-center justify-between md:justify-start gap-2">
                                                <span className="md:hidden text-[9px] font-bold text-secondary/40 uppercase tracking-wider">Vencimiento</span>
                                                {doc.frecuencia === 'Única vez' ? (
                                                    <span className="text-[11px] font-bold text-secondary/30 italic">N/A</span>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <i className={`pi pi-calendar text-xs hidden md:block ${docData?.archivo ? 'text-primary' : 'text-secondary/20'}`}></i>
                                                        <Calendar
                                                            value={docData?.fechaVencimiento ? new Date(docData.fechaVencimiento) : null}
                                                            onChange={(e) => handleDateChange(doc.id, e.value)}
                                                            placeholder="dd/mm/yy"
                                                            disabled={!docData?.archivo}
                                                            minDate={new Date()}
                                                            className={`compact-calendar-input scale-90 w-28 ${!docData?.archivo ? 'opacity-30' : ''}`}
                                                            panelClassName="compact-calendar-panel"
                                                            dateFormat="dd/mm/yy"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="pt-3 pb-1 md:px-6 md:py-4 md:text-right md:w-[15%] border-t md:border-t-0 border-secondary/5 mt-1 md:mt-0">
                                            <div className="flex items-center justify-between md:justify-end gap-2">
                                                <span className="md:hidden text-[9px] font-bold text-secondary/40 uppercase tracking-wider">Acciones</span>
                                                <div className="flex items-center gap-2">
                                                    {docData?.archivo ? (
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => docData.fileUrl && window.open(docData.fileUrl, '_blank')}
                                                                className="h-8 w-8 flex items-center justify-center text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-all cursor-pointer"
                                                                title="Ver Documento"
                                                            >
                                                                <i className="pi pi-eye text-sm"></i>
                                                            </button>
                                                            <button
                                                                onClick={() => handleRemoveFile(doc.id)}
                                                                className="h-8 w-8 flex items-center justify-center text-danger bg-danger/5 hover:bg-danger/10 rounded-lg transition-all cursor-pointer"
                                                                title="Eliminar"
                                                            >
                                                                <i className="pi pi-trash text-sm"></i>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="relative overflow-hidden inline-block"
                                                            onDragOver={(e) => onDragOver(e, doc.id)}
                                                            onDragLeave={onDragLeave}
                                                            onDrop={(e) => onDrop(e, doc.id)}
                                                        >
                                                            <button className={`font-bold py-1.5 px-4 rounded-lg text-[10px] transition-all flex items-center gap-2 ${draggingDocId === doc.id ? 'bg-primary text-white scale-105 shadow-md' : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/10'
                                                                }`}>
                                                                <i className={`pi ${draggingDocId === doc.id ? 'pi-download animate-bounce' : 'pi-cloud-upload'}`}></i>
                                                                {draggingDocId === doc.id ? 'SOLTAR' : 'SUBIR'}
                                                            </button>
                                                            <input
                                                                type="file"
                                                                onChange={(e) => handleFileUpload(doc.id, e)}
                                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                            />
                                                        </div>
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

            <div className="bg-secondary-light p-4 md:px-8 md:py-4 border-t border-secondary/20 flex flex-col-reverse gap-3 md:flex-row md:justify-between md:items-center mt-8 -mx-6 md:-mx-8 -mb-6 md:-mb-8 rounded-b-xl">
                <button
                    onClick={onBack}
                    className="text-secondary hover:text-secondary-dark font-bold text-sm px-4 py-2 hover:underline transition-all w-full md:w-auto text-left"
                >
                    <i className="pi pi-arrow-left text-xs mr-1 text-primary"></i> Volver
                </button>
                <button
                    onClick={handleFinalSubmit}
                    className="text-white bg-primary hover:bg-primary-hover font-bold rounded-lg text-sm px-6 py-2.5 text-center flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/20 transition-all w-full md:w-auto"
                >
                    Finalizar Registro <i className="pi pi-check text-xs ml-1"></i>
                </button>
            </div>

            <ObservationModal
                visible={obsModalVisible}
                onHide={() => setObsModalVisible(false)}
                title="Observación de Auditoría"
                docName={selectedObs.title}
                content={selectedObs.content}
            />

            <ConfirmationModal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={confirmDeleteFile}
                title="¿Eliminar archivo?"
                message="Esta acción eliminará el archivo cargado. Deberá subirlo nuevamente si es un requisito obligatorio."
                confirmLabel="Eliminar"
                severity="danger"
            />
        </div>
    );
};

export default DocumentsData;

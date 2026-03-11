import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { requirementService } from '../../services/requirementService';
import { groupService } from '../../services/groupService';
import { fileService } from '../../services/fileService';
import { auditorService } from '../../services/auditorService';
import { supplierService } from '../../services/supplierService';
import elementService from '../../services/elementService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Column } from 'primereact/column';
import AppTable from '../ui/AppTable';
import TableFilters from '../ui/TableFilters';
import ObservationModal from '../ui/ObservationModal';
import { DOC_TYPE_LABELS } from '../../data/documentConstants';
import { useSupplier } from '../../hooks/useSupplier';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import AuditDocumentModal from '../ui/AuditDocumentModal';
import { TbBackhoe } from 'react-icons/tb';

const DocumentEntityTable = ({ type, filterStatus, explicitCuit, onAuditComplete, onTypeChange }) => {
    const navigate = useNavigate();
    const { user, currentRole, isAuditorLegal, isAdmin } = useAuth();
    const { showError, showWarning } = useNotification();
    const { supplierData, updateSupplier } = useSupplier(explicitCuit);
    const [data, setData] = useState([]);
    const [allRawDocs, setAllRawDocs] = useState([]);
    const [filteredData, setFilteredData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingDocs, setLoadingDocs] = useState({});
    const [observationModalVisible, setObservationModalVisible] = useState(false);
    const [selectedObservation, setSelectedObservation] = useState(null);
    const [filters, setFilters] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [activeCategory, setActiveCategory] = useState(5); // Default to Legajo (5)

    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadDate, setUploadDate] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Audit States
    const [auditModalVisible, setAuditModalVisible] = useState(false);
    const [auditingDoc, setAuditingDoc] = useState(null);
    const [isSubmittingAudit, setIsSubmittingAudit] = useState(false);

    // Race condition protection
    const lastFetchId = useRef(0);

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: 'contains' },
            estado: { value: null, matchMode: 'equals' },
            tipo: { value: null, matchMode: 'equals' },
            entityName: { value: null, matchMode: 'equals' },
            proveedor: { value: null, matchMode: 'equals' }
        });
        setGlobalFilterValue('');
    };



    const getCategoryFromDoc = (typeId, label) => {
        const id = Number(typeId);
        const name = String(label || '').toLowerCase();

        if (id === 1) return 1;
        if (id === 2) return 2;
        if (id === 3) return 3;
        if (id === 5) return 5;

        if (name.includes('seguro personal') || name.includes('accidentes personales') || name.includes('art')) {
            return 5; // Force 'Seguro Personal' to Legajo (5)
        }

        if (name.includes('empleado') || name.includes('personal') || name.includes('recurso')) return 1;
        if (name.includes('vehiculo') || name.includes('unidad') || name.includes('camion')) return 2;
        if (name.includes('maquinaria') || name.includes('equipo') || name.includes('herramienta')) return 3;

        return 5; // Default to Legajo
    };

    useEffect(() => {
        initFilters();
        loadData();
    }, [type, user, currentRole, explicitCuit]);

    useEffect(() => {
        // Sync category with type when it changes
        if (type === 'suppliers') setActiveCategory(5);
        else if (type === 'employees') setActiveCategory(1);
        else if (type === 'vehicles') setActiveCategory(2);
        else if (type === 'machinery') setActiveCategory(3);
    }, [type]);

    useEffect(() => {
        const filteredDocs = allRawDocs.filter(doc => {
            // Category Filter (Legajo, Personal, etc)
            if (activeCategory && Number(doc.id_active_type) !== activeCategory) return false;

            if (filterStatus === 'general') return true;
            const s = doc.estado || 'PENDIENTE';
            switch (filterStatus) {
                case 'pending_upload': return s === 'PENDIENTE' || s === 'INCOMPLETA' || s === 'VENCIDO';
                case 'expiring': return doc.isExpiringSoon || s === 'VENCIDO';
                case 'observed': return s === 'CON OBSERVACIÓN' || s === 'RECHAZADO' || s === 'OBSERVADO';
                case 'in_review': return s === 'EN REVISIÓN';
                case 'valid': return s === 'VIGENTE' || s === 'COMPLETA';
                default: return true;
            }
        });

        filteredDocs.sort((a, b) => (a.entityId || '').localeCompare(b.entityId || ''));
        setData(filteredDocs);
    }, [allRawDocs, activeCategory, filterStatus]);

    const loadData = async () => {
        const currentFetchId = ++lastFetchId.current;
        setLoading(true);
        // Reset data immediately to avoid showing "ghost" data from previous supplier
        setData([]);
        setAllRawDocs([]);

        try {
            let allDocuments = [];
            const categoryId = type === 'suppliers' ? 5 : (type === 'employees' ? 1 : (type === 'vehicles' ? 2 : (type === 'machinery' ? 4 : 5)));
            const isProvider = currentRole?.role === 'PROVEEDOR';

            // Identify CUIT: either explicit from props or from role
            const effectiveCuit = explicitCuit || (isProvider ? (currentRole?.entityCuit || currentRole?.cuit || user?.suppliers?.[0]?.cuit) : null);

            if (effectiveCuit) {
                // Optimized Path: We have a specific CUIT (Provider view or Audit Modal)
                if (type === 'suppliers') {
                    const response = await requirementService.getSupplierDocuments(effectiveCuit);
                    if (response) {
                        const idSupplier = response.id_supplier || response.idSupplier || response.id;
                        const idGroup = response.id_group || response.idGroup;
                        allDocuments = await mapSupplierToDocuments(response, idSupplier, idGroup, categoryId);
                    }
                } else {
                    // Try to get internal supplier ID from supplierData hook or by fetching it quickly
                    let idSupplier = supplierData?.id_supplier || supplierData?.internalId;

                    if (!idSupplier && effectiveCuit) {
                        // Minimal fetch to get ID if hook hasn't loaded it yet
                        const s = await supplierService.getById(effectiveCuit);
                        idSupplier = s?.id_supplier || s?.idSupplier || s?.id;
                    }

                    const idGroup = supplierData?.id_group || supplierData?.idGroup;

                    if (idSupplier) {
                        const elements = await elementService.getBySupplierAndActiveType(idSupplier, categoryId);
                        let groupReqs = idGroup ? await requirementService.getGroupRequirementsDetails({ idSupplier, idGroup, idActiveType: categoryId }) : [];
                        allDocuments = mapElementsToDocuments(elements, groupReqs, categoryId, type);
                    }
                }
            } else {
                // Auditor/Admin Logic - Global view (Multiple Suppliers)
                if (type === 'suppliers') {
                    let suppliers = await supplierService.getAuthorizedSuppliers(user.id, currentRole?.role || currentRole?.name, currentRole?.id_entity);



                    const docPromises = suppliers.map(async (supplier) => {
                        const idSupplier = supplier.id_supplier || supplier.idSupplier || supplier.id;
                        const idGroup = supplier.id_group || supplier.idGroup;
                        // getSupplierDocuments gets full structure needed by mapSupplierToDocuments
                        try {
                            const fullSupplier = await requirementService.getSupplierDocuments(supplier.cuit);
                            return await mapSupplierToDocuments(fullSupplier, idSupplier, idGroup, categoryId);
                        } catch (e) {
                            console.warn("Error fetching documents for supplier", supplier.cuit, e);
                            return [];
                        }
                    });
                    const results = await Promise.all(docPromises);
                    allDocuments = results.flat();
                } else {
                    let elements = await elementService.getAuthorized(categoryId, user.id, currentRole?.role || currentRole?.name, currentRole?.id_entity);



                    // Group elements by supplier
                    const elementsBySupplier = elements.reduce((acc, el) => {
                        const sId = el.supplier?.id_supplier || el.supplier?.idSupplier;
                        if (sId) {
                            if (!acc[sId]) acc[sId] = { elements: [], idGroup: el.supplier.id_group || el.supplier.idGroup };
                            acc[sId].elements.push(el);
                        }
                        return acc;
                    }, {});

                    const docPromises = Object.entries(elementsBySupplier).map(async ([idSupplier, data]) => {
                        let groupReqs = [];
                        if (data.idGroup) {
                            try {
                                groupReqs = await requirementService.getGroupRequirementsDetails({
                                    idSupplier: Number(idSupplier),
                                    idGroup: data.idGroup,
                                    idActiveType: categoryId
                                });
                            } catch (e) {
                                console.warn("Error fetching group requirements for", idSupplier, e);
                            }
                        }
                        return mapElementsToDocuments(data.elements, groupReqs, categoryId, type);
                    });
                    const results = await Promise.all(docPromises);
                    allDocuments = results.flat();
                }
            }

            if (currentFetchId !== lastFetchId.current) return;
            setAllRawDocs(allDocuments);
        } catch (error) {
            console.error("DocumentEntityTable: Error loading data", error);
        } finally {
            if (currentFetchId === lastFetchId.current) {
                setLoading(false);
            }
        }
    };

    const mapSupplierToDocuments = async (response, idSupplier, idGroup, categoryId) => {
        let allDocuments = [];
        if (idGroup && idSupplier) {
            try {
                const groupReqs = await groupService.getSpecific(idSupplier, idGroup);
                if (groupReqs && groupReqs.length > 0) {
                    const docMap = new Map();
                    groupReqs.forEach(req => {
                        const listReq = req.list_requirements || req.listRequirements;
                        if (!listReq) return;

                        const attrTempl = listReq.attribute_template || listReq.attributeTemplate;
                        const attrs = attrTempl?.attributes;
                        const files = listReq.files || [];
                        const submittedFile = files.length > 0 ? files[0] : null;

                        const requirementId = listReq.id_list_requirements || listReq.idListRequirements;
                        const key = req.idGroupRequirements || req.id_group_requirements || requirementId;

                        if (!docMap.has(key)) {
                            const label = listReq.description || attrs?.description || 'Documento';
                            let finalStatus = 'PENDIENTE';
                            const isFile = !!submittedFile;
                            const auditInfo = submittedFile?.audit_info || submittedFile?.auditInfo;
                            const isForwarded = submittedFile?.flag_forwarded || submittedFile?.flagForwarded || false;

                            const hasAudit = !!(submittedFile?.has_audits || submittedFile?.hasAudits || auditInfo);
                            const auditStatus = (auditInfo?.audit_status || auditInfo?.auditStatus || '')?.toUpperCase();

                            const rawVencForStatus = submittedFile?.expiration_date || null;
                            let isExpired = false;
                            let isExpiringSoon = false;

                            if (rawVencForStatus && isFile) {
                                try {
                                    const dateStr = String(rawVencForStatus);
                                    let expDate;
                                    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
                                    if (match) {
                                        expDate = new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10));
                                    } else {
                                        expDate = new Date(dateStr);
                                        expDate.setHours(0, 0, 0, 0);
                                    }

                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);

                                    const tenDaysFromNow = new Date();
                                    tenDaysFromNow.setHours(0, 0, 0, 0);
                                    tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);

                                    if (expDate < today) {
                                        isExpired = true;
                                    } else if (expDate <= tenDaysFromNow) {
                                        isExpiringSoon = true;
                                    }
                                } catch (e) { }
                            }

                            if (hasAudit && !isForwarded) {
                                if (auditStatus === 'APROBADO') {
                                    if (isExpired) finalStatus = 'VENCIDO';
                                    else finalStatus = 'VIGENTE';
                                }
                                else if (auditStatus === 'OBSERVADO' || auditStatus === 'RECHAZADO') finalStatus = 'CON OBSERVACIÓN';
                                else finalStatus = 'EN REVISIÓN';
                            } else {
                                if (isFile) {
                                    if (isExpired) finalStatus = 'VENCIDO';
                                    else finalStatus = 'EN REVISIÓN';
                                } else {
                                    finalStatus = 'PENDIENTE';
                                }
                            }

                            docMap.set(key, {
                                id: `${idSupplier}_${key}`,
                                id_group_req: key,
                                id_attribute: attrs?.id_attributes || attrs?.idAttributes,
                                id_file_submitted: submittedFile?.id_file_submitted || submittedFile?.idFileSubmitted || null,
                                entityId: String(idSupplier),
                                entityName: response.company_name,
                                entityType: 'Proveedor',
                                tipo: attrs?.id_attributes || requirementId,
                                id_active_type: categoryId,
                                label: label.replace(/ obligatorio/i, '').trim(),
                                estado: finalStatus,
                                fechaVencimiento: submittedFile?.expiration_date || null,
                                observacion: isForwarded ? null : (auditInfo?.audit_observations || auditInfo?.auditObservations || null),
                                frecuencia: attrs?.periodicity_description || attrs?.periodicityDescription || 'Única vez',
                                archivo: submittedFile?.file_name || submittedFile?.fileName || null,
                                obligatorio: true,
                                proveedor: response.company_name,
                                isExpiringSoon: isExpiringSoon
                            });
                        }
                    });
                    allDocuments = Array.from(docMap.values());
                }
            } catch (err) {
                console.warn("DocumentEntityTable: Failed to fetch group requirements", err);
            }
        }

        if (allDocuments.length === 0 && response.elements) {
            allDocuments = response.elements.map(el => {
                const activeDesc = el.active?.description || 'DOCUMENTO';
                const docTypeStr = el.data?.tipo || activeDesc;
                const submittedFile = el.files_submitted?.[0];
                let finalStatus = submittedFile ? 'EN REVISIÓN' : 'PENDIENTE';

                return {
                    id: `${idSupplier}_${el.id_elements}`,
                    entityId: String(idSupplier),
                    entityName: response.company_name,
                    entityType: 'Proveedor',
                    tipo: docTypeStr,
                    id_active_type: categoryId,
                    label: el.active?.description || docTypeStr.replace(/_/g, ' '),
                    estado: finalStatus,
                    fechaVencimiento: submittedFile?.expiration_date || el.data?.fechaVencimiento || null,
                    observacion: submittedFile?.audit_info?.audit_observations || el.data?.observacion || null,
                    frecuencia: el.data?.frecuencia || 'Mensual',
                    archivo: submittedFile?.id_file_submitted || el.data?.archivo || null,
                    obligatorio: true,
                    proveedor: response.company_name
                };
            });
        }
        return allDocuments;
    };

    const mapElementsToDocuments = (elements, groupReqs, categoryId, typeName) => {
        const tempDocs = [];
        elements.forEach(el => {
            const proveedor = el.supplier?.company_name || el.supplier?.businessName || el.data?.proveedor || 'Proveedor';
            groupReqs.forEach(req => {
                const submittedFile = (el.files_submitted || []).find(fs =>
                    fs.id_attributes === req.listRequirements?.attribute_template?.attributes?.id_attributes
                );

                let finalStatus = 'PENDIENTE';
                const isFile = !!submittedFile;
                const auditInfo = submittedFile?.audit_info || submittedFile?.auditInfo;
                const isForwarded = submittedFile?.flag_forwarded || submittedFile?.flagForwarded || false;

                const hasAudit = !!(submittedFile?.has_audits || submittedFile?.hasAudits || auditInfo);
                const auditStatus = (auditInfo?.audit_status || auditInfo?.auditStatus || '')?.toUpperCase();

                const rawVencForStatus = submittedFile?.expiration_date || null;
                let isExpired = false;
                let isExpiringSoon = false;

                if (rawVencForStatus && isFile) {
                    try {
                        const dateStr = String(rawVencForStatus);
                        let expDate;
                        const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
                        if (match) {
                            expDate = new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10));
                        } else {
                            expDate = new Date(dateStr);
                            expDate.setHours(0, 0, 0, 0);
                        }

                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const tenDaysFromNow = new Date();
                        tenDaysFromNow.setHours(0, 0, 0, 0);
                        tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);

                        if (expDate < today) {
                            isExpired = true;
                        } else if (expDate <= tenDaysFromNow) {
                            isExpiringSoon = true;
                        }
                    } catch (e) { }
                }

                if (hasAudit && !isForwarded) {
                    if (auditStatus === 'APROBADO') {
                        if (isExpired) finalStatus = 'VENCIDO';
                        else finalStatus = 'VIGENTE';
                    }
                    else if (auditStatus === 'OBSERVADO' || auditStatus === 'RECHAZADO') finalStatus = 'CON OBSERVACIÓN';
                    else finalStatus = 'EN REVISIÓN';
                } else {
                    if (isFile) {
                        if (isExpired) finalStatus = 'VENCIDO';
                        else finalStatus = 'EN REVISIÓN';
                    } else {
                        finalStatus = 'PENDIENTE';
                    }
                }

                tempDocs.push({
                    id: `${el.id_elements}_${req.id_group_requirements || req.idGroupRequirements}`,
                    id_group_req: req.id_group_requirements || req.idGroupRequirements,
                    id_attribute: req.listRequirements?.attribute_template?.attributes?.id_attributes,
                    id_file_submitted: submittedFile?.id_file_submitted || null,
                    entityId: String(el.id_elements),
                    entityName: el.active?.description || el.data?.nombre || 'Recurso',
                    entityType: typeName === 'employees' ? 'Empleado' : typeName === 'vehicles' ? 'Vehículo' : 'Maquinaria',
                    tipo: req.listRequirements?.attribute_template?.attributes?.description || 'DOCUMENTO',
                    id_active_type: categoryId,
                    label: req.listRequirements?.description || 'Documento',
                    estado: finalStatus,
                    fechaVencimiento: submittedFile?.expiration_date || null,
                    observacion: isForwarded ? null : (auditInfo?.audit_observations || null),
                    frecuencia: req.listRequirements?.attribute_template?.attributes?.periodicity_description || 'Mensual',
                    archivo: submittedFile?.file_name || null,
                    obligatorio: true,
                    proveedor: proveedor,
                    isExpiringSoon: isExpiringSoon
                });
            });
        });
        return tempDocs;
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const openUploadModal = (rowData) => {
        if (type !== 'suppliers') {
            alert("La carga directa de documentos para recursos está en desarrollo. Por favor edite el recurso correspondiente.");
            return;
        }

        setUploadingDoc(rowData);
        setUploadFile(null);
        setUploadDate(null);
        setUploadModalVisible(true);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadFile(file);

        // Auto-calculate expiration date based on frequency ONLY WHEN FILE IS SELECTED
        let defaultDate = null;
        if (uploadingDoc?.frecuencia && uploadingDoc.frecuencia !== 'Única vez' && uploadingDoc.frecuencia !== 'UNICA VEZ') {
            const today = new Date();
            const freqLower = uploadingDoc.frecuencia.toLowerCase();

            if (freqLower.includes('anual')) {
                defaultDate = new Date(today.setFullYear(today.getFullYear() + 1));
            } else if (freqLower.includes('semestral')) {
                defaultDate = new Date(today.setMonth(today.getMonth() + 6));
            } else if (freqLower.includes('trimestral')) {
                defaultDate = new Date(today.setMonth(today.getMonth() + 3));
            } else if (freqLower.includes('mensual')) {
                defaultDate = new Date(today.setMonth(today.getMonth() + 1));
            }
        }
        setUploadDate(defaultDate);
    };

    const handleSaveUpload = async () => {
        if (!uploadFile) {
            alert("Seleccione un archivo primero.");
            return;
        }

        if (!supplierData) {
            alert("Los datos del proveedor aún no están cargados. Asegúrese de que su legajo de proveedor esté completo o reintente en unos segundos.");
            return;
        }

        setIsUploading(true);
        try {
            // Check required date locally in modal before sending upward
            if (uploadingDoc?.frecuencia && uploadingDoc.frecuencia !== 'Única vez' && uploadingDoc.frecuencia !== 'UNICA VEZ' && !uploadDate) {
                alert("Debe seleccionar una fecha de vencimiento obligatoriamente para este tipo de documento.");
                setIsUploading(false);
                return;
            }

            setLoadingDocs(prev => ({ ...prev, [uploadingDoc.id]: true }));

            // Map the document update using the unique ID of the requirement
            // This ensures we update the EXACT correct row in the supplier's documentation list
            const updatedDocs = supplierData.documentacion.map(doc => {
                const docId = doc.id_group_req || doc.id_group_requirements || doc.id;
                const targetId = uploadingDoc.id_group_req || uploadingDoc.id_group_requirements || uploadingDoc.id;

                if (docId === targetId || (doc.tipo === uploadingDoc.tipo && !docId)) {
                    return {
                        ...doc,
                        archivo: uploadFile.name,
                        fileObject: uploadFile,
                        fechaVencimiento: uploadDate ? uploadDate.toISOString().split('T')[0] : doc.fechaVencimiento,
                        modified: true
                    };
                }
                return doc;
            });

            await updateSupplier({ documentacion: updatedDocs });
            await loadData();
            setUploadModalVisible(false);
        } catch (error) {
            console.error("Upload error", error);
            alert("Error al subir el documento. Reintente más tarde.");
        } finally {
            setLoadingDocs(prev => ({ ...prev, [uploadingDoc.id]: false }));
            setIsUploading(false);
        }
    };

    // Visualizar o Descargar Archivo (Bypassing popup blockers)
    const handleViewFile = async (docData) => {
        if (!docData || !docData.archivo) return;

        // If it already has a local fileUrl (e.g. newly uploaded file), use it instantly
        if (docData.fileUrl && docData.fileUrl.startsWith('blob:')) {
            window.open(docData.fileUrl, '_blank');
            return;
        }

        const fileId = docData.id_file_submitted || docData.id;

        if (!docData.id_file_submitted) {
            if (docData.fileUrl) window.open(docData.fileUrl, '_blank');
            else showWarning(`Visualización no disponible para: ${docData.archivo}`);
            return;
        }

        try {
            setLoadingDocs(prev => ({ ...prev, [docData.id]: true }));

            // Fetch file via backend service using the submitted file ID
            const fileBlob = await fileService.getFile(docData.id_file_submitted);

            if (fileBlob && fileBlob.size > 0) {
                const blobUrl = URL.createObjectURL(fileBlob);
                if (blobUrl) {
                    // WORKAROUND FOR POPUP BLOCKERS: Modern browsers block window.open if it occurs after an await.
                    // Instead, we create a temporary anchor link, trigger a click, and remove it.
                    const a = document.createElement('a');
                    a.href = blobUrl;
                    a.target = '_blank';
                    // a.download = docData.archivo; // Uncomment if we want forced download instead of new tab view
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(blobUrl); // Clean up memory
                    }, 1000);
                } else {
                    showError('Error local: No se pudo generar la vista previa del archivo.');
                }
            } else if (docData.fileUrl) {
                // Fallback a URL antigua
                window.open(docData.fileUrl, '_blank');
            } else {
                showWarning('El archivo no tiene contenido para visualizar.');
            }
        } catch (error) {
            console.error('Error descargando documento:', error);
            if (docData.fileUrl) {
                window.open(docData.fileUrl, '_blank');
            } else {
                showError('Error al descargar el archivo del servidor.');
            }
        } finally {
            setLoadingDocs(prev => ({ ...prev, [docData.id]: false }));
        }
    };

    // Toggle logic for clicking the header
    // Toggle logic for clicking the header
    // Toggle logic and RowGroup implementation removed for standard table layout.

    // --- AUDIT ACTIONS ---
    const openAuditModal = (rowData) => {
        setAuditingDoc(rowData);
        setAuditModalVisible(true);
    };

    const actionTemplate = (rowData) => (
        <div className="flex justify-end gap-2 pr-2">
            {(isAuditorLegal || isAdmin) && rowData.id_file_submitted && (
                <button
                    onClick={() => openAuditModal(rowData)}
                    className="text-white bg-info hover:bg-info-hover rounded-lg px-3 py-1.5 transition-all text-[10px] font-bold flex items-center gap-1.5 shadow-sm"
                    title="Intervenir Documento"
                >
                    <i className="pi pi-shield"></i> AUDITAR
                </button>
            )}

            {rowData.observacion && (
                <button
                    onClick={() => {
                        setSelectedObservation({
                            title: rowData.label || String(rowData.tipo || '').replace(/_/g, ' '),
                            content: rowData.observacion
                        });
                        setObservationModalVisible(true);
                    }}
                    className="h-8 w-8 flex items-center justify-center text-orange-500 bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-full transition-all cursor-pointer shadow-sm"
                    title="Ver Observación"
                >
                    <i className="pi pi-exclamation-triangle text-sm"></i>
                </button>
            )}

            <div className="flex items-center gap-2">
                {rowData.archivo && (
                    <button
                        onClick={() => handleViewFile(rowData)}
                        disabled={loadingDocs[rowData.id]}
                        className="text-secondary-dark bg-secondary-light/30 hover:bg-secondary-light hover:text-primary rounded-lg px-3 py-1.5 transition-all text-[10px] font-bold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-wait"
                        title="Ver Documento"
                    >
                        {loadingDocs[rowData.id] ? <i className="pi pi-spin pi-spinner"></i> : <i className="pi pi-external-link"></i>} VER
                    </button>
                )}

                {currentRole?.role === 'PROVEEDOR' && (
                    <button
                        onClick={() => openUploadModal(rowData)}
                        disabled={loadingDocs[rowData.id]}
                        className="text-primary bg-primary-light hover:bg-primary hover:text-white rounded-lg px-3 py-1.5 transition-all text-[10px] font-bold flex items-center gap-1.5 disabled:opacity-50"
                        title={rowData.estado === 'VIGENTE' ? "Actualizar documento" : "Subir documento"}
                    >
                        {loadingDocs[rowData.id] ? <i className="pi pi-spin pi-spinner"></i> : <i className="pi pi-upload"></i>} {rowData.estado === 'VIGENTE' ? 'ACTUALIZAR' : 'SUBIR'}
                    </button>
                )}
            </div>
        </div>
    );

    const docTypeTemplate = (rowData) => (
        <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${rowData.archivo ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`}>
                <i className={`pi ${rowData.archivo ? 'pi-file-pdf' : 'pi-file'} text-lg`}></i>
            </div>
            <div className="flex flex-col min-w-0">
                <span className="font-medium text-secondary-dark text-sm truncate" title={rowData.label || String(rowData.tipo || '').replace(/_/g, ' ')}>{rowData.label || String(rowData.tipo || '').replace(/_/g, ' ')}</span>
                <span className="text-[10px] text-secondary truncate">{rowData.frecuencia}</span>
            </div>
        </div>
    );

    const statusBodyTemplate = (rowData) => {
        const status = rowData.estado;
        return (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${status === 'VIGENTE' && rowData.isExpiringSoon ? 'bg-warning/10 text-warning border-warning/20' :
                status === 'VIGENTE' ? 'bg-success/5 text-success border-success/20' :
                    status === 'VENCIDO' ? 'bg-danger/5 text-danger border-danger/20' :
                        status === 'EN REVISIÓN' ? 'bg-info/5 text-info border-info/20' :
                            status === 'CON OBSERVACIÓN' || status === 'OBSERVADO' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                'bg-secondary/5 text-secondary border-secondary/20'
                }`}>
                {status}
            </span>
        );
    };

    const statusOptions = ['VIGENTE', 'VENCIDO', 'PENDIENTE', 'EN REVISIÓN', 'CON OBSERVACIÓN'];

    // Extract unique document labels for the filter
    const docLabels = [...new Set(data.map(item => item.label).filter(l => !!l))];

    const getEntityHeader = () => {
        switch (type) {
            case 'employees': return 'Empleado';
            case 'vehicles': return 'Vehículo';
            case 'machinery': return 'Maquinaria';
            default: return 'Recurso';
        }
    };

    const filterConfig = [
        { label: 'Estado', value: 'estado', options: statusOptions.map(s => ({ label: s, value: s })) },
        { label: 'Tipo de Documento', value: 'label', options: docLabels.map(l => ({ label: l, value: l })) }
    ];

    const isAuditorOrAdmin = currentRole?.role !== 'PROVEEDOR';

    if (isAuditorOrAdmin && !explicitCuit) {
        filterConfig.unshift({
            label: 'Proveedor',
            value: 'proveedor',
            options: [...new Set(data.map(d => d.proveedor).filter(Boolean))].map(n => ({ label: n, value: n }))
        });
    }

    if (type !== 'suppliers') {
        filterConfig.push({
            label: getEntityHeader(),
            value: 'entityName',
            options: [...new Set(data.map(d => d.entityName))].map(n => ({ label: n, value: n }))
        });
    }

    const renderHeader = () => (
        <TableFilters
            filters={filters}
            setFilters={setFilters}
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={onGlobalFilterChange}
            config={filterConfig}
            totalItems={data.length}
            filteredItems={filteredData ? filteredData.length : null}
            topRightContent={
                <div className="flex items-center gap-3 shrink-0">
                    <button className="flex-1 md:flex-none text-secondary-dark bg-white border border-secondary/20 hover:bg-secondary-light font-bold rounded-lg text-xs px-4 py-2.5 transition-all flex items-center justify-center gap-2 shadow-sm">
                        <i className="pi pi-file-excel text-success"></i> <span className="hidden lg:inline">Exportar Excel</span>
                    </button>
                </div>
            }
            itemName="DOCUMENTOS"
        />
    );

    return (
        <div className="w-full bg-white border border-secondary/10 rounded-xl shadow-sm overflow-hidden animate-fade-in">
            {/* Category Navigation (Premium Tabs) */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 border-b border-secondary/5">
                {[
                    { id: 5, label: 'Legajo', icon: <i className="pi pi-briefcase text-xs"></i> },
                    { id: 1, label: 'Personal', icon: <i className="pi pi-users text-xs"></i> },
                    { id: 2, label: 'Vehículos', icon: <i className="pi pi-car text-xs"></i> },
                    { id: 3, label: 'Maquinaria', icon: <TbBackhoe className="text-sm" /> }
                ].map(cat => {
                    const count = allRawDocs.filter(d => Number(d.id_active_type) === cat.id).length;
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => {
                                console.log("Category Change:", cat.label, cat.id);
                                setActiveCategory(cat.id);
                                if (onTypeChange) {
                                    // Map category ID back to type string
                                    const typeMap = { 5: 'suppliers', 1: 'employees', 2: 'vehicles', 3: 'machinery' };
                                    onTypeChange(typeMap[cat.id]);
                                }
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all
                                ${isActive
                                    ? 'bg-white text-primary shadow-sm border border-primary/10'
                                    : 'text-secondary/60 hover:text-secondary hover:bg-white/50'
                                }`}
                        >
                            <span className={isActive ? 'text-primary' : 'text-secondary/40'}>{cat.icon}</span>
                            {cat.label}
                            {count > 0 && <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[8px] ${isActive ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-secondary/40'}`}>{count}</span>}
                        </button>
                    );
                })}
            </div>

            <ObservationModal
                visible={observationModalVisible}
                onHide={() => setObservationModalVisible(false)}
                title="Observación de Auditoría"
                docName={selectedObservation?.title}
                content={selectedObservation?.content}
            />


            <AppTable
                value={data}
                loading={loading}
                filters={filters}
                globalFilterFields={['tipo', 'entityName', 'estado', 'proveedor']}
                onValueChange={(d) => setFilteredData(d)}
                emptyMessage="No se encontraron documentos."
                sortMode="multiple"
                removableSort
                header={renderHeader()}
                rowClassName={() => 'hover:bg-secondary-light/5 transition-colors border-b border-secondary/5 group'}
            >
                {isAuditorOrAdmin && !explicitCuit && (
                    <Column field="proveedor" header="Proveedor" sortable className="font-bold text-secondary-dark w-[20%]"></Column>
                )}
                {type !== 'suppliers' && (
                    <Column field="entityName" header={getEntityHeader()} sortable className="font-bold text-secondary-dark"></Column>
                )}
                <Column field="tipo" header="Documento" body={docTypeTemplate} sortable className="w-[30%]"></Column>
                <Column field="fechaVencimiento" header="Vencimiento" body={(r) => {
                    if (r.frecuencia === 'Única vez' || r.frecuencia === 'UNICA VEZ') return <span className="text-[10px] font-bold text-secondary/30 italic">N/A</span>;
                    if (r.fechaVencimiento) return <span className="font-mono text-xs text-secondary-dark">{r.fechaVencimiento}</span>;
                    return <span className="text-[10px] font-bold text-orange-400">No cargado</span>;
                }} sortable></Column>
                <Column field="estado" header={(isAuditorLegal || isAdmin) ? "Estado Actual" : "Estado"} body={statusBodyTemplate} sortable className="text-center"></Column>
                <Column header={(isAuditorLegal || isAdmin) ? "Intervención" : "Acción"} body={actionTemplate} className="text-right pr-6" headerClassName="pr-6"></Column>
            </AppTable>

            <AuditDocumentModal
                visible={auditModalVisible}
                onHide={() => setAuditModalVisible(false)}
                docData={auditingDoc}
                onAuditComplete={async () => {
                    console.log("DocumentEntityTable: Audit complete wrapper calling loadData...");
                    await loadData();
                    if (onAuditComplete) {
                        console.log("DocumentEntityTable: Notifying parent/dashboard of audit complete...");
                        await onAuditComplete();
                    }
                }}
            />

            <Dialog
                header={<span className="sr-only">Subir Documento</span>}
                visible={uploadModalVisible}
                onHide={() => !isUploading && setUploadModalVisible(false)}
                className="w-[90vw] max-w-[550px]"
                draggable={false}
                resizable={false}
                pt={{
                    mask: { className: 'backdrop-blur-sm' },
                    header: { className: 'hidden' },
                    content: { className: 'p-0 rounded-2xl overflow-hidden bg-white' },
                    footer: { className: 'hidden' }
                }}
            >
                <div className="p-6 flex flex-col gap-6">

                    {/* Header - Card Style */}
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-secondary/20 bg-secondary/5 text-secondary">
                            <i className="pi pi-file-pdf text-2xl"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-secondary-dark text-lg leading-tight mb-2" title={uploadingDoc?.label}>
                                {uploadingDoc?.label}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block bg-secondary/10 text-secondary border-secondary/20 uppercase tracking-widest">
                                    {uploadingDoc?.estado || 'PENDIENTE'}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block bg-primary/10 text-primary border-primary/20 uppercase tracking-widest">
                                    <i className="pi pi-clock text-[9px] mr-1"></i>
                                    {uploadingDoc?.frecuencia || 'Única vez'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-secondary/10 -my-2"></div>

                    {/* Expiration Date Section with Orange Theme */}
                    {(uploadingDoc?.frecuencia !== 'Única vez' && uploadingDoc?.frecuencia !== 'UNICA VEZ') && (
                        <div className="w-full bg-orange-50/50 p-4 rounded-2xl border border-orange-100 flex flex-col gap-3 transition-all">
                            <label className="text-[10px] font-bold text-orange-600/60 uppercase tracking-widest flex items-center gap-2">
                                <i className="pi pi-exclamation-circle text-[11px]"></i> Definir Vencimiento
                            </label>

                            <div className="flex flex-col w-full">
                                <div className="flex items-center gap-2.5">
                                    <i className="pi pi-calendar text-secondary/50 text-base"></i>
                                    <Calendar
                                        value={uploadDate}
                                        onChange={(e) => setUploadDate(e.value)}
                                        placeholder="Vencimiento"
                                        disabled={!uploadFile || isUploading}
                                        minDate={new Date()}
                                        className={`compact-calendar-input w-full border border-secondary/50 rounded-lg ${!uploadFile ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                                        panelClassName="compact-calendar-panel"
                                        dateFormat="dd/mm/yy"
                                    />
                                </div>
                                {!uploadFile && (
                                    <span className="text-[10px] text-orange-400 font-bold ml-6 mt-2">
                                        * Requiere archivo para editar fecha
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* File Dropzone Input */}
                    <div className="relative group/upload w-full h-28 mt-2">
                        <input
                            type="file"
                            id="upload-file-input"
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                            accept=".pdf,.png,.jpg,.jpeg"
                            disabled={isUploading}
                        />
                        <div className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all ${uploadFile ? 'border-primary/50 bg-primary/5' : 'border-secondary/20 bg-secondary/5 group-hover/upload:border-primary/40 group-hover/upload:bg-primary/5'}`}>
                            {uploadFile ? (
                                <>
                                    <i className="pi pi-file-check text-2xl mb-2 text-primary"></i>
                                    <span className="text-xs font-bold text-primary truncate px-4 w-full text-center">
                                        {uploadFile.name}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <i className="pi pi-cloud-upload text-2xl mb-2 text-secondary/60 group-hover/upload:text-primary transition-colors"></i>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-center text-secondary/60 group-hover/upload:text-primary transition-colors">
                                        SUBIR ARCHIVO
                                    </span>
                                    <span className="text-[9px] text-secondary/40 mt-1">o arrastrar aquí</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Custom Modal Footer inside the body since we bypassed PrimeReact's default header/footer visual frames */}
                <div className="flex justify-end gap-3 px-6 py-4 bg-secondary-light/20 border-t border-secondary/10 rounded-b-2xl">
                    <button
                        onClick={() => setUploadModalVisible(false)}
                        className="bg-white border border-secondary/20 hover:bg-secondary-light text-secondary-dark px-6 py-2 rounded-lg font-bold transition-all w-full md:w-auto text-sm"
                        disabled={isUploading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSaveUpload}
                        className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait w-full md:w-auto text-sm"
                        disabled={isUploading || !uploadFile}
                    >
                        {isUploading && <i className="pi pi-spin pi-spinner"></i>}
                        Subir Archivo
                    </button>
                </div>
            </Dialog>
        </div >
    );
};

export default DocumentEntityTable;

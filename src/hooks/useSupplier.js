import { useState, useEffect, useCallback } from 'react';
import { supplierService } from '../services/supplierService';
import { groupService } from '../services/groupService';
import elementService from '../services/elementService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { MOCK_SUPPLIERS } from '../data/mockSuppliers';

import { base64ToBlobUrl, fileToBase64 } from '../utils/fileUtils';


import { DOC_TYPE_LABELS, PERIODICITY_MAP } from '../data/documentConstants';


export const useSupplier = (explicitCuit = null) => {
    const { user, currentRole } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [supplierData, setSupplierData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [legajoActives, setLegajoActives] = useState([]);

    const fetchSupplierData = useCallback(async (isSilent = false) => {
        console.group("useSupplier: DIAGNOSTIC");
        console.log("Context State:", { user, currentRole });

        if (!user) {
            console.warn("No user found in AuthContext yet.");
            setLoading(false);
            console.groupEnd();
            return;
        }

        // Only reset if NOT silent (initial load or full refresh)
        if (!isSilent) {
            setSupplierData(null);
            setLoading(true);
        }

        try {
            // 1. Fetch Actives for Legajo Proveedor (Type 5)
            console.log("Fetching actives for Type 5...");
            const actives = await elementService.getActivesByType(5);
            console.log("Actives fetched:", actives?.length || 0);
            setLegajoActives(actives);

            // 2. Identify the active CUIT based on currentRole or Fallback
            // Prioritize explicitCuit (Admin View) over Role-based CUIT (Supplier View)
            const activeCuit = explicitCuit || currentRole?.entityCuit || currentRole?.cuit || user?.suppliers?.[0]?.cuit;

            console.log("Active CUIT identified:", activeCuit);

            if (activeCuit && activeCuit !== 'undefined' && activeCuit !== 'null') {
                console.log("Requesting data for CUIT:", activeCuit);
                const data = await supplierService.getWithDocuments(activeCuit);
                if (data) {
                    // 3. If Group ID is present, fetch specific group requirements (DYNAMIC FLOW)
                    if (data.idGroup) {
                        try {
                            console.log("Fetching specific group requirements for group", data.idGroup);
                            // CHANGED: Using getSpecific instead of getDetails
                            const groupReqs = await groupService.getSpecific(data.internalId, data.idGroup);

                            if (groupReqs && groupReqs.length > 0) {
                                // Use a Map to ensure absolute uniqueness of Requirements
                                const docMap = new Map();

                                groupReqs.forEach(req => {
                                    // Handle both listRequirements (camelCase) and list_requirements (snake_case)
                                    const listReq = req.list_requirements || req.listRequirements;
                                    if (!listReq) return;

                                    // Handle attribute_template (snake_case) and attributeTemplate (camelCase)
                                    const attrTempl = listReq.attribute_template || listReq.attributeTemplate;
                                    const attrs = attrTempl?.attributes;

                                    // Handle folder_metadata (snake_case) and folderMetadata (camelCase)
                                    const folderMeta = (listReq.folder_metadata || listReq.folderMetadata)?.data;
                                    const files = listReq.files || [];
                                    const submittedFile = files.length > 0 ? files[0] : null;

                                    // Handle id_list_requirements (snake_case) and idListRequirements (camelCase)
                                    const requirementId = listReq.id_list_requirements || listReq.idListRequirements;
                                    const key = requirementId;

                                    if (!docMap.has(key)) {
                                        const label = listReq.description || attrs?.description || 'Documento';

                                        let docKey = Object.keys(DOC_TYPE_LABELS).find(k =>
                                            DOC_TYPE_LABELS[k].label.toLowerCase() === label.toLowerCase()
                                        );

                                        if (!docKey) {
                                            const cleanDesc = label.replace(/ obligatorio/i, '').trim();
                                            docKey = Object.keys(DOC_TYPE_LABELS).find(k =>
                                                DOC_TYPE_LABELS[k].label.toLowerCase().includes(cleanDesc.toLowerCase())
                                            ) || label.toUpperCase().replace(/\s+/g, '_');
                                        }

                                        const isFile = !!submittedFile;
                                        const cleanLabel = label.replace(/ obligatorio/i, '').trim();

                                        // New DB schema fields vs Old DB schema `data_pdf`
                                        const fileData = submittedFile?.data_pdf || submittedFile?.dataPdf || {};
                                        const directFileName = submittedFile?.file_name || submittedFile?.fileName;
                                        const directFileUrl = submittedFile?.file_url || submittedFile?.url;

                                        // Status logic based on Audit, Expiration, and File presence
                                        let finalStatus = 'PENDIENTE';

                                        // Support both snake_case (JsonProperty) and camelCase (default)
                                        const auditInfo = submittedFile?.audit_info || submittedFile?.auditInfo;
                                        const hasAudit = !!(submittedFile?.has_audits || submittedFile?.hasAudits || auditInfo);
                                        const auditStatus = (auditInfo?.audit_status || auditInfo?.auditStatus || '')?.toUpperCase();

                                        if (hasAudit) {
                                            if (auditStatus === 'APROBADO') finalStatus = 'VIGENTE';
                                            else if (auditStatus === 'OBSERVADO') finalStatus = 'CON OBSERVACIÓN';
                                            else finalStatus = 'EN REVISIÓN';
                                        } else {
                                            const rawVencForStatus = submittedFile?.expiration_date || folderMeta?.fechaVencimiento || null;
                                            if (rawVencForStatus) {
                                                try {
                                                    // Parse securely handling both YYYY-MM-DD and full ISO strings
                                                    const dateStr = String(rawVencForStatus);

                                                    // By default, assume the string's YYYY-MM-DD prefix is correct
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

                                                    if (isFile && expDate < today) {
                                                        finalStatus = 'VENCIDO';
                                                    } else {
                                                        finalStatus = isFile ? 'EN REVISIÓN' : 'PENDIENTE';
                                                    }
                                                } catch (e) {
                                                    console.warn("Invalid date format:", rawVencForStatus);
                                                    finalStatus = isFile ? 'EN REVISIÓN' : 'PENDIENTE';
                                                }
                                            } else {
                                                finalStatus = isFile ? 'EN REVISIÓN' : 'PENDIENTE';
                                            }
                                        }

                                        const finalFileName = directFileName || fileData?.file_name || fileData?.fileName || folderMeta?.archivo || null;
                                        const finalObs = hasAudit ? ((auditInfo?.audit_observations || auditInfo?.auditObservations) || folderMeta?.observacion || null) : null;
                                        const rawVenc = submittedFile?.expiration_date || folderMeta?.fechaVencimiento || submittedFile?.date_submitted || null;
                                        const finalVenc = rawVenc ? String(rawVenc).split('T')[0] : null;

                                        docMap.set(key, {
                                            id: key,
                                            id_group_req: req.id_group_requirements || req.idGroupRequirements,
                                            id_list_req: listReq.id_list_requirements || listReq.idListRequirements,
                                            id_attribute: attrs?.id_attributes || attrs?.idAttributes,
                                            id_file_submitted: submittedFile?.id_file_submitted || submittedFile?.idFileSubmitted || null,
                                            id_elements: (listReq.folder_metadata || listReq.folderMetadata)?.id_elements,
                                            id_active: attrTempl?.id_active || attrTempl?.idActive,
                                            tipo: docKey,
                                            label: cleanLabel,
                                            frecuencia: attrs?.periodicity_description || attrs?.periodicityDescription || 'Única vez',
                                            estado: finalStatus,
                                            archivo: finalFileName,
                                            observacion: finalObs,
                                            fechaVencimiento: finalVenc,
                                            fileUrl: directFileUrl || fileData?.url || null, // Blob URL generation happens on demand now
                                            hasAudits: !!(submittedFile?.has_audits || submittedFile?.hasAudits || auditInfo),
                                            modified: false
                                        });
                                    }
                                });

                                const dynamicDocs = Array.from(docMap.values());
                                console.log("Specific Documentation mapped (DEBUG):", JSON.stringify(dynamicDocs, null, 2));
                                data.documentacion = dynamicDocs;
                            } else {
                                console.warn("No specific group requirements found, enriching basic documents from mapToUISupplier");
                                if (data.documentacion && data.documentacion.length > 0) {
                                    data.documentacion = data.documentacion.map(doc => {
                                        const metadata = DOC_TYPE_LABELS[doc.tipo];
                                        return {
                                            ...doc,
                                            label: metadata?.label || doc.tipo?.replace(/_/g, ' ') || 'Documento',
                                            frecuencia: metadata?.frecuencia || 'Única vez'
                                        };
                                    });
                                }
                            }
                        } catch (err) {
                            console.warn("Failed to fetch specific group requirements, falling back to basic documents", err);
                            // Ensure it's marked as not mock even on error
                            data.isMock = false;
                        }
                    }

                    console.log("UI Data ready to be set:", data);
                    setSupplierData({ ...data, isMock: false });
                } else {
                    console.error("Data received is null or undefined");
                    setSupplierData(null);
                }
            } else {
                console.warn("No CUIT identified.");
                setSupplierData(null);
            }
        } catch (error) {
            console.error("CRITICAL ERROR in fetchSupplierData:", error);
            setSupplierData(null);
        } finally {
            console.log("Setting loading to false");
            setLoading(false);
            console.groupEnd();
        }
    }, [user, currentRole]);

    useEffect(() => {
        fetchSupplierData();
    }, [fetchSupplierData]);

    const updateSupplier = async (updatedData) => {
        const mergedData = { ...supplierData, ...updatedData };

        // Prepare Payload
        const cleanPhone = mergedData.telefono ? String(mergedData.telefono).replace(/\D/g, '') : null;
        const cleanCP = mergedData.codigoPostal ? String(mergedData.codigoPostal).replace(/\D/g, '') : null;

        const elementsList = [];
        if (mergedData.documentacion) {
            for (const doc of mergedData.documentacion) {
                const docLabel = DOC_TYPE_LABELS[doc.tipo]?.label;
                // Resolve active: prioritize doc.id_active, then fall back to matching legajoActives
                const active = legajoActives.find(a =>
                    String(a.id_active) === String(doc.id_active || doc.tipo) ||
                    (docLabel && a.description === docLabel)
                );

                const finalIdActive = doc.id_active || active?.id_active;

                if (finalIdActive && (doc.modified || doc.fileObject)) {
                    // Prepare fileDto 
                    let fileDto = null;
                    if (doc.fileObject) {
                        const base64Data = await fileToBase64(doc.fileObject);
                        const pureBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

                        fileDto = {
                            id_file_submitted: doc.id_file_submitted || null,
                            id_attribute: doc.id_attribute || 1,
                            period: doc.period || new Date().getFullYear().toString(),
                            file_name: doc.archivo,
                            file_size: doc.fileObject.size,
                            file_type: doc.fileObject.type,
                            file_content: pureBase64,
                            date_submitted: new Date().toISOString().split('T')[0],
                            // Send as noon UTC to prevent backend from shifting to previous day mapping
                            expiration_date: doc.fechaVencimiento ? (doc.fechaVencimiento.includes('T') ? doc.fechaVencimiento : `${doc.fechaVencimiento}T12:00:00.000Z`) : null
                        };
                    } else if (doc.modified && !doc.archivo) {
                        // DELETION SIGNAL
                        fileDto = {
                            id_file_submitted: doc.id_file_submitted || null,
                            id_attribute: doc.id_attribute || 1,
                            period: doc.period || new Date().getFullYear().toString(),
                            file_name: null,
                            file_size: null,
                            file_type: null,
                            file_content: null,
                            date_submitted: null,
                            expiration_date: doc.fechaVencimiento ? (doc.fechaVencimiento.includes('T') ? doc.fechaVencimiento : `${doc.fechaVencimiento}T12:00:00.000Z`) : null
                        };
                    } else if (doc.modified && doc.archivo && !doc.fileObject) {
                        // CASE: Updated metadata (like expiration date) but NO new file
                        fileDto = {
                            id_file_submitted: doc.id_file_submitted || null,
                            id_attribute: doc.id_attribute || 1,
                            period: doc.period || new Date().getFullYear().toString(),
                            file_name: doc.archivo,
                            file_size: null,
                            file_type: null,
                            file_content: null,
                            date_submitted: null,
                            // Send as noon UTC to prevent backend from shifting to previous day mapping
                            expiration_date: doc.fechaVencimiento ? (doc.fechaVencimiento.includes('T') ? doc.fechaVencimiento : `${doc.fechaVencimiento}T12:00:00.000Z`) : null
                        };
                    }

                    elementsList.push({
                        id_elements: doc.id_elements || null,
                        id_active: finalIdActive,
                        element_data: {
                            tipo: doc.tipo,
                            estado: doc.fileObject ? 'EN REVISIÓN' : doc.estado,
                            archivo: doc.archivo,
                            observacion: doc.fileObject ? null : doc.observacion,
                            id_periodicity: PERIODICITY_MAP[doc.frecuencia?.toUpperCase()] || 1,
                            fechaVencimiento: doc.fechaVencimiento || null // Also place date in element json
                        },
                        file_submitted: fileDto
                    });
                }
            }
        }

        console.log("=== JSON PAYLOAD PARA ACTUALIZAR PROVEEDOR ===");
        console.log(JSON.stringify(elementsList, null, 2));

        const backendPayload = {
            id_supplier: mergedData.internalId || mergedData.id,
            email_corporate: mergedData.email,
            phone: cleanPhone ? Number(cleanPhone) : null,
            address_real: mergedData.direccionReal,
            address_tax: mergedData.direccionFiscal,
            country: mergedData.pais,
            province: mergedData.provincia,
            city: mergedData.localidad,
            postal_code: cleanCP ? Number(cleanCP) : null,
            contacts: {
                list: (mergedData.contactos || []).map(c => ({
                    nombre: String(c.nombre || '').trim(),
                    tipo: String(c.tipo || 'REPRESENTANTE LEGAL').trim(),
                    dni: String(c.dni || '').trim(),
                    email: String(c.email || '').trim(),
                    movil: String(c.movil || '').trim(),
                    telefono: String(c.telefono || '').trim(),
                }))
            },
            document_supplier: {
                list: (mergedData.documentacion || []).map(d => ({
                    id: String(d.id).startsWith('req-') ? null : d.id, // Don't send string IDs if backend expects integers
                    tipo: d.tipo,
                    estado: d.estado,
                    archivo: d.archivo,
                    observacion: d.observacion,
                    id_periodicity: PERIODICITY_MAP[d.frecuencia?.toUpperCase()] || 1, // Default ANUAL if missing
                    fechaVencimiento: d.fechaVencimiento instanceof Date
                        ? d.fechaVencimiento.toISOString().split('T')[0]
                        : (typeof d.fechaVencimiento === 'string' ? d.fechaVencimiento.split('T')[0] : d.fechaVencimiento),
                }))
            },
            elements: elementsList
        };

        setIsSaving(true);
        try {
            if (mergedData.internalId) {
                await supplierService.update(mergedData.internalId, backendPayload);

                // UX: Minimal delay to avoid flickering
                await new Promise(resolve => setTimeout(resolve, 800));

                await fetchSupplierData(true); // Silent refresh to avoid visual flicker
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error updating supplier:", error);

            // Extract specific backend message
            let errorMessage = "No se pudieron guardar los cambios.";
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            showError("Error de Guardado", errorMessage);
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    return {
        supplierData,
        loading,
        isSaving,
        updateSupplier,
        refresh: fetchSupplierData
    };
};

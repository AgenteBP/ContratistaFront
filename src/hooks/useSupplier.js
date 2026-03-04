import { useState, useEffect, useCallback } from 'react';
import { supplierService } from '../services/supplierService';
import { groupService } from '../services/groupService';
import elementService from '../services/elementService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { MOCK_SUPPLIERS } from '../data/mockSuppliers';

import { base64ToBlobUrl, fileToBase64 } from '../utils/fileUtils';


import { DOC_TYPE_LABELS } from '../data/documentConstants';


export const useSupplier = () => {
    const { user, currentRole } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [supplierData, setSupplierData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [legajoActives, setLegajoActives] = useState([]);

    const fetchSupplierData = useCallback(async () => {
        console.group("useSupplier: DIAGNOSTIC");
        console.log("Context State:", { user, currentRole });

        if (!user) {
            console.warn("No user found in AuthContext yet.");
            setLoading(false);
            console.groupEnd();
            return;
        }

        // CRITICAL: Reset data when starting fetch to avoid showing stale data from previous profile
        setSupplierData(null);
        setLoading(true);

        try {
            // 1. Fetch Actives for Legajo Proveedor (Type 5)
            console.log("Fetching actives for Type 5...");
            const actives = await elementService.getActivesByType(5);
            console.log("Actives fetched:", actives?.length || 0);
            setLegajoActives(actives);

            // 2. Identify the active CUIT based on currentRole or Fallback
            // currentRole usually contains the CUIT of the selected entity
            const activeCuit = currentRole?.entityCuit || currentRole?.cuit || user?.suppliers?.[0]?.cuit;

            console.log("Active CUIT identified:", activeCuit);

            if (activeCuit) {
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
                                        const hasAudit = submittedFile?.audit;
                                        const auditStatus = submittedFile?.audit?.status;

                                        if (hasAudit) {
                                            if (auditStatus === 'APROBADO') finalStatus = 'VIGENTE';
                                            else if (auditStatus === 'OBSERVADO') finalStatus = 'CON OBSERVACIÓN';
                                            else finalStatus = 'EN REVISIÓN';
                                        } else {
                                            const expDateStr = folderMeta?.fechaVencimiento || submittedFile?.date_submitted;
                                            if (expDateStr) {
                                                const expDate = new Date(expDateStr);
                                                const today = new Date();
                                                expDate.setHours(0, 0, 0, 0);
                                                today.setHours(0, 0, 0, 0);

                                                if (expDate < today) {
                                                    finalStatus = 'VENCIDO';
                                                } else {
                                                    finalStatus = isFile ? 'EN REVISIÓN' : 'PENDIENTE';
                                                }
                                            } else {
                                                finalStatus = isFile ? 'EN REVISIÓN' : 'PENDIENTE';
                                            }
                                        }

                                        const finalFileName = folderMeta?.archivo || directFileName || fileData?.file_name || fileData?.fileName || null;
                                        const finalObs = folderMeta?.observacion || submittedFile?.observacion || null;
                                        const finalVenc = folderMeta?.fechaVencimiento || submittedFile?.date_submitted || null;

                                        docMap.set(key, {
                                            id: key,
                                            id_group_req: req.id_group_requirements || req.idGroupRequirements,
                                            id_list_req: listReq.id_list_requirements || listReq.idListRequirements,
                                            id_attribute: attrs?.id_attributes || attrs?.idAttributes,
                                            id_file_submitted: submittedFile?.id_file_submitted || submittedFile?.idFileSubmitted || null,
                                            id_element: (listReq.folder_metadata || listReq.folderMetadata)?.id_elements,
                                            id_active: attrTempl?.id_active || attrTempl?.idActive,
                                            tipo: docKey,
                                            label: cleanLabel,
                                            frecuencia: attrs?.periodicity_description || attrs?.periodicityDescription || 'Única vez',
                                            estado: finalStatus,
                                            archivo: finalFileName,
                                            observacion: finalObs,
                                            fechaVencimiento: finalVenc,
                                            fileUrl: directFileUrl || fileData?.url || null, // Blob URL generation happens on demand now
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
                    let fileDto = null;
                    if (doc.fileObject) {
                        const base64Data = await fileToBase64(doc.fileObject);
                        const pureBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

                        // New DB Architecture payload fields 
                        fileDto = {
                            id_file_submitted: doc.id_file_submitted || null,
                            id_attribute: doc.id_attribute || 1,
                            period: new Date().getFullYear().toString(),
                            file_name: doc.archivo,
                            file_size: doc.fileObject.size,
                            file_type: doc.fileObject.type,
                            file_content: pureBase64,
                            date_submitted: new Date().toISOString().split('T')[0]
                        };
                    }

                    elementsList.push({
                        id_element: doc.id_element || null,
                        id_active: finalIdActive,
                        element_data: {
                            tipo: doc.tipo,
                            estado: doc.estado,
                            archivo: doc.archivo,
                            observacion: doc.observacion,
                            fechaVencimiento: doc.fechaVencimiento
                        },
                        file_submitted: fileDto
                    });
                }
            }
        }

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
                    fechaVencimiento: d.fechaVencimiento instanceof Date
                        ? d.fechaVencimiento.toISOString().split('T')[0]
                        : (typeof d.fechaVencimiento === 'string' ? d.fechaVencimiento.split('T')[0] : d.fechaVencimiento),
                }))
            },
            elements: elementsList
        };

        try {
            if (mergedData.internalId) {
                await supplierService.update(mergedData.internalId, backendPayload);
                showSuccess('Éxito', 'Datos actualizados correctamente.');
                await fetchSupplierData(); // Refresh data
                return true;
            }
            return false;
        } catch (error) {
            console.error("Update error:", error);
            showError('Error', 'No se pudieron actualizar los datos.');
            throw error;
        }
    };

    return {
        supplierData,
        loading,
        updateSupplier,
        refresh: fetchSupplierData
    };
};

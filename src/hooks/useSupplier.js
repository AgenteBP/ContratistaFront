import { useState, useEffect, useCallback } from 'react';
import { supplierService } from '../services/supplierService';
import { groupService } from '../services/groupService';
import elementService from '../services/elementService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { MOCK_SUPPLIERS } from '../data/mockSuppliers';

import { base64ToBlobUrl, fileToBase64 } from '../utils/fileUtils';


// Mapping for Document ID to Active Description
const DOC_TYPE_LABELS = {
    'CONSTANCIA_AFIP': 'Constancia de Inscripción AFIP',
    'ESTATUTO': 'Estatuto Social',
    'FORM_931': 'Formulario 931',
    'HABILITACION_SEGURIDAD': 'Habilitación Comercial / Seguridad',
    'SEGURO_ACCIDENTES': 'Seguro de Accidentes Personales',
    'ART_CERTIFICADO': 'Certificado de Cobertura ART',
    'SEGURO_VIDA': 'Seguro de Vida Obligatorio',
    'HABILITACION_VEHICULOS': 'Habilitación de Vehículos / VTV',
    'SOLICITUD_USUARIOS': 'Solicitud de Usuarios de Sistema',
    'CERT_NO_DEUDA_EDESAL': 'Certificado de No Deuda (Edesal)',
    'EMR_MANUAL_EDESAL': 'Manual de Inducción Seguridad EMR (Edesal)',
    'DDJJ_ETICA_EDESAL': 'Declaración Jurada Ética (Edesal)',
    'HABILITACION_VIGILANCIA_EDESAL': 'Habilitación Provincial de Seguridad (Edesal)',
    'ANEXO_SH_ROVELLA': 'Anexo Seguridad e Higiene (Rovella)',
    'FICHA_ALTA_ROVELLA': 'Ficha Alta de Proveedor (Rovella)',
    'POLIZA_OBRA_ROVELLA': 'Póliza de Seguro de Obra (Rovella)',
    'SAP_ROVELLA': 'Seguro ACC Personales - Cláusula Rovella'
};


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
                                    const listReq = req.listRequirements;
                                    if (!listReq) return;

                                    const attrTempl = listReq.attributeTemplate;
                                    const attrs = attrTempl?.attributes;
                                    const folderMeta = listReq.folder_metadata?.data;
                                    const files = listReq.files || [];
                                    const submittedFile = files.length > 0 ? files[0] : null;
                                    const fileData = submittedFile?.data_pdf || submittedFile?.dataPdf;

                                    const requirementId = listReq.id_list_requirements;
                                    const key = `R${requirementId}`;

                                    if (!docMap.has(key)) {
                                        const label = listReq.description || attrs?.description || 'Documento';

                                        let docKey = Object.keys(DOC_TYPE_LABELS).find(k =>
                                            DOC_TYPE_LABELS[k].toLowerCase() === label.toLowerCase()
                                        );

                                        if (!docKey) {
                                            const cleanDesc = label.replace(/ obligatorio/i, '').trim();
                                            docKey = Object.keys(DOC_TYPE_LABELS).find(k =>
                                                DOC_TYPE_LABELS[k].toLowerCase().includes(cleanDesc.toLowerCase())
                                            ) || label.toUpperCase().replace(/\s+/g, '_');
                                        }

                                        const isFile = !!submittedFile;
                                        const cleanLabel = label.replace(/ obligatorio/i, '').trim();

                                        // New DB schema fields vs Old DB schema `data_pdf`
                                        const fileData = submittedFile?.data_pdf || submittedFile?.dataPdf || {};
                                        const directFileName = submittedFile?.file_name || submittedFile?.fileName;
                                        const directFileUrl = submittedFile?.file_url || submittedFile?.url;
                                        const directContent = submittedFile?.content || submittedFile?.file_content;

                                        const finalStatus = folderMeta?.estado || (isFile ? 'EN REVISIÓN' : 'PENDIENTE');
                                        const finalFileName = folderMeta?.archivo || directFileName || fileData?.file_name || fileData?.fileName || null;
                                        const finalObs = folderMeta?.observacion || submittedFile?.observacion || null;
                                        const finalVenc = folderMeta?.fechaVencimiento || submittedFile?.date_submitted || null;

                                        docMap.set(key, {
                                            id: `req-${key}`,
                                            id_group_req: req.id_group_requirements,
                                            id_list_req: listReq.id_list_requirements,
                                            id_attribute: attrs?.id_attributes || attrs?.idAttributes,
                                            id_file_submitted: submittedFile?.id_file_submitted || submittedFile?.idFileSubmitted || null,
                                            id_element: listReq.folder_metadata?.id_elements,
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
                                console.log("Specific Documentation mapped:", dynamicDocs);
                                data.documentacion = dynamicDocs;
                            } else {
                                console.warn("No specific group requirements found, marking as MOCK for visibility");
                                data.isMock = true;
                            }
                        } catch (err) {
                            console.warn("Failed to fetch specific group requirements, falling back to basic documents", err);
                            data.isMock = true;
                        }
                    }

                    console.log("UI Data ready to be set:", data);
                    setSupplierData({ ...data, isMock: false });
                } else {
                    console.error("Data received is null or undefined");
                    throw new Error("API data is empty");
                }
            } else {
                console.warn("No CUIT identified, loading FALLBACK MOCK");
                const mock = MOCK_SUPPLIERS.find(p => p.id === 1);
                console.log("Mock data selected:", mock);
                setSupplierData({ ...mock, isMock: true });
            }
        } catch (error) {
            console.error("CRITICAL ERROR in fetchSupplierData:", error);
            console.log("Attempting emergency MOCK recovery...");
            const activeCuit = currentRole?.entityCuit || currentRole?.cuit || user?.suppliers?.[0]?.cuit;
            const mock = MOCK_SUPPLIERS.find(p => p.cuit === activeCuit) || MOCK_SUPPLIERS.find(p => p.id === 1);
            console.log("Recovery Mock data:", mock);
            setSupplierData({ ...mock, internalId: mock.internalId || mock.id, isMock: true });
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
                const docLabel = DOC_TYPE_LABELS[doc.tipo];
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

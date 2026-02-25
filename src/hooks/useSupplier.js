import { useState, useEffect, useCallback } from 'react';
import { supplierService } from '../services/supplierService';
import { groupService } from '../services/groupService';
import elementService from '../services/elementService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { MOCK_SUPPLIERS } from '../data/mockSuppliers';

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

const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
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
                            console.log("Fetching group requirements for group", data.idGroup);
                            const groupReqs = await groupService.getDetails(data.internalId, data.idGroup, 5);

                            if (groupReqs && groupReqs.length > 0) {
                                // Map Requirements to UI Documentation format
                                const dynamicDocs = groupReqs.map(req => {
                                    const listReq = req.listRequirements;
                                    const info = listReq?.elementInfo;
                                    const active = listReq?.attributeTemplate?.active_description || info?.active?.description || listReq?.description;

                                    // Find key from DOC_TYPE_LABELS or fallback to description
                                    let docKey = Object.keys(DOC_TYPE_LABELS).find(key =>
                                        DOC_TYPE_LABELS[key].toLowerCase() === active.toLowerCase()
                                    );

                                    if (!docKey) {
                                        // Fallback cleaning: remove " obligatorio", etc
                                        const cleanDesc = active.replace(/ obligatorio/i, '').trim();
                                        docKey = Object.keys(DOC_TYPE_LABELS).find(key =>
                                            DOC_TYPE_LABELS[key].toLowerCase().includes(cleanDesc.toLowerCase())
                                        ) || active.toUpperCase().replace(/\s+/g, '_');
                                    }

                                    const lastFile = info?.files_submitted?.[0];
                                    const cleanLabel = active.replace(/ obligatorio/i, '').trim();

                                    return {
                                        id: info?.id_elements || `req-${listReq?.id_list_requirements || Math.random()}`,
                                        id_active: info?.active?.idActive || info?.id_active, // Preservar ID de tipo de documento
                                        tipo: docKey,
                                        label: cleanLabel,
                                        frecuencia: listReq?.attributeTemplate?.attributes?.periodicity_description || 'Única vez',
                                        estado: lastFile ? 'EN REVISIÓN' : 'PENDIENTE',
                                        archivo: lastFile?.data_pdf?.file_name || null,
                                        observacion: lastFile?.observacion || null,
                                        fechaVencimiento: lastFile?.date_submitted || null,
                                        modified: false
                                    };
                                });

                                console.log("Dynamic Documentation mapped:", dynamicDocs);
                                data.documentacion = dynamicDocs;
                            } else {
                                console.warn("No group requirements found, marking as MOCK for visibility");
                                data.isMock = true;
                            }
                        } catch (err) {
                            console.warn("Failed to fetch group requirements, falling back to basic documents", err);
                            data.isMock = true; // Mark as mock if dynamic requirements failed
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
                const active = legajoActives.find(a =>
                    String(a.id_active) === String(doc.tipo || doc.id_active) ||
                    (docLabel && a.description === docLabel)
                );

                if (active && (doc.modified || doc.fileObject)) {
                    let fileDto = null;
                    if (doc.fileObject) {
                        const base64Data = await fileToBase64(doc.fileObject);
                        fileDto = {
                            id_attribute: 1,
                            period: new Date().getFullYear().toString(),
                            data_pdf: {
                                fileName: doc.archivo,
                                fileSize: doc.fileObject.size,
                                fileType: doc.fileObject.type,
                                content: base64Data
                            },
                            date_submitted: new Date().toISOString().split('T')[0]
                        };
                    }

                    elementsList.push({
                        id_active: active.id_active,
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
                    id: d.id,
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

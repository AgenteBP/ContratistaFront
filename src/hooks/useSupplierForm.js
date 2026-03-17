import { useState, useEffect, useCallback, useMemo } from 'react';
import { fileService } from '../services/fileService';
import { activeService } from '../services/activeService';

/**
 * useSupplierForm
 * 
 * Manages the entire state object, step progress, and dirtiness tracking for the SupplierForm wizard.
 * Encapsulates the logic so the UI component focuses only on layout and rendering.
 */
export const useSupplierForm = ({ initialData, isWizardMode, readOnly, isAdmin, groups, availableCompanies, availableRequirements = [], onSubmit }) => {
    // Defines standard steps depending on execution mode
    const allSteps = ['Proveedor', 'Grupo y Empresa', 'Ubicación', 'Contactos', 'Documentos'];
    const steps = isAdmin ? allSteps : allSteps.filter(s => s !== 'Grupo y Empresa');
    
    const [currentStep, setCurrentStep] = useState(1);
    const [dirtySteps, setDirtySteps] = useState(new Set());
    const [isEditingStep, setIsEditingStep] = useState(!readOnly && isWizardMode);

    // Document loading states
    const [loadingDocs, setLoadingDocs] = useState({});

    // State for temporary contact being added
    const [newContact, setNewContact] = useState({
        nombre: '', dni: '', movil: '', email: '', telefono: '', tipo: 'SELECCIONE TIPO'
    });

    // Initial default state
    const defaultFormData = {
        razonSocial: '', cuit: '', nombreFantasia: '', tipoPersona: 'JURIDICA',
        clasificacionAFIP: 'SELECCIONE CLASIFICACIÓN AFIP', servicio: 'SELECCIONE SERVICIO',
        email: '', telefono: '', empleadorAFIP: false, esTemporal: false,
        grupo: '', id_group: null, empresas: [], // Wizard specific
        pais: '', paisCode: '', provincia: '', provinciaCode: '', localidad: '',
        codigoPostal: '', direccionFiscal: '', direccionReal: '',
        contactos: [], documentacion: []
    };

    // Main central state
    const [formData, setFormData] = useState(initialData ? { ...defaultFormData, ...initialData } : defaultFormData);
    
    // Sync with initialData changes from parent re-fetches
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData(prev => {
                const newData = { ...defaultFormData, ...initialData };
                if (JSON.stringify(prev) === JSON.stringify(newData)) {
                    return prev; // Avoid infinite loop due to object reference change
                }
                return newData;
            });
        }
    }, [initialData]);

    const getStepIdx = useCallback((label) => steps.indexOf(label) + 1, [steps]);

    const markStepDirty = useCallback((stepIndex) => {
        setDirtySteps(prev => {
            if (prev.has(stepIndex)) return prev;
            const next = new Set(prev);
            next.add(stepIndex);
            return next;
        });
    }, []);

    const handleChange = useCallback((e) => {
        if (readOnly && !isAdmin) return;
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        markStepDirty(currentStep);
    }, [readOnly, isAdmin, currentStep, markStepDirty]);

    const handleToggle = useCallback((name) => {
        if (readOnly && !isAdmin) return;
        setFormData(prev => ({ ...prev, [name]: !prev[name] }));
        markStepDirty(currentStep);
    }, [readOnly, isAdmin, currentStep, markStepDirty]);

    const handleLocationChange = useCallback((field, value, option) => {
        if (readOnly && !isAdmin) return;
        
        setFormData(prev => {
            let updates = {};
            if (field === 'pais') {
                updates = { pais: option.label, paisCode: value, provincia: '', provinciaCode: '', localidad: '' };
            } else if (field === 'provincia') {
                updates = { provincia: option.label, provinciaCode: value, localidad: '' };
            } else if (field === 'localidad') {
                updates = { localidad: value };
            }
            return { ...prev, ...updates };
        });
        markStepDirty(getStepIdx('Ubicación'));
    }, [readOnly, isAdmin, getStepIdx, markStepDirty]);

    const handleAddContact = useCallback(() => {
        if (!newContact.nombre || newContact.tipo === 'SELECCIONE TIPO') {
            alert("Complete nombre y tipo de contacto");
            return;
        }
        setFormData(prev => ({
            ...prev,
            contactos: [...prev.contactos, { ...newContact, id: Date.now() }]
        }));
        setNewContact({ nombre: '', dni: '', movil: '', email: '', telefono: '', tipo: 'SELECCIONE TIPO' });
        markStepDirty(getStepIdx('Contactos'));
    }, [newContact, getStepIdx, markStepDirty]);

    const handleRemoveContact = useCallback((id) => {
        setFormData(prev => ({
            ...prev,
            contactos: prev.contactos.filter(c => c.id !== id)
        }));
        markStepDirty(getStepIdx('Contactos'));
    }, [getStepIdx, markStepDirty]);

    const getAutoExpiration = useCallback((frecuencia) => {
        const date = new Date();
        const freq = frecuencia?.toUpperCase();
        if (freq === 'MENSUAL') date.setMonth(date.getMonth() + 1);
        else if (freq === 'TRIMESTRAL') date.setMonth(date.getMonth() + 3);
        else if (freq === 'SEMESTRAL') date.setMonth(date.getMonth() + 6);
        else if (freq === 'ANUAL') date.setFullYear(date.getFullYear() + 1);
        else return null;
        return date.toISOString().split('T')[0];
    }, []);

    const handleFileUpload = useCallback((e, docId, docLabel) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileUrl = URL.createObjectURL(file);
        markStepDirty(getStepIdx('Documentos'));

        setFormData(prev => {
            const currentDocs = prev.documentacion || [];
            const docIndex = currentDocs.findIndex(d => String(d.id) === String(docId) || String(d.tipo) === String(docId));
            
            let newDocs;
            if (docIndex >= 0) {
                const currentDoc = currentDocs[docIndex];
                const autoDate = !currentDoc.fechaVencimiento ? getAutoExpiration(currentDoc.frecuencia) : currentDoc.fechaVencimiento;
                
                newDocs = [...currentDocs];
                newDocs[docIndex] = { 
                    ...newDocs[docIndex], 
                    oldArchivo: newDocs[docIndex].oldArchivo || newDocs[docIndex].archivo, 
                    oldEstado: newDocs[docIndex].oldEstado || newDocs[docIndex].estado,
                    archivo: file.name, 
                    fileUrl: fileUrl, 
                    fileObject: file, 
                    modified: true,
                    label: docLabel || newDocs[docIndex].label,
                    fechaVencimiento: autoDate,
                    estado: 'EN REVISIÓN'
                };
            } else {
                newDocs = [...currentDocs, { 
                    id: docId, 
                    tipo: docId, 
                    estado: 'EN REVISIÓN', 
                    archivo: file.name, 
                    fileUrl: fileUrl, 
                    fileObject: file, 
                    modified: true, 
                    fechaVencimiento: getAutoExpiration('ANUAL'), // Default fallback
                    label: docLabel
                }];
            }
            return { ...prev, documentacion: newDocs };
        });
    }, [markStepDirty, getStepIdx, getAutoExpiration]);

    const handleDateChange = useCallback((docId, date) => {
        if (!date) return;
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        markStepDirty(getStepIdx('Documentos'));
        setFormData(prev => {
            const currentDocs = prev.documentacion || [];
            const docIndex = currentDocs.findIndex(d => String(d.id) === String(docId));
            
            let newDocs;
            if (docIndex >= 0) {
                newDocs = [...currentDocs];
                newDocs[docIndex] = { ...newDocs[docIndex], fechaVencimiento: formattedDate, modified: true };
            } else {
                newDocs = [...currentDocs, { 
                    id: docId, 
                    tipo: docId, 
                    estado: 'PENDIENTE', 
                    archivo: null, 
                    modified: true, 
                    fechaVencimiento: formattedDate 
                }];
            }
            return { ...prev, documentacion: newDocs };
        });
    }, [getStepIdx, markStepDirty]);

    const handleRemoveFile = useCallback((docId) => {
        const currentDocs = formData.documentacion || [];
        const targetDoc = currentDocs.find(d => String(d.id) === String(docId) || String(d.tipo) === String(docId));

        if (targetDoc?.hasAudits && !targetDoc?.modified) {
            return; // Bloqueado si ya está auditado y NO fue modificado localmente
        }

        markStepDirty(getStepIdx('Documentos'));
        setFormData(prev => ({
            ...prev,
            documentacion: (prev.documentacion || []).map(d => 
                String(d.id) === String(docId) || String(d.tipo) === String(docId) 
                ? (d.hasAudits && d.modified ? { 
                    ...d, 
                    archivo: d.oldArchivo || null, 
                    fileUrl: null, 
                    fileObject: null, 
                    modified: false, 
                    estado: d.oldEstado || 'CON OBSERVACIÓN' 
                  } : { ...d, archivo: null, fileUrl: null, fileObject: null, modified: true, fechaVencimiento: null })
                : d
            )
        }));
    }, [getStepIdx, markStepDirty, formData.documentacion]);

    const groupDefinitions = useMemo(() => 
        (groups || []).map(g => ({
            id: g.idGroup || g.id_group || g.id || g.description || g.name,
            name: g.description || g.name,
            icon: g.icon || (g.description === 'GRUPO CETA' ? 'pi-briefcase' : 'pi-users')
        }))
    , [groups]);

    const empresasByGrupo = useMemo(() => {
        const map = {};
        (availableCompanies || []).forEach(emp => {
            const groupId = emp.id_group || emp.idGroup;
            if (groupId !== undefined && groupId !== null) {
                const key = String(groupId);
                if (!map[key]) map[key] = [];
                map[key].push({ label: emp.description || emp.name, value: emp.id_company || emp.idCompany || emp.id });
            }
        });
        return map;
    }, [availableCompanies]);

    const [uniqueActives, setUniqueActives] = useState([]);

    useEffect(() => {
        const fetchActives = async () => {
            try {
                const data = await activeService.getByType(5); // Activo Legajo Proveedor
                setUniqueActives(data || []);
            } catch (error) {
                console.error("useSupplierForm: Error fetching actives", error);
            }
        };
        fetchActives();
    }, [availableRequirements]);

    const [localRequiredDocs, setLocalRequiredDocs] = useState([]);
    const [isCustomConfig, setIsCustomConfig] = useState(isWizardMode);

    // Synchronize requiredDocs from formData.documentacion for editing
    useEffect(() => {
        if (!isWizardMode || (formData.documentacion && formData.documentacion.length > 0)) {
            const existingDocs = formData.documentacion || [];
            const dynamicRequirements = existingDocs.map(doc => ({
                id: doc.id || (Date.now() + Math.random()),
                id_active: doc.id_active || null,
                id_attribute: doc.id_attribute || null,
                id_elements: doc.id_elements || null,
                tipo: doc.tipo || 'DOCUMENTO',
                label: doc.label || doc.tipoDescripcion || doc.label,
                frecuencia: doc.frecuencia || 'ANUAL',
                obligatoriedad: doc.obligatoriedad || (doc.isOptional ? 'Opcional' : 'Obligatorio'),
                isOptional: !!doc.isOptional || doc.obligatoriedad === 'Opcional',
                estado: doc.estado || 'PENDIENTE',
                archivo: doc.archivo,
                fechaVencimiento: doc.fechaVencimiento,
                observacion: doc.observacion,
                hasAudits: !!doc.hasAudits
            }));
            
            if (localRequiredDocs.length === 0) {
                setLocalRequiredDocs(dynamicRequirements);
            }
        }
    }, [formData.documentacion, isWizardMode]);

    const toggleDocRequirement = useCallback((docId) => {
        setIsCustomConfig(true);
        setLocalRequiredDocs(prev => {
            const getReqId = (d) => d.id_list_requirements || d.idListRequirements || d.id;
            const exists = prev.find(d => String(getReqId(d)) === String(docId));
            if (exists) return prev.filter(d => String(getReqId(d)) !== String(docId));

            const rule = (availableRequirements || []).find(d => String(getReqId(d)) === String(docId));
            if (!rule) return prev;

            const newReq = {
                id: docId,
                id_active: rule.idActive || rule.id_active || null,
                id_attribute: rule.idAttributes || rule.id_attribute || null,
                label: rule.description || rule.label,
                frecuencia: rule.frecuencia || 'ANUAL',
                obligatoriedad: 'Manual',
                isOptional: false
            };
            return [...prev, newReq];
        });
        markStepDirty(getStepIdx('Documentos'));
    }, [availableRequirements, getStepIdx, markStepDirty]);

    const updateDocRequirement = useCallback((docId, field, value) => {
        setIsCustomConfig(true);
        markStepDirty(getStepIdx('Documentos'));
        setLocalRequiredDocs(prev => prev.map(d => {
            const getReqId = (p) => p.id_list_requirements || p.idListRequirements || p.id;
            if (String(getReqId(d)) === String(docId)) {
                const isAlreadyCustom = String(d.id || '').startsWith('CUSTOM_');
                if (!isAlreadyCustom && field !== 'frecuencia' && field !== 'isOptional') {
                   // This part was specifically for adding custom free-text requirements, 
                   // but for existing ones from availableRequirements we just update.
                }
                
                return {
                    ...d,
                    [field]: value,
                    obligatoriedad: field === 'isOptional' ? (value ? 'Opcional' : 'Manual') : d.obligatoriedad,
                    isOptional: field === 'isOptional' ? value : d.isOptional,
                    modified: true
                };
            }
            return d;
        }));
    }, [getStepIdx, markStepDirty]);

    // Restore requiredDocs as the one consumed by the UI
    const requiredDocs = localRequiredDocs;
    
    // Sync localRequiredDocs to formData.documentacion when in config mode
    useEffect(() => {
        if (isWizardMode || isAdmin) {
            setFormData(prev => {
                const prevDocsJson = JSON.stringify(prev.documentacion || []);
                const newDocsJson = JSON.stringify(localRequiredDocs);
                if (prevDocsJson === newDocsJson) return prev;
                return { ...prev, documentacion: localRequiredDocs };
            });
        }
    }, [localRequiredDocs, isWizardMode, isAdmin]);

    const handleSubmit = async (step) => {
        if (onSubmit) {
            const filteredDocs = (formData.documentacion || []).filter(d => 
                d.modified === true || String(d.id).startsWith('CUSTOM_')
            );
            const dataToSubmit = { ...formData, documentacion: filteredDocs };
            await onSubmit(dataToSubmit, step);
            setIsEditingStep(false); // Lock back to view mode
            setDirtySteps(new Set()); // Clear unsaved changes flag
        }
    };

    return {
        formData,
        setFormData,
        currentStep,
        setCurrentStep,
        steps,
        getStepIdx,
        dirtySteps,
        setDirtySteps,
        markStepDirty,
        isEditingStep,
        setIsEditingStep,
        handleChange,
        handleToggle,
        handleLocationChange,
        newContact,
        setNewContact,
        handleAddContact,
        handleRemoveContact,
        loadingDocs,
        setLoadingDocs,
        handleFileUpload,
        handleDateChange,
        updateDocRequirement,
        groupDefinitions,
        empresasByGrupo,
        uniqueActives,
        requiredDocs,
        setRequiredDocs: setLocalRequiredDocs,
        setIsCustomConfig,
        toggleDocRequirement,
        handleRemoveFile,
        handleSubmit,
        handleViewFile: async (docData) => {
            if (!docData || !docData.archivo) return;

            if (docData.fileUrl && docData.fileUrl.startsWith('blob:')) {
                window.open(docData.fileUrl, '_blank');
                return;
            }

            if (!docData.id_file_submitted) {
                if (docData.fileUrl) window.open(docData.fileUrl, '_blank');
                else alert(`Visualización no disponible para: ${docData.archivo}`);
                return;
            }

            try {
                setLoadingDocs(prev => ({ ...prev, [docData.id]: true }));
                const fileBlob = await fileService.getFile(docData.id_file_submitted);

                if (fileBlob && fileBlob.size > 0) {
                    const blobUrl = URL.createObjectURL(fileBlob);
                    if (blobUrl) {
                        window.open(blobUrl, '_blank');
                    } else {
                        alert('Error local: No se pudo generar la vista previa del archivo.');
                    }
                } else if (docData.fileUrl) {
                    window.open(docData.fileUrl, '_blank');
                } else {
                    alert('El archivo no tiene contenido para visualizar.');
                }
            } catch (error) {
                console.error('Error descargando documento:', error);
                if (docData.fileUrl) {
                    window.open(docData.fileUrl, '_blank');
                } else {
                    alert('Error al descargar el archivo del servidor.');
                }
            } finally {
                setLoadingDocs(prev => ({ ...prev, [docData.id]: false }));
            }
        }
    };
};

export default useSupplierForm;

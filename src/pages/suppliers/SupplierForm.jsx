import React, { useState, useEffect, useRef } from 'react';
import { useBlocker, useBeforeUnload } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Toggle from '../../components/ui/Toggle';
import SectionTitle from '../../components/ui/SectionTitle';
import Label from '../../components/ui/Label';
import UnsavedChangesModal from '../../components/ui/UnsavedChangesModal'; // IMPORT MODAL
import { Country, State, City } from 'country-state-city';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { StatusBadge } from '../../components/ui/Badges';

const SupplierForm = ({ initialData, readOnly = false, partialEdit = false, onSubmit, onBack, title, subtitle, headerInfo }) => {
    // Wizard Mode: Alta de Usuario (Not ReadOnly, Not PartialEdit)
    const isWizardMode = !readOnly && !partialEdit;

    // State único para todo el formulario
    const [formData, setFormData] = useState({
        // Paso 1: General
        razonSocial: '',
        cuit: '',
        nombreFantasia: '',
        tipoPersona: 'JURIDICA',
        clasificacionAFIP: 'SELECCIONE CLASIFICACIÓN AFIP',
        servicio: 'SELECCIONE SERVICIO',
        email: '',
        telefono: '',
        empleadorAFIP: false,
        esTemporal: false,

        // Paso 2: Ubicación
        pais: '',
        paisCode: '',
        provincia: '',
        provinciaCode: '',
        localidad: '',
        codigoPostal: '',
        direccionFiscal: '',
        direccionReal: '',

        // Paso 3: Contactos
        contactos: [],

        ...(initialData || {}) // Use prop or empty object for initial state
    });


    const [currentStep, setCurrentStep] = useState(1);
    const steps = ['Proveedor', 'Ubicación', 'Contactos', 'Documentos'];
    const [validationError, setValidationError] = useState(null);

    // State para tracking de cambios sin guardar
    const [dirtySteps, setDirtySteps] = useState(new Set());

    const markStepDirty = (step) => {
        setDirtySteps(prev => {
            const newSet = new Set(prev);
            newSet.add(step);
            return newSet;
        });
    };

    // State para el modo de edición por paso (para partialEdit)
    const [isEditingStep, setIsEditingStep] = useState(false);

    // --- NAVIGATION GUARD ---
    // 1. Browser Refresh/Close Protection
    useBeforeUnload(
        React.useCallback((e) => {
            if (dirtySteps.size > 0 && !readOnly) {
                e.preventDefault();
                return ''; // Legacy for some browsers
            }
        }, [dirtySteps, readOnly])
    );

    // State for Custom Modal
    const [showLeaveModal, setShowLeaveModal] = useState(false);

    // 2. In-App Navigation Protection
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            dirtySteps.size > 0 && !readOnly && currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        if (blocker.state === "blocked") {
            setShowLeaveModal(true);
        }
    }, [blocker]);

    const handleLeaveConfirm = () => {
        if (blocker.state === "blocked") {
            blocker.proceed();
        }
        setShowLeaveModal(false);
    };

    const handleLeaveCancel = () => {
        if (blocker.state === "blocked") {
            blocker.reset();
        }
        setShowLeaveModal(false);
    };


    // Reset edit mode when changing steps, or auto-enable if there are unsaved changes
    useEffect(() => {
        if (dirtySteps.has(currentStep)) {
            setIsEditingStep(true);
        } else {
            setIsEditingStep(false);
        }
    }, [currentStep, dirtySteps]);

    const handleStartEdit = () => setIsEditingStep(true);
    const handleStopEdit = () => {
        // Guardar cambios al salir del modo edición
        handleSubmit(currentStep);
        setIsEditingStep(false);
    };

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                empleadorAFIP: initialData.empleadorAFIP === 'Si' || initialData.empleadorAFIP === true,
                esTemporal: initialData.esTemporal === 'Si' || initialData.esTemporal === true,
                contactos: initialData.contactos || []
            }));
        }
    }, [initialData]);

    // Opciones para selects
    const servicios = ['SELECCIONE SERVICIO', 'Mantenimiento', 'Limpieza', 'Seguridad', 'Logística', 'VIGILANCIA'];
    const clasificacionesAFIP = ['SELECCIONE CLASIFICACIÓN AFIP', 'Responsable Inscripto', 'Monotributista', 'Exento', 'Consumidor Final'];
    const tiposPersona = ['JURIDICA', 'FISICA'];
    const tiposContacto = [
        'SELECCIONE TIPO',
        'REPRESENTANTE LEGAL',
        'ADMINISTRATIVO - LEGAJO',
        'OPERATIVO - LEGAJO',
        'ADMINISTRATIVO - LICITACIONES',
        'OPERATIVO - LICITACIONES',
        'ADMINISTRATIVO - CONTROL DE PROVEEDORES',
        'OPERATIVO - CONTROL DE PROVEEDOR'
    ];

    // State para contacto temporal
    const [newContact, setNewContact] = useState({
        nombre: '',
        dni: '',
        movil: '',
        email: '',
        telefono: '',
        tipo: 'SELECCIONE TIPO'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (readOnly) return;
        setFormData(prev => ({ ...prev, [name]: value }));
        markStepDirty(currentStep); // Marcar paso actual como sucio
    };

    const handleToggle = (name) => {
        if (readOnly) return;
        setFormData(prev => ({ ...prev, [name]: !prev[name] }));
        markStepDirty(currentStep);
    };

    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setNewContact(prev => ({ ...prev, [name]: value }));
    };

    const addContact = () => {
        if (!newContact.nombre || newContact.tipo === 'SELECCIONE TIPO') {
            alert("Complete nombre y tipo de contacto");
            return;
        }
        setFormData(prev => ({
            ...prev,
            contactos: [...prev.contactos, { ...newContact, id: Date.now() }]
        }));
        setNewContact({ nombre: '', dni: '', movil: '', email: '', telefono: '', tipo: 'SELECCIONE TIPO' });
        markStepDirty(3); // Contactos es paso 3
    };

    // Aliases para compatibilidad con render logic
    const handleAddContact = addContact;

    const removeContact = (id) => {
        setFormData(prev => ({
            ...prev,
            contactos: prev.contactos.filter(c => c.id !== id)
        }));
        markStepDirty(3);
    };
    const handleRemoveContact = removeContact;

    // Campos por paso para guardado parcial
    const STEP_FIELDS = {
        1: ['razonSocial', 'cuit', 'nombreFantasia', 'tipoPersona', 'clasificacionAFIP', 'servicio', 'email', 'telefono', 'empleadorAFIP', 'esTemporal'],
        2: ['pais', 'paisCode', 'provincia', 'provinciaCode', 'localidad', 'codigoPostal', 'direccionFiscal', 'direccionReal'],
        3: ['contactos'],
        4: ['documentacion']
    };

    const handleSubmit = (stepScope = null) => {
        // If stepScope is an event (object), treat as null (Global)
        const scope = (typeof stepScope === 'number') ? stepScope : null;

        console.log(`HANDLING SUBMIT (Scope: ${scope || 'Global'}) - Current Docs:`, formData.documentacion);

        // Finalize document statuses before saving (Only if Global or Step 4)
        let updatedDocs = formData.documentacion;

        if (!scope || scope === 4) {
            updatedDocs = formData.documentacion?.map(doc => {
                // Only update status if the document was MODIFIED (file uploaded or date changed)
                if (doc.modified && doc.archivo) {
                    console.log(`[Submit] Updating ${doc.tipo} to EN REVISIÓN`);
                    return { ...doc, estado: 'EN REVISIÓN' };
                }
                return doc;
            });
        }

        // Clean up 'modified' flags
        const cleanDocs = updatedDocs?.map(({ modified, ...rest }) => rest);

        // Update local state first (always full sync for UI consistency)
        const finalData = { ...formData, documentacion: cleanDocs };
        setFormData(finalData);

        if (scope) {
            // PARTIAL SAVE: Only submit fields for this step
            const fieldsToSave = STEP_FIELDS[scope] || [];
            const partialPayload = {};
            fieldsToSave.forEach(field => {
                partialPayload[field] = finalData[field];
            });
            // Preserve ID if needed
            if (finalData.id) partialPayload.id = finalData.id;

            console.log(`FINAL DATA TO SUBMIT (PARTIAL STEP ${scope}):`, partialPayload);
            onSubmit(partialPayload);

            // Clear dirty flag ONLY for this step
            setDirtySteps(prev => {
                const newSet = new Set(prev);
                newSet.delete(scope);
                return newSet;
            });
        } else {
            // GLOBAL SAVE: Submit everything
            console.log("FINAL DATA TO SUBMIT (GLOBAL):", finalData);
            onSubmit(finalData);
            setDirtySteps(new Set());
        }
    };

    // --- LOGICA DE UBICACION (Country-State-City) ---
    // Mover hooks al nivel superior para no romper reglas de Hooks
    const regionNames = new Intl.DisplayNames(['es'], { type: 'region' });
    const countries = Country.getAllCountries().map(c => {
        let label = c.name;
        try {
            label = regionNames.of(c.isoCode);
        } catch (e) {
            // fallback to original name
        }
        return { label: label, value: c.isoCode };
    }).sort((a, b) => a.label.localeCompare(b.label)); // Re-ordenar alfabéticamente en ES

    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    // INITIALIZATION: Si vienen datos con NOMBRE pero sin CODIGO (legacy/mock), intentamos matchear
    useEffect(() => {
        if (initialData) {
            let updates = {};
            // 1. Match Pais Code
            if (initialData.pais && !initialData.paisCode) {
                const foundCountry = countries.find(c => c.label === initialData.pais);
                if (foundCountry) {
                    updates.paisCode = foundCountry.value;

                    // 2. Match Provincia Code (Solo si encontramos país)
                    if (initialData.provincia && !initialData.provinciaCode) {
                        const countryStates = State.getStatesOfCountry(foundCountry.value);
                        const foundState = countryStates.find(s => s.name === initialData.provincia);
                        if (foundState) {
                            updates.provinciaCode = foundState.isoCode;
                        }
                    }
                }
            }

            if (Object.keys(updates).length > 0) {
                setFormData(prev => ({ ...prev, ...updates }));
            }
        }
    }, [initialData]); // Run once on mount/initialData change

    // Efecto para cargar provincias cuando cambia el país
    useEffect(() => {
        if (formData.paisCode || formData.pais) {
            // Intentar buscar el código si no existe (backwards compatibility)
            let code = formData.paisCode;
            if (!code && formData.pais) {
                const found = countries.find(c => c.label === formData.pais);
                if (found) code = found.value;
            }

            if (code) {
                const countryStates = State.getStatesOfCountry(code).map(s => ({ label: s.name, value: s.isoCode }));
                setStates(countryStates);
            }
        } else {
            setStates([]);
        }
    }, [formData.paisCode, formData.pais]);

    // Efecto para cargar ciudades cuando cambia la provincia
    useEffect(() => {
        if ((formData.provinciaCode || formData.provincia) && (formData.paisCode || formData.pais)) {
            let pCode = formData.paisCode;
            if (!pCode && formData.pais) {
                const found = countries.find(c => c.label === formData.pais);
                if (found) pCode = found.value;
            }

            let sCode = formData.provinciaCode;
            if (!sCode && formData.provincia && states.length > 0) {
                const found = states.find(s => s.label === formData.provincia);
                if (found) sCode = found.value;
            }

            if (pCode && sCode) {
                const stateCities = City.getCitiesOfState(pCode, sCode).map(c => ({ label: c.name, value: c.name })); // City no tiene isoCode único simple
                setCities(stateCities);
            }
        } else {
            setCities([]);
        }
    }, [formData.provinciaCode, formData.provincia, formData.paisCode, formData.pais, states]);


    const handleLocationChange = (field, value, option) => {
        // Al seleccionar, guardamos tanto el Nombre (para display) como el Código (para lógica)
        let updates = {};
        if (field === 'pais') {
            updates = { pais: option.label, paisCode: value, provincia: '', provinciaCode: '', localidad: '' };
        } else if (field === 'provincia') {
            updates = { provincia: option.label, provinciaCode: value, localidad: '' };
        } else if (field === 'localidad') {
            updates = { localidad: value };
        }
        setFormData(prev => ({ ...prev, ...updates }));
        markStepDirty(2); // Ubicación es paso 2
    };

    // --- CONFIGURACIÓN DE DOCUMENTACIÓN ---
    const ALL_DOCS_RULES = [
        { id: 'CONSTANCIA_AFIP', label: 'Constancia de Inscripción AFIP', frecuencia: 'Mensual', obligatoriedad: 'Todos', defaultFor: () => true },
        { id: 'ESTATUTO', label: 'Estatuto Social', frecuencia: 'Única vez', obligatoriedad: 'Solo Jurídicas', defaultFor: (data) => data.tipoPersona === 'JURIDICA' },
        { id: 'FORM_931', label: 'Formulario 931', frecuencia: 'Mensual', obligatoriedad: 'Empleadores', defaultFor: (data) => data.empleadorAFIP },
        { id: 'HABILITACION_SEGURIDAD', label: 'Habilitación Comercial / Seguridad', frecuencia: 'Con Vencimiento', obligatoriedad: 'Vigilancia', defaultFor: (data) => data.servicio === 'VIGILANCIA' },
        { id: 'SEGURO_ACCIDENTES', label: 'Seguro de Accidentes Personales', frecuencia: 'Mensual', obligatoriedad: 'Autónomos', defaultFor: (data) => data.tipoPersona === 'FISICA' },
        { id: 'ART_CERTIFICADO', label: 'Certificado de Cobertura ART', frecuencia: 'Mensual', obligatoriedad: 'Empleadores', defaultFor: (data) => data.empleadorAFIP },
        { id: 'SEGURO_VIDA', label: 'Seguro de Vida Obligatorio', frecuencia: 'Mensual', obligatoriedad: 'Empleadores', defaultFor: (data) => data.empleadorAFIP },
        { id: 'HABILITACION_VEHICULOS', label: 'Habilitación de Vehículos / VTV', frecuencia: 'Con Vencimiento', obligatoriedad: 'Logística', defaultFor: (data) => data.servicio === 'Logística' || data.servicio === 'MOVILES Y EQUIPOS' }
    ];

    const [requiredDocs, setRequiredDocs] = useState([]);
    const [isCustomConfig, setIsCustomConfig] = useState(false);
    const [editDocMode, setEditDocMode] = useState(!readOnly && !partialEdit); // En Wizard Mode, editamos configuración por defecto
    const [showDocModal, setShowDocModal] = useState(false);
    const [isStepperOpen, setIsStepperOpen] = useState(false); // Mobile Accordion State

    // Recalcular requisitos automáticamente SI NO está personalizado
    useEffect(() => {
        if (!isCustomConfig) {
            const defaults = ALL_DOCS_RULES.filter(rule => rule.defaultFor(formData));
            setRequiredDocs(defaults);
        }
    }, [formData, isCustomConfig]);

    // En modo lectura o edición inicial, cargar desde initialData si existe (simulado)
    useEffect(() => {
        if (initialData && initialData.requiredDocsConfig) {
            // Si el back devolviera la config guardada
            setRequiredDocs(initialData.requiredDocsConfig);
            setIsCustomConfig(true);
        }
    }, [initialData]);

    const toggleDocRequirement = (docId) => {
        setIsCustomConfig(true);
        setRequiredDocs(prev => {
            const exists = prev.find(d => d.id === docId);
            if (exists) return prev.filter(d => d.id !== docId);
            const rule = ALL_DOCS_RULES.find(d => d.id === docId);
            return [...prev, rule];
        });
        markStepDirty(4); // Documentos es paso 4
    };

    const updateDocRequirement = (docId, field, value) => {
        setRequiredDocs(prev => prev.map(d =>
            d.id === docId ? { ...d, [field]: value } : d
        ));
        setIsCustomConfig(true);
        markStepDirty(4);
    };

    const resetDocConfig = () => {
        setIsCustomConfig(false);
        const defaults = ALL_DOCS_RULES.filter(rule => rule.defaultFor(formData));
        setRequiredDocs(defaults);
    };

    const nextStep = () => {
        // Obtenemos si el paso actual es inválido
        const currentStepObj = steps.map((step, index) => {
            const stepNum = index + 1;
            let isInvalid = false;

            if (stepNum === 1) {
                if (!formData.razonSocial || !formData.cuit || !formData.email) isInvalid = true;
            } else if (stepNum === 2 && !isWizardMode) {
                if (!formData.pais || !formData.provincia || !formData.localidad || !formData.codigoPostal || !formData.direccionFiscal) isInvalid = true;
            } else if (stepNum === 3 && !isWizardMode) {
                if (formData.contactos.length === 0) isInvalid = true;
            }

            return { stepNum, isInvalid };
        }).find(s => s.stepNum === currentStep);

        if (currentStepObj?.isInvalid) {
            // Animación de error o feedback visual si se desea
            return;
        }

        setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => setCurrentStep(prev => prev - 1);

    const renderStepContent = () => {
        // Helper para renderizar el encabezado con botón Modificar/Guardar
        const StepHeader = ({ title, subtitle }) => (
            <div className="flex justify-between items-center mb-6">
                <SectionTitle title={title} subtitle={subtitle} />
                {partialEdit && (
                    <div>
                        {!isEditingStep ? (
                            <button
                                onClick={handleStartEdit}
                                className="text-secondary hover:text-primary transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-secondary-light"
                            >
                                <i className="pi pi-pencil"></i> <span className="text-sm font-bold">Modificar</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleStopEdit}
                                className="bg-primary hover:bg-primary-hover text-white flex items-center gap-2 px-4 py-1.5 rounded-lg shadow-sm transition-all"
                            >
                                <i className="pi pi-check"></i> <span className="text-sm font-bold">Guardar</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        );

        switch (currentStep) {
            case 1:
                // En partialEdit: 
                // - Si NO edito: todo disabled.
                // - Si edito: todo disabled MENOS email y telefono.
                // En create/fullAdmin: todo enabled (menos lo que sea readOnly global).

                const isStep1Disabled = readOnly || (partialEdit && !isEditingStep);
                const isFiscalDataLocked = readOnly || partialEdit; // Siempre bloqueado en partialEdit

                return (
                    <div className="p-0 md:p-8">
                        <StepHeader title="Datos Fiscales" subtitle="Información registrada ante AFIP." />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <Input
                                label="Razón Social"
                                name="razonSocial"
                                value={formData.razonSocial}
                                onChange={handleChange}
                                placeholder="Ingrese Razón Social"
                                disabled={isFiscalDataLocked}
                            />
                            <Input
                                label="CUIT"
                                name="cuit"
                                icon="pi-id-card"
                                value={formData.cuit}
                                onChange={handleChange}
                                placeholder="XX-XXXXXXXX-X"
                                disabled={isFiscalDataLocked}
                            />
                            <Input
                                label="Nombre de Fantasía"
                                name="nombreFantasia"
                                value={formData.nombreFantasia}
                                onChange={handleChange}
                                placeholder="Nombre comercial"
                                disabled={isFiscalDataLocked}
                            />
                            <div className="w-full">
                                <Label>Tipo de Persona</Label>
                                {isFiscalDataLocked ? (
                                    <Input value={formData.tipoPersona} disabled />
                                ) : (
                                    <Select
                                        name="tipoPersona"
                                        options={tiposPersona}
                                        value={formData.tipoPersona}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>
                            <div className="w-full">
                                <Label>Clasificación AFIP</Label>
                                {isFiscalDataLocked ? (
                                    <Input value={formData.clasificacionAFIP} disabled />
                                ) : (
                                    <Select
                                        name="clasificacionAFIP"
                                        options={clasificacionesAFIP}
                                        value={formData.clasificacionAFIP}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>
                        </div>

                        <SectionTitle title="Contacto y Operaciones" subtitle="Datos para la gestión diaria." />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <Input
                                label="Email Corporativo"
                                name="email"
                                icon="pi-envelope"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="contacto@empresa.com"
                                disabled={isStep1Disabled} // Este SÍ se habilita con Edit
                            />
                            <Input
                                label="Teléfono"
                                name="telefono"
                                icon="pi-phone"
                                value={formData.telefono}
                                onChange={handleChange}
                                placeholder="+54 11 ..."
                                disabled={isStep1Disabled} // Este SÍ se habilita con Edit
                            />
                            <div className="w-full">
                                <Label>Servicio / Rubro</Label>
                                {isFiscalDataLocked ? (
                                    <Input value={formData.servicio} disabled />
                                ) : (
                                    <Select
                                        name="servicio"
                                        options={servicios}
                                        value={formData.servicio}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 mt-8 p-4 bg-secondary-light rounded-lg border border-secondary/20">
                            <Toggle
                                label="¿Es Empleador ante AFIP?"
                                checked={formData.empleadorAFIP}
                                onChange={() => handleToggle('empleadorAFIP')}
                                disabled={isFiscalDataLocked}
                            />
                            <Toggle
                                label="¿Contratación Temporal?"
                                checked={formData.esTemporal}
                                onChange={() => handleToggle('esTemporal')}
                                disabled={isFiscalDataLocked}
                            />
                        </div>
                    </div>
                );
            case 2:
                const isStep2Disabled = readOnly || (partialEdit && !isEditingStep);
                return (
                    <div className="p-0 md:p-8">
                        <StepHeader title="Ubicación" subtitle="Domicilio fiscal y real." />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Selector de País */}
                            <div className="w-full">
                                <Label>País</Label>
                                <Dropdown
                                    value={formData.paisCode}
                                    options={countries}
                                    onChange={(e) => handleLocationChange('pais', e.value, countries.find(c => c.value === e.value))}
                                    optionLabel="label"
                                    placeholder="Seleccione un país"
                                    filter
                                    className="w-full"
                                    disabled={isStep2Disabled}
                                    pt={{
                                        root: { className: `w-full border border-secondary/20 rounded-lg hover:border-primary focus:border-primary h-[42px] flex items-center uppercase ${isStep2Disabled ? 'bg-gray-50 opacity-90' : 'bg-white'}` },
                                        input: { className: 'w-full text-sm p-3 uppercase' },
                                        item: { className: 'uppercase' },
                                        trigger: { className: 'w-10 text-secondary' },
                                        panel: { className: 'text-sm bg-white border border-secondary/20 shadow-lg' }
                                    }}
                                />
                            </div>

                            <div className="w-full">
                                <Label>Provincia / Estado</Label>
                                <Dropdown
                                    value={formData.provinciaCode}
                                    options={states}
                                    onChange={(e) => handleLocationChange('provincia', e.value, states.find(s => s.value === e.value))}
                                    optionLabel="label"
                                    placeholder="Seleccione una provincia"
                                    filter
                                    className="w-full"
                                    disabled={!formData.paisCode || isStep2Disabled}
                                    emptyMessage="Seleccione un país primero"
                                    pt={{
                                        root: { className: `w-full border border-secondary/20 rounded-lg hover:border-primary focus:border-primary h-[42px] flex items-center uppercase ${(!formData.paisCode || isStep2Disabled) ? 'bg-gray-50 opacity-90' : 'bg-white'}` },
                                        input: { className: 'w-full text-sm p-3 uppercase' },
                                        item: { className: 'uppercase' },
                                        trigger: { className: 'w-10 text-secondary' },
                                        panel: { className: 'text-sm bg-white border border-secondary/20 shadow-lg' }
                                    }}
                                />
                            </div>
                            <div className="w-full">
                                <Label>Localidad / Ciudad</Label>
                                <Dropdown
                                    value={formData.localidad} // Guardamos el NOMBRE (value es name en el map de cities)
                                    options={cities}
                                    onChange={(e) => handleLocationChange('localidad', e.value)}
                                    optionLabel="label"
                                    placeholder="Seleccione una localidad"
                                    filter
                                    className="w-full"
                                    disabled={!formData.provinciaCode || isStep2Disabled}
                                    emptyMessage="Seleccione una provincia primero"
                                    pt={{
                                        root: { className: `w-full border border-secondary/20 rounded-lg hover:border-primary focus:border-primary h-[42px] flex items-center uppercase ${(!formData.provinciaCode || isStep2Disabled) ? 'bg-gray-50 opacity-90' : 'bg-white'}` },
                                        input: { className: 'w-full text-sm p-3 uppercase' },
                                        item: { className: 'uppercase' },
                                        trigger: { className: 'w-10 text-secondary' },
                                        panel: { className: 'text-sm bg-white border border-secondary/20 shadow-lg' }
                                    }}
                                />
                            </div>

                            <Input
                                label="Código Postal"
                                name="codigoPostal"
                                value={formData.codigoPostal}
                                onChange={handleChange}
                                placeholder="C.P."
                                disabled={isStep2Disabled}
                            />

                            <Input
                                label="Domicilio Fiscal"
                                name="direccionFiscal"
                                icon="pi-map-marker"
                                value={formData.direccionFiscal}
                                onChange={handleChange}
                                placeholder="Calle, altura, piso..."
                                disabled={isStep2Disabled}
                                className="md:col-span-2"
                            />

                            <Input
                                label="Domicilio Real / Operativo"
                                name="direccionReal"
                                icon="pi-map-marker"
                                value={formData.direccionReal}
                                onChange={handleChange}
                                placeholder="Si difiere del fiscal"
                                disabled={isStep2Disabled}
                                className="md:col-span-3"
                            />
                        </div>
                    </div>
                );
            case 3:
                const isStep3Editing = !partialEdit || (partialEdit && isEditingStep);
                return (
                    <div className="p-0 md:p-8">
                        <StepHeader title="Contactos" subtitle="Personas autorizadas para gestiones." />

                        {/* 1. Formulario de Alta (Solo si está en modo edición) */}
                        {isStep3Editing && (
                            <div className="bg-white border-2 border-dashed border-secondary/20 rounded-xl p-5 mb-8 animate-fade-in shadow-sm max-w-5xl mx-auto">
                                <div className="mb-4">
                                    <h4 className="text-md font-bold text-secondary-dark flex items-center gap-2">
                                        <i className="pi pi-user-plus text-success"></i>
                                        Datos de Contacto
                                    </h4>
                                    <p className="text-secondary text-[10px] mt-0.5">Información de representante.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    <Input
                                        size="sm"
                                        label="Nombres y Apellidos"
                                        value={newContact.nombre}
                                        onChange={(e) => setNewContact({ ...newContact, nombre: e.target.value })}
                                        placeholder="Juan Pérez"
                                    />
                                    <Input
                                        size="sm"
                                        label="DNI"
                                        value={newContact.dni}
                                        onChange={(e) => setNewContact({ ...newContact, dni: e.target.value })}
                                        placeholder="20.123.456"
                                    />
                                    <Input
                                        size="sm"
                                        label="Teléfono"
                                        value={newContact.movil}
                                        onChange={(e) => setNewContact({ ...newContact, movil: e.target.value })}
                                        placeholder="+54 9 11 1234 5678"
                                    />
                                    <Input
                                        size="sm"
                                        label="Correo electrónico"
                                        value={newContact.email}
                                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                        placeholder="contacto@empresa.com"
                                    />
                                    <div className="w-full">
                                        <Select
                                            size="sm"
                                            label="Tipo de contacto"
                                            options={tiposContacto}
                                            value={newContact.tipo}
                                            onChange={(e) => setNewContact({ ...newContact, tipo: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="mt-5 flex justify-end">
                                    <button
                                        onClick={handleAddContact}
                                        className="bg-[#65a30d] hover:bg-[#4d7c0f] text-white px-5 py-2 rounded-lg font-bold shadow-md shadow-success/10 transition-all flex items-center gap-2 transform active:scale-95 text-xs"
                                    >
                                        <i className="pi pi-plus"></i> Agregar Nuevo
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 2. Lista de Contactos (Cards) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {formData.contactos.map((contacto, index) => (
                                <div key={contacto.id || index} className="bg-white border border-secondary/20 border-l-4 border-l-primary rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all relative group animate-fade-in">
                                    {isStep3Editing && (
                                        <button
                                            onClick={() => handleRemoveContact(contacto.id)}
                                            className="absolute top-4 right-4 text-secondary/30 hover:text-red-500 transition-colors bg-white rounded-full p-1"
                                            title="Eliminar contacto"
                                        >
                                            <i className="pi pi-times-circle text-lg"></i>
                                        </button>
                                    )}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-sm shadow-sm ring-2 ring-offset-2 ring-primary/10 shrink-0">
                                            {contacto.nombre ? contacto.nombre.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h5 className="font-bold text-secondary-dark text-base truncate" title={contacto.nombre}>{contacto.nombre || 'Sin nombre'}</h5>
                                            <span className="text-[9px] text-primary font-bold uppercase tracking-wider bg-primary/5 px-2 py-0.5 rounded border border-primary/10 inline-block">
                                                {contacto.tipo || 'General'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 text-xs font-medium text-gray-700 border-t border-secondary/10 pt-3">
                                        {contacto.email && (
                                            <div className="flex items-center gap-2">
                                                <i className="pi pi-envelope text-primary/80 text-[11px]"></i>
                                                <span className="truncate">{contacto.email}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between gap-2">
                                            {(contacto.movil || contacto.telefono) && (
                                                <div className="flex items-center gap-2">
                                                    <i className="pi pi-whatsapp text-primary/80 text-[11px]"></i>
                                                    <span>{contacto.movil || contacto.telefono}</span>
                                                </div>
                                            )}
                                            {contacto.dni && (
                                                <div className="flex items-center gap-2">
                                                    <i className="pi pi-id-card text-primary/80 text-[11px]"></i>
                                                    <span>{contacto.dni}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {formData.contactos.length === 0 && !isStep3Editing && (
                                <div className="col-span-full text-center py-16 border-2 border-dashed border-secondary/20 rounded-xl text-secondary bg-secondary-light/20">
                                    <i className="pi pi-users text-4xl mb-3 block opacity-20"></i>
                                    <p className="font-medium">No hay contactos registrados.</p>
                                    <p className="text-xs opacity-60">Haga clic en Modificar para agregar.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 4:
                // Wizard Mode: Config Enabled, Uploads Disabled
                // Partial Edit: Config Disabled, Uploads Enabled (if editing)
                const isStep4ConfigReadOnly = !isWizardMode;
                const isStep4ActionsEnabled = partialEdit && isEditingStep;

                return (
                    <div className="p-8 animate-fade-in relative">
                        <StepHeader title="Configuración de Documentación" subtitle={isWizardMode ? "Defina qué documentos se solicitarán al proveedor." : "Estado de la documentación."} />

                        {/* Indicar de dónde viene la configuración por defecto */}
                        {isWizardMode && (
                            <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/20 flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="flex flex-wrap gap-3 items-center">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-white px-2 py-1 rounded shadow-sm border border-primary/10">Basado en:</span>
                                    <div className="flex gap-2">
                                        <span className="text-xs font-bold text-secondary-dark px-2.5 py-1 bg-white rounded-lg border border-secondary/20">{formData.tipoPersona}</span>
                                        <span className="text-xs font-bold text-secondary-dark px-2.5 py-1 bg-white rounded-lg border border-secondary/20">{formData.clasificacionAFIP}</span>
                                        <span className="text-xs font-bold text-secondary-dark px-2.5 py-1 bg-white rounded-lg border border-secondary/20">{formData.servicio}</span>
                                    </div>
                                </div>
                                {isCustomConfig && (
                                    <button onClick={resetDocConfig} className="text-xs font-bold text-primary hover:underline flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-primary/20">
                                        <i className="pi pi-refresh"></i> Restablecer sugeridos
                                    </button>
                                )}
                            </div>
                        )}

                        {!isStep4ConfigReadOnly && !editDocMode && isCustomConfig && (
                            <div className="mb-4 bg-warning-light/50 border border-warning/30 rounded-lg p-3 flex items-center justify-between text-xs">
                                <span className="text-warning-hover font-medium flex items-center gap-2">
                                    <i className="pi pi-exclamation-triangle"></i> Configuración personalizada
                                </span>
                                <button onClick={resetDocConfig} className="text-secondary-dark hover:underline">Restablecer sugeridos</button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Card para AGREGAR NUEVO (Solo en modo edición de CONFIGURACION) */}
                            {!isStep4ConfigReadOnly && editDocMode && (
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
                                const docData = formData.documentacion ? formData.documentacion.find(d => d.tipo === doc.id) : null;
                                const status = docData ? docData.estado : 'PENDIENTE';
                                const getStatusColor = (s) => {
                                    if (!isStep4ActionsEnabled && !docData?.archivo) return 'border-secondary/20 bg-white';
                                    switch (s) {
                                        case 'VIGENTE': return 'border-success/50 bg-success-light/10';
                                        case 'PRESENTADO': return 'border-success/50 bg-success-light/10';
                                        case 'VENCIDO': return 'border-danger/50 bg-danger-light/10';
                                        case 'PENDIENTE': return 'border-warning/50 bg-warning-light/10';
                                        case 'EN REVISIÓN': return 'border-info/50 bg-info-light/10';
                                        default: return 'border-secondary/20 bg-secondary-light/10';
                                    }
                                };


                                const handleFileUpload = (e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const fileUrl = URL.createObjectURL(file);
                                        setDirtySteps(prev => new Set(prev).add(4));

                                        setFormData(prev => {
                                            const currentDocs = prev.documentacion || [];
                                            const docIndex = currentDocs.findIndex(d => d.tipo === doc.id);

                                            let newDocs;
                                            if (docIndex >= 0) {
                                                // Update existing - PRESERVE STATUS until save
                                                newDocs = [...currentDocs];
                                                newDocs[docIndex] = {
                                                    ...newDocs[docIndex],
                                                    archivo: file.name,
                                                    fileUrl: fileUrl,
                                                    // Mark as modified so we know to update status on save
                                                    modified: true,
                                                    fechaVencimiento: newDocs[docIndex].fechaVencimiento || null
                                                };
                                            } else {
                                                // Add new - Status PENDING until save
                                                newDocs = [...currentDocs, {
                                                    id: Date.now(),
                                                    tipo: doc.id,
                                                    estado: 'PENDIENTE',
                                                    archivo: file.name,
                                                    fileUrl: fileUrl,
                                                    modified: true, // New docs are modified by definition
                                                    fechaVencimiento: null
                                                }];
                                            }
                                            return { ...prev, documentacion: newDocs };
                                        });
                                    }
                                };

                                const handleRemoveFile = (docId) => {
                                    setDirtySteps(prev => new Set(prev).add(4));
                                    setFormData(prev => {
                                        const currentDocs = prev.documentacion || [];
                                        const docIndex = currentDocs.findIndex(d => d.tipo === docId);

                                        if (docIndex >= 0) {
                                            const newDocs = [...currentDocs];
                                            newDocs[docIndex] = {
                                                ...newDocs[docIndex],
                                                archivo: null,
                                                fileUrl: null,
                                                modified: true
                                            };
                                            return { ...prev, documentacion: newDocs };
                                        }
                                        return prev;
                                    });
                                };

                                const handleDateChange = (docId, date) => {
                                    if (date) {
                                        setDirtySteps(prev => new Set(prev).add(4));
                                        setFormData(prev => {
                                            const currentDocs = prev.documentacion || [];
                                            const docIndex = currentDocs.findIndex(d => d.tipo === docId);
                                            let newDocs;

                                            // Format YYYY-MM-DD for consistency
                                            const year = date.getFullYear();
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const day = String(date.getDate()).padStart(2, '0');
                                            const formattedDate = `${year}-${month}-${day}`;

                                            if (docIndex >= 0) {
                                                newDocs = [...currentDocs];
                                                newDocs[docIndex] = { ...newDocs[docIndex], fechaVencimiento: formattedDate, modified: true };
                                            } else {
                                                newDocs = [...currentDocs, {
                                                    id: Date.now(),
                                                    tipo: docId,
                                                    estado: 'PENDIENTE',
                                                    archivo: null,
                                                    modified: true,
                                                    fechaVencimiento: formattedDate
                                                }];
                                            }
                                            return { ...prev, documentacion: newDocs };
                                        });
                                    }
                                };

                                return (
                                    <div key={doc.id} className={`border rounded-lg p-4 flex flex-col justify-between transition-all hover:shadow-md ${getStatusColor(status)} group relative h-full min-h-[150px]`}>

                                        {/* Botón Eliminar (Solo edición config) */}
                                        {!isStep4ConfigReadOnly && editDocMode && (
                                            <button
                                                onClick={() => toggleDocRequirement(doc.id)}
                                                className="absolute -top-2 -right-2 bg-white text-red-500 shadow-md rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-50 hover:scale-110 transition-all z-10"
                                            >
                                                <i className="pi pi-times text-[10px] font-bold"></i>
                                            </button>
                                        )}

                                        <div className="flex-1 flex flex-col h-full">
                                            {/* Header: Icon + Title */}
                                            <div className="flex items-start gap-4 mb-5">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${isWizardMode ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 text-primary' : (status === 'VIGENTE' || status === 'PRESENTADO' ? 'bg-success/10 border-success/20 text-success' : 'bg-warning/10 border-warning/20 text-warning')}`}>
                                                    <i className={`pi ${doc.id.includes('AFIP') ? 'pi-verified' : doc.id.includes('SEGURO') ? 'pi-shield' : 'pi-file-pdf'} text-xl group-hover:scale-110 transition-transform`}></i>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-secondary-dark text-[13px] leading-tight break-words pr-2 line-clamp-2" title={doc.label}>{doc.label}</h4>
                                                    </div>
                                                    {!isWizardMode && (
                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border inline-block ${(status === 'VIGENTE' || status === 'PRESENTADO') ? 'bg-success/10 text-success border-success/20' :
                                                            status === 'VENCIDO' ? 'bg-danger/10 text-danger border-danger/20' :
                                                                'bg-warning/10 text-warning border-warning/20'
                                                            }`}>
                                                            {status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Body: Configuration (Wizard Mode) */}
                                            {isWizardMode ? (
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
                                                                <option value="Mensual">Mensual</option>
                                                                <option value="Trimestral">Trimestral</option>
                                                                <option value="Semestral">Semestral</option>
                                                                <option value="Anual">Anual</option>
                                                                <option value="Única vez">Única vez</option>
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
                                                <div className="space-y-3 mt-auto">
                                                    <div className="flex items-center gap-2.5 bg-secondary-light/30 p-2 rounded-lg border border-secondary/5">
                                                        <i className="pi pi-clock text-primary text-[11px]"></i>
                                                        <span className="text-xs font-medium text-secondary-dark">{doc.frecuencia} — {doc.obligatoriedad}</span>
                                                    </div>

                                                    {(docData?.fechaVencimiento || isStep4ActionsEnabled) && (
                                                        <div className="flex flex-col w-full">
                                                            <div className="flex items-center gap-2">
                                                                <i className="pi pi-calendar text-secondary/50 text-base"></i>
                                                                {isStep4ActionsEnabled ? (
                                                                    <Calendar
                                                                        value={docData?.fechaVencimiento ? new Date(docData.fechaVencimiento) : null}
                                                                        onChange={(e) => handleDateChange(doc.id, e.value)}
                                                                        placeholder="Vencimiento"
                                                                        disabled={!docData?.archivo}
                                                                        minDate={new Date()}
                                                                        className={`compact-calendar-input w-full border border-secondary/50 rounded-lg ${!docData?.archivo ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                                                                        panelClassName="compact-calendar-panel"
                                                                        dateFormat="dd/mm/yy"
                                                                    />
                                                                ) : (
                                                                    <span className="text-xs font-semibold text-secondary">Vence: {docData.fechaVencimiento || '-'}</span>
                                                                )}
                                                            </div>
                                                            {isStep4ActionsEnabled && !docData?.archivo && (
                                                                <span className="text-[10px] text-warning font-medium ml-6 mt-1.5 animate-pulse">
                                                                    * Requiere archivo para editar fecha
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* File Control (Partial Edit Only) */}
                                                    {!isWizardMode && (
                                                        <div className="pt-3 border-t border-secondary/10">
                                                            {isStep4ActionsEnabled ? (
                                                                <div className="w-full">
                                                                    {docData?.archivo ? (
                                                                        <div className="group/file flex items-center justify-between p-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all duration-300">
                                                                            <div
                                                                                onClick={() => docData.fileUrl ? window.open(docData.fileUrl, '_blank') : alert(`Visualización: ${docData.archivo}`)}
                                                                                className="flex items-center gap-3 cursor-pointer overflow-hidden"
                                                                            >
                                                                                <div className="bg-white p-2 rounded-full text-primary shadow-sm group-hover/file:scale-110 transition-transform">
                                                                                    <i className="pi pi-file-pdf text-sm"></i>
                                                                                </div>
                                                                                <span className="text-[11px] font-bold text-primary-dark truncate max-w-[120px]">
                                                                                    {docData.archivo}
                                                                                </span>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => handleRemoveFile(doc.id)}
                                                                                className="text-secondary/40 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                                                                            >
                                                                                <i className="pi pi-trash text-sm"></i>
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="relative group/upload">
                                                                            <input
                                                                                type="file"
                                                                                id={`file-${doc.id}`}
                                                                                onChange={handleFileUpload}
                                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                                            />
                                                                            <div className="flex items-center justify-center gap-2 w-full p-2.5 border border-dashed border-secondary/30 rounded-xl text-secondary group-hover/upload:text-primary group-hover/upload:border-primary/50 group-hover/upload:bg-primary/5 transition-all">
                                                                                <i className="pi pi-upload text-sm"></i>
                                                                                <span className="text-xs font-bold uppercase tracking-wider">Subir</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                docData?.archivo ? (
                                                                    <button
                                                                        onClick={() => docData.fileUrl ? window.open(docData.fileUrl, '_blank') : alert(`Visualización: ${docData.archivo}`)}
                                                                        className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 text-xs font-bold transition-all border border-primary/10"
                                                                    >
                                                                        <i className="pi pi-eye"></i> Ver Documento
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-full p-2.5 text-center text-[10px] font-bold text-secondary/40 uppercase tracking-widest bg-gray-50/50 rounded-xl border border-secondary/5">
                                                                        No presentado
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* --- MODAL AGREGAR DOCUMENTO --- */}
                        {
                            showDocModal && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                                        <div className="bg-secondary-light px-6 py-4 border-b border-secondary/10 flex justify-between items-center">
                                            <h3 className="font-bold text-secondary-dark">Agregar Documento</h3>
                                            <button onClick={() => setShowDocModal(false)} className="text-secondary hover:text-red-500 transition-colors">
                                                <i className="pi pi-times"></i>
                                            </button>
                                        </div>
                                        <div className="p-2 max-h-[60vh] overflow-y-auto">
                                            {ALL_DOCS_RULES.filter(rule => !requiredDocs.find(r => r.id === rule.id)).map(rule => (
                                                <button
                                                    key={rule.id}
                                                    onClick={() => { toggleDocRequirement(rule.id); setShowDocModal(false); }}
                                                    className="w-full text-left p-3 hover:bg-primary/5 rounded-lg flex items-center justify-between group transition-colors border-b border-secondary/5 last:border-0"
                                                >
                                                    <div>
                                                        <p className="font-bold text-sm text-secondary-dark group-hover:text-primary">{rule.label}</p>
                                                        <p className="text-[10px] text-secondary">{rule.frecuencia} — {rule.obligatoriedad}</p>
                                                    </div>
                                                    <i className="pi pi-plus text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 p-1.5 rounded-full"></i>
                                                </button>
                                            ))}
                                            {ALL_DOCS_RULES.filter(rule => !requiredDocs.find(r => r.id === rule.id)).length === 0 && (
                                                <p className="text-center text-sm text-secondary py-8 italic">No hay más documentos disponibles.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="animate-fade-in w-full">

            {/* --- 1. ENCABEZADO UNIFICADO --- */}
            {(title || !readOnly) && (
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    {headerInfo ? (
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-extrabold text-secondary-dark tracking-tight">{headerInfo.name}</h1>
                                {headerInfo.status && <StatusBadge status={headerInfo.status} />}
                                {headerInfo.docStatus && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-secondary/50 text-xs font-bold uppercase hidden md:inline-block">Documentación:</span>
                                        <StatusBadge status={headerInfo.docStatus} />
                                    </div>
                                )}
                            </div>
                            <p className="text-secondary mt-1 text-sm">CUIT: {headerInfo.cuit} — {initialData?.servicio}</p>
                        </div>
                    ) : (
                        <div>
                            {title && <h1 className="text-2xl md:text-3xl font-extrabold text-secondary-dark tracking-tight">{title}</h1>}
                            {subtitle && <p className="text-secondary mt-1 text-xs">{subtitle}</p>}
                        </div>
                    )}

                    {/* Botón Global de Guardar (Solo en partialEdit) */}
                    {/* Botón Global de Guardar - ELIMINADO PARA SIMPLIFICAR UI (Guardado por pasos) */}
                </div>
            )}

            {/* --- 2. STEPPER (Collapsible Mobile / Horizontal Desktop) --- */}

            {/* Lógica de Validación para el Header Móvil */}
            {(() => {
                let status = 'neutral';
                let msg = '';

                if (currentStep === 1) {
                    if (!formData.razonSocial || !formData.cuit || !formData.email) { status = 'invalid'; msg = 'Datos faltantes'; }
                } else if (currentStep === 2) {
                    if (!formData.pais || !formData.provincia || !formData.localidad || !formData.codigoPostal || !formData.direccionFiscal) { status = 'invalid'; msg = 'Ubicación incompleta'; }
                } else if (currentStep === 3) {
                    if (formData.contactos.length === 0) { status = 'invalid'; msg = 'Sin contactos'; }
                } else if (currentStep === 4) {
                    const missingDocs = requiredDocs.some(req => {
                        const doc = formData.documentacion?.find(d => d.tipo === req.id);
                        return !doc || !doc.archivo || doc.estado === 'VENCIDO';
                    });
                    if (missingDocs) { status = 'invalid'; msg = 'Doc. pendiente'; }
                }

                const isDirtyState = dirtySteps.has(currentStep);
                if (isDirtyState && status !== 'invalid') status = 'dirty';

                const headerBg = status === 'invalid' ? 'bg-red-50' : status === 'dirty' ? 'bg-orange-50' : 'bg-white';
                const circleBg = status === 'invalid' ? 'bg-danger' : status === 'dirty' ? 'bg-warning' : 'bg-primary';
                const textColor = status === 'invalid' ? 'text-danger' : status === 'dirty' ? 'text-warning' : 'text-secondary-dark';

                // Common Badge Styles
                const badgeBase = "px-1.5 py-0.5 rounded border text-[8px] font-extrabold tracking-wider whitespace-nowrap";
                const badgeColor = status === 'invalid' ? 'bg-white border-danger/20 text-danger' : 'bg-white border-warning/20 text-warning';

                return (
                    <div
                        onClick={() => setIsStepperOpen(!isStepperOpen)}
                        className={`md:hidden w-full border border-secondary/20 p-4 shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all select-none z-20 relative
                            ${isStepperOpen ? 'rounded-t-xl border-b-0' : 'rounded-xl mb-4'} 
                            ${headerBg}
                        `}
                    >
                        <div className="flex items-center gap-4 w-full overflow-hidden">
                            <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm shadow-md transition-colors shrink-0 ${circleBg}`}>
                                {currentStep}
                            </div>
                            <div className="flex flex-col w-full overflow-hidden justify-center">
                                <span className="text-[10px] uppercase font-bold text-secondary tracking-wider mb-0.5 leading-tight">
                                    PASO {currentStep} DE {steps.length}
                                </span>
                                <span className={`text-sm font-bold truncate mb-1.5 leading-tight ${textColor}`}>
                                    {steps[currentStep - 1]}
                                </span>
                                <div className="flex flex-wrap items-center gap-2">
                                    {msg && (
                                        <span className={`${badgeBase} ${badgeColor}`}>
                                            {msg}
                                        </span>
                                    )}
                                    {isDirtyState && status !== 'invalid' && (
                                        <span className={`${badgeBase} ${badgeColor}`}>
                                            SIN GUARDAR
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={`w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-secondary transition-transform duration-300 shrink-0 ml-2 ${isStepperOpen ? 'rotate-180' : ''}`}>
                            <i className="pi pi-chevron-down text-xs"></i>
                        </div>
                    </div>
                );
            })()}

            {/* Lista de Pasos (Oculta en móvil si está cerrada) */}
            <ol className={`${isStepperOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-start md:items-center w-full mb-0 md:mb-8 text-sm font-medium text-center text-secondary bg-white p-6 rounded-b-xl md:rounded-xl border border-secondary/20 border-t-0 md:border-t shadow-sm relative animate-fade-in gap-6 md:gap-0`}>

                {/* Vertical Connector Line (Mobile Only) */}
                <div className="absolute left-[38px] top-10 bottom-10 w-0.5 bg-gray-200 z-0 md:hidden"></div>

                {steps.map((step, index) => {
                    const stepNum = index + 1;
                    const isActive = stepNum === currentStep;
                    const isCompleted = stepNum < currentStep;
                    const isDirty = dirtySteps.has(stepNum);

                    // VALIDATION LOGIC
                    let isInvalid = false;
                    let missingMsg = '';

                    if (stepNum === 1) {
                        if (!formData.razonSocial || !formData.cuit || !formData.email) {
                            isInvalid = true;
                            missingMsg = 'Datos faltantes';
                        }
                    } else if (stepNum === 2 && !isWizardMode) {
                        if (!formData.pais || !formData.provincia || !formData.localidad || !formData.codigoPostal || !formData.direccionFiscal) {
                            isInvalid = true;
                            missingMsg = 'Ubicación incompleta';
                        }
                    } else if (stepNum === 3 && !isWizardMode) {
                        if (formData.contactos.length === 0) {
                            isInvalid = true;
                            missingMsg = 'Sin contactos';
                        }
                    } else if (stepNum === 4 && !isWizardMode) {
                        const missingDocs = requiredDocs.some(req => {
                            const doc = formData.documentacion?.find(d => d.tipo === req.id);
                            return !doc || !doc.archivo || doc.estado === 'VENCIDO';
                        });
                        if (missingDocs) {
                            isInvalid = true;
                            missingMsg = 'Doc. pendiente';
                        }
                    }

                    // Unified Badge Style based on priority (Invalid > Dirty)
                    const itemBadgeStyle = isInvalid
                        ? 'text-danger bg-white border-danger/30 shadow-sm'
                        : 'text-warning bg-white border-warning/30 shadow-sm';

                    return (
                        <li
                            key={index}
                            onClick={() => {
                                // Validation: Cannot enter Step 4 (Docs) if Step 1 (Fiscal) is incomplete
                                const isStep1Invalid = !formData.razonSocial || !formData.cuit || !formData.email;
                                if (isStep1Invalid && stepNum === 4) {
                                    setValidationError("Debe completar los datos del proveedor (Paso 1) antes de configurar la documentación.");
                                    setTimeout(() => setValidationError(null), 3000); // Auto-dismiss after 3s
                                    setCurrentStep(1); // Redirect to Step 1
                                    return;
                                }
                                setCurrentStep(stepNum);
                                setValidationError(null); // Clear error on valid change
                            }}
                            className={`flex w-full md:w-auto md:flex-1 flex-row md:flex-col items-center justify-start md:justify-center cursor-pointer select-none transition-all z-10 bg-white md:bg-transparent relative py-1 md:py-0
                                ${isActive
                                    ? (isInvalid ? 'text-danger' : isDirty ? 'text-warning' : 'text-secondary-dark')
                                    : (isInvalid ? 'text-danger hover:text-danger-dark' : isDirty ? 'text-warning hover:text-warning-hover' : 'hover:text-secondary-dark')
                                }
                            `}
                        >
                            {/* Desktop Connector Line (Absolute Div) */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-[15px] left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-[2px] bg-gray-300 z-0"></div>
                            )}

                            <span className="flex items-center md:flex-col w-full md:w-auto relative group gap-4 md:gap-0">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-bold text-xs shrink-0 z-10 md:mb-2 relative
                                    ${isActive
                                        ? `scale-110 shadow-md ring-2 ring-offset-1 ring-transparent text-white ${isInvalid ? 'bg-danger border-danger' : isDirty ? 'bg-warning border-warning' : 'bg-secondary-dark border-secondary-dark'}`
                                        : `${isInvalid ? 'border-danger bg-white text-danger' :
                                            isDirty ? 'border-warning bg-white text-warning' :
                                                isCompleted ? 'border-secondary-dark bg-white text-secondary-dark' :
                                                    'border-secondary/30 text-secondary bg-white'}`
                                    } 
                                `}>
                                    {!isActive && isCompleted && !isInvalid && !isDirty ? <i className="pi pi-check text-xs font-bold text-secondary-dark"></i> : stepNum}
                                </span>

                                {/* Mobile View: Title Left, Badges Right */}
                                <div className="flex flex-1 flex-row items-center justify-between md:hidden w-full">
                                    <span className={`font-semibold text-left text-sm mr-2 flex-1
                                        ${!isActive && !isInvalid && !isDirty && isCompleted ? 'text-secondary-dark' : ''}
                                        ${!isActive && !isInvalid && !isDirty && !isCompleted ? 'text-secondary' : ''}
                                    `}>
                                        {step}
                                    </span>
                                    {/* Evitar redundancia: No mostrar badges en el paso activo (ya están en el header) */}
                                    {!isActive && (
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            {isInvalid && <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider border whitespace-nowrap ${itemBadgeStyle}`}>{missingMsg}</span>}
                                            {isDirty && !isInvalid && <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold tracking-wider border whitespace-nowrap ${itemBadgeStyle}`}>SIN GUARDAR</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Desktop View: Center + Absolute Badges */}
                                <div className="hidden md:flex flex-1 items-center justify-center md:flex-col md:w-auto">
                                    <span className={`font-semibold text-center ${isActive ? 'text-base' : 'text-sm'} 
                                        ${!isActive && !isInvalid && !isDirty && isCompleted ? 'text-secondary-dark' : ''}
                                        ${!isActive && !isInvalid && !isDirty && !isCompleted ? 'text-secondary' : ''}
                                    `}>
                                        {step}
                                    </span>
                                </div>


                                {/* Desktop Badges (Square - Mixed Rotation - Balanced Shift) */}
                                {isInvalid && (
                                    <span className="hidden md:block absolute -top-3 left-1/2 ml-2 text-[6px] font-black px-1 py-0 rounded-md uppercase tracking-wider border text-danger bg-white border-danger/40 shadow-sm transform -translate-x-1/2 rotate-[15deg] animate-fade-in z-20 whitespace-nowrap">
                                        {missingMsg}
                                    </span>
                                )}
                                {isDirty && !isInvalid && (
                                    <span className="hidden md:block absolute -top-3 left-1/2 ml-2 text-[6px] font-black px-1 py-0 rounded-md uppercase tracking-wider border text-warning bg-white border-warning/40 shadow-sm transform -translate-x-1/2 rotate-[17deg] z-20 whitespace-nowrap">
                                        Sin Guardar
                                    </span>
                                )}
                            </span>
                        </li>
                    );
                })}
            </ol>

            {/* Validation Inline Alert */}
            {validationError && (
                <div className="mb-6 mx-1 md:mx-0 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 animate-fade-in shadow-sm">
                    <i className="pi pi-exclamation-circle text-xl shrink-0"></i>
                    <span className="text-sm font-semibold">{validationError}</span>
                </div>
            )}

            {/* --- 3. FORMULARIO CONTENIDO --- */}
            <div className="bg-white border-0 md:border md:border-secondary/20 rounded-xl shadow-none md:shadow-sm overflow-hidden">
                {renderStepContent()}

                <div className="bg-secondary-light p-4 md:px-8 md:py-4 border-t border-secondary/20 flex flex-col-reverse gap-3 md:flex-row md:justify-between md:items-center">
                    <div className="w-full md:w-auto">
                        {currentStep === 1 ? (
                            onBack && !readOnly && (
                                <button
                                    onClick={onBack}
                                    className="text-secondary hover:text-secondary-dark font-medium rounded-lg text-sm px-5 py-2.5 transition-all flex items-center justify-center gap-2 hover:bg-black/5 w-full md:w-auto"
                                >
                                    <i className="pi pi-arrow-left"></i> Cancelar
                                </button>
                            )
                        ) : (
                            <button
                                onClick={prevStep}
                                className="text-secondary hover:text-secondary-dark font-medium rounded-lg text-sm px-5 py-2.5 transition-all flex items-center justify-center gap-2 hover:bg-black/5 w-full md:w-auto"
                            >
                                <i className="pi pi-arrow-left"></i> Anterior
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        {currentStep < steps.length && (
                            <button
                                onClick={nextStep}
                                className="text-white bg-primary hover:bg-primary-hover font-bold rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center gap-2 shadow-md transition-all w-full md:w-auto"
                            >
                                Siguiente <i className="pi pi-arrow-right"></i>
                            </button>
                        )}
                        {currentStep === steps.length && !readOnly && !partialEdit && (
                            <button
                                onClick={() => onSubmit && onSubmit(formData)}
                                className="text-white bg-green-600 hover:bg-green-700 font-bold rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center gap-2 shadow-md transition-all w-full md:w-auto animate-fade-in"
                            >
                                <i className="pi pi-check"></i> Finalizar y Guardar
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {/* MODAL DE CONFIGURACIÓN DE SALIDA */}
            <UnsavedChangesModal
                visible={showLeaveModal}
                onConfirm={handleLeaveConfirm}
                onCancel={handleLeaveCancel}
            />
        </div>
    );
};

export default SupplierForm;
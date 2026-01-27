import React, { useState, useEffect } from 'react';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Toggle from '../../components/ui/Toggle';
import SectionTitle from '../../components/ui/SectionTitle';
import Label from '../../components/ui/Label';
import { Country, State, City } from 'country-state-city';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';

const ProviderForm = ({ initialData, readOnly = false, partialEdit = false, onSubmit, onBack, title, subtitle }) => {
    // State único para todo el formulario
    const [formData, setFormData] = useState({
        // Paso 1: General
        razonSocial: '',
        cuit: '',
        nombreFantasia: '',
        tipoPersona: 'JURIDICA',
        clasificacionAFIP: 'Seleccione...',
        servicio: 'Seleccione...',
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

    // Reset edit mode when changing steps
    useEffect(() => {
        setIsEditingStep(false);
    }, [currentStep]);

    const handleStartEdit = () => setIsEditingStep(true);
    const handleStopEdit = () => {
        // Aquí se podría guardar, por ahora solo cerramos edición
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
    const servicios = ['Seleccione...', 'Mantenimiento', 'Limpieza', 'Seguridad', 'Logística', 'VIGILANCIA'];
    const clasificacionesAFIP = ['Seleccione...', 'Responsable Inscripto', 'Monotributista', 'Exento', 'Consumidor Final'];
    const tiposPersona = ['JURIDICA', 'FISICA'];
    const tiposContacto = [
        'Seleccione',
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
        tipo: 'Seleccione'
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
        if (!newContact.nombre || newContact.tipo === 'Seleccione') {
            alert("Complete nombre y tipo de contacto");
            return;
        }
        setFormData(prev => ({
            ...prev,
            contactos: [...prev.contactos, { ...newContact, id: Date.now() }]
        }));
        setNewContact({ nombre: '', dni: '', movil: '', email: '', telefono: '', tipo: 'Seleccione' });
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

    const handleSubmit = () => {
        onSubmit(formData);
        setDirtySteps(new Set()); // Limpiar dirty state al guardar
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
    const [editDocMode, setEditDocMode] = useState(false);
    const [showDocModal, setShowDocModal] = useState(false);

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

    const resetDocConfig = () => {
        setIsCustomConfig(false);
        const defaults = ALL_DOCS_RULES.filter(rule => rule.defaultFor(formData));
        setRequiredDocs(defaults);
    };

    const nextStep = () => setCurrentStep(prev => prev + 1);
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
                    <div className="p-8">
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
                    <div className="p-8">
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
                                        root: { className: 'w-full border border-secondary/20 rounded-lg hover:border-primary focus:border-primary h-[42px] flex items-center bg-white' },
                                        input: { className: 'w-full text-sm p-3' },
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
                                        root: { className: 'w-full border border-secondary/20 rounded-lg hover:border-primary focus:border-primary h-[42px] flex items-center bg-white' },
                                        input: { className: 'w-full text-sm p-3' },
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
                                        root: { className: 'w-full border border-secondary/20 rounded-lg hover:border-primary focus:border-primary h-[42px] flex items-center bg-white' },
                                        input: { className: 'w-full text-sm p-3' },
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
                    <div className="p-8">
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
                                        label="Teléfono Móvil"
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
                                    <Input
                                        size="sm"
                                        label="Teléfono Proveedor"
                                        value={newContact.telefono}
                                        onChange={(e) => setNewContact({ ...newContact, telefono: e.target.value })}
                                        placeholder="011 4123-4567"
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
                                <div key={contacto.id || index} className="bg-white border border-secondary/20 rounded-xl p-6 shadow-sm hover:shadow-md transition-all relative group animate-fade-in">
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
                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shadow-inner shrink-0">
                                            {contacto.nombre ? contacto.nombre.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h5 className="font-bold text-secondary-dark text-sm truncate" title={contacto.nombre}>{contacto.nombre || 'Sin nombre'}</h5>
                                            <span className="text-[9px] text-primary font-bold uppercase tracking-wider bg-primary/5 px-2 py-0.5 rounded border border-primary/10 inline-block">
                                                {contacto.tipo || 'General'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-secondary border-t border-secondary/5 pt-3">
                                        <div className="flex items-center gap-1.5 min-w-fit">
                                            <i className="pi pi-envelope text-[10px] opacity-70"></i>
                                            <span className="truncate max-w-[150px]">{contacto.email || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 min-w-fit">
                                            <i className="pi pi-whatsapp text-[10px] opacity-70"></i>
                                            <span>{contacto.movil || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 min-w-fit">
                                            <i className="pi pi-id-card text-[10px] opacity-70"></i>
                                            <span>DNI: {contacto.dni || '-'}</span>
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
                // En step 4, 'partialEdit' permite ver y subir archivos.
                // Modificar: Habilita los controles de subida y fecha.
                const isStep4ConfigReadOnly = readOnly || partialEdit;
                const isStep4ActionsEnabled = !partialEdit || (partialEdit && isEditingStep); // Si partialEdit, necesito 'Modificar' para activar inputs

                return (
                    <div className="p-8 animate-fade-in relative">
                        <StepHeader title="Documentación Requerida" subtitle={isStep4ConfigReadOnly ? "Estado de la documentación." : "Configuración de requisitos."} />

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
                                        default: return 'border-secondary/20 bg-secondary-light/10';
                                    }
                                };

                                return (
                                    <div key={doc.id} className={`border rounded-lg p-4 flex flex-col justify-between transition-all hover:shadow-md ${getStatusColor(status)} group relative`}>

                                        {/* Botón Eliminar (Solo edición config) */}
                                        {!isStep4ConfigReadOnly && editDocMode && (
                                            <button
                                                onClick={() => toggleDocRequirement(doc.id)}
                                                className="absolute -top-2 -right-2 bg-white text-red-500 shadow-md rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-50 hover:scale-110 transition-all z-10"
                                            >
                                                <i className="pi pi-times text-[10px] font-bold"></i>
                                            </button>
                                        )}

                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-secondary-dark text-sm pr-4">{doc.label}</h4>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status === 'VIGENTE' || status === 'PRESENTADO' ? 'bg-success-light text-success border-success/20' :
                                                    status === 'VENCIDO' ? 'bg-danger-light text-danger border-danger/20' :
                                                        'bg-warning-light text-warning-hover border-warning/20'
                                                    }`}>
                                                    {status}
                                                </span>
                                            </div>

                                            <div className="space-y-3 mb-3">
                                                <div className="flex items-center gap-1.5">
                                                    <i className="pi pi-clock text-primary text-[10px]"></i>
                                                    <span className="text-xs text-secondary">{doc.frecuencia}</span>
                                                </div>

                                                {/* Vencimiento */}
                                                {(docData?.fechaVencimiento || isStep4ActionsEnabled) && (
                                                    <div className="flex items-center gap-2">
                                                        <i className="pi pi-calendar text-secondary/50 text-sm"></i>
                                                        {isStep4ActionsEnabled ? (
                                                            <Calendar
                                                                value={docData?.fechaVencimiento ? new Date(docData.fechaVencimiento) : null}
                                                                onChange={(e) => {/* Handle date change logic */ }}
                                                                placeholder="Vencimiento"
                                                                className="compact-calendar-input"
                                                                panelClassName="compact-calendar-panel"
                                                                dateFormat="dd/mm/yy"
                                                            />
                                                        ) : (
                                                            <span className="text-xs text-secondary">Vence: {docData.fechaVencimiento || '-'}</span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Archivo */}
                                                <div className="pt-2 border-t border-secondary/10">
                                                    {isStep4ActionsEnabled ? (
                                                        <div className="space-y-2">
                                                            <input
                                                                type="file"
                                                                className="block w-full text-xs text-secondary
                                                                file:mr-2 file:py-1 file:px-2
                                                                file:rounded-full file:border-0
                                                                file:text-xs file:font-semibold
                                                                file:bg-primary/10 file:text-primary
                                                                hover:file:bg-primary/20"
                                                            />
                                                            {docData?.archivo && <span className="text-[10px] text-success block"><i className="pi pi-check"></i> {docData.archivo}</span>}
                                                        </div>
                                                    ) : (
                                                        docData?.archivo ? (
                                                            <button className="text-primary hover:text-primary-hover text-xs font-bold flex items-center gap-1 transition-colors">
                                                                <i className="pi pi-eye"></i> Ver Archivo
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-secondary/50 italic flex items-center gap-1">
                                                                <i className="pi pi-times-circle"></i> No presentado
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </div>
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
                    <div>
                        {title && <h1 className="text-2xl md:text-3xl font-extrabold text-secondary-dark tracking-tight">{title}</h1>}
                        {subtitle && <p className="text-secondary mt-1 text-xs">{subtitle}</p>}
                    </div>

                    {/* Botón Global de Guardar (Solo en partialEdit) */}
                    {partialEdit && (
                        <button
                            onClick={handleSubmit}
                            disabled={dirtySteps.size === 0}
                            className={`
                                flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-0.5
                                ${dirtySteps.size > 0
                                    ? 'bg-primary text-white hover:shadow-primary/30'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'}
                            `}
                        >
                            <i className={`pi ${dirtySteps.size > 0 ? 'pi-save' : 'pi-check-circle'}`}></i>
                            {dirtySteps.size > 0 ? 'Guardar Cambios' : 'Todo Guardado'}
                        </button>
                    )}
                </div>
            )}

            {/* --- 2. STEPPER --- */}
            <ol className="flex items-center w-full mb-10 text-sm font-medium text-center text-secondary bg-white p-4 rounded-xl border border-secondary/20 shadow-sm overflow-x-auto">
                {steps.map((step, index) => {
                    const stepNum = index + 1;
                    const isActive = stepNum === currentStep;
                    const isCompleted = stepNum < currentStep;
                    const isDirty = dirtySteps.has(stepNum);

                    return (
                        <li key={index} className={`flex md:w-full items-center ${index < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-secondary/20 after:border-1 after:hidden sm:after:inline-block after:mx-4 xl:after:mx-8" : ""} ${isActive ? 'text-primary font-bold' : ''}`}>
                            <span className="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-secondary/30 whitespace-nowrap">
                                <span className={`mr-2 w-6 h-6 rounded-full flex items-center justify-center border transition-colors 
                                    ${isActive ? 'border-primary bg-primary text-white' :
                                        isDirty ? 'border-warning bg-warning text-white' :
                                            isCompleted ? 'border-success bg-success text-white' :
                                                'border-secondary/30 text-secondary'
                                    } font-bold text-xs`}>
                                    {isActive ? stepNum : (isDirty ? <i className="pi pi-pencil text-[10px]"></i> : (isCompleted ? <i className="pi pi-check text-[10px]"></i> : stepNum))}
                                </span>
                                {step}
                                {isDirty && <span className="ml-2 text-[10px] text-warning font-bold bg-warning/10 px-1.5 rounded uppercase tracking-wider">Sin Guardar</span>}
                            </span>
                        </li>
                    );
                })}
            </ol>

            {/* --- 3. FORMULARIO CONTENIDO --- */}
            <div className="bg-white border border-secondary/20 rounded-xl shadow-sm overflow-hidden">
                {renderStepContent()}

                <div className="bg-secondary-light px-8 py-4 border-t border-secondary/20 flex justify-between items-center">
                    <div>
                        {currentStep === 1 ? (
                            onBack && !readOnly && (
                                <button
                                    onClick={onBack}
                                    className="text-secondary hover:text-secondary-dark font-medium rounded-lg text-sm px-5 py-2.5 transition-all flex items-center gap-2 hover:bg-black/5"
                                >
                                    <i className="pi pi-arrow-left"></i> Cancelar
                                </button>
                            )
                        ) : (
                            <button
                                onClick={prevStep}
                                className="text-secondary hover:text-secondary-dark font-medium rounded-lg text-sm px-5 py-2.5 transition-all flex items-center gap-2 hover:bg-black/5"
                            >
                                <i className="pi pi-arrow-left"></i> Anterior
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        {currentStep < 4 ? (
                            <button
                                onClick={nextStep}
                                className="text-white bg-primary hover:bg-primary-hover font-bold rounded-lg text-sm px-5 py-2.5 text-center flex items-center gap-2 shadow-md transition-all"
                            >
                                Siguiente <i className="pi pi-arrow-right"></i>
                            </button>
                        ) : (
                            !readOnly && (
                                <button
                                    onClick={handleSubmit}
                                    className="text-white bg-secondary-dark hover:bg-black font-bold rounded-lg text-sm px-5 py-2.5 text-center flex items-center gap-2 shadow-md transition-all"
                                >
                                    Guardar y Finalizar <i className="pi pi-check"></i>
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderForm;
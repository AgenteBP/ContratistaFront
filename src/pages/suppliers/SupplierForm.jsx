import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import usePermissions from '../../hooks/usePermissions';
import useSupplierForm from '../../hooks/useSupplierForm';
import { useBlocker, useBeforeUnload } from 'react-router-dom';

// Step Components
import SupplierStepGeneral from '../../components/resources/forms/SupplierStepGeneral';
import SupplierStepLocation from '../../components/resources/forms/SupplierStepLocation';
import SupplierStepGroupCompany from '../../components/resources/forms/SupplierStepGroupCompany';
import SupplierStepContacts from '../../components/resources/forms/SupplierStepContacts';
import SupplierStepDocuments from '../../components/resources/forms/SupplierStepDocuments';

// UI Components
import StatusBadge from '../../components/ui/Badges';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import UnsavedChangesModal from '../../components/ui/UnsavedChangesModal';

/**
 * SupplierForm
 * 
 * Main orchestrator for Supplier addition and editing.
 * Uses decomposed step components and custom hooks for better maintainability.
 */
const SupplierForm = ({
    initialData = {},
    onSubmit,
    readOnly = false,
    isAdmin = false,
    isWizardMode = false,
    groups = [],
    availableCompanies = [],
    availableRequirements = [],
    onGroupChange,
    countries = [],
    title,
    subtitle,
    headerInfo,
    isEdit = false
}) => {
    // 1. Role-based Permissions & Flags
    const { isAdmin: isAuthAdmin, isAuditor } = usePermissions();
    const effectiveIsAdmin = isAdmin || isAuthAdmin;

    // 2. Form Logic & State Management
    const {
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
        requiredDocs,
        setRequiredDocs,
        setIsCustomConfig,
        handleSubmit: baseHandleSubmit,
        handleViewFile,
        toggleDocRequirement,
        handleRemoveFile,
        uniqueActives
    } = useSupplierForm({ 
        initialData, 
        isWizardMode, 
        readOnly, 
        isAdmin: effectiveIsAdmin, 
        isAuditor,
        groups, 
        availableCompanies,
        availableRequirements,
        onSubmit 
    });
    // 3. Backup for rollback on cancellation
    const [backupFormData, setBackupFormData] = useState(null);

    const handleStartEdit = () => {
        setBackupFormData(JSON.parse(JSON.stringify(formData))); // Deep copy
        setIsEditingStep(true);
    };

    const handleCancelEdit = () => {
        if (backupFormData) {
            setFormData(backupFormData);
            setBackupFormData(null);
        }
        setIsEditingStep(false);
    };

    // 4. Navigation Guards (Unsaved Changes)
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    
    useBeforeUnload(
        React.useCallback((e) => {
            if (dirtySteps.size > 0 && !readOnly) {
                e.preventDefault();
                return '';
            }
        }, [dirtySteps, readOnly])
    );

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            dirtySteps.size > 0 && !readOnly && currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        if (blocker && blocker.state === "blocked") {
            setShowLeaveModal(true);
        }
    }, [blocker]);

    // 4. UI State for global modals
    const [isStepperOpen, setIsStepperOpen] = useState(false);
    const [validationError, setValidationError] = useState(null);
    const formRef = useRef(null);
    const partialEdit = !isWizardMode && !readOnly;

    // 4. Stepper Navigation Helpers
    const scrollToForm = () => {
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const nextStep = () => {
        const nextStepNum = currentStep + 1;
        const nextStepLabel = steps[nextStepNum - 1];

        // Validation for entering Documentos (Step 5)
        if (nextStepLabel === 'Documentos') {
            const isStep1Invalid = !formData.razonSocial || !formData.cuit || !formData.email;
            const isStep2Invalid = isWizardMode && (!formData.id_group || !formData.empresas || formData.empresas.length === 0);
            
            if (isStep1Invalid) {
                setValidationError("Debe completar los datos del proveedor (Paso 1) antes de configurar la documentación.");
                setCurrentStep(getStepIdx('Proveedor'));
                scrollToForm();
                setTimeout(() => setValidationError(null), 5000);
                return;
            }
            
            if (isStep2Invalid) {
                setValidationError("Debe seleccionar un grupo y al menos una empresa (Paso 2) antes de continuar con la documentación.");
                setCurrentStep(getStepIdx('Grupo y Empresa'));
                scrollToForm();
                setTimeout(() => setValidationError(null), 5000);
                return;
            }
        }

        if (currentStep < steps.length) {
            setCurrentStep(nextStepNum);
            scrollToForm();
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            scrollToForm();
        }
    };

    // 5. Render Step Logic
    const renderStepContent = () => {
        switch (steps[currentStep - 1]) {
            case 'Proveedor':
                return (
                    <SupplierStepGeneral 
                        formData={formData}
                        handleChange={handleChange}
                        handleToggle={handleToggle}
                        readOnly={readOnly}
                        partialEdit={partialEdit}
                        isEditingStep={isEditingStep}
                        handleStartEdit={handleStartEdit}
                        handleCancelEdit={handleCancelEdit}
                        handleStopEdit={() => baseHandleSubmit('Proveedor')}
                        isAdmin={effectiveIsAdmin}
                    />
                );
            case 'Ubicación':
                return (
                    <SupplierStepLocation 
                        formData={formData}
                        handleLocationChange={handleLocationChange}
                        handleChange={handleChange}
                        countries={countries}
                        readOnly={readOnly}
                        partialEdit={partialEdit}
                        isEditingStep={isEditingStep}
                        handleStartEdit={handleStartEdit}
                        handleCancelEdit={handleCancelEdit}
                        handleStopEdit={() => baseHandleSubmit('Ubicación')}
                        isAdmin={effectiveIsAdmin}
                    />
                );
            case 'Grupo y Empresa':
                return (
                    <SupplierStepGroupCompany 
                        formData={formData}
                        setFormData={setFormData}
                        markStepDirty={markStepDirty}
                        currentStep={currentStep}
                        onGroupChange={onGroupChange}
                        groupDefinitions={groupDefinitions}
                        empresasByGrupo={empresasByGrupo}
                        setIsCustomConfig={setIsCustomConfig}
                        partialEdit={partialEdit}
                        isEditingStep={isEditingStep}
                        handleStartEdit={handleStartEdit}
                        handleCancelEdit={handleCancelEdit}
                        handleStopEdit={() => baseHandleSubmit('Grupo y Empresa')}
                        isWizardMode={isWizardMode}
                    />
                );
            case 'Contactos':
                return (
                    <SupplierStepContacts 
                        formData={formData}
                        newContact={newContact}
                        setNewContact={setNewContact}
                        handleAddContact={handleAddContact}
                        handleRemoveContact={handleRemoveContact}
                        readOnly={readOnly}
                        partialEdit={partialEdit}
                        isEditingStep={isEditingStep}
                        handleStartEdit={handleStartEdit}
                        handleCancelEdit={handleCancelEdit}
                        handleStopEdit={() => baseHandleSubmit('Contactos')}
                        isAdmin={effectiveIsAdmin}
                    />
                );
            case 'Documentos':
                return (
                    <SupplierStepDocuments 
                        formData={formData}
                        setFormData={setFormData}
                        requiredDocs={requiredDocs}
                        setRequiredDocs={setRequiredDocs}
                        loadingDocs={loadingDocs}
                        handleFileUpload={handleFileUpload}
                        handleDateChange={handleDateChange}
                        handleRemoveFile={handleRemoveFile}
                        handleViewFile={handleViewFile}
                        updateDocRequirement={updateDocRequirement}
                        toggleDocRequirement={toggleDocRequirement}
                        isAdmin={effectiveIsAdmin}
                        isWizardMode={isWizardMode}
                        readOnly={readOnly}
                        partialEdit={partialEdit}
                        isEditingStep={isEditingStep}
                        handleStartEdit={handleStartEdit}
                        handleCancelEdit={handleCancelEdit}
                        handleStopEdit={() => baseHandleSubmit('Documentos')}
                        availableRequirements={availableRequirements}
                        uniqueActives={uniqueActives}
                        setIsCustomConfig={setIsCustomConfig}
                        markStepDirty={markStepDirty}
                        getStepIdx={getStepIdx}
                        groupDefinitions={groupDefinitions}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="animate-fade-in w-full">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                {headerInfo ? (
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-extrabold text-secondary-dark tracking-tight">{headerInfo.name}</h1>
                            {headerInfo.status && <StatusBadge status={headerInfo.status} />}
                        </div>
                        <p className="text-secondary mt-1 text-sm">CUIT: {headerInfo.cuit} — {initialData?.servicio}</p>
                    </div>
                ) : (
                    <div>
                        {title && <h1 className="text-2xl md:text-3xl font-extrabold text-secondary-dark tracking-tight">{title}</h1>}
                        {subtitle && <p className="text-secondary mt-1 text-xs">{subtitle}</p>}
                    </div>
                )}

                {/* Global Save Button (Partial Edit) */}
                {!readOnly && (
                    <button
                        onClick={() => baseHandleSubmit(null)}
                        disabled={dirtySteps.size === 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-all
                            ${dirtySteps.size > 0
                                ? 'bg-primary hover:bg-primary-hover text-white cursor-pointer'
                                : 'bg-secondary-light text-secondary/50 cursor-not-allowed border border-secondary/10'
                            }
                        `}
                    >
                        <i className="pi pi-save"></i> Guardar Cambios
                    </button>
                )}
            </div>

            {/* --- 1. STEPPER / NAVIGATION --- */}
            {(() => {
                // Determine step status/msg for the Mobile Header
                let msg = '';
                let status = 'normal';

                if (currentStep === 1) {
                    if (!formData.razonSocial || !formData.cuit || !formData.email) { status = 'invalid'; msg = 'Datos faltantes'; }
                } else if (currentStep === 2) {
                    // Grupo y Empresa: Solo obligatorio en Wizard Mode
                    if (isWizardMode && (!formData.id_group || !formData.empresas || formData.empresas.length === 0)) { status = 'invalid'; msg = 'Selección faltante'; }
                } else if (currentStep === 3) {
                    // Ubicación: Obligatoria solo en el flujo normal (no Wizard)
                    if (!isWizardMode && (!formData.pais || !formData.provincia || !formData.localidad || !formData.codigoPostal || !formData.direccionFiscal)) { status = 'invalid'; msg = 'Ubicación incompleta'; }
                } else if (currentStep === 4) {
                    // Contactos: Siempre opcional según requerimiento
                    status = 'normal';
                } else if (currentStep === 5) {
                    const docs = formData.documentacion || [];
                    const missingDocs = (availableRequirements || []).some(req => {
                        if (req.obligatoriedad === 'Opcional' || req.isOptional) return false;
                        const doc = docs.find(d => String(d.tipo) === String(req.id) || (req.id_active && String(d.id_active) === String(req.id_active)));
                        return !doc || !doc.archivo || doc.estado === 'VENCIDO' || doc.estado === 'CON OBSERVACIÓN' || doc.estado === 'OBSERVADO' || doc.estado === 'CON OBSERVACION';
                    });
                    if (missingDocs) {
                        status = 'invalid';
                        const hasObs = docs.some(d => d.estado === 'CON OBSERVACIÓN' || d.estado === 'OBSERVADO' || d.estado === 'CON OBSERVACION');
                        msg = hasObs ? 'Observado' : 'Doc. pendiente';
                    }
                }

                const isDirtyState = dirtySteps.has(currentStep);
                if (isDirtyState && status !== 'invalid') status = 'dirty';

                const headerBg = status === 'invalid' ? 'bg-red-50' : status === 'dirty' ? 'bg-orange-50' : 'bg-white';
                const circleBg = status === 'invalid' ? 'bg-danger' : status === 'dirty' ? 'bg-warning' : 'bg-primary';
                const textColor = status === 'invalid' ? 'text-danger' : status === 'dirty' ? 'text-warning' : 'text-secondary-dark';

                // Modern Header Badge Styles
                const badgeBase = "px-2 py-0.5 rounded-full border text-[9px] font-bold tracking-wider whitespace-nowrap shadow-sm backdrop-blur-md";
                const badgeColor = status === 'invalid' ? 'bg-white/80 border-danger/30 text-danger' : 'bg-white/80 border-warning/30 text-warning';

                return (
                    <div
                        onClick={() => setIsStepperOpen(!isStepperOpen)}
                        className={`lg:hidden w-full border-b lg:border border-secondary/20 p-4 shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all select-none z-20 relative
                            ${isStepperOpen ? 'rounded-t-2xl border-b-0' : 'rounded-2xl mb-4'} 
                            ${headerBg}
                        `}
                    >
                        <div className="flex items-center gap-4 w-full overflow-hidden">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-lg transition-all duration-300 shrink-0 ${circleBg} ring-4 ring-primary/5`}>
                                {currentStep}
                            </div>
                            <div className="flex flex-col w-full overflow-hidden justify-center ml-1">
                                <span className="text-[10px] uppercase font-black text-secondary/60 tracking-widest mb-0.5 leading-tight">
                                    PASO {currentStep} / {steps.length}
                                </span>
                                <span className={`text-sm font-extrabold truncate mb-1 leading-tight ${textColor}`}>
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
                                            PENDIENTE DE GUARDAR
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={`w-9 h-9 rounded-full bg-white/60 flex items-center justify-center text-secondary shadow-inner transition-transform duration-500 shrink-0 ml-2 ${isStepperOpen ? 'rotate-180 text-primary' : ''}`}>
                            <i className="pi pi-chevron-down text-xs"></i>
                        </div>
                    </div>
                );
            })()}


            {/* Form Header Area (Ref for scrolling) */}
            <div ref={formRef} className="scroll-mt-20"></div>

            {/* Lista de Pasos (Desktop Stepper) */}
            <ol className={`${isStepperOpen ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row items-start lg:items-center w-full mb-0 lg:mb-10 text-sm font-medium text-center text-secondary bg-white p-6 lg:p-8 rounded-b-2xl lg:rounded-2xl border border-secondary/20 border-t-0 lg:border-t shadow-xl shadow-secondary/5 relative animate-fade-in gap-6 lg:gap-0 overflow-hidden`}>

                {/* Vertical Connector Line (Mobile Only) */}
                <div className="absolute left-[38px] top-10 bottom-10 w-0.5 bg-gray-200 z-0 lg:hidden"></div>

                {steps.map((step, index) => {
                    const stepNum = index + 1;
                    const isActive = currentStep === stepNum;
                    const isCompleted = currentStep > stepNum;
                    const isDirty = dirtySteps.has(stepNum);

                    // VALIDATION LOGIC
                    let isInvalid = false;
                    let missingMsg = '';

                    if (step === 'Proveedor') {
                        if (!formData.razonSocial || !formData.cuit || !formData.email) {
                            isInvalid = true;
                            missingMsg = 'Datos faltantes';
                        }
                    } else if (step === 'Grupo y Empresa') {
                        if (isWizardMode && (!formData.id_group || !formData.empresas || formData.empresas.length === 0)) {
                            isInvalid = true;
                            missingMsg = 'Selección faltante';
                        }
                    } else if (step === 'Ubicación') {
                        // Ubicación: Obligatoria solo para Proveedores en modo normal.
                        // Para administrador (creación/edición) es opcional según feedback.
                        const isSupplierMode = !effectiveIsAdmin;
                        if (isSupplierMode && !isWizardMode && (!formData.pais || !formData.provincia || !formData.localidad || !formData.codigoPostal || !formData.direccionFiscal)) {
                            isInvalid = true;
                            missingMsg = 'Ubicación incompleta';
                        }
                    } else if (step === 'Contactos') {
                        isInvalid = false;
                    } else if (step === 'Documentos') {
                        const docs = formData.documentacion || [];
                        const missingDocs = (availableRequirements || []).some(req => {
                            if (req.obligatoriedad === 'Opcional' || req.isOptional) return false;
                            const doc = docs.find(d => String(d.tipo) === String(req.id) || (req.id_active && String(d.id_active) === String(req.id_active)));
                            return !doc || !doc.archivo || doc.estado === 'VENCIDO' || doc.estado === 'CON OBSERVACIÓN' || doc.estado === 'OBSERVADO' || doc.estado === 'CON OBSERVACION';
                        });
                        if (missingDocs) {
                            isInvalid = true;
                            const hasObs = docs.some(d => d.estado === 'CON OBSERVACIÓN' || d.estado === 'OBSERVADO' || d.estado === 'CON OBSERVACION');
                            missingMsg = hasObs ? 'Observado' : 'Doc. pendiente';
                        }
                    }

                    const itemBadgeStyle = isInvalid
                        ? 'text-danger bg-white border-danger/30 shadow-sm'
                        : 'text-warning bg-white border-warning/30 shadow-sm';

                    return (
                        <li
                            key={index}
                            onClick={() => {
                                // Find first invalid preceding step ONLY if going to Documentos
                                const isGoingToDocs = steps[index] === 'Documentos';
                                const getIsStepInvalid = (stepName) => {
                                    if (stepName === 'Proveedor') {
                                        return !formData.razonSocial || !formData.cuit || !formData.email;
                                    }
                                    if (stepName === 'Grupo y Empresa') {
                                        return isWizardMode && (!formData.id_group || !formData.empresas || formData.empresas.length === 0);
                                    }
                                    return false;
                                };

                                if (isGoingToDocs) {
                                    for (let i = 0; i < index; i++) {
                                        if (getIsStepInvalid(steps[i])) {
                                            const stepName = steps[i];
                                            const errorMsg = stepName === 'Proveedor' 
                                                ? "Por favor, complete los datos obligatorios del Paso 1 (Proveedor) antes de acceder a Documentos."
                                                : "Por favor, complete la selección de Grupo y Empresa en el Paso 2 antes de acceder a Documentos.";
                                            
                                            setValidationError(errorMsg);
                                            setCurrentStep(i + 1);
                                            scrollToForm();
                                            setTimeout(() => setValidationError(null), 6000);
                                            return;
                                        }
                                    }
                                }
                                
                                setCurrentStep(stepNum);
                                scrollToForm();
                            }}
                            className={`flex w-full lg:w-auto lg:flex-1 flex-row lg:flex-col items-center justify-start lg:justify-center cursor-pointer select-none transition-all z-10 bg-white lg:bg-transparent relative py-1 lg:py-0
                                ${isActive
                                    ? (isInvalid ? 'text-danger font-bold' : isDirty ? 'text-warning font-bold' : 'text-primary font-bold')
                                    : (isInvalid ? 'text-danger hover:text-danger-dark' : isDirty ? 'text-warning hover:text-warning-hover' : 'text-secondary/50 hover:text-secondary')
                                }
                            `}
                        >
                            {/* Desktop Connector Line: Anchored to circle center (24px from top for w-12) */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-[24px] left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-0.5 bg-gray-200 z-0 transition-colors duration-300"></div>
                            )}
                            <span className="flex items-center lg:flex-col w-full lg:w-auto lg:min-w-[120px] relative group gap-4 lg:gap-0">
                                {/* Step Indicator (Circle) - Increased to w-12 */}
                                <div className="flex items-center justify-center w-12 h-12 lg:mb-1 shrink-0 relative">
                                    <span className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-bold text-sm z-10 
                                        ${isActive
                                            ? `scale-105 shadow-md ring-2 ring-offset-1 ring-primary/20 text-white ${isInvalid ? 'bg-danger border-danger' : isDirty ? 'bg-warning border-warning' : 'bg-primary border-primary'}`
                                            : `${isInvalid ? 'border-danger bg-white text-danger' :
                                                isDirty ? 'border-warning bg-white text-warning' :
                                                    isCompleted ? 'border-primary bg-primary/10 text-primary' :
                                                        'border-secondary/30 text-secondary/50 bg-white'}`
                                        } 
                                    `}>
                                        {!isActive && isCompleted && !isInvalid && !isDirty ? <i className="pi pi-check text-[12px] font-bold"></i> : stepNum}
                                    </span>
                                </div>

                                {/* Mobile Label Content */}
                                <div className="flex flex-1 flex-row items-center justify-between lg:hidden w-full">
                                    <span className={`font-semibold text-left text-sm mr-2 flex-1
                                        ${!isActive && !isInvalid && !isDirty && isCompleted ? 'text-primary' : ''}
                                        ${!isActive && !isInvalid && !isDirty && !isCompleted ? 'text-secondary/50' : ''}
                                    `}>
                                        {step}
                                    </span>
                                    <div className="flex flex-col items-end gap-0.5 shrink-0 min-h-[16px]">
                                        {!isActive && (
                                            <>
                                                {isInvalid && <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider border whitespace-nowrap ${itemBadgeStyle}`}>{missingMsg}</span>}
                                                {isDirty && !isInvalid && <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold tracking-wider border whitespace-nowrap ${itemBadgeStyle}`}>SIN GUARDAR</span>}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Desktop Label Content: Reserved space for badges to prevent jumping */}
                                <div className="hidden lg:flex flex-col items-center w-full min-h-[48px]">
                                    <span className={`text-center leading-tight transition-all duration-300 ${isActive ? 'text-sm font-bold' : 'text-xs font-semibold'} 
                                        ${!isActive && !isInvalid && !isDirty && isCompleted ? 'text-primary' : ''}
                                        ${!isActive && !isInvalid && !isDirty && !isCompleted ? 'text-secondary/50' : ''}
                                    `}>
                                        {step}
                                    </span>
                                    <div className="flex flex-col items-center gap-1 mt-1.5 h-6">
                                        {!isActive && (
                                            <div className="animate-fade-in flex flex-col items-center gap-1">
                                                {isInvalid && <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border whitespace-nowrap shadow-sm ${itemBadgeStyle}`}>{missingMsg}</span>}
                                                {isDirty && !isInvalid && <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold tracking-wider border whitespace-nowrap shadow-sm ${itemBadgeStyle}`}>SIN GUARDAR</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </span>
                        </li>
                    );
                })}
            </ol>
            
            {/* Inline Navigation Alert */}
            {validationError && (
                <div className="mb-6 animate-fade-in max-w-5xl mx-auto px-4 lg:px-0">
                    <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger shrink-0 ring-4 ring-danger/5">
                            <i className="pi pi-exclamation-triangle text-lg font-bold"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-secondary-dark leading-snug md:whitespace-normal">{validationError}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Content Container */}
            <div className="bg-white border-0 lg:border border-secondary/20 rounded-xl shadow-none lg:shadow-sm overflow-hidden mb-8">
                {renderStepContent()}

                {/* Footer Actions */}
                <div className="bg-secondary-light p-4 lg:px-8 border-t border-secondary/20 flex justify-between items-center">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className={`text-secondary hover:text-secondary-dark font-medium px-5 py-2.5 flex items-center gap-2 ${currentStep === 1 ? 'opacity-0' : 'opacity-100 hover:bg-black/5 rounded-lg'}`}
                    >
                        <i className="pi pi-arrow-left"></i> Anterior
                    </button>
                    
                    <div className="flex gap-3">
                        {currentStep < steps.length ? (
                            <button onClick={nextStep} className="bg-primary hover:bg-primary-hover text-white font-bold rounded-lg px-6 py-2.5 shadow-md flex items-center gap-2">
                                Siguiente <i className="pi pi-arrow-right"></i>
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Global Modals */}

            <UnsavedChangesModal 
                visible={showLeaveModal} 
                onConfirm={() => { setShowLeaveModal(false); blocker.proceed(); }} 
                onCancel={() => { setShowLeaveModal(false); blocker.reset(); }} 
            />
        </div>
    );
};

export default SupplierForm;
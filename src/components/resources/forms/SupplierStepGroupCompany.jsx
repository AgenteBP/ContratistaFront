import React from 'react';
import Label from '../../ui/Label';
import MultiSelect from '../../ui/MultiSelect';
import StepHeader from '../../suppliers/StepHeader';

/**
 * SupplierStepGroupCompany
 * 
 * Component for Step 2: Selecting Business Group and associated Companies.
 */
const SupplierStepGroupCompany = ({ 
    formData, 
    setFormData, 
    markStepDirty, 
    currentStep, 
    onGroupChange, 
    setIsCustomConfig,
    groupDefinitions,
    empresasByGrupo,
    partialEdit,
    isEditingStep,
    handleStartEdit,
    handleStopEdit
}) => {
    return (
        <div className="p-0 md:p-8">
            <StepHeader
                title="Grupo y Empresa"
                subtitle="Seleccione el grupo empresario y las empresas a las que el proveedor prestará servicio."
                partialEdit={partialEdit}
                isEditingStep={isEditingStep}
                handleStartEdit={handleStartEdit}
                handleStopEdit={handleStopEdit}
            />

            <div className="flex flex-col items-center justify-start mt-4">
                <div className="max-w-4xl w-full animate-fade-in text-center">

                    <div className="mt-4">
                        <Label className="block text-center mb-6 text-base font-bold text-secondary-dark">¿A qué grupo pertenece? <span className="text-red-500">*</span></Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-4">
                            {groupDefinitions.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        const groupName = (item.name || '').toUpperCase();
                                        setFormData(prev => ({ 
                                            ...prev, 
                                            grupo: groupName, 
                                            id_group: item.id, 
                                            empresas: [] 
                                        }));
                                        if (setIsCustomConfig) setIsCustomConfig(false);
                                        markStepDirty(currentStep);
                                        if (onGroupChange) onGroupChange(item.id);
                                    }}
                                    className={`
                                        group relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden
                                        ${((item.id && formData.id_group === item.id) || (formData.grupo && item.name && formData.grupo.toUpperCase() === item.name.toUpperCase()))
                                            ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10 scale-[1.03] ring-1 ring-primary'
                                            : 'border-secondary/20 bg-white hover:border-primary/40 hover:shadow-lg hover:scale-[1.01]'
                                        }
                                    `}
                                >
                                    {/* Decoration background */}
                                    <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full transition-all duration-500 opacity-10 group-hover:scale-150 ${((item.id && formData.id_group === item.id) || (formData.grupo && item.name && formData.grupo.toUpperCase() === item.name.toUpperCase())) ? 'bg-primary scale-150' : 'bg-secondary'}`}></div>

                                    <div className={`p-4 rounded-2xl mb-5 transition-all duration-300 ${((item.id && formData.id_group === item.id) || (formData.grupo && item.name && formData.grupo.toUpperCase() === item.name.toUpperCase())) ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-secondary-light text-secondary-dark group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                        <i className={`pi ${item.icon} text-3xl`}></i>
                                    </div>

                                    <h3 className={`text-xl font-black transition-colors ${((item.id && formData.id_group === item.id) || (formData.grupo && item.name && formData.grupo.toUpperCase() === item.name.toUpperCase())) ? 'text-primary' : 'text-secondary-dark'}`}>
                                        {item.name}
                                    </h3>

                                    {((item.id && formData.id_group === item.id) || (formData.grupo && item.name && formData.grupo.toUpperCase() === item.name.toUpperCase())) && (
                                        <div className="absolute top-4 right-4 animate-scale-in">
                                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white shadow-sm ring-4 ring-white">
                                                <i className="pi pi-check text-[10px] font-bold"></i>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {formData.grupo && (
                        <div className="mt-6 animate-fade-in px-4">
                            <div className="max-w-xl mx-auto p-8 rounded-2xl border border-primary/20 bg-white shadow-xl shadow-secondary/5 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/20"></div>

                                <div className="text-left">
                                    <Label className="text-sm font-bold text-secondary-dark mb-4 flex items-center gap-2">
                                        <i className="pi pi-building-cap text-primary"></i> Seleccionar empresas de {formData.grupo} <span className="text-red-500">*</span>
                                    </Label>
                                    <MultiSelect
                                        name="empresas"
                                        value={formData.empresas}
                                        options={empresasByGrupo[String(formData.id_group)] || empresasByGrupo[String(formData.grupo)] || []}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, empresas: e.value }));
                                            markStepDirty(currentStep);
                                        }}
                                        placeholder="Elija una o más empresas"
                                        className="w-full"
                                        display="chip"
                                    />
                                    <div className="mt-4 p-3 bg-secondary-light/40 rounded-lg flex items-start gap-3">
                                        <i className="pi pi-info-circle text-primary mt-0.5 text-sm"></i>
                                        <p className="text-[11px] text-secondary-dark/70 font-medium leading-relaxed italic">
                                            Podrá asociar más empresas o grupos adicionales una vez completado el registro inicial.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupplierStepGroupCompany;

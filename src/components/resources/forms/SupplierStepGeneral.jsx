import React from 'react';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Toggle from '../../ui/Toggle';
import Label from '../../ui/Label';
import SectionTitle from '../../ui/SectionTitle';
import StepHeader from '../../suppliers/StepHeader';
import { InputMask } from 'primereact/inputmask';
import { classNames } from 'primereact/utils';
import { TIPOS_PERSONA, CLASIFICACIONES_AFIP, SERVICIOS } from '../../../data/supplierConstants';

/**
 * SupplierStepGeneral
 * 
 * Component for Step 1: Data Fiscal & Operations.
 */
const SupplierStepGeneral = ({ 
    formData, 
    handleChange, 
    handleToggle, 
    readOnly, 
    partialEdit, 
    isEditingStep,
    handleStartEdit,
    handleStopEdit,
    isAdmin
}) => {
    const isStep1Disabled = readOnly || (partialEdit && !isEditingStep);
    const isFiscalDataLocked = readOnly || partialEdit; // Locked for non-admins usually

    return (
        <div className="p-0 md:p-8">
            <StepHeader 
                title="Datos Fiscales" 
                subtitle="Información registrada ante AFIP." 
                partialEdit={partialEdit}
                isEditingStep={isEditingStep}
                handleStartEdit={handleStartEdit}
                handleStopEdit={handleStopEdit}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Input
                    label={<>Razón Social {!isAdmin && <span className="text-red-500">*</span>}</>}
                    name="razonSocial"
                    value={formData.razonSocial || ''}
                    onChange={handleChange}
                    placeholder="Ingrese Razón Social"
                    disabled={isFiscalDataLocked}
                />
                <div className="w-full">
                    <Label>CUIT {!isAdmin && <span className="text-red-500">*</span>}</Label>
                    <InputMask
                        name="cuit"
                        mask="99-99999999-9"
                        value={formData.cuit || ''}
                        onChange={handleChange}
                        placeholder="XX-XXXXXXXX-X"
                        disabled={isFiscalDataLocked}
                        className={classNames(
                            'w-full border border-secondary/40 text-secondary-dark outline-none transition-all block shadow-sm hover:shadow-md focus:ring-2 focus:ring-primary/20 focus:border-primary p-2.5 text-sm rounded-lg', 
                            { 'bg-gray-50 opacity-90 cursor-not-allowed': isFiscalDataLocked }
                        )}
                    />
                </div>
                <Input
                    label="Nombre de Fantasía"
                    name="nombreFantasia"
                    value={formData.nombreFantasia || ''}
                    onChange={handleChange}
                    placeholder="Nombre comercial"
                    disabled={isFiscalDataLocked}
                />
                <div className="w-full">
                    <Label>Tipo de Persona {!isAdmin && <span className="text-red-500">*</span>}</Label>
                    {isFiscalDataLocked ? (
                        <Input value={formData.tipoPersona} disabled />
                    ) : (
                        <Select
                            name="tipoPersona"
                            options={TIPOS_PERSONA}
                            value={formData.tipoPersona}
                            onChange={handleChange}
                        />
                    )}
                </div>
                <div className="w-full">
                    <Label>Clasificación AFIP {!isAdmin && <span className="text-red-500">*</span>}</Label>
                    {isFiscalDataLocked ? (
                        <Input value={formData.clasificacionAFIP} disabled />
                    ) : (
                        <Select
                            name="clasificacionAFIP"
                            options={CLASIFICACIONES_AFIP}
                            value={formData.clasificacionAFIP}
                            onChange={handleChange}
                        />
                    )}
                </div>
            </div>

            <SectionTitle title="Contacto y Operaciones" subtitle="Datos para la gestión diaria." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Input
                    label={<>Email Corporativo {!isAdmin && <span className="text-red-500">*</span>}</>}
                    name="email"
                    icon="pi-envelope"
                    value={formData.email || ''}
                    onChange={handleChange}
                    placeholder="contacto@empresa.com"
                    disabled={isStep1Disabled}
                />
                <Input
                    label="Teléfono"
                    name="telefono"
                    icon="pi-phone"
                    value={formData.telefono || ''}
                    onChange={handleChange}
                    placeholder="+54 11 ..."
                    disabled={isStep1Disabled}
                />
                <div className="w-full">
                    <Label>Servicio / Rubro {!isAdmin && <span className="text-red-500">*</span>}</Label>
                    {isFiscalDataLocked ? (
                        <Input value={formData.servicio} disabled />
                    ) : (
                        <Select
                            name="servicio"
                            options={SERVICIOS}
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
};

export default SupplierStepGeneral;

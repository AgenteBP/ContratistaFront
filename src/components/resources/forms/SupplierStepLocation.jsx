import React, { useState, useEffect, useMemo } from 'react';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import StepHeader from '../../suppliers/StepHeader';
import { Country, State, City } from 'country-state-city';

/**
 * SupplierStepLocation
 * 
 * Component responsible for capturing Location details.
 * Contains the logic for the Country-State-City selectors inside this component, 
 * decoupled from the main form component.
 */
const SupplierStepLocation = ({ 
    formData, 
    handleLocationChange, 
    handleChange, 
    readOnly,
    partialEdit,
    isEditingStep,
    handleStartEdit,
    handleStopEdit,
    isAdmin
}) => {
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const isStepDisabled = readOnly || (partialEdit && !isEditingStep);
    const isEditMode = !readOnly && (!partialEdit || isEditingStep);

    // Shared localization mapping
    const regionNames = new Intl.DisplayNames(['es'], { type: 'region' });
    
    const countriesOptions = useMemo(() => {
        return Country.getAllCountries().map(c => {
            let label = c.name;
            try {
                label = regionNames.of(c.isoCode);
            } catch (e) {
                // fallback
            }
            return { label: label, value: c.isoCode };
        }).sort((a, b) => a.label.localeCompare(b.label));
    }, []);

    useEffect(() => {
        if (formData.paisCode || formData.pais) {
            let code = formData.paisCode;
            if (!code && formData.pais) {
                const found = countriesOptions.find(c => c.label === formData.pais);
                if (found) code = found.value;
            }
            if (code) {
                const countryStates = State.getStatesOfCountry(code).map(s => ({ label: s.name, value: s.isoCode }));
                setStates(countryStates);
            }
        } else {
            setStates([]);
        }
    }, [formData.paisCode, formData.pais, countriesOptions]);

    useEffect(() => {
        if ((formData.provinciaCode || formData.provincia) && (formData.paisCode || formData.pais)) {
            let pCode = formData.paisCode;
            if (!pCode && formData.pais) {
                const found = countriesOptions.find(c => c.label === formData.pais);
                if (found) pCode = found.value;
            }

            let sCode = formData.provinciaCode;
            if (!sCode && formData.provincia && states.length > 0) {
                const found = states.find(s => s.label === formData.provincia);
                if (found) sCode = found.value;
            }

            if (pCode && sCode) {
                const stateCities = City.getCitiesOfState(pCode, sCode).map(c => ({ label: c.name, value: c.name }));
                setCities(stateCities);
            }
        } else {
            setCities([]);
        }
    }, [formData.provinciaCode, formData.provincia, formData.paisCode, formData.pais, states, countriesOptions]);

    return (
        <div className="p-0 md:p-8">
            <StepHeader 
                title="Ubicación" 
                subtitle="Direcciones fiscales y reales del proveedor." 
                partialEdit={partialEdit}
                isEditingStep={isEditingStep}
                handleStartEdit={handleStartEdit}
                handleStopEdit={handleStopEdit}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Select
                    label={<>País {!isAdmin && <span className="text-red-500">*</span>}</>}
                    name="pais"
                    value={formData.paisCode || (countriesOptions.find(c => c.label?.toUpperCase() === formData.pais?.toUpperCase())?.value) || ''}
                    options={countriesOptions}
                    onChange={(e) => handleLocationChange('pais', e.target.value, e.target.options[e.target.selectedIndex])}
                    disabled={isStepDisabled}
                    placeholder="Seleccione país"
                    required={!isAdmin}
                />
                <Select
                    label={<>Provincia/Estado {!isAdmin && <span className="text-red-500">*</span>}</>}
                    name="provincia"
                    value={formData.provinciaCode || (states.find(s => s.label?.toUpperCase() === formData.provincia?.toUpperCase())?.value) || ''}
                    options={states}
                    onChange={(e) => handleLocationChange('provincia', e.target.value, e.target.options[e.target.selectedIndex])}
                    disabled={isStepDisabled || states.length === 0}
                    placeholder={states.length === 0 ? "Seleccione un país" : "Seleccione provincia"}
                    required={!isAdmin}
                />
                <Select
                    label={<>Localidad {!isAdmin && <span className="text-red-500">*</span>}</>}
                    name="localidad"
                    value={formData.localidad}
                    options={cities}
                    onChange={(e) => handleLocationChange('localidad', e.target.value, e.target.options[e.target.selectedIndex])}
                    disabled={isStepDisabled || cities.length === 0}
                    placeholder={cities.length === 0 ? "Seleccione provincia" : "Seleccione localidad"}
                    required={!isAdmin}
                />
                <Input
                    label={<>Código Postal {!isAdmin && <span className="text-red-500">*</span>}</>}
                    name="codigoPostal"
                    value={formData.codigoPostal}
                    onChange={handleChange}
                    disabled={isStepDisabled}
                    required={!isAdmin}
                />
                <Input
                    label={<>Dirección Fiscal {!isAdmin && <span className="text-red-500">*</span>}</>}
                    name="direccionFiscal"
                    value={formData.direccionFiscal}
                    onChange={handleChange}
                    disabled={isStepDisabled}
                    required={!isAdmin}
                />
                <Input
                    label="Dirección Real"
                    name="direccionReal"
                    value={formData.direccionReal}
                    onChange={handleChange}
                    disabled={isStepDisabled}
                />
            </div>
        </div>
    );
};

export default SupplierStepLocation;

import React, { useState, useEffect } from 'react';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Toggle from '../../components/ui/Toggle';
import SectionTitle from '../../components/ui/SectionTitle';
import Label from '../../components/ui/Label';

const ProviderForm = ({ initialData = {}, readOnly = false, onSubmit, onBack, title, subtitle }) => {
    // State único para todo el formulario
    const [formData, setFormData] = useState({
        razonSocial: '',
        cuit: '',
        nombreFantasia: '',
        tipoPersona: 'JURIDICA',
        grupo: 'Seleccione...',
        email: '',
        telefono: '',
        servicio: 'Seleccione...',
        riesgo: 'A DEFINIR',
        empleadorAFIP: false,
        esTemporal: false,
        ...initialData // Sobrescribe defaults con lo que venga
    });

    useEffect(() => {
        if (initialData) {
            // Normalización de datos si es necesario
            setFormData(prev => ({
                ...prev,
                ...initialData,
                empleadorAFIP: initialData.empleadorAFIP === 'Si' || initialData.empleadorAFIP === true,
                esTemporal: initialData.esTemporal === 'Si' || initialData.esTemporal === true
            }));
        }
    }, [initialData]);

    const steps = ['Proveedor', 'Ubicación', 'Contacto', 'Documentos'];
    const grupos = ['Seleccione...', 'MANTENIMIENTO', 'TI', 'SEGURIDAD', 'DISTRIBUCIÓN', 'COMERCIAL', 'RR.HH.'];
    const servicios = ['Seleccione...', 'Mantenimiento', 'Limpieza', 'Seguridad', 'Logística', 'VIGILANCIA'];
    const riesgos = ['A DEFINIR', 'RIESGO ALTO', 'RIESGO MEDIO', 'RIESGO BAJO'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (readOnly) return;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (name) => {
        if (readOnly) return;
        setFormData(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const handleSubmit = () => {
        // Conversión final antes de enviar si es necesario (ej: bool a 'Si'/'No')
        // Por ahora enviamos el objeto tal cual
        onSubmit(formData);
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
                </div>
            )}

            {/* --- 2. STEPPER (Visual placeholder por ahora) --- */}
            <ol className="flex items-center w-full mb-10 text-sm font-medium text-center text-secondary bg-white p-4 rounded-xl border border-secondary/20 shadow-sm">
                {steps.map((step, index) => (
                    <li key={index} className={`flex md:w-full items-center ${index < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-secondary/20 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10" : ""} ${index === 0 ? 'text-primary font-bold' : ''}`}>
                        <span className="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-secondary/30">
                            <span className={`mr-2 w-6 h-6 rounded-full flex items-center justify-center border ${index === 0 ? 'border-primary bg-primary text-white font-bold' : 'border-secondary/30'}`}>
                                {index + 1}
                            </span>
                            {step}
                        </span>
                    </li>
                ))}
            </ol>

            {/* --- 3. FORMULARIO --- */}
            <div className="bg-white border border-secondary/20 rounded-xl shadow-sm overflow-hidden">
                <div className="p-8">
                    <SectionTitle title="Datos Fiscales" subtitle="Información registrada ante AFIP." />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <Input
                            label="Razón Social"
                            name="razonSocial"
                            value={formData.razonSocial}
                            onChange={handleChange}
                            placeholder="Ingrese Razón Social"
                            disabled={readOnly}
                        />
                        <Input
                            label="CUIT"
                            name="cuit"
                            icon="pi-id-card"
                            value={formData.cuit}
                            onChange={handleChange}
                            placeholder="XX-XXXXXXXX-X"
                            disabled={readOnly}
                        />
                        <Input
                            label="Nombre de Fantasía"
                            name="nombreFantasia"
                            value={formData.nombreFantasia}
                            onChange={handleChange}
                            placeholder="Nombre comercial"
                            disabled={readOnly}
                        />
                        <Input
                            label="Tipo de Persona"
                            name="tipoPersona"
                            value={formData.tipoPersona}
                            onChange={handleChange}
                            disabled={readOnly}
                        />
                        <div className="w-full">
                            <Label>Grupo</Label>
                            {readOnly ? (
                                <Input value={formData.grupo} disabled />
                            ) : (
                                <Select
                                    name="grupo"
                                    options={grupos}
                                    value={formData.grupo}
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
                            disabled={readOnly}
                        />
                        <Input
                            label="Teléfono"
                            name="telefono"
                            icon="pi-phone"
                            value={formData.telefono}
                            onChange={handleChange}
                            placeholder="+54 11 ..."
                            disabled={readOnly}
                        />
                        <div className="w-full">
                            <Label>Servicio / Rubro</Label>
                            {readOnly ? (
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
                        <div className="w-full">
                            <Label>Nivel de Riesgo</Label>
                            {readOnly ? (
                                <Input value={formData.riesgo} disabled />
                            ) : (
                                <Select
                                    name="riesgo"
                                    options={riesgos}
                                    value={formData.riesgo}
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
                            disabled={readOnly}
                        />
                        <Toggle
                            label="¿Contratación Temporal?"
                            checked={formData.esTemporal}
                            onChange={() => handleToggle('esTemporal')}
                            disabled={readOnly}
                        />
                    </div>
                </div>

                {!readOnly && (
                    <div className="bg-secondary-light px-8 py-4 border-t border-secondary/20 flex justify-between items-center">
                        <div>
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="text-secondary hover:text-secondary-dark font-medium rounded-lg text-sm px-5 py-2.5 transition-all flex items-center gap-2 hover:bg-black/5"
                                >
                                    <i className="pi pi-arrow-left"></i> Volver
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSubmit}
                                className="text-white bg-secondary-dark hover:bg-black font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center gap-2 shadow-md transition-all"
                            >
                                Guardar y Finalizar <i className="pi pi-check"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProviderForm;
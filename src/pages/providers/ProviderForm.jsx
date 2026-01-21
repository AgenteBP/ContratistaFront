import React, { useState, useEffect } from 'react';
// Importas tus componentes UI desde su nueva casa
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Toggle from '../../components/ui/Toggle';
import SectionTitle from '../../components/ui/SectionTitle';
import Label from '../../components/ui/Label';

// 1. Agregamos "title" y "subtitle" a las props recibidas
const ProviderForm = ({ initialData = {}, readOnly = false, onSubmit, title, subtitle }) => {
    const [empleador, setEmpleador] = useState(false);
    const [esTemporal, setEsTemporal] = useState(false);

    useEffect(() => {
        if (initialData?.empleadorAFIP) {
            setEmpleador(initialData.empleadorAFIP === 'Si');
        }
        if (initialData?.esTemporal) {
            setEsTemporal(initialData.esTemporal === 'Si' || initialData.esTemporal === true);
        }
    }, [initialData]);

    const steps = ['Proveedor', 'Ubicación', 'Contacto', 'Documentos'];
    const grupos = ['Seleccione...', 'MANTENIMIENTO', 'TI', 'SEGURIDAD', 'DISTRIBUCIÓN', 'COMERCIAL', 'RR.HH.'];
    const servicios = ['Seleccione...', 'Mantenimiento', 'Limpieza', 'Seguridad', 'Logística', 'VIGILANCIA'];
    const riesgos = ['A DEFINIR', 'RIESGO ALTO', 'RIESGO MEDIO', 'RIESGO BAJO'];

    return (
        <div className="animate-fade-in w-full">

            {/* --- 1. ENCABEZADO UNIFICADO --- */}
            {/* Renderizamos este bloque si hay título O si hay botones (no es readOnly) */}
            {(title || !readOnly) && (
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">

                    {/* IZQUIERDA: Título y Subtítulo */}
                    <div>
                        {title && (
                            <h1 className="text-2xl md:text-3xl font-extrabold text-secondary-dark tracking-tight">
                                {title}
                            </h1>
                        )}
                        {subtitle && (
                            <p className="text-secondary mt-1 text-xs">{subtitle}</p>
                        )}
                    </div>

                    {/* DERECHA: Botones (Solo si NO es lectura) */}
                    {!readOnly && (
                        <div className="flex gap-3">
                            <button className="text-secondary-dark bg-white border border-secondary/30 hover:bg-secondary-light font-medium rounded-lg text-sm px-5 py-2.5 shadow-sm transition-all">
                                Guardar Borrador
                            </button>
                            <button onClick={onSubmit} className="text-white bg-primary hover:bg-primary-hover font-bold rounded-lg text-sm px-5 py-2.5 shadow-lg shadow-primary/30 transition-all flex items-center gap-2">
                                <i className="pi pi-save"></i> Guardar
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* --- 2. STEPPER --- */}
            <ol className="flex items-center w-full mb-10 text-sm font-medium text-center text-secondary bg-white p-4 rounded-xl border border-secondary/20 shadow-sm">
                {steps.map((step, index) => (
                    <li key={index} className={`flex md:w-full items-center ${index < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-secondary/20 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10" : ""} ${index === 0 ? 'text-primary font-bold' : ''}`}>
                        <span className="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-secondary/30">
                            {index === 0 ? (
                                <span className="mr-2 w-6 h-6 rounded-full flex items-center justify-center border border-primary bg-primary text-white font-bold">1</span>
                            ) : (
                                <span className="mr-2 w-6 h-6 rounded-full flex items-center justify-center border border-secondary/30">{index + 1}</span>
                            )}
                            {step}
                        </span>
                    </li>
                ))}
            </ol>

            {/* --- 3. FORMULARIO --- */}
            <div className="bg-white border border-secondary/20 rounded-xl shadow-sm overflow-hidden">
                <div className="p-8">
                    {/* ... (El resto del formulario sigue igual) ... */}
                    <SectionTitle title="Datos Fiscales" subtitle="Información registrada ante AFIP." />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <Input label="Razón Social" defaultValue={initialData?.razonSocial || ''} placeholder="Ingrese Razón Social" disabled={readOnly} />
                        <Input label="CUIT" icon="pi-id-card" defaultValue={initialData?.cuit || ''} placeholder="XX-XXXXXXXX-X" disabled={readOnly} />
                        <Input label="Nombre de Fantasía" defaultValue={initialData?.nombreFantasia || ''} placeholder="Nombre comercial" disabled={readOnly} />
                        <Input label="Tipo de Persona" defaultValue={initialData?.tipoPersona || 'JURIDICA'} disabled={readOnly} />
                        <div className="w-full">
                            <Label>Grupo</Label>
                            {readOnly ? <Input defaultValue={initialData?.grupo || ''} disabled /> : <Select options={grupos} defaultValue={initialData?.grupo} />}
                        </div>
                    </div>

                    <SectionTitle title="Contacto y Operaciones" subtitle="Datos para la gestión diaria." />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Input label="Email Corporativo" icon="pi-envelope" defaultValue={initialData?.email || ''} placeholder="contacto@empresa.com" disabled={readOnly} />
                        <Input label="Teléfono" icon="pi-phone" defaultValue={initialData?.telefono || ''} placeholder="+54 11 ..." disabled={readOnly} />
                        <div className="w-full">
                            <Label>Servicio / Rubro</Label>
                            {readOnly ? <Input defaultValue={initialData?.servicio || ''} disabled /> : <Select options={servicios} defaultValue={initialData?.servicio} />}
                        </div>
                        <div className="w-full">
                            <Label>Nivel de Riesgo</Label>
                            {readOnly ? <Input defaultValue={initialData?.riesgo || 'A DEFINIR'} disabled /> : <Select options={riesgos} defaultValue={initialData?.riesgo} />}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 mt-8 p-4 bg-secondary-light rounded-lg border border-secondary/20">
                        <Toggle label="¿Es Empleador ante AFIP?" checked={empleador} onChange={() => !readOnly && setEmpleador(!empleador)} disabled={readOnly} />
                        <Toggle label="¿Contratación Temporal?" checked={esTemporal} onChange={() => !readOnly && setEsTemporal(!esTemporal)} disabled={readOnly} />                    
                    </div>
                </div>

                {!readOnly && (
                    <div className="bg-secondary-light px-8 py-4 border-t border-secondary/20 flex justify-between items-center">
                        <button className="text-secondary hover:text-danger font-medium text-sm transition-colors">Cancelar operación</button>
                        <div className="flex gap-3">
                            <button className="text-white bg-secondary-dark hover:bg-black font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center gap-2 shadow-md transition-all">Siguiente Paso <i className="pi pi-arrow-right"></i></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProviderForm;
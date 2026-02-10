import React, { useState, useEffect } from 'react';
import SectionTitle from '../../ui/SectionTitle';
import Input from '../../ui/Input';
import Dropdown from '../../ui/Dropdown';
import Label from '../../ui/Label';
import { Calendar } from 'primereact/calendar';

const EmployeeData = ({ data, onChange, onNext }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        cuil: '',
        dni: '',
        lugarNacimiento: '', // Select
        fechaNacimiento: null,
        fechaInicio: null,
        sindicato: '',
        convenio: '',
        telefono: '',
        direccion: '',
        genero: '', // Radio/Select
        esChofer: false,
        ...data
    });

    const [errors, setErrors] = useState({});

    // Mocks for dropdowns
    const places = [
        { label: 'San Luis', value: 'San Luis' },
        { label: 'Villa Mercedes', value: 'Villa Mercedes' },
        { label: 'Mendoza', value: 'Mendoza' }
    ];

    const genderOptions = [
        { label: 'Masculino', value: 'M' },
        { label: 'Femenino', value: 'F' },
        { label: 'No Binario', value: 'X' }
    ];

    useEffect(() => {
        setFormData(prev => ({ ...prev, ...data }));
    }, [data]);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleToggle = (name) => {
        setFormData(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const validate = () => {
        // Basic validation
        const newErrors = {};
        if (!formData.nombre) newErrors.nombre = 'Requerido';
        if (!formData.apellido) newErrors.apellido = 'Requerido';
        if (!formData.dni) newErrors.dni = 'Requerido';
        // Add more as needed
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (validate()) {
            onNext(formData);
        }
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-xl border border-secondary/20 shadow-sm animate-fade-in max-w-5xl mx-auto">
            <SectionTitle title="Datos del Empleado" subtitle="Información General del Empleado." />

            {/* Image Upload Placeholder */}
            <div className="mb-6 flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                    <i className="pi pi-image text-2xl"></i>
                </div>
                <div>
                    <button className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3 py-1.5 rounded mr-2 transition-colors">Cargar</button>
                    <button className="bg-white border border-gray-300 text-secondary text-xs font-bold px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">Limpiar</button>
                    <p className="text-[10px] text-gray-400 mt-1">Imagen en formato JPG, GIF o PNG. Tamaño Máx 100kB</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Input label="Apellido" value={formData.apellido} onChange={(e) => handleChange('apellido', e.target.value)} placeholder="INGRESE APELLIDOS DEL EMPLEADO" error={errors.apellido} />
                <Input label="Nombre" value={formData.nombre} onChange={(e) => handleChange('nombre', e.target.value)} placeholder="INGRESE NOMBRES DEL EMPLEADO" error={errors.nombre} />
                <Input label="C.U.I.L." value={formData.cuil} onChange={(e) => handleChange('cuil', e.target.value)} placeholder="INGRESE CUIL DEL EMPLEADO" />

                <Input label="D.N.I." value={formData.dni} onChange={(e) => handleChange('dni', e.target.value)} placeholder="INGRESE DNI DEL EMPLEADO" error={errors.dni} />
                <div className="w-full">
                    <Label>Lugar de Nacimiento</Label>
                    <Dropdown
                        options={places}
                        value={formData.lugarNacimiento}
                        onChange={(e) => handleChange('lugarNacimiento', e.value)}
                        placeholder="Seleccione"
                    />
                </div>
                <div className="w-full flex flex-col">
                    <Label>Fecha de Nacimiento</Label>
                    <Calendar
                        value={formData.fechaNacimiento}
                        onChange={(e) => handleChange('fechaNacimiento', e.value)}
                        showIcon
                        className="compact-calendar-input w-full border border-secondary/30 rounded-lg"
                        panelClassName="compact-calendar-panel"
                        placeholder="dd/mm/aaaa"
                    />
                </div>

                <div className="w-full flex flex-col">
                    <Label>Fecha Inicio según AFIP</Label>
                    <Calendar
                        value={formData.fechaInicio}
                        onChange={(e) => handleChange('fechaInicio', e.value)}
                        showIcon
                        className="compact-calendar-input w-full border border-secondary/30 rounded-lg"
                        panelClassName="compact-calendar-panel"
                        placeholder="dd/mm/aaaa"
                    />
                </div>
                <Input label="Sindicato" value={formData.sindicato} onChange={(e) => handleChange('sindicato', e.target.value)} placeholder="INGRESE NOMBRE DEL SINDICATO" />
                <Input label="Convenio" value={formData.convenio} onChange={(e) => handleChange('convenio', e.target.value)} placeholder="INGRESE NOMBRE DEL CONVENIO" />

                <Input label="Teléfono" value={formData.telefono} onChange={(e) => handleChange('telefono', e.target.value)} placeholder="INGRESE TELÉFONO DEL EMPLEADO" />
                <div className="md:col-span-2">
                    <Input label="Dirección/Detalle Adicional" value={formData.direccion} onChange={(e) => handleChange('direccion', e.target.value)} placeholder="INGRESE DIRECCIÓN DEL EMPLEADO" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <Label>Género</Label>
                    <div className="flex gap-4 mt-2">
                        {genderOptions.map(opt => (
                            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="genero"
                                    value={opt.value}
                                    checked={formData.genero === opt.value}
                                    onChange={(e) => handleChange('genero', e.target.value)}
                                    className="accent-primary"
                                />
                                <span className="text-sm text-secondary-dark">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <Label className="mb-2 block">¿Es chofer?</Label>
                <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
                    <button
                        onClick={() => handleChange('esChofer', true)}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${formData.esChofer ? 'bg-[#2970fa] text-white shadow-sm' : 'text-secondary hover:bg-gray-200'}`}
                    >
                        Si
                    </button>
                    <button
                        onClick={() => handleChange('esChofer', false)}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${!formData.esChofer ? 'bg-[#2970fa] text-white shadow-sm' : 'text-secondary hover:bg-gray-200'}`}
                    >
                        No
                    </button>
                </div>
            </div>

            <div className="bg-secondary-light p-4 md:px-8 md:py-4 border-t border-secondary/20 flex flex-col-reverse gap-3 md:flex-row md:justify-end md:items-center mt-8 -mx-6 md:-mx-8 -mb-6 md:-mb-8 rounded-b-xl">
                <button
                    onClick={handleNextStep}
                    className="text-white bg-primary hover:bg-primary-hover font-bold rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center gap-2 shadow-md transition-all w-full md:w-auto"
                >
                    Siguiente <i className="pi pi-arrow-right"></i>
                </button>
            </div>
        </div>
    );
};

export default EmployeeData;

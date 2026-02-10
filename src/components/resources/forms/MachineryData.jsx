import React, { useState, useEffect } from 'react';
import SectionTitle from '../../ui/SectionTitle';
import Input from '../../ui/Input';
import Label from '../../ui/Label';
import Select from '../../ui/Select';
import Dropdown from '../../ui/Dropdown';
import { MOCK_EMPLOYEES } from '../../../data/mockResources';

const MachineryData = ({ data, onChange, onNext }) => {
    const [formData, setFormData] = useState({
        codigo: '',
        marca: '',
        modelo: '',
        patente: '',
        chasis: '',
        motor: '',
        anio: '',
        tipoMaquinaria: '',
        tieneChofer: false,
        choferAsignado: null,
        tieneGNC: false,
        ...data
    });

    const [errors, setErrors] = useState({});

    // Mocks
    const types = [
        { label: 'Excavadora', value: 'Excavadora' },
        { label: 'Motoniveladora', value: 'Motoniveladora' },
        { label: 'Montacargas', value: 'Montacargas' },
        { label: 'Generador', value: 'Generador' }
    ];

    const driverCandidates = MOCK_EMPLOYEES;

    useEffect(() => {
        setFormData(prev => ({ ...prev, ...data }));
    }, [data]);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.codigo) newErrors.codigo = 'Requerido';
        // Patente might be N/A for machinery
        // if (!formData.patente) newErrors.patente = 'Requerido'; 
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
            <SectionTitle title="Datos de la Maquinaria" subtitle="Información técnica del equipo." />

            <div className="mb-6 flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                    <i className="pi pi-cog text-2xl"></i>
                </div>
                <div>
                    <button className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3 py-1.5 rounded mr-2 transition-colors">Cargar</button>
                    <button className="bg-white border border-gray-300 text-secondary text-xs font-bold px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">Limpiar</button>
                    <p className="text-[10px] text-gray-400 mt-1">Imagen en formato JPG, GIF o PNG. Tamaño Máx 100kB</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Input label="Código" value={formData.codigo} onChange={(e) => handleChange('codigo', e.target.value)} placeholder="0001" error={errors.codigo} />
                <Input label="Marca" value={formData.marca} onChange={(e) => handleChange('marca', e.target.value)} placeholder="CAT" />
                <Input label="Modelo" value={formData.modelo} onChange={(e) => handleChange('modelo', e.target.value)} placeholder="320" />

                <Input label="Patente" value={formData.patente} onChange={(e) => handleChange('patente', e.target.value)} placeholder="N/A" error={errors.patente} />
                <Input label="Número de Chasis" value={formData.chasis} onChange={(e) => handleChange('chasis', e.target.value)} placeholder="CH-123..." />
                <Input label="Número de Motor" value={formData.motor} onChange={(e) => handleChange('motor', e.target.value)} placeholder="M-456..." />

                <Input label="Año" value={formData.anio} onChange={(e) => handleChange('anio', e.target.value)} placeholder="2023" />

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="w-full">
                        <Label>Tipo de Maquinaria</Label>
                        <Select options={types} value={formData.tipoMaquinaria} onChange={(e) => handleChange('tipoMaquinaria', e.target.value)} placeholder="Seleccione" />
                    </div>

                    <div>
                        <Label className="mb-2 block">¿Tiene chofer?</Label>
                        <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
                            <button
                                onClick={() => handleChange('tieneChofer', true)}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${formData.tieneChofer ? 'bg-[#2970fa] text-white shadow-sm' : 'text-secondary hover:bg-gray-200'}`}
                            >
                                Si
                            </button>
                            <button
                                onClick={() => handleChange('tieneChofer', false)}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${!formData.tieneChofer ? 'bg-[#2970fa] text-white shadow-sm' : 'text-secondary hover:bg-gray-200'}`}
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>

                {/* Conditional Driver Select */}
                {formData.tieneChofer && (
                    <div className="md:col-span-1 animate-fade-in">
                        <Label>Nombre del chofer</Label>
                        <Dropdown
                            value={formData.choferAsignado}
                            options={driverCandidates}
                            onChange={(e) => handleChange('choferAsignado', e.value)}
                            optionLabel="nombre"
                            placeholder="Seleccione"
                            className="w-full"
                            filter
                            pt={undefined}
                        />
                    </div>
                )}

                <div className="md:col-span-1">
                    <Label className="mb-2 block">¿Tiene GNC?</Label>
                    <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
                        <button
                            onClick={() => handleChange('tieneGNC', true)}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${formData.tieneGNC ? 'bg-[#2970fa] text-white shadow-sm' : 'text-secondary hover:bg-gray-200'}`}
                        >
                            Si
                        </button>
                        <button
                            onClick={() => handleChange('tieneGNC', false)}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${!formData.tieneGNC ? 'bg-[#2970fa] text-white shadow-sm' : 'text-secondary hover:bg-gray-200'}`}
                        >
                            No
                        </button>
                    </div>
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

export default MachineryData;

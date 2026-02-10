import React, { useState, useEffect } from 'react';
import SectionTitle from '../../ui/SectionTitle';
import Dropdown from '../../ui/Dropdown';
import Label from '../../ui/Label';

const AssignmentData = ({ data, onChange, onBack, onSubmit }) => {
    // Mock Options
    const categories = [
        { label: 'ÚNICA', value: 'UNICA' },
        { label: 'OFICIAL', value: 'OFICIAL' },
        { label: 'AYUDANTE', value: 'AYUDANTE' }
    ];

    const areas = [
        { label: 'SAN LUIS Y VILLA MERCEDES', value: 'SL_VM' },
        { label: 'MENDOZA', value: 'MDZ' },
        { label: 'CORDOBA', value: 'CBA' }
    ];

    const services = [
        { label: 'MANTENIMIENTO', value: 'MANTENIMIENTO' },
        { label: 'LIMPIEZA', value: 'LIMPIEZA' },
        { label: 'SEGURIDAD', value: 'SEGURIDAD' },
        { label: 'LOGISTICA', value: 'LOGISTICA' }
    ];

    const [formData, setFormData] = useState({
        categoria: '',
        area: '',
        servicio: '',
        ...data
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        setFormData(prev => ({ ...prev, ...data }));
    }, [data]);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.categoria) newErrors.categoria = 'Este campo es obligatorio.';
        if (!formData.area) newErrors.area = 'Este campo es obligatorio.';
        if (!formData.servicio) newErrors.servicio = 'Este campo es obligatorio.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            onSubmit(formData);
        }
    };



    return (
        <div className="bg-white p-6 md:p-8 rounded-xl border border-secondary/20 shadow-sm animate-fade-in max-w-5xl mx-auto">
            <SectionTitle title="Datos de Asignación" subtitle="Detalles." />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="w-full">
                    <Label className={errors.categoria ? 'text-red-500' : ''}>Categoría</Label>
                    <Dropdown
                        value={formData.categoria}
                        options={categories}
                        onChange={(e) => handleChange('categoria', e.value)}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="SELECCIONE CATEGORÍA"
                        className="w-full"
                        error={errors.categoria}
                    />
                    {errors.categoria && <small className="text-red-500 text-xs mt-1 block">{errors.categoria}</small>}
                </div>

                <div className="w-full">
                    <Label className={errors.area ? 'text-red-500' : ''}>Área</Label>
                    <Dropdown
                        value={formData.area}
                        options={areas}
                        onChange={(e) => handleChange('area', e.value)}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="SELECCIONE ÁREA"
                        className="w-full"
                        error={errors.area}
                    />
                    {errors.area && <small className="text-red-500 text-xs mt-1 block">{errors.area}</small>}
                </div>

                <div className="w-full">
                    <Label className={errors.servicio ? 'text-red-500' : ''}>Servicio</Label>
                    <Dropdown
                        value={formData.servicio}
                        options={services}
                        onChange={(e) => handleChange('servicio', e.value)}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="SELECCIONE SERVICIO"
                        className="w-full"
                        error={errors.servicio}
                    />

                    {errors.servicio && <small className="text-red-500 text-xs mt-1 block">{errors.servicio}</small>}
                </div>
            </div>

            <div className="bg-secondary-light p-4 md:px-8 md:py-4 border-t border-secondary/20 flex flex-col-reverse gap-3 md:flex-row md:justify-between md:items-center mt-8 -mx-6 md:-mx-8 -mb-6 md:-mb-8 rounded-b-xl">
                <div className="w-full md:w-auto">
                    <button
                        onClick={onBack}
                        className="text-secondary hover:text-secondary-dark font-medium rounded-lg text-sm px-5 py-2.5 transition-all flex items-center justify-center gap-2 hover:bg-black/5 w-full md:w-auto"
                    >
                        <i className="pi pi-arrow-left"></i> Anterior
                    </button>
                </div>
                <div className="w-full md:w-auto">
                    <button
                        onClick={handleNext}
                        className="text-white bg-primary hover:bg-primary-hover font-bold rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center gap-2 shadow-md transition-all w-full md:w-auto"
                    >
                        Siguiente <i className="pi pi-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignmentData;

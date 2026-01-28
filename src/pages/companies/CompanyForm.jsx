import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';

const CompanyForm = ({ initialData = {} }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        razonSocial: initialData.razonSocial || '',
        cuit: initialData.cuit || '',
        descripcion: initialData.descripcion || '',
        rubro: initialData.rubro || '',
        grupo: initialData.grupo || '',
        estatus: initialData.estatus || 'ACTIVO'
    });

    const rubros = [
        { label: 'Tecnología', value: 'Tecnología' },
        { label: 'Construcción', value: 'Construcción' },
        { label: 'Minería', value: 'Minería' },
        { label: 'Agro', value: 'Agro' },
        { label: 'Logística', value: 'Logística' },
        { label: 'Energía', value: 'Energía' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Guardando empresa:', formData);
        navigate('/empresas');
    };

    return (
        <div className="animate-fade-in w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/empresas')}
                    className="w-10 h-10 rounded-full bg-white border border-secondary/20 flex items-center justify-center text-secondary hover:text-primary hover:border-primary transition-all shadow-sm"
                >
                    <i className="pi pi-arrow-left"></i>
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-secondary-dark">Nueva Empresa</h1>
                    <p className="text-secondary text-sm">Registre una nueva empresa cliente en el sistema.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-secondary/20 shadow-sm p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-secondary uppercase tracking-wide">Razón Social</label>
                            <InputText
                                value={formData.razonSocial}
                                onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                                className="w-full p-3 border border-secondary/30 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                placeholder="Ej. Tech Solutions S.A."
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-secondary uppercase tracking-wide">CUIT</label>
                            <InputText
                                value={formData.cuit}
                                onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
                                className="w-full p-3 border border-secondary/30 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm"
                                placeholder="30-00000000-0"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-secondary uppercase tracking-wide">Descripción</label>
                        <InputTextarea
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            rows={3}
                            className="w-full p-3 border border-secondary/30 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                            placeholder="Breve descripción de la actividad principal..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-secondary uppercase tracking-wide">Rubro</label>
                            <Dropdown
                                value={formData.rubro}
                                options={rubros}
                                onChange={(e) => setFormData({ ...formData, rubro: e.value })}
                                optionLabel="label"
                                placeholder="Seleccione un rubro"
                                className="w-full border border-secondary/30 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                pt={{
                                    root: { className: 'w-full flex items-center h-[46px]' },
                                    input: { className: 'p-3' }
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-secondary uppercase tracking-wide">Grupo Empresarial</label>
                            <InputText
                                value={formData.grupo}
                                onChange={(e) => setFormData({ ...formData, grupo: e.target.value })}
                                className="w-full p-3 border border-secondary/30 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Ej. Grupo Tech"
                            />
                        </div>
                    </div>

                    <div className="pt-8 border-t border-secondary/10 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/empresas')}
                            className="px-6 py-2.5 rounded-lg border border-secondary/20 text-secondary font-bold hover:bg-gray-50 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-primary/30 transition-all transform active:scale-95"
                        >
                            Crear Empresa
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompanyForm;

import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { MOCK_SUPPLIERS } from '../../data/mockSuppliers';

const AuditorForm = ({ onSubmit, onBack, initialData = {}, readOnly = false }) => {
    const [formData, setFormData] = useState({
        nombre: initialData.nombre || '',
        apellido: initialData.apellido || '',
        matricula: initialData.matricula || '',
        tipo: initialData.tipo || null,
        empresas: initialData.empresas || []
    });

    const tiposAuditor = [
        { label: 'Auditor Legal', value: 'LEGAL' },
        { label: 'Auditor Técnico', value: 'TECNICO' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className={`bg-white p-6 rounded-xl border border-secondary/20 shadow-sm animate-fade-in ${readOnly ? 'opacity-90' : ''}`}>
            {!readOnly && (
                <>
                    <h2 className="text-xl font-bold text-secondary-dark mb-1">Datos del Auditor</h2>
                    <p className="text-sm text-secondary mb-6">Complete la información profesional del auditor y asigne las empresas bajo su alcance.</p>
                </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Nombre</label>
                        <InputText
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full p-2 border border-secondary/30 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm disabled:bg-gray-50 disabled:text-secondary-dark disabled:opacity-100 disabled:font-medium"
                            placeholder="Ej. Juan"
                            required
                            disabled={readOnly}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Apellido</label>
                        <InputText
                            value={formData.apellido}
                            onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                            className="w-full p-2 border border-secondary/30 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm disabled:bg-gray-50 disabled:text-secondary-dark disabled:opacity-100 disabled:font-medium"
                            placeholder="Ej. Pérez"
                            required
                            disabled={readOnly}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Matrícula</label>
                        <InputText
                            value={formData.matricula}
                            onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                            className="w-full p-2 border border-secondary/30 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm disabled:bg-gray-50 disabled:text-secondary-dark disabled:opacity-100 disabled:font-medium"
                            placeholder="Ej. T-4509"
                            required
                            disabled={readOnly}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Tipo de Auditoría</label>
                        <Dropdown
                            value={formData.tipo}
                            options={tiposAuditor}
                            onChange={(e) => setFormData({ ...formData, tipo: e.value })}
                            optionLabel="label"
                            placeholder="Seleccione..."
                            className="w-full border border-secondary/30 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm disabled:bg-gray-50 disabled:text-secondary-dark disabled:opacity-100 disabled:font-medium"
                            pt={{
                                root: { className: 'w-full h-[38px] flex items-center' },
                                input: { className: 'text-sm p-2' }
                            }}
                            required
                            disabled={readOnly}
                        />
                    </div>
                </div>

                {/* HIDE COMPANIES IN READ-ONLY MODE (Profile Tab) */}
                {!readOnly && (
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Empresas Asignadas (Opcional)</label>
                        <MultiSelect
                            value={formData.empresas}
                            options={MOCK_SUPPLIERS}
                            onChange={(e) => setFormData({ ...formData, empresas: e.value })}
                            optionLabel="razonSocial"
                            placeholder="Seleccione empresas a auditar..."
                            display="chip"
                            filter
                            className="w-full border border-secondary/30 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm disabled:opacity-70"
                            pt={{
                                root: { className: 'w-full flex items-center min-h-[38px] py-1' },
                                label: { className: 'text-sm px-2 py-0' },
                                token: { className: 'bg-primary/10 text-primary text-[10px] py-0.5 px-2' },
                                item: { className: 'p-2 text-sm hover:bg-primary/5' },
                                header: { className: 'p-2' },
                                checkbox: {
                                    root: { className: 'mr-2' },
                                    box: { className: 'border border-primary/40 bg-primary/5 data-[p-highlight=true]:bg-primary/80 data-[p-highlight=true]:border-primary text-white w-5 h-5 transition-all' },
                                    icon: { className: 'text-xs font-bold' }
                                }
                            }}
                            disabled={readOnly}
                        />
                        <small className="text-xs text-secondary/60">Puede dejarlo vacío y asignarlas más tarde.</small>
                    </div>
                )}

                {!readOnly && (
                    <div className="flex justify-between items-center pt-6 border-t border-secondary/10 mt-6">
                        <button
                            type="button"
                            onClick={onBack}
                            className="text-secondary hover:text-black font-medium flex items-center gap-2 transition-colors"
                        >
                            <i className="pi pi-arrow-left"></i> Volver
                        </button>
                        <button
                            type="submit"
                            className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-primary/30 transition-all transform active:scale-95"
                        >
                            Guardar y Finalizar
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default AuditorForm;

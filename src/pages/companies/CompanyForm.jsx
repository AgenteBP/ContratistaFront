import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { groupService } from '../../services/groupService';

const CompanyForm = ({ initialData, onSubmit, onBack, title = "Nueva Empresa", subtitle = "Complete los datos de la empresa." }) => {
    const [formData, setFormData] = useState({
        razonSocial: initialData?.description || '',
        cuit: initialData?.cuit || '',
        requiereTecnico: initialData?.requiredTechnical || false,
        idGroup: null,
        userNewGroup: false,
        newGroupName: '',
        newGroupIcon: 'pi-tag'
    });
    const [groups, setGroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchGroups = async () => {
            setLoadingGroups(true);
            try {
                const data = await groupService.getAll();
                setGroups(data || []);
            } catch (error) {
                console.error("Error fetching groups:", error);
            } finally {
                setLoadingGroups(false);
            }
        };
        fetchGroups();
    }, []);

    const icons = [
        { label: 'Etiqueta', value: 'pi-tag' },
        { label: 'Maletín', value: 'pi-briefcase' },
        { label: 'Caja', value: 'pi-box' },
        { label: 'Escudo', value: 'pi-shield' },
        { label: 'Cámara', value: 'pi-camera' },
        { label: 'Mundo', value: 'pi-globe' },
        { label: 'Estrella', value: 'pi-star' },
        { label: 'Herramientas', value: 'pi-wrench' },
        { label: 'Camión', value: 'pi-truck' },
        { label: 'Usuarios', value: 'pi-users' }
    ];

    const validate = () => {
        let newErrors = {};
        if (!formData.razonSocial.trim()) {
            newErrors.razonSocial = 'La razón social es obligatoria.';
        }

        if (!formData.cuit || formData.cuit.includes('_')) {
            newErrors.cuit = 'El CUIT es obligatorio y debe estar completo.';
        }

        if (!formData.userNewGroup && !formData.idGroup) {
            newErrors.group = 'Debe seleccionar un grupo existente o crear uno nuevo.';
        }

        if (formData.userNewGroup && !formData.newGroupName.trim()) {
            newErrors.newGroupName = 'El nombre del nuevo grupo es obligatorio.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            // Adaptar al DTO esperado por el Backend
            const payload = {
                description: formData.razonSocial,
                cuit: formData.cuit.replace(/-/g, ''), // Send clean CUIT
                required_technical: formData.requiereTecnico,
                id_group: formData.userNewGroup ? null : formData.idGroup,
                newGroupName: formData.userNewGroup ? formData.newGroupName : null,
                newGroupIcon: formData.userNewGroup ? formData.newGroupIcon : null
            };
            onSubmit(payload);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-secondary/20 shadow-sm animate-fade-in">
            <div className="text-center mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="pi pi-building text-xl text-primary"></i>
                </div>
                <h3 className="text-xl font-bold text-secondary-dark">{title}</h3>
                <p className="text-sm text-secondary">{subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">

                {/* Grupo Association */}
                <div className="bg-gray-50/50 p-4 rounded-xl border border-secondary/10 space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <label className="block text-xs font-bold text-secondary uppercase tracking-wider">
                            Asignación de Grupo <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                inputId="userNewGroup"
                                checked={formData.userNewGroup}
                                onChange={(e) => setFormData({ ...formData, userNewGroup: e.checked, idGroup: e.checked ? null : formData.idGroup })}
                            />
                            <label htmlFor="userNewGroup" className="text-xs font-medium text-secondary cursor-pointer">Nuevo Grupo</label>
                        </div>
                    </div>

                    {!formData.userNewGroup ? (
                        <div className="field">
                            <Dropdown
                                value={formData.idGroup}
                                options={groups}
                                optionLabel="description"
                                optionValue="idGroup"
                                onChange={(e) => setFormData({ ...formData, idGroup: e.value })}
                                placeholder={loadingGroups ? "Cargando grupos..." : "Seleccione un grupo..."}
                                className={classNames('w-full', { 'p-invalid': errors.group })}
                                itemTemplate={(option) => (
                                    <div className="flex items-center gap-2">
                                        <i className={classNames('pi', option.icon || 'pi-tag', 'text-secondary/60')}></i>
                                        <span>{option.description}</span>
                                    </div>
                                )}
                                filter
                                disabled={loadingGroups}
                            />
                            {errors.group && <small className="p-error block mt-1">{errors.group}</small>}
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in-down">
                            <div className="field">
                                <InputText
                                    value={formData.newGroupName}
                                    onChange={(e) => setFormData({ ...formData, newGroupName: e.target.value })}
                                    className={classNames('w-full p-2.5 text-sm', { 'p-invalid': errors.newGroupName })}
                                    placeholder="Nombre del nuevo grupo"
                                />
                                {errors.newGroupName && <small className="p-error block mt-1">{errors.newGroupName}</small>}
                            </div>

                            <div className="field">
                                <label className="block text-[10px] font-bold text-secondary uppercase tracking-tighter mb-1.5 ml-1">Icono del Grupo</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {icons.map(icon => (
                                        <button
                                            key={icon.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, newGroupIcon: icon.value })}
                                            className={classNames(
                                                'flex items-center justify-center p-2 rounded-lg border transition-all',
                                                formData.newGroupIcon === icon.value
                                                    ? 'bg-primary/10 border-primary text-primary shadow-sm'
                                                    : 'bg-white border-secondary/20 text-secondary hover:border-secondary/40'
                                            )}
                                            title={icon.label}
                                        >
                                            <i className={classNames('pi', icon.value, 'text-lg')}></i>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Razón Social */}
                <div className="field">
                    <label htmlFor="razonSocial" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2 px-1">
                        Razón Social / Descripción Empresa <span className="text-red-500">*</span>
                    </label>
                    <InputText
                        id="razonSocial"
                        value={formData.razonSocial}
                        onChange={(e) => {
                            setFormData({ ...formData, razonSocial: e.target.value });
                            if (errors.razonSocial) setErrors({ ...errors, razonSocial: null });
                        }}
                        className={classNames('w-full p-2.5 text-sm', { 'p-invalid': errors.razonSocial })}
                        placeholder="Ej: Tech Solutions S.A."
                    />
                    {errors.razonSocial && <small className="p-error block mt-1">{errors.razonSocial}</small>}
                </div>

                {/* CUIT */}
                <div className="field">
                    <label htmlFor="cuit" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2 px-1">
                        CUIT <span className="text-red-500">*</span>
                    </label>
                    <InputMask
                        id="cuit"
                        mask="99-99999999-9"
                        value={formData.cuit}
                        onChange={(e) => {
                            setFormData({ ...formData, cuit: e.value });
                            if (errors.cuit) setErrors({ ...errors, cuit: null });
                        }}
                        className={classNames('w-full p-2.5 text-sm', { 'p-invalid': errors.cuit })}
                        placeholder="00-00000000-0"
                    />
                    {errors.cuit && <small className="p-error block mt-1">{errors.cuit}</small>}
                </div>

                {/* Requiere Técnico */}
                <div className="field flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-secondary/10">
                    <Checkbox
                        inputId="requiereTecnico"
                        onChange={(e) => setFormData({ ...formData, requiereTecnico: e.checked })}
                        checked={formData.requiereTecnico}
                    />
                    <label htmlFor="requiereTecnico" className="text-sm font-medium text-secondary-dark cursor-pointer select-none">
                        ¿Requiere Responsable Técnico?
                    </label>
                </div>

                {/* Botones */}
                <div className="flex justify-between items-center pt-6 border-t border-secondary/10 mt-8">
                    <button
                        type="button"
                        onClick={onBack}
                        className="text-secondary hover:text-black font-medium flex items-center gap-2 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
                    >
                        <i className="pi pi-arrow-left"></i> Volver
                    </button>
                    <button
                        type="submit"
                        className="bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-6 rounded-lg shadow-lg shadow-primary/30 transition-all flex items-center gap-2"
                    >
                        Crear Empresa <i className="pi pi-check"></i>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CompanyForm;

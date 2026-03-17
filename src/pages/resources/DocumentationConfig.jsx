import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { requirementService } from '../../services/requirementService';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/ui/Badges';
import { activeService } from '../../services/activeService';
import { TbBackhoe } from 'react-icons/tb';

const DocumentationConfig = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const idActiveType = parseInt(searchParams.get('type'));
    const idSupplier = parseInt(searchParams.get('supplier'));
    const idGroup = parseInt(searchParams.get('group'));

    const [requirements, setRequirements] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [subActives, setSubActives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Default periodicity labels for UI
    const PERIODICITY_OPTIONS = [
        { label: 'Mensual', value: 1 },
        { label: 'Anual', value: 2 },
        { label: 'Única vez', value: 3 },
        { label: 'Vigencia', value: 4 }
    ];

    const periodicityMap = {
        'MENSUAL': 1,
        'ANUAL': 2,
        'ÚNICA VEZ': 3,
        'VIGENCIA': 4
    };

    // New requirement state
    const [newReq, setNewReq] = useState({
        description: '',
        periodicity: 'MENSUAL',
        idTypeRequirements: 1, // Default to manual upload
        idActive: null
    });

    const resourceTypes = {
        1: { label: 'Empleado', icon: 'pi-users', color: 'text-success' },
        2: { label: 'Vehículo', icon: 'pi-car', color: 'text-primary' },
        4: { label: 'Maquinaria', icon: <TbBackhoe />, color: 'text-warning' }
    };

    const resource = resourceTypes[idActiveType] || { label: 'Desconocido', icon: 'pi-box', color: 'text-secondary' };

    useEffect(() => {
        if (!isAdmin) {
            navigate('/dashboard');
            return;
        }
        fetchInitialData();
    }, [idActiveType, idSupplier, idGroup]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [fetchedSuggestions, fetchedSubActives] = await Promise.all([
                requirementService.getListRequirements({
                    idActiveType,
                    idGroup
                }),
                activeService.getByType(idActiveType)
            ]);
            setSuggestions(fetchedSuggestions);
            setSubActives(fetchedSubActives);
            
            if (fetchedSubActives.length > 0) {
                setNewReq(prev => ({ ...prev, idActive: fetchedSubActives[0].id_active }));
            }
        } catch (error) {
            console.error("Error fetching documentation data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCustom = () => {
        if (!newReq.description || !newReq.idActive) return;

        const customReq = {
            id_list_requirements: null,
            description: newReq.description,
            isCustom: true,
            periodicityId: periodicityMap[newReq.periodicity] || 1,
            isRequired: true,
            idActive: newReq.idActive,
            typeRequirements: { description: 'Personalizado' }
        };

        setRequirements([...requirements, customReq]);
        setNewReq({ ...newReq, description: '' });
    };

    const handleAddRequirement = (sug) => {
        if (requirements.some(r => r.id_list_requirements === sug.id_list_requirements && !r.isCustom)) return;

        const newEntry = {
            ...sug,
            periodicityId: sug.attribute_template?.attributes?.id_periodicity || 1,
            isRequired: true
        };

        setRequirements([...requirements, newEntry]);
    };

    const handleUpdateRequirement = (index, field, value) => {
        const updated = [...requirements];
        updated[index][field] = value;
        setRequirements(updated);
    };

    const handleRemoveRequirement = (idx) => {
        setRequirements(requirements.filter((_, i) => i !== idx));
    };

    const handleResetSuggestions = () => {
        setRequirements([]);
    };

    const handleSave = async () => {
        if (requirements.length === 0) {
            alert("Seleccione al menos un requisito.");
            return;
        }

        setIsSaving(true);
        try {
            for (const req of requirements) {
                const payload = {
                    id_group: idGroup,
                    id_supplier: idSupplier,
                    list_requirements: req.isCustom ? {
                        description: req.description,
                        id_active: req.idActive,
                        id_type_requirements: 1,
                        attributes: {
                            description: req.description,
                            id_periodicity: req.periodicityId,
                            is_required: req.isRequired,
                            extension: 'ALFA_NUM'
                        }
                    } : {
                        id_list_requirements: req.id_list_requirements,
                        description: req.description,
                        id_active: req.idActive || idActiveType, // Fallback to main type
                        id_type_requirements: req.id_type_requirements || 1,
                        attributes: {
                            description: req.description,
                            id_periodicity: req.periodicityId,
                            is_required: req.isRequired,
                            extension: 'ALFA_NUM'
                        }
                    }
                };

                await requirementService.saveGroupRequirement(payload);
            }
            alert("Configuración de documentación guardada correctamente.");
            navigate(-1);
        } catch (error) {
            console.error("Error saving requirements:", error);
            alert("Ocurrió un error al guardar la configuración.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="animate-fade-in w-full pb-8 space-y-8">
            <PageHeader
                title="Configuración de Documentación"
                subtitle="Defina qué documentos se solicitarán al proveedor."
                icon="pi pi-cog"
                actionButton={
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-white border border-secondary/20 hover:bg-secondary-light text-secondary-dark font-bold rounded-lg shadow-sm text-sm px-4 py-2 transition-all"
                        >
                            Cancelar
                        </button>
                        <PrimaryButton
                            label={isSaving ? "Guardando..." : "Finalizar"}
                            icon={isSaving ? "pi pi-spin pi-spinner" : "pi pi-check"}
                            onClick={handleSave}
                            disabled={isSaving}
                        />
                    </div>
                }
            />

            {/* Context Bar - New Design */}
            <div className="bg-[#f8f9ff] p-6 rounded-3xl border border-secondary/10 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl border border-secondary/10 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">BASADO EN:</span>
                    </div>

                    <div className="bg-primary px-4 py-2 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm">
                        <i className="pi pi-building text-xs"></i>
                        GRUPO EDESAL
                    </div>

                    <div className="bg-white px-4 py-2 rounded-xl border border-secondary/10 text-secondary-dark font-bold text-xs uppercase tracking-wider">
                        {resource.label}
                    </div>
                </div>

                <button
                    onClick={handleResetSuggestions}
                    className="flex items-center gap-3 text-primary hover:bg-primary/5 px-4 py-2 rounded-2xl transition-all border border-transparent hover:border-primary/10"
                >
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                        <i className="pi pi-refresh text-xs"></i>
                    </div>
                    <span className="text-xs font-bold">Restablecer sugeridos</span>
                </button>
            </div>

            {/* Grid Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Add Card */}
                <div
                    onClick={() => setModalVisible(true)}
                    className="group cursor-pointer aspect-[4/5] border-2 border-dashed border-secondary/30 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-primary transition-all hover:bg-primary/5"
                >
                    <div className="w-16 h-16 rounded-full border-2 border-secondary/20 flex items-center justify-center group-hover:border-primary group-hover:bg-white transition-all">
                        <i className="pi pi-plus text-secondary group-hover:text-primary text-xl"></i>
                    </div>
                    <span className="text-sm font-bold text-secondary group-hover:text-primary uppercase tracking-widest">Agregar Requisito</span>
                </div>

                {/* Requirement Cards */}
                {requirements.map((req, index) => (
                    <div key={req.id_list_requirements || index} className="relative group aspect-[4/5] bg-white border border-secondary/10 rounded-[2rem] shadow-xl shadow-secondary/5 flex flex-col p-6 animate-scale-in">
                        {/* Remove button */}
                        <button
                            onClick={() => handleRemoveRequirement(index)}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-secondary/10 rounded-full flex items-center justify-center text-danger shadow-md hover:scale-110 transition-all z-10"
                        >
                            <i className="pi pi-times text-[10px] font-black"></i>
                        </button>

                        {/* Card Header: Icon + Title */}
                        <div className="flex gap-4 items-start mb-6">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 border border-primary/5">
                                <i className="pi pi-file-pdf text-xl text-primary font-bold"></i>
                            </div>
                            <h4 className="text-sm font-black text-secondary-dark leading-snug line-clamp-3">
                                {req.description}
                            </h4>
                        </div>

                        <div className="w-full h-px bg-secondary/5 mb-6"></div>

                        {/* Form Fields as in the image */}
                        <div className="space-y-6 flex-1">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-secondary/60 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <i className="pi pi-history text-[10px]"></i> PERIODICIDAD
                                </label>
                                <Dropdown
                                    value={req.periodicityId}
                                    options={PERIODICITY_OPTIONS}
                                    onChange={(e) => handleUpdateRequirement(index, 'periodicityId', e.value)}
                                    className="w-full h-12 border-none bg-slate-50/50 rounded-2xl flex items-center px-2 text-sm font-bold shadow-inner"
                                    pt={{
                                        root: { className: 'border-secondary/10' },
                                        input: { className: 'text-xs font-bold py-3' }
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-secondary/60 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <i className="pi pi-user text-[10px]"></i> REQUERIMIENTO
                                </label>
                                <div
                                    onClick={() => handleUpdateRequirement(index, 'isRequired', !req.isRequired)}
                                    className={`w-full h-12 rounded-2xl flex items-center px-4 gap-3 cursor-pointer border transition-all ${req.isRequired ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-slate-50/50 border-transparent text-secondary/40 shadow-inner'}`}
                                >
                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${req.isRequired ? 'bg-primary border-primary text-white shadow-sm' : 'bg-white border-secondary/20'}`}>
                                        {req.isRequired && <i className="pi pi-check text-[10px] font-bold"></i>}
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider">Obligatorio</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL: AGREGAR DOCUMENTO (Redesigned to match reference image) */}
            <Dialog
                header="Agregar Requisitos"
                visible={modalVisible}
                className="w-[95vw] md:w-[500px]"
                onHide={() => setModalVisible(false)}
                pt={{
                    root: { className: 'rounded-3xl border-none shadow-2xl overflow-hidden' },
                    header: { className: 'p-6 bg-white border-b border-secondary/5 text-secondary-dark font-black text-lg' },
                    content: { className: 'p-0 bg-white' }
                }}
            >
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* NEW FORM: Crear requisito personalizado */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-secondary-dark tracking-tight">Crear requisito personalizado</h4>

                        <div className="space-y-3">
                            {/* Resource Type Dropdown - Now showing categories like LEGAJO FISCAL */}
                            <Dropdown
                                value={newReq.idActive}
                                options={subActives}
                                optionLabel="description"
                                optionValue="id_active"
                                onChange={(e) => setNewReq({ ...newReq, idActive: e.value })}
                                placeholder="Seleccione el Activo (Obligatorio)"
                                className="w-full h-12 border border-warning/40 bg-white rounded-xl flex items-center px-2 text-sm font-medium shadow-sm transition-all focus:border-warning"
                                pt={{
                                    root: { className: 'border-warning/40' },
                                    input: { className: 'text-xs font-bold' }
                                }}
                            />

                            {/* Periodicity with Icon - Fixed icon overlap */}
                            <div className="relative">
                                <Dropdown
                                    value={newReq.periodicity}
                                    options={Object.keys(periodicityMap)}
                                    onChange={(e) => setNewReq({ ...newReq, periodicity: e.value })}
                                    className="w-full h-12 border border-secondary/20 bg-white rounded-xl flex items-center px-2 text-sm font-medium"
                                    pt={{
                                        input: { className: 'pr-10 text-xs font-bold' },
                                        trigger: { className: 'pr-8' } // Move the arrow left
                                    }}
                                />
                                <i className="pi pi-clock absolute right-3 top-1/2 -translate-y-1/2 text-secondary/40 text-sm"></i>
                            </div>

                            {/* Name and Create Button */}
                            <div className="flex gap-2">
                                <InputText
                                    value={newReq.description}
                                    onChange={(e) => setNewReq({ ...newReq, description: e.target.value })}
                                    placeholder="Nombre del documento..."
                                    className="flex-1 text-sm border border-secondary/20 h-12 rounded-xl px-4 outline-none focus:border-primary transition-all"
                                />
                                <button
                                    disabled={!newReq.description}
                                    onClick={handleCreateCustom}
                                    className={`px-6 h-12 rounded-xl font-bold text-sm transition-all ${newReq.description ? 'bg-[#b0b8ff] text-white hover:bg-primary shadow-md' : 'bg-secondary/10 text-secondary cursor-not-allowed'}`}
                                >
                                    Crear
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SUGGESTIONS: Grouped by resource type as in the photo */}
                    <div className="space-y-4 pt-4 border-t border-secondary/5">
                        <div className="bg-[#f8f9ff] p-2 rounded-lg flex items-center gap-2">
                            <i className="pi pi-folder-open text-[#b0b8ff] text-xs"></i>
                            <span className="text-[10px] font-black text-[#6d7dfb] uppercase tracking-wider">{resource.label.toUpperCase()}</span>
                        </div>

                        {loading ? (
                            <div className="text-center py-6">
                                <i className="pi pi-spin pi-spinner text-primary text-xl"></i>
                            </div>
                        ) : suggestions.length === 0 ? (
                            <p className="text-xs text-secondary/50 italic text-center py-4">No hay sugerencias disponibles</p>
                        ) : (
                            <div className="flex flex-col gap-0">
                                {suggestions.map((sug) => {
                                    const isAdded = requirements.some(r => r.id_list_requirements === sug.id_list_requirements && !r.isCustom);
                                    return (
                                        <div
                                            key={sug.id_list_requirements}
                                            onClick={() => !isAdded && handleAddRequirement(sug)}
                                            className={`py-4 border-b border-secondary/5 transition-all flex items-center justify-between group cursor-pointer ${isAdded ? 'opacity-40 cursor-default' : 'hover:bg-slate-50/50'}`}
                                        >
                                            <span className={`text-sm font-black tracking-tight ${isAdded ? 'text-secondary' : 'text-secondary-dark group-hover:text-primary'}`}>
                                                {sug.description}
                                            </span>
                                            {isAdded && <i className="pi pi-check text-success text-xs"></i>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default DocumentationConfig;

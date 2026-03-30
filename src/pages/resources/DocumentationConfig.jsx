import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { requirementService } from '../../services/requirementService';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { useAuth } from '../../context/AuthContext';
import { activeService } from '../../services/activeService';
import { TbBackhoe } from 'react-icons/tb';
import LoadingOverlay from '../../components/ui/LoadingOverlay';

/**
 * Paleta de colores asignada a cada sub-activo (id_active).
 * Se cicla si hay más activos que colores definidos.
 */
const ACTIVE_COLORS = [
    { border: 'border-red-200',    bg: 'bg-red-50/60',      header: 'bg-red-100',      text: 'text-red-700',      dot: 'bg-red-400'      },
    { border: 'border-blue-200',   bg: 'bg-blue-50/60',     header: 'bg-blue-100',     text: 'text-blue-700',     dot: 'bg-blue-400'     },
    { border: 'border-emerald-200',bg: 'bg-emerald-50/60',  header: 'bg-emerald-100',  text: 'text-emerald-700',  dot: 'bg-emerald-400'  },
    { border: 'border-amber-200',  bg: 'bg-amber-50/60',    header: 'bg-amber-100',    text: 'text-amber-700',    dot: 'bg-amber-400'    },
    { border: 'border-purple-200', bg: 'bg-purple-50/60',   header: 'bg-purple-100',   text: 'text-purple-700',   dot: 'bg-purple-400'   },
    { border: 'border-pink-200',   bg: 'bg-pink-50/60',     header: 'bg-pink-100',     text: 'text-pink-700',     dot: 'bg-pink-400'     },
];

const DocumentationConfig = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const idActiveType = parseInt(searchParams.get('type'));
    const idSupplier   = parseInt(searchParams.get('supplier'));
    const idGroup      = parseInt(searchParams.get('group'));

    const [requirements,     setRequirements]     = useState([]);
    const [savedRequirements,setSavedRequirements] = useState([]);
    const [suggestions,      setSuggestions]      = useState([]);
    const [subActives,       setSubActives]        = useState([]);
    const [loading,          setLoading]           = useState(true);
    const [isSaving,         setIsSaving]          = useState(false);
    const [modalVisible,     setModalVisible]      = useState(false);
    const [overlayStatus,    setOverlayStatus]     = useState(null);
    const [overlayMessage,   setOverlayMessage]    = useState('');

    const PERIODICITY_OPTIONS = [
        { label: 'Mensual',    value: 1 },
        { label: 'Anual',      value: 2 },
        { label: 'Única vez',  value: 3 },
        { label: 'Vigencia',   value: 4 }
    ];

    const periodicityMap = {
        'MENSUAL':    1,
        'ANUAL':      2,
        'ÚNICA VEZ':  3,
        'VIGENCIA':   4
    };

    const resourceTypes = {
        1: { label: 'Empleado',   icon: 'pi-users', color: 'text-success'  },
        2: { label: 'Vehículo',   icon: 'pi-car',   color: 'text-primary'  },
        4: { label: 'Maquinaria', icon: <TbBackhoe />, color: 'text-warning' }
    };

    const resource = resourceTypes[idActiveType] || { label: 'Desconocido', icon: 'pi-box', color: 'text-secondary' };

    const [newReq, setNewReq] = useState({
        description:        '',
        periodicity:        'MENSUAL',
        idTypeRequirements: 1,
        idActive:           null
    });

    // Refs a cada sección de activo para hacer scroll tras agregar un requisito
    const groupRefs = useRef({});

    useEffect(() => {
        if (!isAdmin) { navigate('/dashboard'); return; }
        fetchInitialData();
    }, [idActiveType, idSupplier, idGroup]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [fetchedSuggestions, fetchedSubActives, fetchedSaved] = await Promise.all([
                requirementService.getListRequirements({ idActiveType, idGroup }),
                activeService.getByType(idActiveType),
                /**
                 * Endpoint: GET /group_requirements/details?idSupplier&idGroup&idActiveType
                 * Devuelve los GroupRequirementsFullDTO ya guardados para este proveedor/grupo/tipo.
                 * Usado aquí para mostrar los requisitos existentes agrupados por sub-activo.
                 */
                requirementService.getGroupRequirementsDetails({ idSupplier, idGroup, idActiveType })
            ]);

            setSuggestions(fetchedSuggestions);
            setSubActives(fetchedSubActives);
            setSavedRequirements(fetchedSaved || []);

            if (fetchedSubActives.length > 0) {
                setNewReq(prev => ({ ...prev, idActive: fetchedSubActives[0].id_active }));
            }
        } catch (error) {
            console.error("Error fetching documentation data:", error);
        } finally {
            setLoading(false);
        }
    };

    // ─── Handlers ────────────────────────────────────────────────────────────

    const scrollToGroup = (idActive) => {
        setTimeout(() => {
            groupRefs.current[idActive]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120); // espera a que React renderice el nuevo card
    };

    const handleCreateCustom = () => {
        if (!newReq.description || !newReq.idActive) return;
        const customReq = {
            id_list_requirements: null,
            description:          newReq.description,
            isCustom:             true,
            periodicityId:        periodicityMap[newReq.periodicity] || 1,
            isRequired:           true,
            idActive:             newReq.idActive,
            typeRequirements:     { description: 'Personalizado' }
        };
        setRequirements(prev => [...prev, customReq]);
        setNewReq(prev => ({ ...prev, description: '' }));
        setModalVisible(false);
        scrollToGroup(newReq.idActive);
    };

    const handleAddRequirement = (sug) => {
        if (requirements.some(r => r.id_list_requirements === sug.id_list_requirements && !r.isCustom)) return;
        const targetIdActive = sug.attribute_template?.id_active || newReq.idActive;
        const newEntry = {
            ...sug,
            periodicityId: sug.attribute_template?.attributes?.id_periodicity || 1,
            isRequired:    true,
            idActive:      targetIdActive
        };
        setRequirements(prev => [...prev, newEntry]);
        setModalVisible(false);
        scrollToGroup(targetIdActive);
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
            setOverlayStatus('error');
            setOverlayMessage('Seleccione al menos un requisito.');
            setTimeout(() => setOverlayStatus(null), 2500);
            return;
        }

        setIsSaving(true);
        setOverlayStatus('loading');
        setOverlayMessage('Guardando configuración...');
        try {
            for (const req of requirements) {
                const payload = {
                    id_group:    idGroup,
                    id_supplier: idSupplier,
                    list_requirements: req.isCustom ? {
                        description:           req.description,
                        id_active:             req.idActive,
                        id_type_requirements:  1,
                        attributes: {
                            description:    req.description,
                            id_periodicity: req.periodicityId,
                            is_required:    req.isRequired,
                            extension:      'ALFA_NUM'
                        }
                    } : {
                        id_list_requirements:  req.id_list_requirements,
                        description:           req.description,
                        id_active:             req.idActive || idActiveType,
                        id_type_requirements:  req.id_type_requirements || 1,
                        attributes: {
                            description:    req.description,
                            id_periodicity: req.periodicityId,
                            is_required:    req.isRequired,
                            extension:      'ALFA_NUM'
                        }
                    }
                };
                await requirementService.saveGroupRequirement(payload);
            }
            setOverlayStatus('success');
            setOverlayMessage('Configuración de documentación guardada correctamente.');
            setTimeout(() => {
                setOverlayStatus(null);
                navigate('/recursos');
            }, 1800);
        } catch (error) {
            console.error("Error saving requirements:", error);
            setOverlayStatus('error');
            setOverlayMessage('Ocurrió un error al guardar la configuración.');
            setTimeout(() => setOverlayStatus(null), 2500);
        } finally {
            setIsSaving(false);
        }
    };

    // ─── Computed groups ─────────────────────────────────────────────────────

    /**
     * Agrupa los requisitos guardados y pendientes por sub-activo.
     * Solo incluye grupos que tengan al menos un requisito (guardado o pendiente).
     * El color se asigna por índice dentro del array de sub-activos completo
     * para que sea estable aunque filtremos grupos vacíos.
     */
    const activeGroups = subActives
        .map((active, index) => {
            const color = ACTIVE_COLORS[index % ACTIVE_COLORS.length];
            const saved = savedRequirements.filter(
                sr => sr.listRequirements?.attributeTemplate?.id_active === active.id_active
            );
            const pending = requirements.filter(r => r.idActive === active.id_active);
            return { active, color, saved, pending };
        })
        .filter(g => g.saved.length > 0 || g.pending.length > 0);

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="animate-fade-in w-full pb-8 space-y-8">
            <LoadingOverlay
                isVisible={overlayStatus !== null}
                status={overlayStatus || 'loading'}
                message={overlayMessage}
            />

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

            {/* Context Bar */}
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

            {/* ── Botón único para agregar requisito ───────────────────────── */}
            <button
                onClick={() => setModalVisible(true)}
                className="w-full flex items-center gap-4 px-6 py-4 border-2 border-dashed border-secondary/30 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group"
            >
                <div className="w-10 h-10 rounded-xl border-2 border-secondary/20 flex items-center justify-center group-hover:border-primary group-hover:bg-white transition-all shrink-0">
                    <i className="pi pi-plus text-secondary group-hover:text-primary text-sm"></i>
                </div>
                <span className="text-sm font-bold text-secondary group-hover:text-primary uppercase tracking-widest">
                    Agregar Requisito
                </span>
            </button>

            {/* ── Grupos por sub-activo (solo los que tienen requisitos) ────── */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <i className="pi pi-spin pi-spinner text-primary text-3xl"></i>
                </div>
            ) : activeGroups.length === 0 ? (
                /* Estado vacío: aún no se agregaron requisitos */
                <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                    <div className="w-14 h-14 bg-secondary/5 rounded-full flex items-center justify-center">
                        <i className="pi pi-inbox text-2xl text-secondary/30"></i>
                    </div>
                    <p className="text-sm text-secondary/50 font-medium">
                        Aún no hay requisitos configurados. Usá el botón de arriba para agregar.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {activeGroups.map(({ active, color, saved, pending }) => (
                        <ActiveGroup
                            key={active.id_active}
                            active={active}
                            color={color}
                            saved={saved}
                            pending={pending}
                            periodicityOptions={PERIODICITY_OPTIONS}
                            onUpdate={handleUpdateRequirement}
                            onRemove={handleRemoveRequirement}
                            requirements={requirements}
                            groupRef={(el) => { groupRefs.current[active.id_active] = el; }}
                        />
                    ))}
                </div>
            )}

            {/* MODAL: AGREGAR REQUISITO */}
            <Dialog
                header="Agregar Requisitos"
                visible={modalVisible}
                className="w-[95vw] md:w-[500px]"
                onHide={() => setModalVisible(false)}
                pt={{
                    root:    { className: 'rounded-3xl border-none shadow-2xl overflow-hidden' },
                    header:  { className: 'p-6 bg-white border-b border-secondary/5 text-secondary-dark font-black text-lg' },
                    content: { className: 'p-0 bg-white' }
                }}
            >
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Crear requisito personalizado */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-secondary-dark tracking-tight">Crear requisito personalizado</h4>
                        <div className="space-y-3">
                            <Dropdown
                                value={newReq.idActive}
                                options={subActives}
                                optionLabel="description"
                                optionValue="id_active"
                                onChange={(e) => setNewReq({ ...newReq, idActive: e.value })}
                                placeholder="Seleccione el Activo (Obligatorio)"
                                className="w-full h-12 border border-warning/40 bg-white rounded-xl flex items-center px-2 text-sm font-medium shadow-sm"
                                pt={{ root: { className: 'border-warning/40' }, input: { className: 'text-xs font-bold' } }}
                            />
                            <div className="relative">
                                <Dropdown
                                    value={newReq.periodicity}
                                    options={Object.keys(periodicityMap)}
                                    onChange={(e) => setNewReq({ ...newReq, periodicity: e.value })}
                                    className="w-full h-12 border border-secondary/20 bg-white rounded-xl flex items-center px-2 text-sm font-medium"
                                    pt={{ input: { className: 'pr-10 text-xs font-bold' } }}
                                />
                                <i className="pi pi-clock absolute right-3 top-1/2 -translate-y-1/2 text-secondary/40 text-sm"></i>
                            </div>
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

                    {/* Sugerencias */}
                    <div className="space-y-4 pt-4 border-t border-secondary/5">
                        <div className="bg-[#f8f9ff] p-2 rounded-lg flex items-center gap-2">
                            <i className="pi pi-folder-open text-[#b0b8ff] text-xs"></i>
                            <span className="text-[10px] font-black text-[#6d7dfb] uppercase tracking-wider">{resource.label.toUpperCase()}</span>
                        </div>
                        {loading ? (
                            <div className="text-center py-6"><i className="pi pi-spin pi-spinner text-primary text-xl"></i></div>
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

// ─── Sub-componentes ──────────────────────────────────────────────────────────

/**
 * Sección con borde de color para un sub-activo.
 * Muestra requisitos guardados (read-only) y pendientes (editables).
 * groupRef permite hacer scroll programático hasta esta sección.
 */
const ActiveGroup = ({ active, color, saved, pending, periodicityOptions, onUpdate, onRemove, requirements, groupRef }) => {
    const totalCount = saved.length + pending.length;

    return (
        <div ref={groupRef} className={`rounded-3xl border-2 ${color.border} ${color.bg} p-5 space-y-5`}>
            {/* Header del grupo */}
            <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${color.dot} shrink-0`}></span>
                <span className={`text-xs font-black uppercase tracking-widest ${color.text}`}>
                    {active.description}
                </span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${color.header} ${color.text}`}>
                    {totalCount} requisito{totalCount !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Grid de cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {/* Requisitos ya guardados (read-only) */}
                {saved.map(sr => (
                    <SavedReqCard key={sr.id_group_requirements} req={sr} color={color} />
                ))}

                {/* Requisitos pendientes de guardar (editables) */}
                {pending.map((req) => {
                    const globalIndex = requirements.indexOf(req);
                    return (
                        <PendingReqCard
                            key={req.id_list_requirements || `custom-${globalIndex}`}
                            req={req}
                            index={globalIndex}
                            periodicityOptions={periodicityOptions}
                            onUpdate={onUpdate}
                            onRemove={onRemove}
                        />
                    );
                })}
            </div>
        </div>
    );
};

/**
 * Card de requisito ya guardado en el servidor (solo lectura).
 * Muestra descripción, periodicidad y un badge "Guardado".
 */
const SavedReqCard = ({ req, color }) => {
    const lr = req.listRequirements;
    const periodicity = lr?.attributeTemplate?.attributes?.periodicity_description || '—';

    return (
        <div className="relative aspect-[4/5] bg-white border border-secondary/10 rounded-[2rem] shadow-xl shadow-secondary/5 flex flex-col p-6">
            {/* Badge guardado */}
            <span className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-md ${color?.header || 'bg-success/10'} ${color?.text || 'text-success'} border border-white`}>
                Guardado
            </span>

            {/* Header */}
            <div className="flex gap-4 items-start mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 border border-primary/5">
                    <i className="pi pi-file-pdf text-xl text-primary font-bold"></i>
                </div>
                <h4 className="text-sm font-black text-secondary-dark leading-snug line-clamp-3">
                    {lr?.description || '—'}
                </h4>
            </div>

            <div className="w-full h-px bg-secondary/5 mb-6"></div>

            {/* Info periodicidad */}
            <div className="space-y-4 flex-1">
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-secondary/60 uppercase tracking-[0.2em] flex items-center gap-2">
                        <i className="pi pi-history text-[10px]"></i> PERIODICIDAD
                    </label>
                    <div className="h-12 bg-slate-50/80 rounded-2xl flex items-center px-4 text-xs font-bold text-secondary-dark">
                        {periodicity}
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Card de requisito pendiente de guardar (editable).
 */
const PendingReqCard = ({ req, index, periodicityOptions, onUpdate, onRemove }) => (
    <div className="relative group aspect-[4/5] bg-white border border-secondary/10 rounded-[2rem] shadow-xl shadow-secondary/5 flex flex-col p-6 animate-scale-in">
        <button
            onClick={() => onRemove(index)}
            className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-secondary/10 rounded-full flex items-center justify-center text-danger shadow-md hover:scale-110 transition-all z-10"
        >
            <i className="pi pi-times text-[10px] font-black"></i>
        </button>

        <div className="flex gap-4 items-start mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 border border-primary/5">
                <i className="pi pi-file-pdf text-xl text-primary font-bold"></i>
            </div>
            <h4 className="text-sm font-black text-secondary-dark leading-snug line-clamp-3">
                {req.description}
            </h4>
        </div>

        <div className="w-full h-px bg-secondary/5 mb-6"></div>

        <div className="space-y-6 flex-1">
            <div className="space-y-2">
                <label className="text-[9px] font-black text-secondary/60 uppercase tracking-[0.2em] flex items-center gap-2">
                    <i className="pi pi-history text-[10px]"></i> PERIODICIDAD
                </label>
                <Dropdown
                    value={req.periodicityId}
                    options={periodicityOptions}
                    onChange={(e) => onUpdate(index, 'periodicityId', e.value)}
                    className="w-full h-12 border-none bg-slate-50/50 rounded-2xl flex items-center px-2 text-sm font-bold shadow-inner"
                    pt={{ root: { className: 'border-secondary/10' }, input: { className: 'text-xs font-bold py-3' } }}
                />
            </div>

            <div className="space-y-2">
                <label className="text-[9px] font-black text-secondary/60 uppercase tracking-[0.2em] flex items-center gap-2">
                    <i className="pi pi-user text-[10px]"></i> REQUERIMIENTO
                </label>
                <div
                    onClick={() => onUpdate(index, 'isRequired', !req.isRequired)}
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
);

export default DocumentationConfig;

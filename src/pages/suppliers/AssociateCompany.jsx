import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Label from '../../components/ui/Label';
import MultiSelect from '../../components/ui/MultiSelect';
import { MOCK_SUPPLIERS } from '../../data/mockSuppliers';
import { StatusBadge } from '../../components/ui/Badges';

const AssociateCompany = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [supplier, setSupplier] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [isSaved, setIsSaved] = useState(false);

    // Structure: { [groupName]: [companyValues] }
    const [associations, setAssociations] = useState({});

    const empresasByGrupo = {
        'EDESAL': [{ label: 'Edesal', value: 'Edesal' }],
        'ROVELLA': [
            { label: 'Semisa', value: 'Semisa' },
            { label: 'Nativo', value: 'Nativo' },
            { label: 'Alubry', value: 'Alubry' },
            { label: 'Limay', value: 'Limay' }
        ]
    };

    useEffect(() => {
        const found = MOCK_SUPPLIERS.find(s => s.id === parseInt(id));
        if (found) {
            setSupplier({ ...found });

            // Initialize associations object from flat mock data
            // In a real app, the API would ideally return this grouped or we'd map it
            const initialAssoc = {};
            if (found.grupo && found.empresas) {
                initialAssoc[found.grupo] = found.empresas;
            }
            setAssociations(initialAssoc);
        }
    }, [id]);

    const handleSave = () => {
        setAssociations(prev => {
            const currentGroupAssoc = prev[selectedGroup] || [];
            return {
                ...prev,
                [selectedGroup]: [...new Set([...currentGroupAssoc, ...selectedCompanies])]
            };
        });

        setIsSaved(true);
        setSelectedGroup(null);
        setSelectedCompanies([]);

        console.log(`Asociación exitosa para ${supplier?.razonSocial}`);
    };

    if (!supplier) return <div className="p-8 text-center text-secondary">Cargando...</div>;

    const getFilteredOptions = (grupo) => {
        const allOptions = empresasByGrupo[grupo] || [];
        const currentGroupAssoc = associations[grupo] || [];
        return allOptions.filter(opt => !currentGroupAssoc.includes(opt.value));
    };

    const hasAnyAssociation = Object.values(associations).some(arr => arr.length > 0);

    return (
        <div className="p-0 md:p-8 animate-fade-in pb-20">
            <PageHeader
                title="Asociar Empresa"
                subtitle="Vincule al proveedor con grupos y empresas operativas."
                backPath="/proveedores"
            />

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Supplier Info Card & Current Associations */}
                <div className="bg-white border border-secondary/20 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-start gap-6 relative overflow-hidden">
                    {isSaved && (
                        <div className="absolute top-0 right-0 bg-success/10 text-success text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-success/20 animate-fade-in z-20">
                            <i className="pi pi-check-circle mr-1"></i> ACTUALIZADO
                        </div>
                    )}

                    <div className="flex flex-row md:flex-col items-center gap-4 md:gap-2 md:w-32 shrink-0">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                            {supplier.razonSocial?.charAt(0)}
                        </div>
                        <StatusBadge status={supplier.estatus} className="scale-75 md:scale-90" />
                    </div>

                    <div className="flex-1 space-y-4">
                        <div>
                            <h2 className="text-xl font-bold text-secondary-dark">{supplier.razonSocial}</h2>
                            <p className="text-sm text-secondary font-medium uppercase tracking-wider">CUIT: {supplier.cuit}</p>
                        </div>

                        {/* Current Associations Summary - Grouped */}
                        {hasAnyAssociation && (
                            <div className="bg-secondary-light/30 border border-secondary/10 rounded-xl p-4 transition-all duration-500">
                                <Label className="text-[10px] uppercase tracking-widest text-secondary/60 mb-3 block border-b border-secondary/10 pb-1">
                                    Asociaciones Actuales
                                </Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Object.entries(associations).map(([group, companies]) => (
                                        companies.length > 0 && (
                                            <div key={group} className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <i className={`pi ${group === 'EDESAL' ? 'pi-bolt' : 'pi-building'} text-[10px] text-primary`}></i>
                                                    <span className="text-[11px] font-extrabold text-secondary-dark tracking-tight">{group}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {companies.map(emp => (
                                                        <span key={emp} className="text-[9px] bg-white border border-secondary/20 px-2 py-0.5 rounded-full text-secondary-dark font-medium animate-scale-in">
                                                            {emp}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Action Area */}
                <div className="space-y-4">
                    <Label className="text-base font-bold text-secondary-dark">Asociar a un nuevo Grupo</Label>
                    <p className="text-xs text-secondary -mt-2">Seleccione un grupo para ver las empresas disponibles que aún no están vinculadas.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(empresasByGrupo).map(grupo => {
                            const availableOptions = getFilteredOptions(grupo);
                            const availableCount = availableOptions.length;
                            const isFullyAssociated = availableCount === 0;

                            return (
                                <div
                                    key={grupo}
                                    onClick={() => {
                                        if (!isFullyAssociated) {
                                            setSelectedGroup(grupo);
                                            setSelectedCompanies([]);
                                            setIsSaved(false);
                                        }
                                    }}
                                    className={`p-6 rounded-2xl border-2 transition-all group relative overflow-hidden ${selectedGroup === grupo
                                            ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                                            : isFullyAssociated
                                                ? 'border-secondary/5 bg-gray-50 opacity-60 cursor-not-allowed'
                                                : 'cursor-pointer border-secondary/10 bg-white hover:border-secondary/30'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${selectedGroup === grupo ? 'bg-primary text-white' : 'bg-secondary-light text-secondary group-hover:bg-secondary/10'
                                            }`}>
                                            <i className={`pi ${grupo === 'EDESAL' ? 'pi-bolt' : 'pi-building'}`}></i>
                                        </div>
                                        <div>
                                            <h3 className={`font-bold transition-all ${selectedGroup === grupo ? 'text-primary' : 'text-secondary-dark'}`}>
                                                {grupo}
                                            </h3>
                                            <p className="text-xs text-secondary">
                                                {isFullyAssociated
                                                    ? 'Ya asociado a todas las empresas'
                                                    : `${availableCount} empresas disponibles`}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedGroup === grupo && (
                                        <div className="absolute top-2 right-2 text-primary animate-bounce-subtle">
                                            <i className="pi pi-check-circle text-lg"></i>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Company MultiSelect */}
                {selectedGroup && (
                    <div className="bg-white border border-secondary/20 rounded-2xl p-8 shadow-xl shadow-secondary/5 animate-slide-up relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/20"></div>
                        <div className="max-w-md mx-auto">
                            <Label className="text-sm font-bold text-secondary-dark mb-4 flex items-center gap-2">
                                <i className="pi pi-building-cap text-primary"></i> Empresas Disponibles en {selectedGroup}
                            </Label>
                            <MultiSelect
                                value={selectedCompanies}
                                options={getFilteredOptions(selectedGroup)}
                                onChange={(e) => setSelectedCompanies(e.value)}
                                placeholder="Elija una o más empresas"
                                className="w-full"
                                display="chip"
                            />
                            <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-3">
                                <i className="pi pi-info-circle text-primary mt-0.5 text-sm"></i>
                                <div>
                                    <p className="text-xs text-primary font-bold mb-1">Impacto de la Asociación</p>
                                    <p className="text-[11px] text-secondary-dark/70 font-medium leading-relaxed italic">
                                        Las empresas seleccionadas podrán visualizar toda la documentación y datos del proveedor <strong>{supplier.razonSocial}</strong> una vez guardada la asociación.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-secondary/10">
                    <button
                        onClick={() => navigate('/proveedores')}
                        className="px-6 py-2.5 rounded-xl font-bold text-secondary hover:bg-secondary-light transition-all flex items-center gap-2"
                    >
                        <i className="pi pi-arrow-left text-sm"></i> Volver al listado
                    </button>

                    <div className="flex gap-4">
                        {!isSaved && (
                            <button
                                onClick={() => setSelectedGroup(null)}
                                className="px-6 py-2.5 rounded-xl font-bold text-secondary hover:bg-secondary-light transition-all"
                            >
                                Cancelar
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={!selectedGroup || selectedCompanies.length === 0}
                            className={`px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md ${!selectedGroup || selectedCompanies.length === 0
                                    ? 'bg-secondary/20 text-secondary/40 cursor-not-allowed'
                                    : 'bg-primary hover:bg-primary-hover text-white shadow-primary/20 animate-pulse-subtle'
                                }`}
                        >
                            <i className="pi pi-save"></i> Guardar Asociación
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssociateCompany;

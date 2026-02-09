import React, { useState, useEffect } from 'react';
import { TbBackhoe } from 'react-icons/tb';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import Dropdown from '../../../components/ui/Dropdown';

import PageHeader from '../../../components/ui/PageHeader';
import AppTable from '../../../components/ui/AppTable';
import { StatusBadge } from '../../../components/ui/Badges';
import { MOCK_MACHINERY } from '../../../data/mockResources';

import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../../../components/ui/PrimaryButton';

const MachineryList = ({ isEmbedded = false, showProvider = false }) => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [machinery, setMachinery] = useState([]);
    const [filteredMachinery, setFilteredMachinery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState(null);

    const [marcas, setMarcas] = useState([]);
    const [modelos, setModelos] = useState([]);

    useEffect(() => {
        initFilters();
        setMachinery(MOCK_MACHINERY);

        const uniqueMarcas = [...new Set(MOCK_MACHINERY.map(m => m.marca))].sort();
        const uniqueModelos = [...new Set(MOCK_MACHINERY.map(m => m.modelo))].sort();

        setMarcas(uniqueMarcas.map(m => ({ label: m, value: m })));
        setModelos(uniqueModelos.map(m => ({ label: m, value: m })));

        setLoading(false);
    }, []);

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            estado: { value: null, matchMode: FilterMatchMode.EQUALS },
            marca: { value: null, matchMode: FilterMatchMode.EQUALS },
            modelo: { value: null, matchMode: FilterMatchMode.EQUALS }
        });
        setGlobalFilterValue('');
    };

    const dropdownPt = {
        root: { className: 'w-full md:w-48 bg-white border border-secondary/30 rounded-lg h-9 flex items-center focus-within:ring-2 focus-within:ring-primary/50 shadow-sm' },
        input: { className: 'text-xs px-3 text-secondary-dark font-medium' },
        trigger: { className: 'w-8 text-secondary flex items-center justify-center border-l border-secondary/10' },
        panel: { className: 'text-xs bg-white border border-secondary/10 shadow-xl rounded-lg mt-1' },
        item: { className: 'p-2.5 hover:bg-secondary-light text-secondary-dark transition-colors' },
        list: { className: 'p-1' }
    };

    const rowExpansionTemplate = (data) => (
        <div className="bg-secondary-light/30 border-t border-secondary/10 p-5 shadow-inner animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-secondary/10 text-primary">
                    <TbBackhoe className="text-4xl" />
                </div>
                <div>
                    <h5 className="font-bold text-secondary-dark text-sm">Ficha Técnica de Maquinaria</h5>
                    <p className="text-[10px] text-secondary uppercase tracking-wider font-medium">{data.nombre} | Serie {data.serie}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div className="space-y-3">
                    <h6 className="text-[10px] font-bold text-secondary-dark/40 uppercase tracking-widest border-b border-secondary/10 pb-1">Identificación Técnica</h6>
                    <div><span className="block text-[10px] text-secondary font-bold uppercase">Descripción</span><span className="text-sm font-medium text-secondary-dark">{data.nombre}</span></div>
                    <div><span className="block text-[10px] text-secondary font-bold uppercase">Marca / Modelo</span><span className="text-sm font-medium text-secondary-dark">{data.marca} {data.modelo}</span></div>
                    <div><span className="block text-[10px] text-secondary font-bold uppercase">Nº Serie</span><span className="text-sm font-mono text-secondary-dark">{data.serie}</span></div>
                </div>

                <div className="space-y-3">
                    <h6 className="text-[10px] font-bold text-secondary-dark/40 uppercase tracking-widest border-b border-secondary/10 pb-1">Estado de Control</h6>
                    <div className="flex flex-col gap-2.5 pt-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-secondary font-bold uppercase w-28">Estado Adm:</span>
                            <StatusBadge status={data.estado} />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-secondary font-bold uppercase w-28">Documentación:</span>
                            <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-white border border-secondary/10">
                                <span className={`w-1.5 h-1.5 rounded-full ${data.docStatus === 'COMPLETA' ? 'bg-success shadow-[0_0_5px_rgba(34,197,94,0.4)]' : 'bg-warning'}`}></span>
                                <span className={`text-[10px] font-bold ${data.docStatus === 'COMPLETA' ? 'text-success' : 'text-warning-hover'}`}>
                                    {data.docStatus || 'INCOMPLETA'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {data.motivo && (
                        <div className="mt-2 bg-white/60 p-2 rounded border border-secondary/10 italic">
                            <p className="text-[10px] text-danger/80 leading-tight">
                                <i className="pi pi-info-circle text-[9px] mr-1"></i>
                                {data.motivo}
                            </p>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <h6 className="text-[10px] font-bold text-secondary-dark/40 uppercase tracking-widest border-b border-secondary/10 pb-1">Pertenencia</h6>
                    {showProvider && <div><span className="block text-[10px] text-secondary font-bold uppercase">Proveedor Dueño</span><span className="text-sm font-medium text-primary hover:underline cursor-pointer">{data.proveedor}</span></div>}
                    <div><span className="block text-[10px] text-secondary font-bold uppercase">Tipo de Equipo</span><span className="text-sm font-medium text-secondary-dark">{data.tipo}</span></div>
                    <div><span className="block text-[10px] text-secondary font-bold uppercase">ID Interno</span><span className="text-xs font-mono text-secondary-dark bg-white px-1.5 py-0.5 rounded border border-secondary/10">MAQ-{data.id.toString().padStart(4, '0')}</span></div>
                </div>

                <div className="flex flex-col justify-end gap-2">
                    <button className="w-full text-primary bg-primary-light/30 hover:bg-primary-light/50 font-bold rounded-lg text-[11px] py-2 transition-all border border-primary/20 flex items-center justify-center gap-2">
                        <i className="pi pi-file-pdf"></i> Inspecciones Técnicas
                    </button>
                    <button className="w-full text-secondary-dark bg-white hover:bg-secondary-light font-bold rounded-lg text-[11px] py-2 transition-all border border-secondary/20 flex items-center justify-center gap-2">
                        <i className="pi pi-shield"></i> Pólizas y Seguros
                    </button>
                </div>
            </div>
        </div>
    );

    const renderHeader = () => (
        <div className="bg-white border-b border-secondary/10 px-4 py-3 space-y-3">
            {/* Top Row: Search and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-[450px]">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <i className="pi pi-search text-secondary/50 text-xs"></i>
                    </div>
                    <input
                        type="text"
                        value={globalFilterValue}
                        onChange={(e) => {
                            const val = e.target.value;
                            setGlobalFilterValue(val);
                            let _filters = { ...filters };
                            _filters['global'].value = val;
                            setFilters(_filters);
                        }}
                        className="bg-secondary-light/40 border border-secondary/20 text-secondary-dark text-xs rounded-lg focus:ring-1 focus:ring-primary/20 focus:border-primary/50 block w-full ps-9 p-2 outline-none transition-all placeholder:text-secondary/40 h-9"
                        placeholder="Buscar maquinaria..."
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex-1 sm:flex-none text-secondary-dark bg-white border border-secondary/20 hover:bg-secondary-light font-bold rounded-lg text-xs px-4 py-2 transition-all flex items-center justify-center gap-2 h-9">
                        <i className="pi pi-file-excel"></i> <span className="hidden sm:inline">Exportar Excel</span><span className="sm:hidden">Exportar</span>
                    </button>
                    {isEmbedded && (
                        <PrimaryButton
                            label="Nueva Maquinaria"
                            icon="pi pi-plus"
                            onClick={() => navigate('/recursos/maquinaria/nueva')}
                        />
                    )}
                </div>
            </div>

            {/* Bottom Row: Filters & Stats */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between border-t border-secondary/5 pt-3">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative">
                        <Dropdown
                            value={filters?.marca?.value}
                            options={marcas}
                            onChange={(e) => setFilters({ ...filters, marca: { value: e.value, matchMode: FilterMatchMode.EQUALS } })}
                            placeholder="MARCA"
                            className="w-full md:w-48"
                        />
                        {filters?.marca?.value && (
                            <i
                                className="pi pi-filter-slash text-white bg-primary text-[10px] absolute -top-2 -right-2 rounded-full p-[3px] shadow-sm border border-secondary/10 cursor-pointer hover:bg-danger transition-colors"
                                onClick={() => {
                                    let _filters = { ...filters };
                                    _filters['marca'].value = null;
                                    setFilters(_filters);
                                }}
                                title="Limpiar filtro"
                            ></i>
                        )}
                    </div>

                    <div className="relative">
                        <Dropdown
                            value={filters?.modelo?.value}
                            options={modelos}
                            onChange={(e) => {
                                let _filters = { ...filters };
                                _filters['modelo'].value = e.value;
                                setFilters(_filters);
                            }}
                            placeholder="MODELO"
                            className="w-full md:w-48"
                        />
                        {filters?.modelo?.value && (
                            <i
                                className="pi pi-filter-slash text-white bg-primary text-[10px] absolute -top-2 -right-2 rounded-full p-[3px] shadow-sm border border-secondary/10 cursor-pointer hover:bg-danger transition-colors"
                                onClick={() => {
                                    let _filters = { ...filters };
                                    _filters['modelo'].value = null;
                                    setFilters(_filters);
                                }}
                                title="Limpiar filtro"
                            ></i>
                        )}
                    </div>

                    <div className="relative">
                        <Dropdown
                            value={filters?.estado?.value}
                            options={['ACTIVO', 'VENCIDO', 'EN REVISIÓN', 'SUSPENDIDO', 'DADO DE BAJA'].map(s => ({ label: s, value: s }))}
                            onChange={(e) => {
                                let _filters = { ...filters };
                                _filters['estado'].value = e.value;
                                setFilters(_filters);
                            }}
                            placeholder="ESTADO"
                            className="w-full md:w-48"
                        />
                        {filters?.estado?.value && (
                            <i
                                className="pi pi-filter-slash text-white bg-primary text-[10px] absolute -top-2 -right-2 rounded-full p-[3px] shadow-sm border border-secondary/10 cursor-pointer hover:bg-danger transition-colors"
                                onClick={() => {
                                    let _filters = { ...filters };
                                    _filters['estado'].value = null;
                                    setFilters(_filters);
                                }}
                                title="Limpiar filtro"
                            ></i>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 text-xs ml-auto">
                    <button
                        onClick={initFilters}
                        className="text-secondary hover:text-primary font-bold hover:underline transition-colors flex items-center gap-1"
                    >
                        <i className="pi pi-filter-slash text-[10px]"></i> Limpiar Filtros
                    </button>
                    <div className="h-4 w-px bg-secondary/20 hidden md:block"></div>
                    <span className="text-secondary/50 font-bold uppercase tracking-widest leading-none">
                        {filteredMachinery ? filteredMachinery.length : machinery.length} Equipos
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in w-full">
            {!isEmbedded && (
                <PageHeader
                    title="Maquinaria"
                    subtitle="Registro de máquinas y equipos especiales."
                    icon={<TbBackhoe className="text-[33px] md:text-[42px] font-bold" />}
                    actionButton={
                        <PrimaryButton
                            label="Nueva Maquinaria"
                            icon="pi pi-plus"
                            onClick={() => navigate('/recursos/maquinaria/nueva')}
                        />
                    }
                />
            )}

            <div className={`${isEmbedded ? 'bg-white' : 'p-4'}`}>
                <AppTable
                    value={machinery}
                    loading={loading}
                    header={renderHeader()}
                    filters={filters}
                    globalFilterFields={['codigo', 'tipo', 'marca', 'modelo', 'numeroSerie']}
                    emptyMessage="No se encontraron equipos."
                    dataKey="id"
                    expandedRows={expandedRows}
                    onRowToggle={(e) => setExpandedRows(e.data)}
                    onValueChange={(data) => setFilteredMachinery(data)}
                    rowExpansionTemplate={rowExpansionTemplate}
                    rowClassName={() => 'hover:bg-primary-light/5 transition-colors border-b border-secondary/5'}
                >
                    <Column expander className="w-12 pl-6" headerClassName="pl-6 w-12" />
                    <Column field="nombre" header="Descripción" sortable className="font-bold text-secondary-dark text-sm" headerClassName="text-[10px] font-bold uppercase tracking-wider text-secondary/60 py-4" />
                    <Column field="marca" header="Marca" sortable className="text-sm hidden sm:table-cell" headerClassName="hidden sm:table-cell text-[10px] font-bold uppercase tracking-wider text-secondary/60" />
                    <Column field="modelo" header="Modelo" sortable className="text-sm hidden md:table-cell" headerClassName="hidden md:table-cell text-[10px] font-bold uppercase tracking-wider text-secondary/60" />
                    <Column field="tipo" header="Tipo" sortable className="hidden lg:table-cell text-xs" headerClassName="hidden lg:table-cell text-[10px] font-bold uppercase tracking-wider text-secondary/60" />
                    {showProvider && <Column field="proveedor" header="Proveedor" sortable className="text-xs text-secondary hidden xl:table-cell" headerClassName="hidden xl:table-cell text-[10px] font-bold uppercase tracking-wider text-secondary/60" />}
                    <Column field="estado" header="Estado" body={(d) => <StatusBadge status={d.estado} />} sortable className="pr-6 text-sm" headerClassName="pr-6 text-[10px] font-bold uppercase tracking-wider text-secondary/60 text-right" />
                </AppTable>
            </div>
        </div>
    );
};

export default MachineryList;

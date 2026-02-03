import React, { useState, useEffect } from 'react';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { Dropdown } from 'primereact/dropdown';

import PageHeader from '../../components/ui/PageHeader';
import AppTable from '../../components/ui/AppTable';
import { StatusBadge } from '../../components/ui/Badges';
import { MOCK_EMPLOYEES } from '../../data/mockResources';

const EmployeesList = ({ isEmbedded = false, showProvider = false }) => {
    const [filters, setFilters] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState(null);

    useEffect(() => {
        initFilters();
        setEmployees(MOCK_EMPLOYEES);
        setLoading(false);
    }, []);

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            estado: { value: null, matchMode: FilterMatchMode.EQUALS },
            habilitado: { value: null, matchMode: FilterMatchMode.EQUALS }
        });
        setGlobalFilterValue('');
    };

    const dropdownPt = {
        root: { className: 'w-full md:w-36 bg-secondary-light/40 border border-secondary/20 rounded-lg h-9 flex items-center transition-all hover:border-secondary/40' },
        input: { className: 'text-xs px-2 text-secondary-dark font-medium' },
        trigger: { className: 'w-6 text-secondary flex items-center justify-center scale-90' },
        panel: { className: 'text-xs bg-white border border-secondary/20 shadow-lg' },
        item: { className: 'p-2 hover:bg-secondary-light text-secondary-dark text-xs' },
        clearIcon: { className: 'text-[10px] text-secondary/60' }
    };

    const rowExpansionTemplate = (data) => (
        <div className="bg-secondary-light/30 border-t border-secondary/10 p-5 shadow-inner animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-secondary/10 overflow-hidden text-primary">
                    <i className="pi pi-user text-xl"></i>
                </div>
                <div>
                    <h5 className="font-bold text-secondary-dark text-sm">Ficha de Legajo</h5>
                    <p className="text-[10px] text-secondary uppercase tracking-wider font-medium">{data.nombre} | Legajo {data.legajo}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div className="space-y-3">
                    <h6 className="text-[10px] font-bold text-secondary-dark/40 uppercase tracking-widest border-b border-secondary/10 pb-1">Datos Personales</h6>
                    <div><span className="block text-[10px] text-secondary font-bold uppercase">Nombre Completo</span><span className="text-sm font-medium text-secondary-dark">{data.nombre}</span></div>
                    <div><span className="block text-[10px] text-secondary font-bold uppercase">DNI</span><span className="text-sm font-mono text-secondary-dark">{data.dni}</span></div>
                    <div><span className="block text-[10px] text-secondary font-bold uppercase">Puesto</span><span className="text-sm font-medium text-secondary-dark">{data.puesto}</span></div>
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
                    <h6 className="text-[10px] font-bold text-secondary-dark/40 uppercase tracking-widest border-b border-secondary/10 pb-1">Vinculación</h6>
                    {showProvider && <div><span className="block text-[10px] text-secondary font-bold uppercase">Empresa Proveedora</span><span className="text-sm font-medium text-primary hover:underline cursor-pointer">{data.proveedor}</span></div>}
                    <div><span className="block text-[10px] text-secondary font-bold uppercase">Área Operativa</span><span className="text-sm font-medium text-secondary-dark">{data.area}</span></div>
                    <div><span className="block text-[10px] text-secondary font-bold uppercase">ID Interno</span><span className="text-xs font-mono text-secondary-dark bg-white px-1.5 py-0.5 rounded border border-secondary/10">PER-{data.id.toString().padStart(4, '0')}</span></div>
                </div>

                <div className="flex flex-col justify-end gap-2">
                    <button className="w-full text-primary bg-primary-light/30 hover:bg-primary-light/50 font-bold rounded-lg text-[11px] py-2 transition-all border border-primary/20 flex items-center justify-center gap-2">
                        <i className="pi pi-id-card"></i> Credencial Digital
                    </button>
                    <button className="w-full text-secondary-dark bg-white hover:bg-secondary-light font-bold rounded-lg text-[11px] py-2 transition-all border border-secondary/20 flex items-center justify-center gap-2">
                        <i className="pi pi-file-pdf"></i> Ver Documentación
                    </button>
                </div>
            </div>
        </div>
    );

    const renderHeader = () => (
        <div className="bg-white border-b border-secondary/10 px-6 py-3 flex flex-col xl:flex-row items-center justify-between gap-4">
            {/* Left side: Search and Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto flex-1">
                <div className="relative flex-1 md:max-w-[200px]">
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
                        placeholder="Buscar..."
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Dropdown
                        value={filters?.habilitado?.value}
                        options={[
                            { label: 'Habilitado', value: true },
                            { label: 'No Habilitado', value: false }
                        ]}
                        onChange={(e) => {
                            let _filters = { ...filters };
                            _filters['habilitado'].value = e.value;
                            setFilters(_filters);
                        }}
                        placeholder="Habilitación"
                        showClear
                        pt={dropdownPt}
                    />

                    <Dropdown
                        value={filters?.estado?.value}
                        options={['ACTIVO', 'VENCIDO', 'EN REVISIÓN', 'SUSPENDIDO', 'DADO DE BAJA'].map(s => ({ label: s, value: s }))}
                        onChange={(e) => {
                            let _filters = { ...filters };
                            _filters['estado'].value = e.value;
                            setFilters(_filters);
                        }}
                        placeholder="Estado"
                        showClear
                        pt={dropdownPt}
                    />
                </div>

                <div className="hidden 2xl:flex items-center gap-2 text-secondary/30 ml-auto whitespace-nowrap">
                    <span className="text-[10px] font-bold uppercase tracking-widest">{employees.length} Legajos</span>
                </div>
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-2 w-full xl:w-auto">
                <button className="flex-1 md:flex-none text-secondary-dark bg-white border border-secondary/20 hover:bg-secondary-light font-bold rounded-lg text-xs px-4 py-2 transition-all flex items-center justify-center gap-2 h-9">
                    <i className="pi pi-file-excel"></i> Exportar
                </button>
                <button className="flex-1 md:flex-none text-white bg-primary hover:bg-primary-hover font-bold rounded-lg text-xs px-5 py-2 shadow-md shadow-primary/30 transition-all flex items-center justify-center gap-2 h-9 uppercase tracking-wider">
                    <i className="pi pi-plus"></i> <span className="hidden sm:inline">Nuevo Empleado</span><span className="sm:hidden">Nuevo</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in w-full">
            {!isEmbedded && (
                <PageHeader
                    title="Empleados"
                    subtitle="Nómina de personal y personal habilitado."
                />
            )}

            <div className={`${isEmbedded ? 'bg-white' : 'p-4'}`}>
                <AppTable
                    value={employees}
                    loading={loading}
                    header={renderHeader()}
                    filters={filters}
                    globalFilterFields={['nombre', 'dni', 'legajo', 'puesto', 'proveedor']}
                    emptyMessage="No se encontraron empleados."
                    dataKey="id"
                    expandedRows={expandedRows}
                    onRowToggle={(e) => setExpandedRows(e.data)}
                    rowExpansionTemplate={rowExpansionTemplate}
                    rowClassName={() => 'hover:bg-primary-light/5 transition-colors border-b border-secondary/5'}
                >
                    <Column expander className="w-12 pl-6" headerClassName="pl-6 w-12" />
                    <Column field="nombre" header="Nombre Completo" sortable className="font-bold text-secondary-dark text-sm" headerClassName="text-[10px] font-bold uppercase tracking-wider text-secondary/60 py-4" />
                    <Column field="dni" header="DNI" sortable className="font-mono text-sm hidden sm:table-cell" headerClassName="hidden sm:table-cell text-[10px] font-bold uppercase tracking-wider text-secondary/60" />
                    <Column field="legajo" header="Legajo" sortable className="font-mono text-sm hidden md:table-cell" headerClassName="hidden md:table-cell text-[10px] font-bold uppercase tracking-wider text-secondary/60" />
                    <Column field="habilitado" header="Habilitación" body={(d) => (
                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-secondary-light/30 border border-secondary/10 w-fit">
                            <span className={`w-1.5 h-1.5 rounded-full ${d.habilitado ? 'bg-success shadow-[0_0_5px_rgba(34,197,94,0.4)]' : 'bg-danger/60'}`}></span>
                            <span className={`text-[10px] font-bold ${d.habilitado ? 'text-success' : 'text-secondary-dark opacity-50'}`}>
                                {d.habilitado ? 'SÍ' : 'NO'}
                            </span>
                        </div>
                    )} sortable headerClassName="text-[10px] font-bold uppercase tracking-wider text-secondary/60" />
                    <Column field="puesto" header="Puesto" sortable className="hidden lg:table-cell text-sm" headerClassName="hidden lg:table-cell text-[10px] font-bold uppercase tracking-wider text-secondary/60" />
                    {showProvider && <Column field="proveedor" header="Proveedor" sortable className="text-xs text-secondary hidden xl:table-cell" headerClassName="hidden xl:table-cell text-[10px] font-bold uppercase tracking-wider text-secondary/60" />}
                    <Column field="estado" header="Estado" body={(d) => <StatusBadge status={d.estado} />} sortable className="pr-6 text-sm" headerClassName="pr-6 text-[10px] font-bold uppercase tracking-wider text-secondary/60 text-right" />
                </AppTable>
            </div>
        </div>
    );
};

export default EmployeesList;

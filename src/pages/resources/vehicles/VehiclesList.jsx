import React, { useState, useEffect } from 'react';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import Dropdown from '../../../components/ui/Dropdown';

import PageHeader from '../../../components/ui/PageHeader';
import AppTable from '../../../components/ui/AppTable';
import { StatusBadge } from '../../../components/ui/Badges';
import { MOCK_VEHICLES } from '../../../data/mockResources';
import TableFilters from '../../../components/ui/TableFilters';

import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../../../components/ui/PrimaryButton';

const VehiclesList = ({ isEmbedded = false, showProvider = false }) => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState(null);

    const [marcas, setMarcas] = useState([]);
    const [modelos, setModelos] = useState([]);

    useEffect(() => {
        initFilters();
        setVehicles(MOCK_VEHICLES);

        const uniqueMarcas = [...new Set(MOCK_VEHICLES.map(v => v.marca))].sort();
        const uniqueModelos = [...new Set(MOCK_VEHICLES.map(v => v.modelo))].sort();

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
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-secondary/10 overflow-hidden text-primary">
                    <i className="pi pi-car text-xl"></i>
                </div>
                <div>
                    <h5 className="font-bold text-secondary-dark text-sm">Ficha Técnica del Vehículo</h5>
                    <p className="text-[10px] text-secondary uppercase tracking-wider font-medium">Patente {data.patente} | {data.marca} {data.modelo}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div className="space-y-3">
                    <h6 className="text-[10px] font-bold text-secondary-dark/40 uppercase tracking-widest border-b border-secondary/10 pb-1">Especificaciones</h6>
                    <div><span className="block text-[10px] text-secondary font-bold uppercase">Marca / Modelo</span><span className="text-sm font-medium text-secondary-dark">{data.marca} {data.modelo}</span></div>
                    <div><span className="block text-[10px] text-secondary font-bold uppercase">Año fabricación</span><span className="text-sm font-medium text-secondary-dark">{data.anio}</span></div>
                    <div><span className="block text-[10px] text-secondary font-bold uppercase">Tipo de unidad</span><span className="text-sm font-medium text-secondary-dark">{data.tipo}</span></div>
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
                    <div><span className="block text-[10px] text-secondary font-bold uppercase">ID Interno</span><span className="text-xs font-mono text-secondary-dark bg-white px-1.5 py-0.5 rounded border border-secondary/10">VEH-{data.id.toString().padStart(4, '0')}</span></div>
                </div>

                <div className="flex flex-col justify-end gap-2">
                    <button className="w-full text-primary bg-primary-light/30 hover:bg-primary-light/50 font-bold rounded-lg text-[11px] py-2 transition-all border border-primary/20 flex items-center justify-center gap-2">
                        <i className="pi pi-file-excel"></i> Ver Planillas VTV
                    </button>
                    <button className="w-full text-secondary-dark bg-white hover:bg-secondary-light font-bold rounded-lg text-[11px] py-2 transition-all border border-secondary/20 flex items-center justify-center gap-2">
                        <i className="pi pi-file-pdf"></i> Ver Seguros
                    </button>
                </div>
            </div>
        </div>
    );

    const topActions = (
        <div className="flex items-center gap-2">
            <button className="flex-1 sm:flex-none text-secondary-dark bg-white border border-secondary/20 hover:bg-secondary-light font-bold rounded-lg text-xs px-4 py-2 transition-all flex items-center justify-center gap-2 h-9">
                <i className="pi pi-file-excel"></i> <span className="hidden sm:inline">Exportar Excel</span><span className="sm:hidden">Exportar</span>
            </button>
            {isEmbedded && (
                <PrimaryButton
                    label="Nuevo Vehículo"
                    icon="pi pi-plus"
                    onClick={() => navigate('/recursos/vehiculos/nuevo')}
                />
            )}
        </div>
    );

    const filterConfig = [
        { label: 'MARCA', value: 'marca', options: marcas },
        { label: 'MODELO', value: 'modelo', options: modelos },
        { label: 'ESTADO', value: 'estado', options: ['ACTIVO', 'VENCIDO', 'EN REVISIÓN', 'SUSPENDIDO', 'DADO DE BAJA'].map(s => ({ label: s, value: s })) }
    ];

    const renderHeader = () => (
        <TableFilters
            filters={filters}
            setFilters={setFilters}
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={(e) => {
                const val = e.target.value;
                setGlobalFilterValue(val);
                let _filters = { ...filters };
                _filters['global'].value = val;
                setFilters(_filters);
            }}
            config={filterConfig}
            totalItems={vehicles.length}
            filteredItems={filteredVehicles ? filteredVehicles.length : null}
            topRightContent={topActions}
        />
    );

    return (
        <div className="animate-fade-in w-full">
            {!isEmbedded && (
                <PageHeader
                    title="Vehículos"
                    subtitle="Gestión de flota y unidades habilitadas."
                    icon="pi pi-car"
                    actionButton={
                        <PrimaryButton
                            label="Nuevo Vehículo"
                            icon="pi pi-plus"
                            onClick={() => navigate('/recursos/vehiculos/nuevo')}
                        />
                    }
                />
            )}

            <div className={`${isEmbedded ? 'bg-white' : 'p-4'}`}>
                <AppTable
                    value={vehicles}
                    loading={loading}
                    header={renderHeader()}
                    expandedRows={expandedRows}
                    onRowToggle={(e) => setExpandedRows(e.data)}
                    onValueChange={(data) => setFilteredVehicles(data)}
                    rowExpansionTemplate={rowExpansionTemplate}
                    dataKey="id"
                    filters={filters}
                    globalFilterFields={['patente', 'marca', 'modelo', 'tipo', 'anio']}
                    emptyMessage="No se encontraron vehículos."
                    rowClassName={() => 'hover:bg-primary-light/5 transition-colors border-b border-secondary/5'}
                >
                    <Column expander className="w-12 pl-6" headerClassName="pl-6 w-12" />
                    <Column field="patente" header="Patente" sortable className="font-bold text-secondary-dark text-sm" headerClassName="text-[10px] font-bold uppercase tracking-wider text-secondary/60 py-4" />
                    <Column field="marca" header="Marca" sortable className="text-sm" headerClassName="text-[10px] font-bold uppercase tracking-wider text-secondary/60" />
                    <Column field="modelo" header="Modelo" sortable className="text-sm hidden sm:table-cell" headerClassName="hidden sm:table-cell text-[10px] font-bold uppercase tracking-wider text-secondary/60" />
                    <Column field="tipo" header="Tipo" sortable className="hidden lg:table-cell text-secondary/60 text-sm" headerClassName="hidden lg:table-cell text-[10px] font-bold uppercase tracking-wider text-secondary/60" />
                    {showProvider && <Column field="proveedor" header="Proveedor" sortable className="text-xs text-secondary hidden xl:table-cell" headerClassName="hidden xl:table-cell text-[10px] font-bold uppercase tracking-wider text-secondary/60" />}
                    <Column field="estado" header="Estado" body={(d) => <StatusBadge status={d.estado} />} sortable className="pr-6 text-sm" headerClassName="pr-6 text-[10px] font-bold uppercase tracking-wider text-secondary/60 text-right" />
                </AppTable>
            </div>
        </div>
    );
};

export default VehiclesList;

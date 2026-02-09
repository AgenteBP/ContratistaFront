import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Menu } from 'primereact/menu';
import { MOCK_EMPRESAS } from '../../data/mockCompanies';
import { StatusBadge } from '../../components/ui/Badges';
import PageHeader from '../../components/ui/PageHeader';
import AppTable from '../../components/ui/AppTable';

const CompanyList = () => {
    const navigate = useNavigate();

    // Constants
    const rubros = ['Software', 'Consultoría', 'Servicios', 'Construcción', 'Retail'];
    const grupos = ['Pyme', 'Empresa Grande', 'Multinacional'];
    const estatusOptions = ['ACTIVO', 'INACTIVO', 'PENDIENTE'];

    // Initial Filter State Helper
    const getInitialFilters = () => ({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        razonSocial: { value: null, matchMode: FilterMatchMode.CONTAINS },
        cuit: { value: null, matchMode: FilterMatchMode.CONTAINS },
        rubro: { value: null, matchMode: FilterMatchMode.EQUALS },
        grupo: { value: null, matchMode: FilterMatchMode.EQUALS },
        estatus: { value: null, matchMode: FilterMatchMode.EQUALS }
    });

    // State
    const [filters, setFilters] = useState(getInitialFilters());
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [companies] = useState(MOCK_EMPRESAS);
    const [filteredCompanies, setFilteredCompanies] = useState(MOCK_EMPRESAS); // Init with data
    const [loading, setLoading] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [expandedRows, setExpandedRows] = useState(null);
    const menuRef = useRef(null);

    // Filter Functions
    const initFilters = () => {
        setFilters(getInitialFilters());
        setGlobalFilterValue('');
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    // Effects
    useEffect(() => {
        // Optional: Re-init or fetch data if needed. 
        // Since we init state with MOCK_EMPRESAS, this might be redundant but safe.
        setFilteredCompanies(MOCK_EMPRESAS);
        initFilters();
    }, []);

    const menuItems = [
        {
            label: 'Ver Detalles',
            icon: 'pi pi-eye',
            command: () => {
                console.log("Ver detalles:", selectedRow?.razonSocial);
            }
        },
        {
            label: 'Editar',
            icon: 'pi pi-pencil',
            command: () => {
                console.log("Editando a:", selectedRow?.razonSocial);
            }
        },
        {
            label: 'Borrar',
            icon: 'pi pi-trash',
            className: 'text-red-500',
            command: () => {
            }
        }
    ];

    const dropdownPt = {
        root: { className: 'w-full md:w-48 bg-white border border-secondary/30 rounded-lg h-9 flex items-center focus-within:ring-2 focus-within:ring-primary/50 shadow-sm' },
        input: { className: 'text-xs px-3 text-secondary-dark font-medium' },
        trigger: { className: 'w-8 text-secondary flex items-center justify-center border-l border-secondary/10' },
        panel: { className: 'text-xs bg-white border border-secondary/10 shadow-xl rounded-lg mt-1' },
        item: { className: 'p-2.5 hover:bg-secondary-light text-secondary-dark transition-colors' },
        list: { className: 'p-1' }
    };

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
                        onChange={onGlobalFilterChange}
                        className="bg-secondary-light/40 border border-secondary/20 text-secondary-dark text-xs rounded-lg focus:ring-1 focus:ring-primary/20 focus:border-primary/50 block w-full ps-9 p-2 outline-none transition-all placeholder:text-secondary/40 h-9"
                        placeholder="Buscar empresa (Razón Social, CUIT)..."
                    />
                </div>
            </div>

            {/* Bottom Row: Filters & Stats */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between border-t border-secondary/5 pt-3">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative">
                        <Dropdown
                            value={filters?.rubro?.value}
                            options={rubros.map(r => ({ label: r, value: r }))}
                            onChange={(e) => {
                                let _filters = { ...filters };
                                _filters['rubro'].value = e.value;
                                setFilters(_filters);
                            }}
                            placeholder="Rubro"
                            pt={dropdownPt}
                        />
                        {filters?.rubro?.value && (
                            <i
                                className="pi pi-filter-slash text-white bg-primary text-[10px] absolute -top-2 -right-2 rounded-full p-[3px] shadow-sm border border-secondary/10 cursor-pointer hover:bg-danger transition-colors"
                                onClick={() => {
                                    let _filters = { ...filters };
                                    _filters['rubro'].value = null;
                                    setFilters(_filters);
                                }}
                                title="Limpiar filtro"
                            ></i>
                        )}
                    </div>

                    <div className="relative">
                        <Dropdown
                            value={filters?.grupo?.value}
                            options={grupos.map(g => ({ label: g, value: g }))}
                            onChange={(e) => {
                                let _filters = { ...filters };
                                _filters['grupo'].value = e.value;
                                setFilters(_filters);
                            }}
                            placeholder="Grupo"
                            pt={dropdownPt}
                        />
                        {filters?.grupo?.value && (
                            <i
                                className="pi pi-filter-slash text-white bg-primary text-[10px] absolute -top-2 -right-2 rounded-full p-[3px] shadow-sm border border-secondary/10 cursor-pointer hover:bg-danger transition-colors"
                                onClick={() => {
                                    let _filters = { ...filters };
                                    _filters['grupo'].value = null;
                                    setFilters(_filters);
                                }}
                                title="Limpiar filtro"
                            ></i>
                        )}
                    </div>

                    <div className="relative">
                        <Dropdown
                            value={filters?.estatus?.value}
                            options={estatusOptions.map(s => ({ label: s, value: s }))}
                            onChange={(e) => {
                                let _filters = { ...filters };
                                _filters['estatus'].value = e.value;
                                setFilters(_filters);
                            }}
                            placeholder="Estatus"
                            pt={dropdownPt}
                        />
                        {filters?.estatus?.value && (
                            <i
                                className="pi pi-filter-slash text-white bg-primary text-[10px] absolute -top-2 -right-2 rounded-full p-[3px] shadow-sm border border-secondary/10 cursor-pointer hover:bg-danger transition-colors"
                                onClick={() => {
                                    let _filters = { ...filters };
                                    _filters['estatus'].value = null;
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
                        {filteredCompanies ? filteredCompanies.length : companies.length} Empresas
                    </span>
                </div>
            </div>
        </div>
    );

    const customSortIcon = (options) => {
        if (options.sorted) return options.sortOrder === 1 ? <i className="pi pi-arrow-up text-[10px] ml-1 text-primary"></i> : <i className="pi pi-arrow-down text-[10px] ml-1 text-primary"></i>;
        return <i className="pi pi-sort-alt text-[10px] ml-1 text-secondary opacity-50"></i>;
    };

    const actionTemplate = (rowData) => {
        return (
            <div className="flex justify-center">
                <button
                    onClick={(event) => {
                        setSelectedRow(rowData);
                        menuRef.current.toggle(event);
                    }}
                    className="text-secondary hover:bg-secondary-light hover:text-primary rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 w-8 h-8 flex items-center justify-center"
                    aria-label="Opciones"
                >
                    <i className="pi pi-ellipsis-v text-xs"></i>
                </button>
            </div>
        );
    };

    const header = renderHeader();

    // Template para mobile expansion (simple, reutilizando el estilo de Suppliers)
    const rowExpansionTemplate = (data) => (
        <div className="bg-secondary-light border-t border-secondary/20 p-4 shadow-inner animate-fade-in text-sm">
            <div className="flex items-center gap-2 mb-3">
                <i className="pi pi-building text-primary text-lg"></i>
                <h5 className="font-bold text-secondary-dark">{data.razonSocial}</h5>
            </div>
            <div className="grid grid-cols-1 gap-2">
                {/* CUIT: Hidden sm:table-cell -> sm:hidden */}
                <div className="sm:hidden"><span className="block text-[10px] text-secondary">CUIT</span><span className="font-mono text-secondary-dark">{data.cuit}</span></div>

                {/* Rubro: Hidden lg:table-cell -> lg:hidden */}
                <div className="lg:hidden"><span className="block text-[10px] text-secondary">Rubro</span><span className="font-medium text-secondary-dark">{data.rubro}</span></div>

                {/* Grupo: Hidden xl:table-cell -> xl:hidden */}
                <div className="xl:hidden"><span className="block text-[10px] text-secondary">Grupo</span><span className="font-medium text-secondary-dark">{data.grupo}</span></div>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in w-full">
            <PageHeader
                title="Empresas"
                subtitle="Gestione el directorio de clientes y sus configuraciones."
                actionButton={
                    <button
                        onClick={() => navigate('/empresas/nueva')}
                        className="text-white bg-primary hover:bg-primary-hover font-bold rounded-lg text-xs px-4 py-2 shadow-md shadow-primary/30 transition-all flex items-center justify-center gap-2 w-full md:w-auto"
                    >
                        <i className="pi pi-plus"></i> <span className="hidden md:inline">Nueva Empresa</span><span className="md:hidden">Nueva</span>
                    </button>
                }
            />

            <Menu model={menuItems} popup ref={menuRef} id="popup_menu" />

            <AppTable
                value={companies}
                loading={loading}
                header={header}
                filters={filters}
                globalFilterFields={['razonSocial', 'cuit', 'rubro', 'grupo', 'estatus']}
                onValueChange={(data) => setFilteredCompanies(data)}
                emptyMessage="No se encontraron datos."
                sortMode="multiple"
                removableSort
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data)}
                rowExpansionTemplate={rowExpansionTemplate}
                dataKey="id"
                sortIcon={customSortIcon}
            >
                {/* Expander Column for desktop & mobile spacer */}
                <Column expander={true} style={{ width: '2rem' }} className="2xl:hidden" headerClassName="2xl:hidden" />

                <Column field="id" header="#" sortable className="hidden md:table-cell font-mono text-sm text-secondary/50 w-10 pl-6" headerClassName="hidden md:table-cell pl-6"></Column>
                <Column field="razonSocial" header="Razón Social" sortable className="font-bold text-secondary-dark"></Column>
                <Column field="cuit" header="CUIT" sortable className="font-mono text-sm hidden sm:table-cell" headerClassName="hidden sm:table-cell"></Column>
                <Column field="rubro" header="Rubro" sortable className="hidden lg:table-cell" headerClassName="hidden lg:table-cell"></Column>
                <Column field="grupo" header="Grupo" sortable className="hidden xl:table-cell" headerClassName="hidden xl:table-cell"></Column>
                <Column field="estatus" header="Estatus" sortable body={(d) => <StatusBadge status={d.estatus} />}></Column>
                <Column header="Acciones" body={actionTemplate} className="pr-6" headerClassName="pr-6" style={{ width: '50px', textAlign: 'center' }}></Column>
            </AppTable>

            <p className="mt-4 text-[10px] text-secondary/50 text-center md:hidden pb-4">
                Toque la fila para ver detalles.
            </p>
        </div>
    );
};

export default CompanyList;

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
    const [filters, setFilters] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [companies] = useState(MOCK_EMPRESAS);
    const menuRef = useRef(null);
    const [selectedRow, setSelectedRow] = useState(null);

    const rubros = ['Software', 'Consultoría', 'Servicios', 'Construcción', 'Retail']; // Example rubros
    const estatusOptions = ['ACTIVO', 'INACTIVO', 'PENDIENTE'];

    useEffect(() => { initFilters(); }, []);

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            razonSocial: { value: null, matchMode: FilterMatchMode.CONTAINS },
            cuit: { value: null, matchMode: FilterMatchMode.CONTAINS },
            rubro: { value: null, matchMode: FilterMatchMode.EQUALS },
            grupo: { value: null, matchMode: FilterMatchMode.EQUALS },
            estatus: { value: null, matchMode: FilterMatchMode.EQUALS }
        });
        setGlobalFilterValue('');
    };

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

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const renderHeader = () => (
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-3 border-b border-secondary/20 gap-3">
            <div className="flex gap-2">
                <button onClick={initFilters} className="text-xs text-primary hover:text-primary-active font-bold hover:underline">Limpiar Filtros</button>
            </div>
            <div className="relative w-full md:w-auto">
                <div className="absolute inset-y-0 start-0 flex items-center ps-2.5 pointer-events-none"><i className="pi pi-search text-secondary text-xs"></i></div>
                <input type="text" value={globalFilterValue} onChange={onGlobalFilterChange} className="bg-white border border-secondary/30 text-secondary-dark text-sm rounded-lg focus:ring-primary focus:border-primary block w-full ps-8 p-1.5 outline-none" placeholder="Buscar..." />
            </div>
        </div>
    );

    const createTextFilter = (options) => <InputText value={options.value || ''} onChange={(e) => options.filterApplyCallback(e.target.value)} placeholder="Filtrar..." unstyled className="bg-white border border-secondary/30 text-secondary-dark text-sm rounded focus:ring-primary focus:border-primary block w-full px-2 h-8 outline-none font-normal" />;

    const createDropdownFilter = (options, list, placeholder = "Todos") => (
        <Dropdown value={options.value} options={list} onChange={(e) => options.filterApplyCallback(e.value)} placeholder={placeholder} className="p-column-filter w-full"
            pt={{
                root: { className: 'w-full bg-white border border-secondary/30 rounded h-8 flex items-center focus-within:ring-2 focus-within:ring-primary/50' },
                input: { className: 'text-sm px-2 text-secondary-dark' },
                trigger: { className: 'w-6 text-secondary flex items-center justify-center' },
                panel: { className: 'text-sm bg-white border border-secondary/20 shadow-lg' },
                item: { className: 'p-2 hover:bg-secondary-light text-secondary-dark' }
            }}
        />
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
    // State para expansion
    const [expandedRows, setExpandedRows] = useState(null);

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
                header={header}
                filters={filters}
                globalFilterFields={['razonSocial', 'cuit', 'rubro', 'grupo', 'estatus']}
                filterDisplay="row"
                emptyMessage="No se encontraron empresas."
                sortMode="multiple"
                removableSort
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data)}
                rowExpansionTemplate={rowExpansionTemplate}
                dataKey="id"
                sortIcon={customSortIcon}
            >
                {/* Expander Column for desktop & mobile spacer */}
                <Column expander={true} style={{ width: '2rem' }} />

                <Column field="id" header="#" sortable className="hidden md:table-cell font-mono text-sm text-secondary/50 w-10 pl-6" headerClassName="hidden md:table-cell pl-6"></Column>
                <Column field="razonSocial" header="Razón Social" sortable filter filterElement={createTextFilter} showFilterMenu={false} className="font-bold text-secondary-dark"></Column>
                <Column field="cuit" header="CUIT" sortable filter filterElement={createTextFilter} showFilterMenu={false} className="hidden sm:table-cell font-mono text-sm" headerClassName="hidden sm:table-cell"></Column>
                <Column field="rubro" header="Rubro" sortable filter filterElement={createTextFilter} showFilterMenu={false} className="hidden lg:table-cell" headerClassName="hidden lg:table-cell"></Column>
                <Column field="grupo" header="Grupo" sortable filter filterElement={createTextFilter} showFilterMenu={false} className="hidden xl:table-cell" headerClassName="hidden xl:table-cell"></Column>
                <Column field="estatus" header="Estatus" sortable body={(d) => <StatusBadge status={d.estatus} />} filter filterElement={(opts) => createDropdownFilter(opts, estatusOptions)} showFilterMenu={false}></Column>
                <Column header="Acciones" body={actionTemplate} className="pr-6" headerClassName="pr-6" style={{ width: '50px', textAlign: 'center' }}></Column>
            </AppTable>

            <p className="mt-4 text-[10px] text-secondary/50 text-center md:hidden pb-4">
                Toque la fila para ver detalles.
            </p>
        </div>
    );
};

export default CompanyList;

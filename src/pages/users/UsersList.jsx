import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Menu } from 'primereact/menu';
import { StatusBadge } from '../../components/ui/Badges';
import { MOCK_USERS } from '../../data/mockUsers';
import PageHeader from '../../components/ui/PageHeader';
import AppTable from '../../components/ui/AppTable';

const UsersList = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [users] = useState(MOCK_USERS);
    const menuRef = useRef(null);
    const [selectedRow, setSelectedRow] = useState(null);

    const roles = ['ADMINISTRADOR', 'PROVEEDOR', 'AUDITOR', 'TECNICO', 'RRHH'];
    const estatusOptions = ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'];

    useEffect(() => { initFilters(); }, []);

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            username: { value: null, matchMode: FilterMatchMode.CONTAINS },
            email: { value: null, matchMode: FilterMatchMode.CONTAINS },
            role: { value: null, matchMode: FilterMatchMode.EQUALS },
            status: { value: null, matchMode: FilterMatchMode.EQUALS }
        });
        setGlobalFilterValue('');
    };

    const menuItems = [
        {
            label: 'Ver Detalles',
            icon: 'pi pi-eye',
            command: () => {
                if (selectedRow) {
                    navigate(`/usuarios/${selectedRow.id}`);
                }
            }
        },
        {
            label: 'Editar',
            icon: 'pi pi-pencil',
            command: () => {
                console.log("Editando a:", selectedRow?.username);
            }
        },
        {
            label: 'Borrar',
            icon: 'pi pi-trash',
            className: 'text-red-500',
            command: () => {
                console.log("Borrando a:", selectedRow?.username);
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

    const fullNameTemplate = (rowData) => {
        return (
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                    {rowData.firstName.charAt(0)}{rowData.lastName.charAt(0)}
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-secondary-dark leading-tight">{rowData.firstName} {rowData.lastName}</span>
                    <span className="text-[10px] text-secondary">{rowData.email}</span>
                </div>
            </div>
        );
    };

    const header = renderHeader();

    return (
        <div className="animate-fade-in w-full">
            <PageHeader
                title="Usuarios"
                subtitle="Gestión de usuarios y roles del sistema."
                actionButton={
                    <button
                        onClick={() => navigate('/usuarios/nuevo?mode=NEW')}
                        className="text-white bg-primary hover:bg-primary-hover font-bold rounded-lg text-xs px-4 py-2 shadow-md shadow-primary/30 transition-all flex items-center justify-center gap-2 w-full md:w-auto"
                    >
                        <i className="pi pi-plus"></i> <span className="hidden md:inline">Nuevo Usuario</span><span className="md:hidden">Nuevo</span>
                    </button>
                }
            />

            <Menu model={menuItems} popup ref={menuRef} id="popup_menu" />

            <AppTable
                value={users}
                header={header}
                filters={filters}
                globalFilterFields={['username', 'firstName', 'lastName', 'email', 'role']}
                filterDisplay="row"
                dataKey="id"
                sortIcon={customSortIcon}
                emptyMessage="No se encontraron usuarios."
            >
                <Column field="id" header="#" sortable className="font-mono text-sm text-secondary/50 w-10 pl-6" headerClassName="pl-6"></Column>
                <Column field="username" header="Usuario" sortable filter filterElement={createTextFilter} showFilterMenu={false} className="font-mono text-secondary-dark"></Column>
                <Column header="Nombre" body={fullNameTemplate} sortable sortField="firstName" filter filterPlaceholder="Buscar nombre..." filterElement={createTextFilter} showFilterMenu={false}></Column>
                <Column field="status" header="Estatus" sortable body={(d) => <StatusBadge status={d.status} />} filter filterElement={(opts) => createDropdownFilter(opts, estatusOptions)} showFilterMenu={false}></Column>
                <Column header="Acciones" body={actionTemplate} className="pr-6" headerClassName="pr-6" style={{ width: '50px', textAlign: 'center' }}></Column>
            </AppTable>
        </div>
    );
};

export default UsersList;

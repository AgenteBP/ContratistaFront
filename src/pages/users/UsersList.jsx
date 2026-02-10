import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Menu } from 'primereact/menu';
import { StatusBadge } from '../../components/ui/Badges';
import { MOCK_USERS } from '../../data/mockUsers';
import { userService } from '../../services/userService';
import PageHeader from '../../components/ui/PageHeader';
import AppTable from '../../components/ui/AppTable';

import PrimaryButton from '../../components/ui/PrimaryButton';

const UsersList = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState(null);
    const [loading, setLoading] = useState(true);
    const menuRef = useRef(null);
    const [selectedRow, setSelectedRow] = useState(null);

    const roles = ['ADMINISTRADOR', 'PROVEEDOR', 'AUDITOR', 'TECNICO', 'RRHH'];
    const estatusOptions = ['ACTIVO', 'INACTIVO'];

    useEffect(() => {
        initFilters();
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            // --- INTEGRACIÓN CON API ---
            // Para activar la API real:
            // 1. Descomentar la siguiente línea:
            const data = await userService.getAll();

            // Transformar datos de API para la tabla
            const processedData = data.map(user => ({
                ...user,
                // Mapear active (bool) a status (string) para el Badge
                status: user.active ? 'ACTIVO' : 'INACTIVO',
                // Si la API no trae email separado y usa username como email
                email: user.username,
                // Aplanar roles para filtrado/ordenamiento simple si es necesario
                roleStr: user.rols ? user.rols.join(', ') : ''
            }));

            console.log("Raw API Data:", data);
            console.log("Processed Data:", processedData);

            // Comentar la línea de mock data:
            // const data = MOCK_USERS;

            setUsers(processedData);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
        } finally {
            setLoading(false);
        }
    };

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            username: { value: null, matchMode: FilterMatchMode.CONTAINS },
            firstName: { value: null, matchMode: FilterMatchMode.CONTAINS }, // Agregado
            lastName: { value: null, matchMode: FilterMatchMode.CONTAINS }, // Agregado
            email: { value: null, matchMode: FilterMatchMode.CONTAINS },
            // role: { value: null, matchMode: FilterMatchMode.EQUALS }, // Ajustar si se quiere filtrar por rol
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
                        disabled={loading}
                        className={`bg-secondary-light/40 border border-secondary/20 text-secondary-dark text-xs rounded-lg focus:ring-1 focus:ring-primary/20 focus:border-primary/50 block w-full ps-9 p-2 outline-none transition-all placeholder:text-secondary/40 h-9 ${loading ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                        placeholder="Buscar usuario..."
                    />
                </div>
            </div>

            {/* Bottom Row: Filters & Stats */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between border-t border-secondary/5 pt-3">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative">
                        <Dropdown
                            value={filters?.status?.value}
                            options={estatusOptions.map(s => ({ label: s, value: s }))}
                            onChange={(e) => {
                                let _filters = { ...filters };
                                _filters['status'].value = e.value;
                                setFilters(_filters);
                            }}
                            placeholder="Estatus"
                            pt={dropdownPt}
                        />
                        {filters?.status?.value && (
                            <i
                                className="pi pi-filter-slash text-white bg-primary text-[10px] absolute -top-2 -right-2 rounded-full p-[3px] shadow-sm border border-secondary/10 cursor-pointer hover:bg-danger transition-colors"
                                onClick={() => {
                                    let _filters = { ...filters };
                                    _filters['status'].value = null;
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
                        {filteredUsers ? filteredUsers.length : users.length} Usuarios
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

    const fullNameTemplate = (rowData) => {
        return (
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                    {rowData.firstName?.charAt(0) || ''}{rowData.lastName?.charAt(0) || ''}
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-secondary-dark leading-tight">{rowData.firstName} {rowData.lastName}</span>
                    <span className="text-[10px] text-secondary">{rowData.username}</span>
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
                    <PrimaryButton
                        label="Nuevo Usuario"
                        onClick={() => navigate('/usuarios/nuevo?mode=NEW')}
                    />
                }
            />

            <Menu model={menuItems} popup ref={menuRef} id="popup_menu" />

            <AppTable
                value={users}
                loading={loading}
                header={renderHeader()}
                filters={filters}
                globalFilterFields={['username', 'role', 'email']}
                onValueChange={(data) => setFilteredUsers(data)}
                dataKey="id"
                sortIcon={customSortIcon}
                emptyMessage="No se encontraron usuarios."
            >
                <Column field="id" header="#ID" sortable className="hidden md:table-cell font-mono text-sm text-secondary/50 w-10 pl-6" headerClassName="hidden md:table-cell pl-6"></Column>

                {/* Usuario / Email */}
                <Column field="username" header="Usuario" sortable className="hidden lg:table-cell font-mono text-secondary-dark" headerClassName="hidden lg:table-cell"></Column>

                {/* Nombre Completo */}
                <Column header="Nombre" body={fullNameTemplate} sortable sortField="firstName" className="pl-4" headerClassName="pl-4"></Column>


                {/* Estatus Mapeado */}
                <Column field="status" header="Estatus" sortable body={(d) => <StatusBadge status={d.status} />}></Column>

                <Column header="Acciones" body={actionTemplate} className="pr-6" headerClassName="pr-6" style={{ width: '50px', textAlign: 'center' }}></Column>
            </AppTable>
        </div>
    );
};

export default UsersList;

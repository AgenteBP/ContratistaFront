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
import TableFilters from '../../components/ui/TableFilters';

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
    const [expandedRows, setExpandedRows] = useState(null);

    const roles = ['PROVEEDOR', 'AUDITOR', 'CLIENTE/EMPRESA', 'ADMINISTRADOR'];
    const estadoOptions = ['ACTIVO', 'INACTIVO'];

    const roleTranslations = {
        'ADMIN': 'ADMINISTRADOR',
        'ROLE_ADMIN': 'ADMINISTRADOR',
        'ADMINISTRATOR': 'ADMINISTRADOR',
        'ADMINISTRADOR': 'ADMINISTRADOR',
        'PROVIDER': 'PROVEEDOR',
        'ROLE_PROVIDER': 'PROVEEDOR',
        'PROVEEDOR': 'PROVEEDOR',
        'SUPPLIER': 'PROVEEDOR',
        'AUDITOR': 'AUDITOR',
        'ROLE_AUDITOR': 'AUDITOR',
        'COMPANY': 'CLIENTE/EMPRESA',
        'ROLE_COMPANY': 'CLIENTE/EMPRESA',
        'ENTERPRISE': 'CLIENTE/EMPRESA',
        'CLIENTE': 'CLIENTE/EMPRESA',
        'EMPRESA': 'CLIENTE/EMPRESA',
        'CUSTOMER': 'CLIENTE/EMPRESA',
        'TECNICO': 'TÉCNICO', // Optional if technical users exist? Removing from filter as per request but keeping translation just in case
        'RRHH': 'RRHH'
    };

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
            const processedData = data.map(user => {
                // Traducir roles
                const translatedRoles = user.rols ? user.rols.map(r => roleTranslations[r.toUpperCase()] || r) : [];

                return {
                    ...user,
                    // Reemplazar rols con los traducidos para visualizar
                    rols: translatedRoles,
                    // Mapear active (bool) a status (string) para el Badge
                    status: user.active ? 'ACTIVO' : 'INACTIVO',
                    // Si la API no trae email separado y usa username como email
                    email: user.username,
                    // Aplanar roles para filtrado/ordenamiento simple si es necesario
                    roleStr: translatedRoles.join(', ')
                };
            });

            console.log("Raw API Data:", data);
            console.log("Processed Data:", processedData);

            // Comentar la línea de mock data:
            // const data = MOCK_USERS;

            setUsers(processedData);
            setFilteredUsers(null);
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
            roleStr: { value: null, matchMode: FilterMatchMode.CONTAINS },
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



    const filterConfig = [
        { label: 'Rol', value: 'roleStr', options: roles.map(r => ({ label: r, value: r })) },
        { label: 'Estado', value: 'status', options: estadoOptions.map(s => ({ label: s, value: s })) }
    ];

    const renderHeader = () => (
        <TableFilters
            filters={filters}
            setFilters={setFilters}
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={onGlobalFilterChange}
            config={filterConfig}
            totalItems={users.length}
            filteredItems={filteredUsers ? filteredUsers.length : null}
            itemName="USUARIOS"
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
                    {rowData.firstName?.charAt(0) || ''}{rowData.lastName?.charAt(0) || ''}
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-secondary-dark leading-tight">{rowData.firstName} {rowData.lastName}</span>
                    <span className="text-[10px] text-secondary">{rowData.username}</span>
                </div>
            </div>
        );
    };

    const rowExpansionTemplate = (data) => (
        <div className="p-4 bg-gray-50 text-sm space-y-3 animate-fade-in relative">
            {/* Indicador visual de expansión */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>

            <div className="grid grid-cols-1 gap-2">
                <div>
                    <span className="font-bold text-secondary-dark block mb-1">Roles:</span>
                    <div className="flex flex-wrap gap-1">
                        {data.rols?.map((rol, index) => (
                            <span key={index} className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary-light text-secondary-dark border border-secondary/20">
                                {rol}
                            </span>
                        ))}
                    </div>
                </div>
                <div>
                    <span className="font-bold text-secondary-dark block">Email / Usuario:</span>
                    <span className="text-secondary">{data.username}</span>
                </div>
            </div>
        </div>
    );

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
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data)}
                rowExpansionTemplate={rowExpansionTemplate}
            >
                <Column header="Nombre" body={fullNameTemplate} sortable sortField="firstName" className="pl-6" headerClassName="pl-6"></Column>


                {/* Estado Mapeado */}
                {/* Estado Mapeado */}
                <Column field="roleStr" header="Roles" sortable className="hidden md:table-cell" headerClassName="hidden md:table-cell" style={{ width: '350px' }} body={(rowData) => (
                    <div className="flex flex-wrap gap-1">
                        {rowData.rols?.map((rol, index) => (
                            <span key={index} className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary-light text-secondary-dark border border-secondary/20">
                                {rol}
                            </span>
                        ))}
                    </div>
                )}></Column>

                <Column field="status" header="Estado" sortable body={(d) => <StatusBadge status={d.status} />}></Column>

                <Column header="Acciones" body={actionTemplate} className="pr-6" headerClassName="pr-6" style={{ width: '50px', textAlign: 'center' }}></Column>
            </AppTable>
        </div>
    );
};

export default UsersList;

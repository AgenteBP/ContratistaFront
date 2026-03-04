import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import Dropdown from '../../components/ui/Dropdown';
import { Menu } from 'primereact/menu';
import { RiskBadge, BooleanBadge, StatusBadge } from '../../components/ui/Badges';
import PageHeader from '../../components/ui/PageHeader';
import AppTable from '../../components/ui/AppTable';
import TableFilters from '../../components/ui/TableFilters';
import { auditorService } from '../../services/auditorService';
import { groupService } from '../../services/groupService';
import { MOCK_AUDITORES } from '../../data/mockAuditors';
import { formatCUIT } from '../../utils/formatUtils';
import PrimaryButton from '../../components/ui/PrimaryButton';

const AuditorsList = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [expandedRows, setExpandedRows] = useState(null);
    const [auditores, setAuditores] = useState([]);
    const [filteredAuditores, setFilteredAuditores] = useState(null);
    const [loading, setLoading] = useState(false);
    const menuRef = useRef(null);
    const [selectedRow, setSelectedRow] = useState(null);



    const tipos = ['LEGAL', 'TÉCNICO'];
    // const grupos = ['EXTERNO', 'TECNICO', 'UNIPERSONAL']; // Now dynamic
    const estadoOptions = ['ACTIVO', 'DADO DE BAJA', 'SUSPENDIDO'];

    useEffect(() => {
        initFilters();
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [auditorsData, groupsData] = await Promise.all([
                auditorService.getAll(),
                groupService.getAll()
            ]);

            // Create groups lookup map
            const groupsMap = {};
            if (Array.isArray(groupsData)) {
                groupsData.forEach(g => {
                    groupsMap[g.idGroup] = g.description;
                });
            }

            // Map backend snake_case to frontend if necessary
            // AuditorsDTO: id_auditor, registration_number, type_auditor, user (UserDTO)
            const mappedData = auditorsData.map(a => {
                // Map Type
                let tipo = a.type_auditor;
                if (tipo === 'TECHNICAL' || tipo === 'TECNICO') tipo = 'TÉCNICO';
                if (tipo === 'LEGAL') tipo = 'LEGAL';

                // Map Group
                // Assuming auditor has idGroup or similar connection to a group
                // If not directly on auditor, check user? For now assuming on auditor/user structure similar to companies or specific logic.
                // Re-reading: "columna grupo tambien es a que grupo esta asociado como en empresa"
                // If the API doesn't have it, we might need a workaround. 
                // Let's assume `a.id_group` or `a.group` exists or `a.user.id_group`.
                // Checking previous context: Auditors are Users. Users have Groups?
                // Use a safe fallback.
                const groupName = a.group?.description || groupsMap[a.idGroup] || groupsMap[a.id_group] || 'Sin Grupo';

                return {
                    id: a.id_auditor,
                    registration_number: a.registration_number,
                    type_auditor: a.type_auditor,
                    user: a.user,
                    // Fields for table filters/sorting
                    razonSocial: a.user ? `${a.user.firstName || ''} ${a.user.lastName || ''}` : 'Sin Nombre',
                    cuit: formatCUIT(a.user?.cuit || '-'),
                    tipo: tipo,
                    estado: 'ACTIVO', // Default
                    grupo: groupName
                };
            });
            setAuditores(mappedData);
            setFilteredAuditores(null);
        } catch (error) {
            console.error("Error loading auditors:", error);
            // setAuditores(MOCK_AUDITORES); // Optional fallback
        } finally {
            setLoading(false);
        }
    };

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            razonSocial: { value: null, matchMode: FilterMatchMode.CONTAINS },
            cuit: { value: null, matchMode: FilterMatchMode.CONTAINS },
            tipo: { value: null, matchMode: FilterMatchMode.EQUALS },
            grupo: { value: null, matchMode: FilterMatchMode.EQUALS },
            estado: { value: null, matchMode: FilterMatchMode.EQUALS },
            accesoHabilitado: { value: null, matchMode: FilterMatchMode.EQUALS }
        });
        setGlobalFilterValue('');
    };

    const menuItems = [
        {
            label: 'Ver Detalles',
            icon: 'pi pi-eye',
            command: () => {
                if (selectedRow) {
                    navigate(`/auditores/${selectedRow.id}`);
                }
            }
        },
        {
            label: 'Editar',
            icon: 'pi pi-pencil',
            command: () => {
                console.log("Editando a:", selectedRow?.razonSocial);
            }
        },
        { separator: true },
        {
            label: 'Borrar',
            icon: 'pi pi-trash',
            className: 'text-red-500',
            command: () => {
                // Implementar borrado
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

    const rowExpansionTemplate = (data) => (
        <div className="bg-secondary-light border-t border-secondary/20 p-4 shadow-inner animate-fade-in text-sm">
            <div className="flex items-center gap-2 mb-3">
                <i className="pi pi-briefcase text-primary text-lg"></i>
                <h5 className="font-bold text-secondary-dark">Ficha del Auditor #{data.id}</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <h6 className="text-[10px] font-bold text-secondary uppercase tracking-wider">Detalles Adicionales</h6>
                    <div><span className="block text-[10px] text-secondary">Tipo</span><span className="font-medium text-secondary-dark">{data.tipo}</span></div>
                    {/* Grupo: Visible en card solo si está oculto en tabla (hidden xl:table-cell -> xl:hidden) */}
                    <div className="xl:hidden"><span className="block text-[10px] text-secondary">Grupo</span><span className="font-medium text-secondary-dark">{data.grupo}</span></div>
                    <div><span className="block text-[10px] text-secondary">Riesgo</span><RiskBadge nivel={data.riesgo} /></div>
                </div>
                <div className="space-y-2">
                    <h6 className="text-[10px] font-bold text-secondary uppercase tracking-wider">Estado</h6>
                    <div className="flex justify-between md:block"><span className="text-[10px] text-secondary">Acceso</span><div className="mt-0.5"><BooleanBadge value={data.accesoHabilitado} isAccess={true} /></div></div>
                </div>
                <div className="space-y-2">
                    <h6 className="text-[10px] font-bold text-secondary uppercase tracking-wider">Identificación</h6>
                    {/* CUIT: Hidden sm:table-cell -> sm:hidden */}
                    <div className="sm:hidden"><span className="block text-[10px] text-secondary">CUIT</span><span className="font-mono text-secondary-dark">{data.cuit}</span></div>
                    {/* Servicio (redundante con Detalle Adicional pero diferente punto de vista si se quiere ocultar especif. en lg) */}
                    {/* En AuditorList: Servicio es hidden lg:table-cell. Entonces aquí: lg:hidden */}
                    <div className="lg:hidden"><span className="block text-[10px] text-secondary">Tipo</span><span className="font-medium text-secondary-dark">{data.tipo}</span></div>
                </div>
                <div className="space-y-2">
                    <h6 className="text-[10px] font-bold text-secondary uppercase tracking-wider">Historial</h6>
                    <div><span className="block text-[10px] text-secondary">Alta</span><span className="font-mono text-secondary-dark">{data.altaSistema}</span></div>
                    {data.bajaSistema && <div><span className="block text-[10px] text-secondary">Baja</span><span className="font-mono text-danger">{data.bajaSistema}</span></div>}
                </div>
                <div className="space-y-2">
                    <h6 className="text-[10px] font-bold text-secondary uppercase tracking-wider">Notas</h6>
                    <div><span className="block text-[10px] text-secondary">Empleador AFIP</span><span className="font-medium text-secondary-dark">{data.empleadorAFIP}</span></div>
                    {data.motivo && <div className="bg-warning-light p-1.5 rounded border border-warning"><p className="text-[10px] text-secondary-dark italic">"{data.motivo}"</p></div>}
                </div>
            </div>
        </div>
    );

    const dropdownPt = {
        root: { className: 'w-full md:w-48 bg-white border border-secondary/30 rounded-lg h-9 flex items-center focus-within:ring-2 focus-within:ring-primary/50 shadow-sm' },
        input: { className: 'text-xs px-3 text-secondary-dark font-medium' },
        trigger: { className: 'w-8 text-secondary flex items-center justify-center border-l border-secondary/10' },
        panel: { className: 'text-xs bg-white border border-secondary/10 shadow-xl rounded-lg mt-1' },
        item: { className: 'p-2.5 hover:bg-secondary-light text-secondary-dark transition-colors' },
        list: { className: 'p-1' }
    };

    // Helper to extract unique options from data
    const getUniqueOptions = (data, field) => {
        const values = data.map(item => item[field]).filter(val => val !== null && val !== undefined);
        return [...new Set(values)].sort().map(val => ({ label: val, value: val }));
    };

    const grupoOptions = getUniqueOptions(auditores, 'grupo');

    const filterConfig = [
        { label: 'Tipo', value: 'tipo', options: tipos.map(s => ({ label: s, value: s })) },
        { label: 'Grupo', value: 'grupo', options: grupoOptions },
        { label: 'Estado', value: 'estado', options: estadoOptions.map(s => ({ label: s, value: s })) }
    ];

    const renderHeader = () => (
        <TableFilters
            filters={filters}
            setFilters={setFilters}
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={onGlobalFilterChange}
            config={filterConfig}
            totalItems={auditores.length}
            filteredItems={filteredAuditores ? filteredAuditores.length : null}
            itemName="AUDITORES"
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
        const firstName = rowData.user?.firstName || '';
        const lastName = rowData.user?.lastName || '';
        const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

        return (
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                    {initials}
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-secondary-dark leading-tight">{rowData.razonSocial}</span>
                    <span className="text-[10px] text-secondary">{rowData.user?.username}</span>
                </div>
            </div>
        );
    };

    const header = renderHeader();

    return (
        <div className="animate-fade-in w-full">
            <PageHeader
                title="Auditores"
                subtitle="Gestión de auditores legales y técnicos."
                actionButton={
                    <PrimaryButton
                        label="Nuevo Auditor"
                        onClick={() => navigate('/usuarios/nuevo?role=AUDITOR')}
                    />
                }
            />

            <Menu model={menuItems} popup ref={menuRef} id="popup_menu" />

            <AppTable
                value={auditores}
                loading={loading}
                header={header}
                filters={filters}
                globalFilterFields={['razonSocial', 'cuit', 'tipo', 'grupo', 'estado']}
                onValueChange={(data) => setFilteredAuditores(data)}
                emptyMessage="No se encontraron datos."
                sortMode="multiple"
                removableSort
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data)}
                rowExpansionTemplate={rowExpansionTemplate}
                dataKey="id"
                sortIcon={customSortIcon}
            >
                <Column expander={true} style={{ width: '2rem' }} className="2xl:hidden" headerClassName="2xl:hidden" />

                <Column field="fullName" header="Nombre" body={fullNameTemplate} sortable className="pl-6" headerClassName="pl-6"></Column>
                <Column field="cuit" header="CUIT" sortable className="font-mono text-sm hidden sm:table-cell" headerClassName="hidden sm:table-cell"></Column>
                <Column field="tipo" header="Tipo" sortable className="hidden lg:table-cell" headerClassName="hidden lg:table-cell"></Column>
                <Column field="grupo" header="Grupo" sortable className="hidden xl:table-cell" headerClassName="hidden xl:table-cell"></Column>
                <Column field="estado" header="Estado" sortable body={(d) => <StatusBadge status={d.estado} />}></Column>
                <Column header="Acciones" body={actionTemplate} className="pr-6" headerClassName="pr-6" style={{ width: '50px', textAlign: 'center' }}></Column>
            </AppTable>
        </div>
    );
};

export default AuditorsList;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Menu } from 'primereact/menu';
import { StatusBadge } from '../../components/ui/Badges';
import PageHeader from '../../components/ui/PageHeader';
import AppTable from '../../components/ui/AppTable';
import TableFilters from '../../components/ui/TableFilters';
import { companyService } from '../../services/companyService';
import { groupService } from '../../services/groupService';
import { formatCUIT } from '../../utils/formatUtils';
import { MOCK_EMPRESAS } from '../../data/mockCompanies';

const CompanyList = () => {
    const navigate = useNavigate();

    // Constants
    const estadoOptions = ['ACTIVO', 'INACTIVO', 'PENDIENTE'];

    // Initial Filter State Helper
    const getInitialFilters = () => ({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        razonSocial: { value: null, matchMode: FilterMatchMode.CONTAINS },
        cuit: { value: null, matchMode: FilterMatchMode.CONTAINS },
        rubro: { value: null, matchMode: FilterMatchMode.EQUALS },
        grupo: { value: null, matchMode: FilterMatchMode.EQUALS },
        estado: { value: null, matchMode: FilterMatchMode.EQUALS },
        sector: { value: null, matchMode: FilterMatchMode.EQUALS },
        pais: { value: null, matchMode: FilterMatchMode.EQUALS }
    });

    // State
    const [filters, setFilters] = useState(getInitialFilters());
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [companies, setCompanies] = useState([]);
    const [filteredCompanies, setFilteredCompanies] = useState(null);
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
        initFilters();
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Companies and Groups in parallel
            const [companiesData, groupsData] = await Promise.all([
                companyService.getAll(),
                groupService.getAll()
            ]);

            console.log("Companies API Data:", companiesData);
            console.log("Groups API Data:", groupsData);

            // 2. Create a lookup map for groups: id -> description
            const groupsMap = {};
            if (Array.isArray(groupsData)) {
                groupsData.forEach(g => {
                    // Adjust keys based on GroupDTO (idGroup / description)
                    groupsMap[g.idGroup] = g.description;
                });
            }

            // 3. Map Companies
            const mappedData = companiesData.map(c => {
                // Determine Group Name
                // Priority: Nested object -> Mapped ID -> 'Sin Grupo'
                const groupName = c.group?.description || groupsMap[c.idGroup] || groupsMap[c.id_group] || 'Sin Grupo';

                return {
                    id: c.idCompany,
                    razonSocial: c.description || 'Sin Razón Social',
                    cuit: formatCUIT(c.cuit),
                    // User Query: "De donde sacas el dato de servicio?" 
                    // Answer: It's likely not in DB. We default to 'No especificado'.
                    rubro: c.rubro || 'No especificado',
                    grupo: groupName,
                    estado: 'ACTIVO', // Default field as requested previously
                    requiredTechnical: c.requiredTechnical
                };
            });

            setCompanies(mappedData);
            setFilteredCompanies(null);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
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

    // Dynamic Options derived from loaded companies
    const rubroOptions = getUniqueOptions(companies, 'rubro');
    const grupoOptions = getUniqueOptions(companies, 'grupo');

    const filterConfig = [
        { label: 'Rubro', value: 'rubro', options: rubroOptions },
        { label: 'Grupo', value: 'grupo', options: grupoOptions },
        { label: 'Estado', value: 'estado', options: estadoOptions.map(s => ({ label: s, value: s })) },
        { label: 'Sector', value: 'sector', options: [{ label: 'INDUSTRIAL', value: 'INDUSTRIAL' }, { label: 'SERVICIOS', value: 'SERVICIOS' }] },
        { label: 'País', value: 'pais', options: [{ label: 'ARGENTINA', value: 'ARGENTINA' }, { label: 'CHILE', value: 'CHILE' }] }
    ];

    const renderHeader = () => (
        <TableFilters
            filters={filters}
            setFilters={setFilters}
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={onGlobalFilterChange}
            config={filterConfig}
            totalItems={companies.length}
            filteredItems={filteredCompanies ? filteredCompanies.length : null}
            itemName="EMPRESAS"
        />
    );

    const customSortIcon = (options) => {
        if (options.sorted) return options.sortOrder === 1 ? <i className="pi pi-arrow-up text-[10px] ml-1 text-primary"></i> : <i className="pi pi-arrow-down text-[10px] ml-1 text-primary"></i>;
        return <i className="pi pi-sort-alt text-[10px] ml-1 text-secondary opacity-50"></i>;
    };

    const textDataTemplate = (rowData, field) => {
        const val = rowData[field];
        const isPlaceholder = ['No especificado', 'Sin Grupo', 'N/A', 'Sin Razón Social'].includes(val);
        return <span className={isPlaceholder ? "text-secondary/40 italic" : "text-secondary-dark"}>{val}</span>;
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
                <div className="lg:hidden"><span className="block text-[10px] text-secondary">Rubro</span>{textDataTemplate(data, 'rubro')}</div>

                {/* Grupo: Hidden xl:table-cell -> xl:hidden */}
                <div className="xl:hidden"><span className="block text-[10px] text-secondary">Grupo</span>{textDataTemplate(data, 'grupo')}</div>
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
                globalFilterFields={['razonSocial', 'cuit', 'rubro', 'grupo', 'estado']}
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

                <Column field="razonSocial" header="Razón Social" sortable className="font-bold text-secondary-dark pl-6" headerClassName="pl-6"></Column>
                <Column field="cuit" header="CUIT" sortable className="font-mono text-sm hidden sm:table-cell" headerClassName="hidden sm:table-cell"></Column>
                <Column field="rubro" header="Rubro" sortable className="hidden lg:table-cell" headerClassName="hidden lg:table-cell" body={(d) => textDataTemplate(d, 'rubro')}></Column>
                <Column field="grupo" header="Grupo" sortable className="hidden xl:table-cell" headerClassName="hidden xl:table-cell" body={(d) => textDataTemplate(d, 'grupo')}></Column>
                <Column field="estado" header="Estado" sortable body={(d) => <StatusBadge status={d.estado} />}></Column>
                <Column header="Acciones" body={actionTemplate} className="pr-6" headerClassName="pr-6" style={{ width: '50px', textAlign: 'center' }}></Column>
            </AppTable>

            <p className="mt-4 text-[10px] text-secondary/50 text-center md:hidden pb-4">
                Toque la fila para ver detalles.
            </p>
        </div>
    );
};

export default CompanyList;

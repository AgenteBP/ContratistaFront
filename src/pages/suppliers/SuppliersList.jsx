import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supplierService } from '../../services/supplierService';

// --- IMPORTACIONES DE PRIME REACT ---
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import Dropdown from '../../components/ui/Dropdown';
import { Menu } from 'primereact/menu';

// --- IMPORTACIONES DE TUS COMPONENTES UI (Atomic Design) ---
import { RiskBadge, BooleanBadge, StatusBadge } from '../../components/ui/Badges';
import PageHeader from '../../components/ui/PageHeader';
import AppTable from '../../components/ui/AppTable';
import TableFilters from '../../components/ui/TableFilters';

// --- DATOS MOCK ---
import { MOCK_SUPPLIERS } from '../../data/mockSuppliers';
import { formatCUIT } from '../../utils/formatUtils';
import PrimaryButton from '../../components/ui/PrimaryButton';

const SuppliersList = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    // Estado para los datos y carga
    const [proveedores, setProveedores] = useState([]);
    const [filteredProveedores, setFilteredProveedores] = useState(null);
    const [loading, setLoading] = useState(true);

    const menuRef = useRef(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [expandedRows, setExpandedRows] = useState(null);

    const servicios = ['ALQUILER DE VEHÍCULOS', 'BAREMO', 'CALLCENTER', 'INVERSION Y MANTENIMIENTO', 'LIMPIEZA DE OFICINAS', 'MANTENIMIENTO', 'VIGILANCIA', 'MOVILES Y EQUIPOS'];
    const estadoOptions = ['ACTIVO', 'DADO DE BAJA', 'SIN COMPLETAR', 'SUSPENDIDO'];

    useEffect(() => {
        initFilters();
        loadSuppliers();
    }, []);

    const loadSuppliers = async () => {
        try {
            setLoading(true);
            console.log("Fetching suppliers...");
            const response = await supplierService.getAll();
            console.log("API Response:", response);

            if (!response || !Array.isArray(response)) {
                console.warn("Invalid API response format:", response);
                throw new Error("Invalid response");
            }

            // Map API data to Table structure
            const mappedData = response.map(s => ({
                id: s.id_supplier || s.cuit || Math.random(),
                internalId: s.id_supplier,
                rawCuit: s.cuit, // Added for navigation
                razonSocial: s.company_name || 'Sin Razón Social',
                cuit: formatCUIT(s.cuit) || 'N/A',
                nombreFantasia: s.fantasy_name || s.company_name || '-',
                tipoPersona: (s.type_person || 'N/A').toUpperCase(),
                clasificacionAFIP: s.classification_afip || 'N/A',
                servicio: s.category_service || 'N/A',
                email: s.email_corporate || '-',
                telefono: s.phone || '-',
                empleadorAFIP: !!s.is_an_afip_employer,
                esTemporal: !!s.is_temporary_hiring,
                estado: s.active === 0 ? 'ACTIVO' : (s.active === 1 ? 'DADO DE BAJA' : 'INACTIVO'),
                provincia: s.province || '-',
                localidad: s.city || '-',
                motivo: s.document_supplier?.observaciones || null,
                accesoHabilitado: s.user?.active || false,
                facturasAPOC: 'No',
                altaSistema: 'N/A'
            }));

            setProveedores(mappedData);
            setFilteredProveedores(null);
        } catch (error) {
            console.error("Error loading suppliers:", error);
            // Fallback to empty but log it
            setProveedores([]);
        } finally {
            setLoading(false);
        }
    };

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            razonSocial: { value: null, matchMode: FilterMatchMode.CONTAINS },
            cuit: { value: null, matchMode: FilterMatchMode.CONTAINS },
            servicio: { value: null, matchMode: FilterMatchMode.EQUALS },
            tipoPersona: { value: null, matchMode: FilterMatchMode.EQUALS },
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
                if (selectedRow?.rawCuit) {
                    navigate(`/proveedores/${selectedRow.rawCuit}`);
                } else {
                    console.error("No CUIT available for navigation", selectedRow);
                }
            }
        },
        {
            label: 'Asociar Empresa',
            icon: 'pi pi-link',
            command: () => {
                if (selectedRow?.rawCuit) {
                    navigate(`/proveedores/${selectedRow.rawCuit}/asociar-empresa`);
                } else {
                    console.error("No CUIT available for navigation", selectedRow);
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
            label: 'Suspender',
            icon: 'pi pi-ban',
            className: 'text-red-500',
            command: () => {
                console.log("Suspendiendo a:", selectedRow?.razonSocial);
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

    // --- TEMPLATES VISUALES ---

    // Template para la fila expandida (La Ficha Detallada)
    const rowExpansionTemplate = (data) => (
        <div className="bg-secondary-light border-t border-secondary/20 p-4 shadow-inner animate-fade-in text-sm">
            <div className="flex items-center gap-2 mb-3">
                <i className="pi pi-id-card text-primary text-lg"></i>
                <h5 className="font-bold text-secondary-dark">Ficha del Proveedor</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <h6 className="text-[10px] font-bold text-secondary uppercase tracking-wider">Datos Comerciales</h6>
                    {data.nombreFantasia && <div><span className="block text-[10px] text-secondary">Nombre Fantasía</span><span className="font-medium text-secondary-dark">{data.nombreFantasia}</span></div>}
                    <div><span className="block text-[10px] text-secondary">Condición AFIP</span><span className="font-medium text-secondary-dark">{data.clasificacionAFIP}</span></div>
                    <div><span className="block text-[10px] text-secondary">Servicio</span><span className="font-medium text-secondary-dark">{data.servicio}</span></div>
                </div>

                <div className="space-y-2">
                    <h6 className="text-[10px] font-bold text-secondary uppercase tracking-wider">Estado y Ubicación</h6>
                    <div className="mb-2">
                        <span className="block text-[10px] text-secondary">Ubicación</span>
                        <span className="font-medium text-secondary-dark">
                            {data.localidad ? `${data.localidad}, ${data.provincia}` : data.provincia}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex flex-col items-start gap-1">
                            <span className="text-[10px] text-secondary">Acceso</span>
                            <BooleanBadge value={data.accesoHabilitado} isAccess={true} />
                        </div>
                        <div className="flex flex-col items-start gap-1">
                            <span className="text-[10px] text-secondary">Temporal</span>
                            {data.esTemporal ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-warning-light text-warning-hover border border-warning/30 inline-flex items-center gap-1">
                                    <i className="pi pi-clock text-[8px]"></i> SÍ
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success-light text-success-hover border border-success/30 inline-flex items-center gap-1">
                                    NO
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col items-start gap-1">
                            <span className="text-[10px] text-secondary">APOC</span>
                            {String(data.facturasAPOC).toLowerCase() === 'no' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success-light text-success-hover border border-success/30 inline-flex items-center gap-1">
                                    NO
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-danger-light text-danger-hover border border-danger/30 inline-flex items-center gap-1">
                                    <i className="pi pi-exclamation-triangle text-[8px]"></i> SÍ
                                </span>
                            )}
                        </div>
                    </div>
                    {data.motivo && <div className="mt-2 bg-warning-light p-1.5 rounded border border-warning"><p className="text-[10px] text-secondary-dark italic">"{data.motivo}"</p></div>}
                </div>

                <div className="space-y-2">
                    <h6 className="text-[10px] font-bold text-secondary uppercase tracking-wider">Identificación</h6>
                    {/* CUIT: Hidden sm:table-cell -> sm:hidden */}
                    <div className="sm:hidden"><span className="block text-[10px] text-secondary">CUIT</span><span className="font-mono text-secondary-dark">{data.cuit}</span></div>
                    {/* Tipo: Hidden lg:table-cell -> lg:hidden */}
                    <div className="lg:hidden"><span className="block text-[10px] text-secondary">Tipo Persona</span><span className="font-medium text-secondary-dark">{data.tipoPersona}</span></div>
                    <div><span className="block text-[10px] text-secondary">Alta</span><span className="font-mono text-secondary-dark">{data.altaSistema}</span></div>
                    {data.bajaSistema && <div><span className="block text-[10px] text-secondary">Baja</span><span className="font-mono text-danger">{data.bajaSistema}</span></div>}
                </div>

                <div className="space-y-2">
                    <h6 className="text-[10px] font-bold text-secondary uppercase tracking-wider">Contacto</h6>
                    {data.email && <div className="truncate"><span className="block text-[10px] text-secondary">Email</span><a href={`mailto:${data.email}`} className="font-medium text-primary hover:underline truncate block" title={data.email}>{data.email}</a></div>}
                    {data.telefono && <div><span className="block text-[10px] text-secondary">Teléfono</span><span className="font-mono text-secondary-dark">{data.telefono}</span></div>}
                    <div><span className="block text-[10px] text-secondary">Empleador AFIP</span><div className="mt-0.5"><BooleanBadge value={data.empleadorAFIP} trueLabel="SI" falseLabel="NO" /></div></div>
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

    const filterConfig = [
        { label: 'Tipo', value: 'tipoPersona', options: ['JURIDICA', 'FISICA'].map(t => ({ label: t, value: t })) },
        { label: 'Servicio', value: 'servicio', options: servicios.map(s => ({ label: s, value: s })) },
        { label: 'Estado', value: 'estado', options: estadoOptions.map(s => ({ label: s, value: s })) }
    ];

    const renderHeader = () => (
        <TableFilters
            filters={filters}
            setFilters={setFilters}
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={onGlobalFilterChange}
            config={filterConfig}
            totalItems={proveedores.length}
            filteredItems={filteredProveedores ? filteredProveedores.length : null}
            itemName="PROVEEDORES"
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
                        setSelectedRow(rowData); // 1. Guardamos QUÉ proveedor es
                        menuRef.current.toggle(event); // 2. Abrimos el menú ahí mismo
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

    return (
        <div className="animate-fade-in w-full">
            <PageHeader
                title="Proveedores"
                subtitle="Base de datos de contratistas."
                icon="pi pi-briefcase"
                actionButton={
                    <PrimaryButton
                        label="Nuevo Proveedor"
                        onClick={() => navigate('/proveedores/nuevo?role=PROVEEDOR')}
                    />
                }
            />

            <Menu model={menuItems} popup ref={menuRef} id="popup_menu" />

            <AppTable
                value={proveedores}
                loading={loading}
                header={header}
                filters={filters}
                globalFilterFields={['razonSocial', 'cuit', 'servicio', 'estado']}
                onValueChange={(data) => setFilteredProveedores(data)}
                emptyMessage="No se encontraron datos."
                sortMode="multiple"
                removableSort
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data)}
                rowExpansionTemplate={rowExpansionTemplate}
                dataKey="id"
                sortIcon={customSortIcon}
            >
                {/* Expander Column: Visible (Spacer on Mobile due to global CSS hiding arrow) */}
                <Column expander={true} style={{ width: '2rem' }} className="2xl:hidden" headerClassName="2xl:hidden" />

                {/* Column 'id' removed as requested */}
                <Column field="razonSocial" header="Razón Social" sortable className="font-bold text-secondary-dark pl-6" headerClassName="pl-6"></Column>
                <Column field="cuit" header="CUIT" sortable className="font-mono text-sm hidden sm:table-cell" headerClassName="hidden sm:table-cell"></Column>
                <Column field="tipoPersona" header="Tipo" sortable className="hidden lg:table-cell" headerClassName="hidden lg:table-cell"></Column>
                <Column field="servicio" header="Servicio" sortable className="hidden xl:table-cell" headerClassName="hidden xl:table-cell"></Column>
                <Column field="estado" header="Estado" sortable body={(d) => <StatusBadge status={d.estado} />}></Column>
                <Column header="Acciones" body={actionTemplate} className="pr-6" headerClassName="pr-6" style={{ width: '50px', textAlign: 'center' }}></Column>
            </AppTable>

            <p className="mt-4 text-[10px] text-secondary/50 text-center md:hidden pb-4">
                Toque la fila para ver detalles.
            </p>
        </div>
    );
};

export default SuppliersList;
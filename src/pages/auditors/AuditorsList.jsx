import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Menu } from 'primereact/menu';
import { RiskBadge, BooleanBadge, StatusBadge } from '../../components/ui/Badges';
import PageHeader from '../../components/ui/PageHeader';
import AppTable from '../../components/ui/AppTable';
import { MOCK_AUDITORES } from '../../data/mockAuditors';

const AuditorsList = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [expandedRows, setExpandedRows] = useState(null);
    const [auditores] = useState(MOCK_AUDITORES);
    const menuRef = useRef(null);
    const [selectedRow, setSelectedRow] = useState(null);

    const servicios = ['AUDITOR LEGAL', 'AUDITOR TECNICO'];
    const grupos = ['EXTERNO', 'TECNICO', 'UNIPERSONAL'];
    const estatusOptions = ['ACTIVO', 'DADO DE BAJA', 'SUSPENDIDO'];

    useEffect(() => { initFilters(); }, []);

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            razonSocial: { value: null, matchMode: FilterMatchMode.CONTAINS },
            cuit: { value: null, matchMode: FilterMatchMode.CONTAINS },
            servicio: { value: null, matchMode: FilterMatchMode.EQUALS },
            grupo: { value: null, matchMode: FilterMatchMode.EQUALS },
            estatus: { value: null, matchMode: FilterMatchMode.EQUALS },
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
                    <div><span className="block text-[10px] text-secondary">Servicio</span><span className="font-medium text-secondary-dark">{data.servicio}</span></div>
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
                    <div className="lg:hidden"><span className="block text-[10px] text-secondary">Servicio (Tipo)</span><span className="font-medium text-secondary-dark">{data.servicio}</span></div>
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

    return (
        <div className="animate-fade-in w-full">
            <PageHeader
                title="Auditores"
                subtitle="Gestión de auditores legales y técnicos."
                actionButton={
                    <button
                        onClick={() => navigate('/usuarios/nuevo?role=AUDITOR')}
                        className="text-white bg-primary hover:bg-primary-hover font-bold rounded-lg text-xs px-4 py-2 shadow-md shadow-primary/30 transition-all flex items-center justify-center gap-2 w-full md:w-auto"
                    >
                        <i className="pi pi-plus"></i> <span className="hidden md:inline">Nuevo Auditor</span><span className="md:hidden">Nuevo</span>
                    </button>
                }
            />

            <Menu model={menuItems} popup ref={menuRef} id="popup_menu" />

            <AppTable
                value={auditores}
                header={header}
                filters={filters}
                globalFilterFields={['razonSocial', 'cuit', 'servicio', 'estatus']}
                filterDisplay="row"
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

                <Column field="id" header="#" sortable className="hidden md:table-cell font-mono text-sm text-secondary/50 w-10 pl-6" headerClassName="hidden md:table-cell pl-6"></Column>
                <Column field="razonSocial" header="Razón Social" sortable filter filterElement={createTextFilter} showFilterMenu={false} className="font-bold text-secondary-dark"></Column>
                <Column field="cuit" header="CUIT" sortable filter filterElement={createTextFilter} showFilterMenu={false} className="font-mono text-sm hidden sm:table-cell" headerClassName="hidden sm:table-cell"></Column>
                <Column field="servicio" header="Servicio" sortable filter filterElement={(opts) => createDropdownFilter(opts, servicios)} showFilterMenu={false} className="hidden lg:table-cell" headerClassName="hidden lg:table-cell"></Column>
                <Column field="grupo" header="Grupo" sortable filter filterElement={(opts) => createDropdownFilter(opts, grupos)} showFilterMenu={false} className="hidden xl:table-cell" headerClassName="hidden xl:table-cell"></Column>
                <Column field="estatus" header="Estatus" sortable body={(d) => <StatusBadge status={d.estatus} />} filter filterElement={(opts) => createDropdownFilter(opts, estatusOptions)} showFilterMenu={false} filterMenuStyle={{ width: '10rem' }}></Column>
                <Column header="Acciones" body={actionTemplate} className="pr-6" headerClassName="pr-6" style={{ width: '50px', textAlign: 'center' }}></Column>
            </AppTable>
        </div>
    );
};

export default AuditorsList;

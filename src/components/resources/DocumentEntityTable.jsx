import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';

// --- UI Components ---
import Dropdown from '../ui/Dropdown';
import { StatusBadge } from '../ui/Badges';
import PrimaryButton from '../ui/PrimaryButton';
import ObservationModal from '../ui/ObservationModal';
import AppTable from '../ui/AppTable';
import TableFilters from '../ui/TableFilters';

// --- Mocks ---
import { MOCK_SUPPLIERS } from '../../data/mockSuppliers';
import { MOCK_EMPLOYEES, MOCK_VEHICLES, MOCK_MACHINERY } from '../../data/mockResources';

const DocumentEntityTable = ({ type, filterStatus }) => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        entityName: { value: null, matchMode: FilterMatchMode.CONTAINS },
        tipo: { value: null, matchMode: FilterMatchMode.CONTAINS },
        estado: { value: null, matchMode: FilterMatchMode.EQUALS },
    });
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [observationModalVisible, setObservationModalVisible] = useState(false);
    const [selectedObservation, setSelectedObservation] = useState(null);


    // --- Mock Document Generators for Resources ---
    const generateDocsForResource = (item, type) => {
        const docs = [];
        const status = item.docStatus || 'PENDIENTE';

        // Ensure ID is String for consistency
        const entityIdStr = String(item.id);

        const createDoc = (id, tipo, estado, vencimiento = null, obs = null) => {
            // Determine frequency based on type (Mock logic)
            const isOneTime = ['TITULO', 'ALTA_AFIP', 'DNI', 'DOCUMENTACION_GENERAL', 'MANUAL_USO'].includes(tipo);

            return {
                id: `${entityIdStr}-${id}`,
                entityId: entityIdStr, // Enforce String
                entityName: item.nombre || item.razonSocial || item.patente || `Equipo ${item.id}`,
                entityType: type,
                tipo: tipo,
                estado: estado,
                fechaVencimiento: vencimiento,
                observacion: obs,
                frecuencia: isOneTime ? 'Única vez' : 'Periódica',
                archivo: estado === 'VIGENTE' ? 'archivo.pdf' : null,
                obligatorio: true // Default to true for generated core docs
            };
        };

        if (type === 'employees') {
            if (status === 'INCOMPLETA') docs.push(createDoc(1, 'DNI', 'PENDIENTE'));
            if (status === 'VENCIDA') docs.push(createDoc(2, 'ALTA_AFIP', 'VIGENTE', null)); // One time, clean status
            if (status === 'COMPLETA') docs.push(createDoc(3, 'ART_NOMINA', 'VIGENTE', '2025-12-31'));
            if (docs.length === 0) docs.push(createDoc(4, 'DOCUMENTACION_GENERAL', status));
        } else if (type === 'vehicles') {
            if (status === 'INCOMPLETA') docs.push(createDoc(1, 'TITULO', 'PENDIENTE'));
            if (status === 'PENDIENTE') docs.push(createDoc(2, 'VTV', 'PENDIENTE'));
            if (status === 'VENCIDA') docs.push(createDoc(3, 'SEGURO', 'VENCIDO', '2024-02-01'));
            if (status === 'COMPLETA') docs.push(createDoc(4, 'CEDULA_VERDE', 'VIGENTE', null));
            if (docs.length === 0) docs.push(createDoc(5, 'DOCUMENTACION_VEHIC', status));
        } else if (type === 'machinery') {
            if (status === 'PENDIENTE') docs.push(createDoc(1, 'CERT_OPERATIVIDAD', 'PENDIENTE'));
            if (status === 'VENCIDA') docs.push(createDoc(2, 'SEGURO_TECNICO', 'VENCIDO', '2024-01-15'));
            if (status === 'COMPLETA') docs.push(createDoc(3, 'MANUAL_USO', 'VIGENTE', null));
            if (docs.length === 0) docs.push(createDoc(4, 'DOCUMENTACION_MAQ', status));
        }
        return docs;
    };

    useEffect(() => {
        initFilters();
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, filterStatus]);

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            entityName: { value: null, matchMode: FilterMatchMode.CONTAINS },
            tipo: { value: null, matchMode: FilterMatchMode.CONTAINS },
            estado: { value: null, matchMode: FilterMatchMode.EQUALS },
        });
        setGlobalFilterValue('');
    };

    const loadData = () => {
        setLoading(true);

        // --- HARDCODED CONTEXT FOR DEMO ---
        // In real app, get this from AuthContext
        const CURRENT_PROVIDER_ID = 1;
        const CURRENT_PROVIDER_NAME = 'PAEZ BRAIAN ANDRES';

        let validEntities = [];
        switch (type) {
            case 'suppliers':
                validEntities = MOCK_SUPPLIERS.filter(s => s.id === CURRENT_PROVIDER_ID);
                break;
            case 'employees':
                validEntities = MOCK_EMPLOYEES.filter(e => e.proveedor === CURRENT_PROVIDER_NAME);
                break;
            case 'vehicles':
                validEntities = MOCK_VEHICLES.filter(v => v.proveedor === CURRENT_PROVIDER_NAME);
                break;
            case 'machinery':
                validEntities = MOCK_MACHINERY.filter(m => m.proveedor === CURRENT_PROVIDER_NAME);
                break;
            default: validEntities = [];
        }

        let allDocuments = [];
        if (type === 'suppliers') {
            allDocuments = validEntities.flatMap(sup => {
                const docs = sup.documentacion || [];
                // Ensure ID is String for consistency
                const entityIdStr = String(sup.id);
                return docs.map(doc => ({
                    ...doc,
                    id: `${entityIdStr}-${doc.id}`,
                    entityId: entityIdStr, // Enforce String
                    entityName: sup.razonSocial,
                    entityType: 'Proveedor'
                }));
            });
        } else {
            allDocuments = validEntities.flatMap(item => generateDocsForResource(item, type));
        }

        const filteredDocs = allDocuments.filter(doc => {
            if (filterStatus === 'general') return true;
            const s = doc.estado || 'PENDIENTE';
            switch (filterStatus) {
                case 'pending_upload': return s === 'PENDIENTE' || s === 'INCOMPLETA';
                case 'expiring': return s === 'VENCIDO' || s === 'POR VENCER';
                case 'observed': return s === 'CON OBSERVACIÓN' || s === 'RECHAZADO' || s === 'OBSERVADO';
                case 'in_review': return s === 'EN REVISIÓN';
                case 'valid': return s === 'VIGENTE' || s === 'COMPLETA';
                default: return true;
            }
        });

        // Enforce sort by entityId to ensure grouping works
        filteredDocs.sort((a, b) => {
            // String comparison for entityId
            if (a.entityId < b.entityId) return -1;
            if (a.entityId > b.entityId) return 1;
            return 0;
        });

        console.log("Data Loaded (Sorted):", filteredDocs);
        setData(filteredDocs);
        setLoading(false);
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    // Toggle logic for clicking the header
    // Toggle logic for clicking the header
    // Toggle logic and RowGroup implementation removed for standard table layout.

    const actionTemplate = (rowData) => (
        <div className="flex justify-end gap-2 pr-2">
            {rowData.observacion && (
                <button
                    onClick={() => {
                        setSelectedObservation({
                            title: rowData.tipo.replace(/_/g, ' '),
                            content: rowData.observacion
                        });
                        setObservationModalVisible(true);
                    }}
                    className="h-8 w-8 flex items-center justify-center text-warning bg-warning/10 hover:bg-warning/20 rounded-full transition-all cursor-pointer shadow-sm"
                    title="Ver Observación"
                >
                    <i className="pi pi-exclamation-triangle text-sm"></i>
                </button>
            )}

            {rowData.estado === 'VIGENTE' || rowData.estado === 'EN REVISIÓN' ? (
                <button onClick={() => console.log("Ver documento", rowData)} className="text-secondary-dark bg-secondary-light/30 hover:bg-secondary-light hover:text-primary rounded-lg px-3 py-1.5 transition-all text-[10px] font-bold flex items-center gap-1.5" title="Ver Documento">
                    <i className="pi pi-external-link"></i> VER
                </button>
            ) : (
                <button onClick={() => console.log("Subir documento", rowData)} className="text-primary bg-primary-light hover:bg-primary hover:text-white rounded-lg px-3 py-1.5 transition-all text-[10px] font-bold flex items-center gap-1.5" title="Subir documento">
                    <i className="pi pi-upload"></i> SUBIR
                </button>
            )}
        </div>
    );

    const docTypeTemplate = (rowData) => (
        <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${rowData.archivo ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`}>
                <i className={`pi ${rowData.archivo ? 'pi-file-pdf' : 'pi-file'} text-lg`}></i>
            </div>
            <div className="flex flex-col">
                <span className="font-medium text-secondary-dark text-sm">{rowData.tipo.replace(/_/g, ' ')}</span>
                <span className="text-[10px] text-secondary">{rowData.frecuencia}</span>
            </div>
        </div>
    );

    const statusBodyTemplate = (rowData) => {
        const status = rowData.estado;
        return (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${status === 'VIGENTE' ? 'bg-success/5 text-success border-success/20' :
                status === 'VENCIDO' ? 'bg-danger/5 text-danger border-danger/20' :
                    status === 'EN REVISIÓN' ? 'bg-info/5 text-info border-info/20' :
                        'bg-secondary/5 text-secondary border-secondary/20'
                }`}>
                {status}
            </span>
        );
    };

    const statusOptions = ['VIGENTE', 'VENCIDO', 'PENDIENTE', 'EN REVISIÓN', 'CON OBSERVACIÓN'];

    // Extract unique document types for the filter (raw values)
    const docTypes = [...new Set(data.map(item => item.tipo))];

    const getEntityHeader = () => {
        switch (type) {
            case 'employees': return 'Empleado';
            case 'vehicles': return 'Vehículo';
            case 'machinery': return 'Maquinaria';
            default: return 'Recurso';
        }
    };

    const filterConfig = [
        { label: 'Estado', value: 'estado', options: statusOptions.map(s => ({ label: s, value: s })) },
        { label: 'Tipo de Documento', value: 'tipo', options: docTypes.map(t => ({ label: t.replace(/_/g, ' '), value: t })) }
    ];

    if (type !== 'suppliers') {
        filterConfig.push({
            label: getEntityHeader(),
            value: 'entityName',
            options: [...new Set(data.map(d => d.entityName))].map(n => ({ label: n, value: n }))
        });
    }

    const renderHeader = () => (
        <TableFilters
            filters={filters}
            setFilters={setFilters}
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={onGlobalFilterChange}
            config={filterConfig}
            totalItems={data.length}
            filteredItems={filteredData ? filteredData.length : null}
            topRightContent={
                <div className="flex items-center gap-3 shrink-0">
                    <button className="flex-1 md:flex-none text-secondary-dark bg-white border border-secondary/20 hover:bg-secondary-light font-bold rounded-lg text-xs px-4 py-2.5 transition-all flex items-center justify-center gap-2 shadow-sm">
                        <i className="pi pi-file-excel text-success"></i> <span className="hidden lg:inline">Exportar Excel</span>
                    </button>
                </div>
            }
            itemName="DOCUMENTOS"
        />
    );

    return (
        <div className="w-full bg-white border border-secondary/10 rounded-xl shadow-sm overflow-hidden animate-fade-in">
            <ObservationModal
                visible={observationModalVisible}
                onHide={() => setObservationModalVisible(false)}
                title="Observación de Auditoría"
                docName={selectedObservation?.title}
                content={selectedObservation?.content}
            />


            <AppTable
                value={data}
                loading={loading}
                filters={filters}
                globalFilterFields={['tipo', 'entityName', 'estado']}
                onValueChange={(d) => setFilteredData(d)}
                emptyMessage="No se encontraron documentos."
                sortMode="multiple"
                removableSort
                header={renderHeader()}
                rowClassName={() => 'hover:bg-secondary-light/5 transition-colors border-b border-secondary/5 group'}
            >
                {type !== 'suppliers' && (
                    <Column field="entityName" header={getEntityHeader()} sortable className="font-bold text-secondary-dark"></Column>
                )}
                <Column field="tipo" header="Documento" body={docTypeTemplate} sortable className={type !== 'suppliers' ? "w-[40%]" : "w-[50%]"}></Column>
                <Column field="fechaVencimiento" header="Vencimiento" body={(r) => {
                    if (r.fechaVencimiento) return <span className="font-mono text-xs text-secondary-dark">{r.fechaVencimiento}</span>;
                    if (r.frecuencia === 'Única vez') return <span className="text-[10px] font-bold text-secondary/30 italic">N/A</span>;
                    return <span className="text-[10px] font-bold text-orange-400">No cargado</span>;
                }} sortable></Column>
                <Column field="estado" header="Estado" body={statusBodyTemplate} sortable className="text-center"></Column>
                <Column header="Acción" body={actionTemplate} className="text-right pr-6" headerClassName="pr-6"></Column>
            </AppTable>
        </div>
    );
};

export default DocumentEntityTable;

import { requirementService } from '../../services/requirementService';

const DocumentEntityTable = ({ type, filterStatus }) => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState(null);
    const [loading, setLoading] = useState(true);
    // ... filters state and other state vars ...

    // ... generator helper ...

    useEffect(() => {
        initFilters();
        loadData();
    }, [type, filterStatus]);

    const loadData = async () => {
        setLoading(true);

        // --- CONTEXT ---
        // In real app, this comes from the logged-in user session
        const CURRENT_PROVIDER_CUIT = '30712345678'; // Example CUIT for supplier 1

        try {
            let allDocuments = [];

            if (type === 'suppliers') {
                // Fetch real data from backend
                const response = await requirementService.getSupplierDocuments(CURRENT_PROVIDER_CUIT);
                console.log("DocumentEntityTable: Fetching real supplier docs", response);

                if (response && response.elements) {
                    allDocuments = response.elements.map(el => ({
                        id: el.id_elements,
                        entityId: String(response.id_supplier),
                        entityName: response.company_name,
                        entityType: 'Proveedor',
                        tipo: el.active?.description || 'DOCUMENTO',
                        estado: el.data?.estado || 'PENDIENTE',
                        fechaVencimiento: el.data?.fechaVencimiento || null,
                        observacion: el.data?.observacion || null,
                        frecuencia: el.data?.frecuencia || 'Mensual',
                        archivo: el.data?.archivo || null,
                        obligatorio: true
                    }));
                }
            } else {
                // Keep resources with mock data for now, or update if endpoints exist
                let validEntities = [];
                const CURRENT_PROVIDER_NAME = 'PAEZ BRAIAN ANDRES';

                switch (type) {
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

            filteredDocs.sort((a, b) => {
                if (a.entityId < b.entityId) return -1;
                if (a.entityId > b.entityId) return 1;
                return 0;
            });

            setData(filteredDocs);
        } catch (error) {
            console.error("DocumentEntityTable: Error loading data", error);
        } finally {
            setLoading(false);
        }
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

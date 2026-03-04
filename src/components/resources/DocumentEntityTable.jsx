import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requirementService } from '../../services/requirementService';
import { groupService } from '../../services/groupService';
import { fileService } from '../../services/fileService';
import { useAuth } from '../../context/AuthContext';
import { Column } from 'primereact/column';
import AppTable from '../ui/AppTable';
import TableFilters from '../ui/TableFilters';
import ObservationModal from '../ui/ObservationModal';
import { DOC_TYPE_LABELS } from '../../data/documentConstants';
import { useSupplier } from '../../hooks/useSupplier';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';

const DocumentEntityTable = ({ type, filterStatus }) => {
    const navigate = useNavigate();
    const { user, currentRole } = useAuth();
    const { supplierData, updateSupplier } = useSupplier();
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingDocs, setLoadingDocs] = useState({});
    const [observationModalVisible, setObservationModalVisible] = useState(false);
    const [selectedObservation, setSelectedObservation] = useState(null);
    const [filters, setFilters] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadDate, setUploadDate] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: 'contains' },
            estado: { value: null, matchMode: 'equals' },
            tipo: { value: null, matchMode: 'equals' },
            entityName: { value: null, matchMode: 'equals' }
        });
        setGlobalFilterValue('');
    };

    const MOCK_EMPLOYEES = [];
    const MOCK_VEHICLES = [];
    const MOCK_MACHINERY = [];
    const generateDocsForResource = () => [];

    useEffect(() => {
        initFilters();
        loadData();
    }, [type, filterStatus, user, currentRole]);

    const loadData = async () => {
        setLoading(true);

        const CURRENT_PROVIDER_CUIT = currentRole?.entityCuit || currentRole?.cuit || user?.suppliers?.[0]?.cuit;

        if (!CURRENT_PROVIDER_CUIT && type === 'suppliers') {
            setData([]);
            setLoading(false);
            return;
        }

        try {
            let allDocuments = [];

            if (type === 'suppliers') {
                // Fetch real data from backend
                const response = await requirementService.getSupplierDocuments(CURRENT_PROVIDER_CUIT);
                console.log("DocumentEntityTable: Fetching real supplier docs", response);

                if (response) {
                    if (response.id_group) {
                        try {
                            const groupReqs = await groupService.getSpecific(response.id_supplier, response.id_group);
                            if (groupReqs && groupReqs.length > 0) {
                                const docMap = new Map();
                                groupReqs.forEach(req => {
                                    const listReq = req.list_requirements || req.listRequirements;
                                    if (!listReq) return;

                                    const attrTempl = listReq.attribute_template || listReq.attributeTemplate;
                                    const attrs = attrTempl?.attributes;

                                    const folderMeta = (listReq.folder_metadata || listReq.folderMetadata)?.data;
                                    const files = listReq.files || [];
                                    const submittedFile = files.length > 0 ? files[0] : null;

                                    const requirementId = listReq.id_list_requirements || listReq.idListRequirements;
                                    const key = requirementId;

                                    if (!docMap.has(key)) {
                                        const label = listReq.description || attrs?.description || 'Documento';

                                        let docKey = Object.keys(DOC_TYPE_LABELS).find(k =>
                                            DOC_TYPE_LABELS[k].label.toLowerCase() === label.toLowerCase()
                                        );

                                        if (!docKey) {
                                            const cleanDesc = label.replace(/ obligatorio/i, '').trim();
                                            docKey = Object.keys(DOC_TYPE_LABELS).find(k =>
                                                DOC_TYPE_LABELS[k].label.toLowerCase().includes(cleanDesc.toLowerCase())
                                            ) || label.toUpperCase().replace(/\s+/g, '_');
                                        }

                                        const isFile = !!submittedFile;
                                        const cleanLabel = label.replace(/ obligatorio/i, '').trim();

                                        const fileData = submittedFile?.data_pdf || submittedFile?.dataPdf || {};
                                        const directFileName = submittedFile?.file_name || submittedFile?.fileName;

                                        // Status logic based on Audit, Expiration, and File presence
                                        let finalStatus = 'PENDIENTE';
                                        const hasAudit = submittedFile?.audit;
                                        const auditStatus = submittedFile?.audit?.status;

                                        if (hasAudit) {
                                            if (auditStatus === 'APROBADO') finalStatus = 'VIGENTE';
                                            else if (auditStatus === 'OBSERVADO') finalStatus = 'CON OBSERVACIÓN';
                                            else finalStatus = 'EN REVISIÓN'; // Fallback if audit exists but status is unknown
                                        } else {
                                            const expDateStr = folderMeta?.fechaVencimiento || submittedFile?.date_submitted;
                                            if (expDateStr) {
                                                const expDate = new Date(expDateStr);
                                                const today = new Date();
                                                // Reset time for accurate day comparison
                                                expDate.setHours(0, 0, 0, 0);
                                                today.setHours(0, 0, 0, 0);

                                                if (expDate < today) {
                                                    finalStatus = 'VENCIDO';
                                                } else {
                                                    finalStatus = isFile ? 'EN REVISIÓN' : 'PENDIENTE';
                                                }
                                            } else {
                                                finalStatus = isFile ? 'EN REVISIÓN' : 'PENDIENTE';
                                            }
                                        }

                                        // Override with folderMeta status if it was explicitly set (optional, depending on architecture)
                                        // finalStatus = folderMeta?.estado || finalStatus;

                                        const finalFileName = folderMeta?.archivo || directFileName || fileData?.file_name || fileData?.fileName || null;
                                        const finalObs = folderMeta?.observacion || submittedFile?.observacion || null;
                                        const finalVenc = folderMeta?.fechaVencimiento || submittedFile?.date_submitted || null;

                                        docMap.set(key, {
                                            id: key,
                                            id_file_submitted: submittedFile?.id_file_submitted || submittedFile?.idFileSubmitted || null,
                                            entityId: String(response.id_supplier),
                                            entityName: response.company_name,
                                            entityType: 'Proveedor',
                                            tipo: docKey,
                                            label: cleanLabel,
                                            estado: finalStatus,
                                            fechaVencimiento: finalVenc,
                                            observacion: finalObs,
                                            frecuencia: attrs?.periodicity_description || attrs?.periodicityDescription || 'Única vez',
                                            archivo: finalFileName,
                                            obligatorio: true
                                        });
                                    }
                                });
                                allDocuments = Array.from(docMap.values());
                            }
                        } catch (err) {
                            console.warn("DocumentEntityTable: Failed to fetch group requirements", err);
                        }
                    }

                    // Fallback if specific group requirements not available but elements exist
                    if (allDocuments.length === 0 && response.elements) {
                        allDocuments = response.elements.map(el => ({
                            id: el.id_elements,
                            entityId: String(response.id_supplier),
                            entityName: response.company_name,
                            entityType: 'Proveedor',
                            tipo: el.active?.description || 'DOCUMENTO',
                            label: el.active?.description || 'DOCUMENTO',
                            estado: el.data?.estado || 'PENDIENTE',
                            fechaVencimiento: el.data?.fechaVencimiento || null,
                            observacion: el.data?.observacion || null,
                            frecuencia: el.data?.frecuencia || 'Mensual',
                            archivo: el.data?.archivo || null,
                            obligatorio: true
                        }));
                    }
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

    const openUploadModal = (rowData) => {
        if (type !== 'suppliers') {
            alert("La carga directa de documentos para recursos está en desarrollo. Por favor edite el recurso correspondiente.");
            return;
        }

        setUploadingDoc(rowData);
        setUploadFile(null);
        setUploadDate(null);
        setUploadModalVisible(true);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadFile(file);

        // Auto-calculate expiration date based on frequency ONLY WHEN FILE IS SELECTED
        let defaultDate = null;
        if (uploadingDoc?.frecuencia && uploadingDoc.frecuencia !== 'Única vez') {
            const today = new Date();
            const freqLower = uploadingDoc.frecuencia.toLowerCase();

            if (freqLower.includes('anual')) {
                defaultDate = new Date(today.setFullYear(today.getFullYear() + 1));
            } else if (freqLower.includes('semestral')) {
                defaultDate = new Date(today.setMonth(today.getMonth() + 6));
            } else if (freqLower.includes('trimestral')) {
                defaultDate = new Date(today.setMonth(today.getMonth() + 3));
            } else if (freqLower.includes('mensual')) {
                defaultDate = new Date(today.setMonth(today.getMonth() + 1));
            }
        }
        setUploadDate(defaultDate);
    };

    const handleSaveUpload = async () => {
        if (!uploadFile) {
            alert("Seleccione un archivo primero.");
            return;
        }

        if (!supplierData) {
            alert("Los datos del proveedor aún no están cargados. Asegúrese de que su legajo de proveedor esté completo o reintente en unos segundos.");
            return;
        }

        setIsUploading(true);
        try {
            setLoadingDocs(prev => ({ ...prev, [uploadingDoc.id]: true }));
            const updatedDocs = supplierData.documentacion.map(doc => {
                if (doc.tipo === uploadingDoc.tipo) {
                    return {
                        ...doc,
                        archivo: uploadFile.name,
                        fileObject: uploadFile,
                        fechaVencimiento: uploadDate ? uploadDate.toISOString().split('T')[0] : doc.fechaVencimiento,
                        modified: true
                    };
                }
                return doc;
            });

            await updateSupplier({ documentacion: updatedDocs });
            await loadData();
            setUploadModalVisible(false);
        } catch (error) {
            console.error("Upload error", error);
            alert("Error al subir el documento. Reintente más tarde.");
        } finally {
            setLoadingDocs(prev => ({ ...prev, [uploadingDoc.id]: false }));
            setIsUploading(false);
        }
    };

    const handleViewFile = async (docData) => {
        if (!docData || !docData.archivo) return;

        if (docData.fileUrl && docData.fileUrl.startsWith('blob:')) {
            window.open(docData.fileUrl, '_blank');
            return;
        }

        const fileId = docData.id_file_submitted || docData.id;

        if (!docData.id_file_submitted) {
            if (docData.fileUrl) window.open(docData.fileUrl, '_blank');
            else alert(`Visualización no disponible para: ${docData.archivo}`);
            return;
        }

        try {
            setLoadingDocs(prev => ({ ...prev, [docData.id]: true }));
            const fileBlob = await fileService.getFile(docData.id_file_submitted);

            if (fileBlob && fileBlob.size > 0) {
                const blobUrl = URL.createObjectURL(fileBlob);
                if (blobUrl) {
                    window.open(blobUrl, '_blank');
                } else {
                    alert('Error local: No se pudo generar la vista previa del archivo.');
                }
            } else if (docData.fileUrl) {
                window.open(docData.fileUrl, '_blank');
            } else {
                alert('El archivo no tiene contenido para visualizar.');
            }
        } catch (error) {
            console.error('Error descargando documento:', error);
            if (docData.fileUrl) {
                window.open(docData.fileUrl, '_blank');
            } else {
                alert('Error al descargar el archivo del servidor.');
            }
        } finally {
            setLoadingDocs(prev => ({ ...prev, [docData.id]: false }));
        }
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
                            title: rowData.label || rowData.tipo.replace(/_/g, ' '),
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
                <button
                    onClick={() => handleViewFile(rowData)}
                    disabled={loadingDocs[rowData.id]}
                    className="text-secondary-dark bg-secondary-light/30 hover:bg-secondary-light hover:text-primary rounded-lg px-3 py-1.5 transition-all text-[10px] font-bold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-wait"
                    title="Ver Documento"
                >
                    {loadingDocs[rowData.id] ? <i className="pi pi-spin pi-spinner"></i> : <i className="pi pi-external-link"></i>} VER
                </button>
            ) : (
                <button
                    onClick={() => openUploadModal(rowData)}
                    disabled={loadingDocs[rowData.id]}
                    className="text-primary bg-primary-light hover:bg-primary hover:text-white rounded-lg px-3 py-1.5 transition-all text-[10px] font-bold flex items-center gap-1.5 disabled:opacity-50"
                    title="Subir documento"
                >
                    {loadingDocs[rowData.id] ? <i className="pi pi-spin pi-spinner"></i> : <i className="pi pi-upload"></i>} SUBIR
                </button>
            )}
        </div>
    );

    const docTypeTemplate = (rowData) => (
        <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${rowData.archivo ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`}>
                <i className={`pi ${rowData.archivo ? 'pi-file-pdf' : 'pi-file'} text-lg`}></i>
            </div>
            <div className="flex flex-col min-w-0">
                <span className="font-medium text-secondary-dark text-sm truncate" title={rowData.label || rowData.tipo.replace(/_/g, ' ')}>{rowData.label || rowData.tipo.replace(/_/g, ' ')}</span>
                <span className="text-[10px] text-secondary truncate">{rowData.frecuencia}</span>
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

            <Dialog
                header={<span className="sr-only">Subir Documento</span>}
                visible={uploadModalVisible}
                onHide={() => !isUploading && setUploadModalVisible(false)}
                className="w-[90vw] max-w-[550px]"
                draggable={false}
                resizable={false}
                pt={{
                    mask: { className: 'backdrop-blur-sm' },
                    header: { className: 'hidden' },
                    content: { className: 'p-0 rounded-2xl overflow-hidden bg-white' },
                    footer: { className: 'hidden' }
                }}
            >
                <div className="p-6 flex flex-col gap-6">

                    {/* Header - Card Style */}
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-secondary/20 bg-secondary/5 text-secondary">
                            <i className="pi pi-file-pdf text-2xl"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-secondary-dark text-lg leading-tight mb-2" title={uploadingDoc?.label}>
                                {uploadingDoc?.label}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block bg-secondary/10 text-secondary border-secondary/20 uppercase tracking-widest">
                                    {uploadingDoc?.estado || 'PENDIENTE'}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block bg-primary/10 text-primary border-primary/20 uppercase tracking-widest">
                                    <i className="pi pi-clock text-[9px] mr-1"></i>
                                    {uploadingDoc?.frecuencia || 'Única vez'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-secondary/10 -my-2"></div>

                    {/* Expiration Date Section with Orange Theme */}
                    {uploadingDoc?.frecuencia !== 'Única vez' && (
                        <div className="w-full bg-orange-50/50 p-4 rounded-2xl border border-orange-100 flex flex-col gap-3 transition-all">
                            <label className="text-[10px] font-bold text-orange-600/60 uppercase tracking-widest flex items-center gap-2">
                                <i className="pi pi-exclamation-circle text-[11px]"></i> Definir Vencimiento
                            </label>

                            <div className="flex flex-col w-full">
                                <div className="flex items-center gap-2.5">
                                    <i className="pi pi-calendar text-secondary/50 text-base"></i>
                                    <Calendar
                                        value={uploadDate}
                                        onChange={(e) => setUploadDate(e.value)}
                                        placeholder="Vencimiento"
                                        disabled={!uploadFile || isUploading}
                                        minDate={new Date()}
                                        className={`compact-calendar-input w-full border border-secondary/50 rounded-lg ${!uploadFile ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                                        panelClassName="compact-calendar-panel"
                                        dateFormat="dd/mm/yy"
                                    />
                                </div>
                                {!uploadFile && (
                                    <span className="text-[10px] text-orange-400 font-bold ml-6 mt-2">
                                        * Requiere archivo para editar fecha
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* File Dropzone Input */}
                    <div className="relative group/upload w-full h-28 mt-2">
                        <input
                            type="file"
                            id="upload-file-input"
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                            accept=".pdf,.png,.jpg,.jpeg"
                            disabled={isUploading}
                        />
                        <div className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all ${uploadFile ? 'border-primary/50 bg-primary/5' : 'border-secondary/20 bg-secondary/5 group-hover/upload:border-primary/40 group-hover/upload:bg-primary/5'}`}>
                            {uploadFile ? (
                                <>
                                    <i className="pi pi-file-check text-2xl mb-2 text-primary"></i>
                                    <span className="text-xs font-bold text-primary truncate px-4 w-full text-center">
                                        {uploadFile.name}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <i className="pi pi-cloud-upload text-2xl mb-2 text-secondary/60 group-hover/upload:text-primary transition-colors"></i>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-center text-secondary/60 group-hover/upload:text-primary transition-colors">
                                        SUBIR ARCHIVO
                                    </span>
                                    <span className="text-[9px] text-secondary/40 mt-1">o arrastrar aquí</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Custom Modal Footer inside the body since we bypassed PrimeReact's default header/footer visual frames */}
                <div className="flex justify-end gap-3 px-6 py-4 bg-secondary-light/20 border-t border-secondary/10 rounded-b-2xl">
                    <button
                        onClick={() => setUploadModalVisible(false)}
                        className="bg-white border border-secondary/20 hover:bg-secondary-light text-secondary-dark px-6 py-2 rounded-lg font-bold transition-all w-full md:w-auto text-sm"
                        disabled={isUploading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSaveUpload}
                        className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait w-full md:w-auto text-sm"
                        disabled={isUploading || !uploadFile}
                    >
                        {isUploading && <i className="pi pi-spin pi-spinner"></i>}
                        Subir Archivo
                    </button>
                </div>
            </Dialog>
        </div>
    );
};

export default DocumentEntityTable;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SupplierForm from './SupplierForm';
import { supplierService } from '../../services/supplierService';
import { requirementService } from '../../services/requirementService';
import { groupService } from '../../services/groupService';
import { StatusBadge } from '../../components/ui/Badges';
import { formatCUIT } from '../../utils/formatUtils';
import { base64ToBlobUrl } from '../../utils/fileUtils';
import { getDocLabel, getDocFrequency } from '../../data/documentConstants';

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proveedor, setProveedor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setLoading(true);
        // Use requirementService to get full context (Elements)
        const response = await requirementService.getSupplierDocuments(id);
        console.log("Respuesta API Detailed Supplier:", response);

        // 2. Fetch Group Requirements for dynamic Legajo (Consistent with useSupplier)
        let dynamicDocs = [];
        if (response.id_group) {
          try {
            console.log("SupplierDetail: Fetching specific group requirements for group", response.id_group);
            const groupReqs = await groupService.getSpecific(response.id_supplier, response.id_group);

            if (groupReqs && groupReqs.length > 0) {
              const DOC_TYPE_LABELS = {
                'CONSTANCIA_AFIP': { label: 'Constancia de Inscripción AFIP', frecuencia: 'Mensual' },
                'ESTATUTO': { label: 'Estatuto Social', frecuencia: 'Única vez' },
                'FORM_931': { label: 'Formulario 931', frecuencia: 'Mensual' },
                'HABILITACION_SEGURIDAD': { label: 'Habilitación Comercial / Seguridad', frecuencia: 'Con Vencimiento' },
                'SEGURO_ACCIDENTES': { label: 'Seguro de Accidentes Personales', frecuencia: 'Mensual' },
                'ART_CERTIFICADO': { label: 'Certificado de Cobertura ART', frecuencia: 'Mensual' },
                'SEGURO_VIDA': { label: 'Seguro de Vida Obligatorio', frecuencia: 'Anual' },
                'HABILITACION_VEHICULOS': { label: 'Habilitación de Vehículos / VTV', frecuencia: 'Anual' },
                'SOLICITUD_USUARIOS': { label: 'Solicitud de Usuarios de Sistema', frecuencia: 'Única vez' },
                'CERT_NO_DEUDA_EDESAL': { label: 'Certificado de No Deuda (Edesal)', frecuencia: 'Trimestral' },
                'EMR_MANUAL_EDESAL': { label: 'Manual de Inducción Seguridad EMR (Edesal)', frecuencia: 'Bienal' },
                'DDJJ_ETICA_EDESAL': { label: 'Declaración Jurada Ética (Edesal)', frecuencia: 'Anual' },
                'HABILITACION_VIGILANCIA_EDESAL': { label: 'Habilitación Provincial de Seguridad (Edesal)', frecuencia: 'Anual' },
                'ANEXO_SH_ROVELLA': { label: 'Anexo Seguridad e Higiene (Rovella)', frecuencia: 'Única vez' },
                'FICHA_ALTA_ROVELLA': { label: 'Ficha Alta de Proveedor (Rovella)', frecuencia: 'Única vez' },
                'POLIZA_OBRA_ROVELLA': { label: 'Póliza de Seguro de Obra (Rovella)', frecuencia: 'Mensual' },
                'SAP_ROVELLA': { label: 'Seguro ACC Personales - Cláusula Rovella', frecuencia: 'Anual' }
              };

              // Use a Map to ensure absolute uniqueness of Requirements
              const docMap = new Map();

              groupReqs.forEach(req => {
                // Handle both listRequirements (camelCase) and list_requirements (snake_case)
                const listReq = req.list_requirements || req.listRequirements;
                if (!listReq) return;

                // Handle attribute_template (snake_case) and attributeTemplate (camelCase)
                const attrTempl = listReq.attribute_template || listReq.attributeTemplate;
                const attrs = attrTempl?.attributes;

                // Handle folder_metadata (snake_case) and folderMetadata (camelCase)
                const folderMeta = (listReq.folder_metadata || listReq.folderMetadata)?.data;
                const files = listReq.files || [];
                const submittedFile = files.length > 0 ? files[0] : null;

                // Handle id_list_requirements (snake_case) and idListRequirements (camelCase)
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

                  // New DB schema fields vs Old DB schema `data_pdf`
                  const fileData = submittedFile?.data_pdf || submittedFile?.dataPdf || {};
                  const directFileName = submittedFile?.file_name || submittedFile?.fileName;
                  const directFileUrl = submittedFile?.file_url || submittedFile?.url;

                  const finalStatus = folderMeta?.estado || (isFile ? 'EN REVISIÓN' : 'PENDIENTE');
                  const finalFileName = folderMeta?.archivo || directFileName || fileData?.file_name || fileData?.fileName || null;
                  const finalObs = folderMeta?.observacion || submittedFile?.observacion || null;
                  const finalVenc = folderMeta?.fechaVencimiento || submittedFile?.date_submitted || null;

                  docMap.set(key, {
                    id: key,
                    id_group_req: req.id_group_requirements || req.idGroupRequirements,
                    id_list_req: listReq.id_list_requirements || listReq.idListRequirements,
                    id_attribute: attrs?.id_attributes || attrs?.idAttributes,
                    id_file_submitted: submittedFile?.id_file_submitted || submittedFile?.idFileSubmitted || null,
                    id_element: (listReq.folder_metadata || listReq.folderMetadata)?.id_elements,
                    id_active: attrTempl?.id_active || attrTempl?.idActive,
                    tipo: docKey,
                    label: cleanLabel,
                    frecuencia: attrs?.periodicity_description || attrs?.periodicityDescription || 'Única vez',
                    estado: finalStatus,
                    archivo: finalFileName,
                    observacion: finalObs,
                    fechaVencimiento: finalVenc,
                    fileUrl: directFileUrl || fileData?.url || null // Blob URL generation happens on demand now
                  });
                }
              });

              dynamicDocs = Array.from(docMap.values());
            }
          } catch (err) {
            console.warn("SupplierDetail: Failed to fetch group requirements", err);
          }
        }

        if (response) {
          // Map API response to SupplierForm structure
          const mappedData = {
            id: response.cuit,
            internalId: response.id_supplier,
            idGroup: response.id_group, // Ensure idGroup is passed
            razonSocial: response.company_name,
            cuit: formatCUIT(response.cuit),
            nombreFantasia: response.fantasy_name,
            tipoPersona: response.type_person || 'JURIDICA',
            clasificacionAFIP: response.classification_afip || 'Responsable Inscripto',
            servicio: response.category_service || 'Mantenimiento',
            email: response.email_corporate,
            telefono: response.phone,
            empleadorAFIP: response.is_an_afip_employer,
            esTemporal: response.is_temporary_hiring,
            estado: response.active === 1 ? 'ACTIVO' : 'INACTIVO',
            pais: response.country,
            provincia: response.province,
            localidad: response.city,
            codigoPostal: response.postal_code,
            direccionFiscal: response.address_tax,
            direccionReal: response.address_real,
            contactos: response.contacts ? [{
              nombre: response.contacts.nombre_contacto || '',
              tipo: response.contacts.puesto || 'OPERATIVO - LEGAJO'
            }] : [],
            documentacion: dynamicDocs.length > 0 ? dynamicDocs : (response.elements ? response.elements.map(el => {
              const tipo = el.active?.description || 'DOCUMENTO';
              return {
                id: el.id_elements,
                id_active: el.active?.idActive,
                tipo: tipo,
                label: getDocLabel(tipo),
                estado: el.data?.estado || 'PENDIENTE',
                archivo: el.data?.archivo || null,
                observacion: el.data?.observacion || null,
                fechaVencimiento: el.data?.fechaVencimiento || null,
                frecuencia: getDocFrequency(tipo)
              };
            }) : [])
          };
          setProveedor(mappedData);
        }
      } catch (error) {
        console.error("Error al cargar detalle del proveedor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <i className="pi pi-spin pi-spinner text-4xl text-primary"></i>
      </div>
    );
  }

  if (!proveedor) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-secondary">Proveedor no encontrado</h2>
        <button onClick={() => navigate('/proveedores')} className="mt-4 text-primary hover:underline">
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full">
      {/* ENCABEZADO DINÁMICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-secondary-dark tracking-tight">
              {proveedor.razonSocial}
            </h1>
            <StatusBadge status={proveedor.estado} />
          </div>
          <p className="text-secondary mt-1">{proveedor.servicio}</p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate('/proveedores')} className="bg-white border border-secondary/30 text-secondary-dark px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary-light transition-colors">
            Volver
          </button>
          <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-primary/30 hover:bg-primary-hover transition-colors">
            <i className="pi pi-pencil mr-2"></i>Editar
          </button>
        </div>
      </div>

      {/* FORMULARIO EN MODO LECTURA */}
      <SupplierForm
        initialData={proveedor}
        readOnly={true}
      />
    </div>
  );
};

export default SupplierDetail;

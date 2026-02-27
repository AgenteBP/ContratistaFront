import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SupplierForm from './SupplierForm';
import { supplierService } from '../../services/supplierService';
import { requirementService } from '../../services/requirementService';
import { groupService } from '../../services/groupService';
import { StatusBadge } from '../../components/ui/Badges';
import { formatCUIT } from '../../utils/formatUtils';
import { base64ToBlobUrl } from '../../utils/fileUtils';

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
                'CONSTANCIA_AFIP': 'Constancia de Inscripción AFIP',
                'ESTATUTO': 'Estatuto Social',
                'FORM_931': 'Formulario 931',
                'HABILITACION_SEGURIDAD': 'Habilitación Comercial / Seguridad',
                'SEGURO_ACCIDENTES': 'Seguro de Accidentes Personales',
                'ART_CERTIFICADO': 'Certificado de Cobertura ART',
                'SEGURO_VIDA': 'Seguro de Vida Obligatorio',
                'HABILITACION_VEHICULOS': 'Habilitación de Vehículos / VTV',
                'SOLICITUD_USUARIOS': 'Solicitud de Usuarios de Sistema',
                'CERT_NO_DEUDA_EDESAL': 'Certificado de No Deuda (Edesal)',
                'EMR_MANUAL_EDESAL': 'Manual de Inducción Seguridad EMR (Edesal)',
                'DDJJ_ETICA_EDESAL': 'Declaración Jurada Ética (Edesal)',
                'HABILITACION_VIGILANCIA_EDESAL': 'Habilitación Provincial de Seguridad (Edesal)',
                'ANEXO_SH_ROVELLA': 'Anexo Seguridad e Higiene (Rovella)',
                'FICHA_ALTA_ROVELLA': 'Ficha Alta de Proveedor (Rovella)',
                'POLIZA_OBRA_ROVELLA': 'Póliza de Seguro de Obra (Rovella)',
                'SAP_ROVELLA': 'Seguro ACC Personales - Cláusula Rovella'
              };

              // Use a Map to ensure absolute uniqueness of Requirements
              const docMap = new Map();

              groupReqs.forEach(req => {
                const listReq = req.listRequirements;
                if (!listReq) return;

                const attrTempl = listReq.attributeTemplate;
                const attrs = attrTempl?.attributes;
                const folderMeta = listReq.folder_metadata?.data;
                const files = listReq.files || [];
                const submittedFile = files.length > 0 ? files[0] : null;
                const fileData = submittedFile?.data_pdf || submittedFile?.dataPdf;

                const requirementId = listReq.id_list_requirements;
                const key = `R${requirementId}`;

                if (!docMap.has(key)) {
                  const label = listReq.description || attrs?.description || 'Documento';

                  let docKey = Object.keys(DOC_TYPE_LABELS).find(k =>
                    DOC_TYPE_LABELS[k].toLowerCase() === label.toLowerCase()
                  );

                  if (!docKey) {
                    const cleanDesc = label.replace(/ obligatorio/i, '').trim();
                    docKey = Object.keys(DOC_TYPE_LABELS).find(k =>
                      DOC_TYPE_LABELS[k].toLowerCase().includes(cleanDesc.toLowerCase())
                    ) || label.toUpperCase().replace(/\s+/g, '_');
                  }

                  const isFile = !!submittedFile;
                  const cleanLabel = label.replace(/ obligatorio/i, '').trim();

                  // New DB schema fields vs Old DB schema `data_pdf`
                  const fileData = submittedFile?.data_pdf || submittedFile?.dataPdf || {};
                  const directFileName = submittedFile?.file_name || submittedFile?.fileName;
                  const directFileUrl = submittedFile?.file_url || submittedFile?.url;
                  const directContent = submittedFile?.content || submittedFile?.file_content;

                  const finalStatus = folderMeta?.estado || (isFile ? 'EN REVISIÓN' : 'PENDIENTE');
                  const finalFileName = folderMeta?.archivo || directFileName || fileData?.file_name || fileData?.fileName || null;
                  const finalObs = folderMeta?.observacion || submittedFile?.observacion || null;
                  const finalVenc = folderMeta?.fechaVencimiento || submittedFile?.date_submitted || null;

                  docMap.set(key, {
                    id: `req-${key}`,
                    id_group_req: req.id_group_requirements,
                    id_list_req: listReq.id_list_requirements,
                    id_attribute: attrs?.id_attributes || attrs?.idAttributes,
                    id_element: listReq.folder_metadata?.id_elements,
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
            documentacion: dynamicDocs.length > 0 ? dynamicDocs : (response.elements ? response.elements.map(el => ({
              id: el.id_elements,
              id_active: el.active?.idActive,
              tipo: el.active?.description || 'DOCUMENTO',
              estado: el.data?.estado || 'PENDIENTE',
              archivo: el.data?.archivo || null,
              observacion: el.data?.observacion || null,
              fechaVencimiento: el.data?.fechaVencimiento || null,
              frecuencia: el.data?.frecuencia || 'Mensual'
            })) : [])
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

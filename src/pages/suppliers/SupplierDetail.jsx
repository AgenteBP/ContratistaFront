import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SupplierForm from './SupplierForm';
import { supplierService } from '../../services/supplierService';
import { StatusBadge } from '../../components/ui/Badges';

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proveedor, setProveedor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setLoading(true);
        const response = await supplierService.getById(id);
        console.log("Respuesta API GetById:", response);

        if (response) {
          // Map API response to SupplierForm structure
          const mappedData = {
            id: response.cuit, // Keeping id as CUIT for consistency with list logic if needed, or just use s.id_supplier if that was intended.
            internalId: response.id_supplier,
            razonSocial: response.company_name,
            cuit: response.cuit,
            nombreFantasia: response.fantasy_name,
            tipoPersona: response.type_person || 'JURIDICA',
            clasificacionAFIP: response.classification_afip || 'Responsable Inscripto',
            servicio: response.category_service || 'Mantenimiento',
            email: response.email_corporate,
            telefono: response.phone,
            empleadorAFIP: response.is_an_afip_employer,
            esTemporal: response.is_temporary_hiring,
            estatus: response.active === 1 ? 'ACTIVO' : 'INACTIVO',
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
            documentacion: response.document_supplier ? [{
              tipo: 'OBSERVACIONES',
              estado: 'INFO',
              archivo: null,
              observacion: response.document_supplier.observaciones
            }] : []
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
            <StatusBadge status={proveedor.estatus} />
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

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SupplierForm from './SupplierForm';
import { StatusBadge } from '../../components/ui/Badges';
import { useSupplier } from '../../hooks/useSupplier';
import { formatCUIT } from '../../utils/formatUtils';
import { base64ToBlobUrl } from '../../utils/fileUtils';
import { getDocLabel, getDocFrequency } from '../../data/documentConstants';
import { useAuth } from '../../context/AuthContext';
import { companyService } from '../../services/companyService';
import { Tag } from 'primereact/tag';
import { useBreadcrumb } from '../../context/BreadcrumbContext';

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialEditMode = queryParams.get('mode') === 'edit';

  const { supplierData, loading, updateSupplier } = useSupplier(id);
  const { currentRole } = useAuth();
  const isEmpresa = currentRole?.role === 'EMPRESA';
  const [isEditing, setIsEditing] = useState(initialEditMode && !isEmpresa);
  const [requiredTechnical, setRequiredTechnical] = useState(false);
  const { setLabel, clearLabel } = useBreadcrumb();

  useEffect(() => {
    if (supplierData?.razonSocial) {
      setLabel(location.pathname, supplierData.razonSocial);
    }
    return () => clearLabel(location.pathname);
  }, [supplierData?.razonSocial, location.pathname]);

  useEffect(() => {
    const checkRequired = async () => {
        if (!isEmpresa || !currentRole?.id_company) return;
        try {
            const companies = await companyService.getAll();
            const currentComp = companies.find(c => (c.id_company || c.idCompany) === currentRole.id_company);
            if (currentComp) {
                setRequiredTechnical(currentComp.required_technical);
            }
        } catch (error) {
            console.error("Error checking required technical:", error);
        }
    };
    checkRequired();
  }, [isEmpresa, currentRole]);

  const handleSave = async (data) => {
    const success = await updateSupplier(data);
    if (success) {
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <i className="pi pi-spin pi-spinner text-4xl text-primary"></i>
      </div>
    );
  }

  if (!supplierData) {
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
              {supplierData.razonSocial}
            </h1>
            <StatusBadge status={supplierData.estado} />
            {requiredTechnical && (
                <Tag 
                    value={`AUDITORÍA TÉCNICA: ${supplierData.isTecSuccess === null || supplierData.isTecSuccess === undefined ? 'PENDIENTE' : (supplierData.isTecSuccess ? 'APROBADO' : 'RECHAZADO')}`} 
                    severity={supplierData.isTecSuccess === null || supplierData.isTecSuccess === undefined ? "warning" : (supplierData.isTecSuccess ? "success" : "danger")}
                    icon={supplierData.isTecSuccess === null || supplierData.isTecSuccess === undefined ? "pi pi-clock" : (supplierData.isTecSuccess ? "pi pi-check-circle" : "pi pi-shield")}
                    className="px-3"
                    style={{ borderRadius: '20px' }}
                />
            )}
          </div>
          <p className="text-secondary mt-1">{supplierData.servicio}</p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate('/proveedores')} className="bg-white border border-secondary/30 text-secondary-dark px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary-light transition-colors">
            Volver
          </button>
          {!isEditing && !isEmpresa ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-primary/30 hover:bg-primary-hover transition-colors"
            >
              <i className="pi pi-pencil mr-2"></i>Editar
            </button>
          ) : isEditing ? (
            <button
              onClick={() => setIsEditing(false)}
              className="bg-secondary text-white px-4 py-2 rounded-lg text-sm font-medium border border-secondary/30 hover:bg-secondary-dark transition-colors"
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </div>

      {/* FORMULARIO EN MODO LECTURA / EDICION */}
      <SupplierForm
        initialData={supplierData}
        readOnly={!isEditing}
        partialEdit={isEditing}
        onSubmit={handleSave}
      />
    </div>
  );
};

export default SupplierDetail;

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SupplierForm from './SupplierForm';
import { MOCK_SUPPLIERS } from '../../data/mockSuppliers';
import { StatusBadge } from '../../components/ui/Badges'; // Opcional, para que quede bonito

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. Buscamos el proveedor (convertimos ID a número)
  const proveedor = MOCK_SUPPLIERS.find(p => p.id === parseInt(id));

  if (!proveedor) {
    return <div className="p-10 text-center">Proveedor no encontrado</div>;
  }

  return (
    <div className="animate-fade-in w-full">
      {/* ENCABEZADO DINÁMICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            {/* TÍTULO CON EL NOMBRE DEL PROVEEDOR */}
            <h1 className="text-3xl font-extrabold text-secondary-dark tracking-tight">
              {proveedor.razonSocial}
            </h1>
            <StatusBadge status={proveedor.estatus} />
          </div>
          <p className="text-secondary mt-1">Legajo #{proveedor.id} — {proveedor.servicio}</p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate('/proveedores')} className="bg-white border border-secondary/30 text-secondary-dark px-4 py-2 rounded-lg text-sm font-medium">
            Volver
          </button>
          <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-primary/30">
            <i className="pi pi-pencil mr-2"></i>Editar
          </button>
        </div>
      </div>

      {/* FORMULARIO EN MODO LECTURA */}
      {/* Pasamos 'proveedor' como initialData */}
      <SupplierForm
        initialData={proveedor}
        readOnly={true}
      />
    </div>
  );
};

export default SupplierDetail;
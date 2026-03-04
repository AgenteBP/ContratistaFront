import React from 'react';
import SupplierForm from './SupplierForm';
import { useSupplier } from '../../hooks/useSupplier';
import { formatCUIT } from '../../utils/formatUtils';

/**
 * SupplierData Component - Refactored version
 * Uses useSupplier hook for business logic and data fetching.
 */
const SupplierData = () => {
    const { supplierData, loading, updateSupplier } = useSupplier();

    console.log("SupplierData Render:", { loading, hasData: !!supplierData });

    const getDocStatus = (data) => {
        const docs = data.documentacion || [];

        // Si no hay documentos asignados al proveedor
        if (docs.length === 0) return 'SIN ASIGNAR';

        if (docs.some(d => d.estado === 'VENCIDO')) return 'VENCIDO';
        if (docs.some(d => d.estado === 'CON OBSERVACIÓN' || d.estado === 'OBSERVADO' || d.estado === 'CON OBSERVACION')) return 'OBSERVADO';

        const locationComplete = data.pais && data.provincia && data.localidad &&
            data.codigoPostal && data.direccionFiscal;

        // Un documento se considera al día si está VIGENTE o EN REVISIÓN (ya fue presentado)
        const allDocsValid = docs.every(d =>
            d.estado === 'VIGENTE' || d.estado === 'PRESENTADO' || d.estado === 'EN REVISIÓN'
        );

        return (allDocsValid && locationComplete) ? 'COMPLETO' : 'PENDIENTE';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <i className="pi pi-spin pi-spinner text-4xl text-primary"></i>
            </div>
        );
    }

    if (!supplierData) {
        return <div className="p-8 text-center text-secondary">No se encontraron datos del proveedor asociado.</div>;
    }

    return (
        <div className="mx-auto max-w-7xl">
            <SupplierForm
                initialData={supplierData}
                partialEdit={true}
                onSubmit={updateSupplier}
                title="Mis Datos"
                subtitle="Complete su legajo y mantenga sus datos actualizados."
                headerInfo={{
                    name: supplierData.razonSocial,
                    cuit: formatCUIT(supplierData.cuit),
                    status: supplierData.estado,
                    docStatus: getDocStatus(supplierData)
                }}
            />
        </div>
    );
};

export default SupplierData;

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SupplierForm from './SupplierForm';
import { useSupplier } from '../../hooks/useSupplier';
import { formatCUIT } from '../../utils/formatUtils';
import { useNotification } from '../../context/NotificationContext';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import { useBreadcrumb } from '../../context/BreadcrumbContext';

/**
 * SupplierData Component - Refactored version
 * Uses useSupplier hook for business logic and data fetching.
 */
const SupplierData = () => {
    const { supplierData, loading, updateSupplier, isSaving } = useSupplier();
    const [overlayStatus, setOverlayStatus] = useState('loading'); // 'loading' | 'success'
    const [showOverlay, setShowOverlay] = useState(false);
    const { showSuccess } = useNotification();
    const location = useLocation();
    const { setLabel, clearLabel } = useBreadcrumb();

    useEffect(() => {
        if (supplierData?.razonSocial) {
            setLabel(location.pathname, supplierData.razonSocial);
        }
        return () => clearLabel(location.pathname);
    }, [supplierData?.razonSocial, location.pathname]);

    const handleSubmit = async (data) => {
        setOverlayStatus('loading');
        setShowOverlay(true);

        const result = await updateSupplier(data);

        if (result) {
            showSuccess('Actualizado', 'Los datos del proveedor han sido guardados correctamente.');
        }

        setShowOverlay(false);
        return result;
    };

    // console.log("SupplierData Render:", { loading, hasData: !!supplierData });

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

    if (loading && !showOverlay) {
        return (
            <div className="flex items-center justify-center p-20">
                <i className="pi pi-spin pi-spinner text-4xl text-primary"></i>
            </div>
        );
    }

    if (!loading && !showOverlay && !supplierData) {
        return <div className="p-8 text-center text-secondary">No se encontraron datos del proveedor asociado.</div>;
    }

    return (
        <div className="mx-auto max-w-7xl relative">
            <LoadingOverlay
                isVisible={showOverlay}
                status={overlayStatus}
            />

            <SupplierForm
                initialData={supplierData}
                partialEdit={true}
                isSaving={isSaving}
                onSubmit={handleSubmit}
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

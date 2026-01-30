import React, { useState, useEffect } from 'react';
import SupplierForm from './SupplierForm';
import { MOCK_SUPPLIERS } from '../../data/mockSuppliers';

const SupplierData = () => {
    const [supplierData, setSupplierData] = useState(null);

    useEffect(() => {
        // SIMULACIÓN: Obtener datos del proveedor logueado (Braian Paez ID: 1)
        const myProfile = MOCK_SUPPLIERS.find(p => p.id === 1);
        setSupplierData(myProfile);
    }, []);

    const handleUpdate = (updatedData) => {
        console.log("Actualizando datos de proveedor:", updatedData);
        alert("Datos actualizados correctamente (Simulación)");
    };

    if (!supplierData) {
        return <div className="p-8 text-center text-secondary">Cargando datos...</div>;
    }

    return (
        <div className="mx-auto max-w-7xl">
            <SupplierForm
                initialData={supplierData}
                partialEdit={true}
                onSubmit={handleUpdate}
                title="Mis Datos"
                subtitle="Complete su legajo y mantenga sus datos actualizados."
                headerInfo={{
                    name: supplierData.razonSocial,
                    cuit: supplierData.cuit,
                    status: supplierData.estatus, // 'ACTIVO', 'PENDIENTE', etc.
                    docStatus: (() => {
                        const docs = supplierData.documentacion || [];
                        if (docs.some(d => d.estado === 'VENCIDO')) return 'VENCIDO';

                        // Validar campos de ubicación obligatorios
                        const locationComplete = supplierData.pais &&
                            supplierData.provincia &&
                            supplierData.localidad &&
                            supplierData.codigoPostal &&
                            supplierData.direccionFiscal;

                        const allDocsValid = docs.every(d => d.estado === 'VIGENTE' || d.estado === 'PRESENTADO');

                        return (allDocsValid && locationComplete) ? 'COMPLETO' : 'PENDIENTE';
                    })()
                }}
            />
        </div>
    );
};

export default SupplierData;

import React, { useState, useEffect } from 'react';
import ProviderForm from './ProviderForm';
import { MOCK_PROVEEDORES } from '../../data/mockProviders';

const ProviderData = () => {
    const [providerData, setProviderData] = useState(null);

    useEffect(() => {
        // SIMULACIÓN: Obtener datos del proveedor logueado (Braian Paez ID: 1)
        const myProfile = MOCK_PROVEEDORES.find(p => p.id === 1);
        setProviderData(myProfile);
    }, []);

    const handleUpdate = (updatedData) => {
        console.log("Actualizando datos de proveedor:", updatedData);
        alert("Datos actualizados correctamente (Simulación)");
    };

    if (!providerData) {
        return <div className="p-8 text-center text-secondary">Cargando datos...</div>;
    }

    return (
        <div className="mx-auto max-w-7xl">
            <ProviderForm
                initialData={providerData}
                partialEdit={true}
                onSubmit={handleUpdate}
                title="Mis Datos"
                subtitle="Complete su legajo y mantenga sus datos actualizados."
            />
        </div>
    );
};

export default ProviderData;

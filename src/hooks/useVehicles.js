import { useState, useEffect, useCallback } from 'react';
import elementService from '../services/elementService';
import { useAuth } from '../context/AuthContext';

export const useVehicles = (explicitIdSupplier = null) => {
    const { user, currentRole } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchVehicles = useCallback(async () => {
        const idSupplier = explicitIdSupplier || (currentRole?.role === 'PROVEEDOR'
            ? currentRole.id_entity
            : user?.suppliers?.[0]?.id_supplier);

        if (!idSupplier) {
            setLoading(false);
            return;
        }

        setLoading(true);
        // Reset state to avoid showing stale data
        setVehicles([]);

        try {
            // ID 2 corresponds to Vehicles
            const allElements = await elementService.getBySupplierAndActiveType(idSupplier, 2);

            const vehiclesData = allElements.map(e =>
                elementService.mapToUIVehicle(e, idSupplier, currentRole, user?.suppliers)
            );

            setVehicles(vehiclesData);

            // Extract unique Marcas and Modelos for filters
            const uniqueMarcas = [...new Set(vehiclesData.map(v => v.marca))].filter(m => m !== 'N/A').sort();
            const uniqueModelos = [...new Set(vehiclesData.map(v => v.modelo))].filter(m => m !== 'N/A').sort();

            setMarcas(uniqueMarcas.map(m => ({ label: m, value: m })));
            setModelos(uniqueModelos.map(m => ({ label: m, value: m })));

        } catch (error) {
            console.error("Error fetching vehicles:", error);
        } finally {
            setLoading(false);
        }
    }, [user, currentRole]);

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    return {
        vehicles,
        marcas,
        modelos,
        loading,
        refresh: fetchVehicles
    };
};

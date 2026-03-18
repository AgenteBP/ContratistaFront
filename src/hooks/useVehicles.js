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
            let allElements = [];

            if (currentRole?.role === 'PROVEEDOR') {
                const idSupplier = currentRole.id_entity || user?.suppliers?.[0]?.id_supplier;
                if (!idSupplier) { setLoading(false); return; }
                allElements = await elementService.getBySupplierAndActiveType(idSupplier, 2);
            } else {
                if (!user?.id || !currentRole?.role) { setLoading(false); return; }
                allElements = await elementService.getAuthorized(2, user.id, currentRole.role, currentRole.id_entity);
            }

            const vehiclesData = allElements.map(e =>
                elementService.mapToUIVehicle(e, e.supplier?.id_supplier || e.supplier?.idSupplier, currentRole, user?.suppliers)
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

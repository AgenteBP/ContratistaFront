import { useState, useEffect, useCallback } from 'react';
import elementService from '../services/elementService';
import { useAuth } from '../context/AuthContext';

export const useMachinery = () => {
    const { user, currentRole } = useAuth();
    const [machinery, setMachinery] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMachinery = useCallback(async () => {
        setLoading(true);
        // Reset state
        setMachinery([]);

        try {
            let allElements = [];

            if (currentRole?.role === 'PROVEEDOR') {
                const idSupplier = currentRole.id_entity || user?.suppliers?.[0]?.id_supplier;
                if (!idSupplier) { setLoading(false); return; }
                allElements = await elementService.getBySupplierAndActiveType(idSupplier, 4);
            } else {
                if (!user?.id || !currentRole?.role) { setLoading(false); return; }
                allElements = await elementService.getAuthorized(4, user.id, currentRole.role, currentRole.id_entity);
            }

            const machineryData = allElements.map(e =>
                elementService.mapToUIMachinery(e, e.supplier?.id_supplier || e.supplier?.idSupplier, currentRole, user?.suppliers)
            );

            setMachinery(machineryData);

            // Extract unique Marcas and Modelos for filters
            const uniqueMarcas = [...new Set(machineryData.map(m => m.marca))].filter(m => m !== 'N/A').sort();
            const uniqueModelos = [...new Set(machineryData.map(m => m.modelo))].filter(m => m !== 'N/A').sort();

            setMarcas(uniqueMarcas.map(m => ({ label: m, value: m })));
            setModelos(uniqueModelos.map(m => ({ label: m, value: m })));

        } catch (error) {
            console.error("Error fetching machinery:", error);
        } finally {
            setLoading(false);
        }
    }, [user, currentRole]);

    useEffect(() => {
        fetchMachinery();
    }, [fetchMachinery]);

    return {
        machinery,
        marcas,
        modelos,
        loading,
        refresh: fetchMachinery
    };
};

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
        const idSupplier = currentRole?.role === 'PROVEEDOR'
            ? currentRole.id_entity
            : user?.suppliers?.[0]?.id_supplier;

        if (!idSupplier) {
            setLoading(false);
            return;
        }

        setLoading(true);
        // Reset state
        setMachinery([]);

        try {
            // ID 4 corresponds to Machinery (Maquinaria)
            const allElements = await elementService.getBySupplierAndActiveType(idSupplier, 4);

            const machineryData = allElements.map(e =>
                elementService.mapToUIMachinery(e, idSupplier, currentRole, user?.suppliers)
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

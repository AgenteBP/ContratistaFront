import { useState, useEffect, useCallback } from 'react';
import elementService from '../services/elementService';
import { useAuth } from '../context/AuthContext';

export const useEmployees = () => {
    const { user, currentRole } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        // Reset state
        setEmployees([]);

        try {
            let employeesDataReq = [];

            if (currentRole?.role === 'PROVEEDOR') {
                const idSupplier = currentRole.id_entity || user?.suppliers?.[0]?.id_supplier;
                if (!idSupplier) { setLoading(false); return; }
                employeesDataReq = await elementService.getBySupplierAndActiveType(idSupplier, 1);
            } else {
                if (!user?.id || !currentRole?.role) { setLoading(false); return; }
                employeesDataReq = await elementService.getAuthorized(1, user.id, currentRole.role, currentRole.id_entity);
            }

            const employeesData = employeesDataReq.map(e =>
                elementService.mapToUIEmployee(e, e.supplier?.id_supplier || e.supplier?.idSupplier, currentRole, user?.suppliers)
            );

            setEmployees(employeesData);
        } catch (error) {
            console.error("Error fetching employees:", error);
        } finally {
            setLoading(false);
        }
    }, [user, currentRole]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    return {
        employees,
        loading,
        refresh: fetchEmployees
    };
};

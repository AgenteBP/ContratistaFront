import { useState, useEffect, useCallback } from 'react';
import elementService from '../services/elementService';
import { useAuth } from '../context/AuthContext';

export const useEmployees = () => {
    const { user, currentRole } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEmployees = useCallback(async () => {
        const idSupplier = currentRole?.role === 'PROVEEDOR'
            ? currentRole.id_entity
            : user?.suppliers?.[0]?.id_supplier;

        if (!idSupplier) {
            setLoading(false);
            return;
        }

        setLoading(true);
        // Reset state
        setEmployees([]);

        try {
            // ID 1 corresponds to Employees
            const employeesDataReq = await elementService.getBySupplierAndActiveType(idSupplier, 1);

            const employeesData = employeesDataReq.map(e =>
                elementService.mapToUIEmployee(e, idSupplier, currentRole, user?.suppliers)
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

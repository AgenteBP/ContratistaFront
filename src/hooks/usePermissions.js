import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * usePermissions
 * 
 * Provides centralized Role-Based Access Control (RBAC) checks tailored to the application's roles.
 * Instead of checking string literals like `role === 'ADMIN'` across components,
 * use specific boolean flags like `isAdmin`, `isSupplier`, `canEditDocuments`, etc.
 */
export const usePermissions = () => {
    const { currentRole } = useAuth();

    // The role object in AuthContext may have role or id_role/idRole
    const userRole = currentRole?.role;
    const roleId = currentRole?.id_role || currentRole?.idRole;

    return useMemo(() => {
        // --- Core Roles ---
        // Verify both the string name and the expected numeric ID for robustness
        const isAdmin = userRole === 'ADMIN' || roleId === 1;
        const isSupplier = userRole === 'PROVEEDOR' || roleId === 2;
        const isAuditor = userRole === 'AUDITOR' || roleId === 3;

        // --- Action-Based Permissions ---
        const canEditGeneralData = isAdmin; // Only admins can edit supplier master data
        const canUploadDocuments = isSupplier; // Suppliers upload files
        const canAuditDocuments = isAuditor || isAdmin; // Auditors and Admins can audit/review documents
        const canConfigureRequirements = isAdmin; // Only admins define what documents are required

        return {
            isAdmin,
            isSupplier,
            isAuditor,
            permissions: {
                canEditGeneralData,
                canUploadDocuments,
                canAuditDocuments,
                canConfigureRequirements,
            }
        };
    }, [currentRole, userRole, roleId]);
};

export default usePermissions;

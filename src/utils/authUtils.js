/**
 * Mapea los datos del perfil de usuario al formato que entiende la UI de selección de roles.
 * @param {Object} userProfile - El perfil completo del usuario (desde /auth/users/{id}).
 * @returns {Array} Un array de objetos con { id, role, entities }.
 */
export const getAvailableRoles = (userProfile) => {
    if (!userProfile) return [];

    const mapped = [];

    userProfile.roles?.forEach(roleName => {
        if (roleName === 'ADMIN') {
            mapped.push({
                id: 'admin-root',
                role: 'ADMIN',
                entities: [{ id: 0, name: 'Gestión Central' }]
            });
        }

        if (roleName === 'AUDITOR' && userProfile.auditors) {
            mapped.push({
                id: 'auditor-root',
                role: 'AUDITOR',
                entities: userProfile.auditors.map(a => ({
                    id: a.id_auditor,
                    name: `Registro: ${a.registration_number}`,
                    type: a.type_auditor
                }))
            });
        }

        if (roleName === 'CUSTOMER' && userProfile.clients) {
            mapped.push({
                id: 'customer-root',
                role: 'EMPRESA',
                entities: userProfile.clients.map(c => ({
                    id: c.id_company_client,
                    name: c.companyDescription,
                    id_company: c.id_company
                }))
            });
        }

        if (roleName === 'SUPPLIER' && userProfile.suppliers) {
            mapped.push({
                id: 'supplier-root',
                role: 'PROVEEDOR',
                entities: userProfile.suppliers.map(s => ({
                    id: s.id_supplier,
                    name: s.company_name,
                    cuit: s.cuit
                }))
            });
        }
    });

    return mapped;
};

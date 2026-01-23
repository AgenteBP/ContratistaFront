import api from '../api/axiosConfig';

export const userService = {
    // Crear usuario
    create: async (userData) => {
        // En una implementación real: const response = await api.post('/users', userData);
        // return response.data;
        console.log("Simulating User Creation:", userData);
        return {
            id: Date.now(),
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email, // Asumiendo que se agregará email
            roles: []
        };
    },

    // Asignar rol
    assignRole: async (userId, role) => {
        // const response = await api.post(`/users/${userId}/roles`, { role });
        console.log(`Simulating Role Assignment: User ${userId} -> Role ${role}`);
        return { success: true };
    },

    // Obtener roles disponibles (para el selector)
    getAvailableRoles: async () => {
        return [
            { id: 'PROVEEDOR', name: 'Proveedor', description: 'Suministra bienes o servicios.' },
            { id: 'EMPRESA', name: 'Empresa', description: 'Contratista principal.' },
            { id: 'AUDITOR', name: 'Auditor', description: 'Realiza controles y revisiones.' }
        ];
    }
};

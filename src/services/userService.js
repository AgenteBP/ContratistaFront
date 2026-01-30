import api from '../api/axiosConfig';

export const userService = {
    // 1. Obtener todos (GET)
    getAll: async () => {
        const response = await api.get('/user');
        return response.data;
    },

    // 2. Obtener uno por ID (GET)
    getById: async (id) => {
        const response = await api.get(`/user/${id}`);
        return response.data;
    },

    // 3. Crear usuario (POST)
    create: async (userData) => {
        const response = await api.post('/user', userData);
        return response.data;
    },

    // 4. Actualizar usuario (PUT)
    update: async (id, userData) => {
        const response = await api.put(`/user/${id}`, userData);
        return response.data;
    },

    // 5. Borrar usuario (DELETE)
    delete: async (id) => {
        const response = await api.delete(`/user/${id}`);
        return response.data;
    },

    // 6. Asignar rol
    assignRole: async (userId, role) => {
        // Asumiendo endpoint: POST /user/{id}/roles
        const response = await api.post(`/user/${userId}/roles`, { role });
        return response.data;
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

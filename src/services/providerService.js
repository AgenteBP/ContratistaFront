import api from '../api/axiosConfig';

export const providerService = {
    // 1. Obtener todos (GET)
    getAll: async () => {
        const response = await api.get('/proveedores');
        return response.data; 
    },

    // 2. Obtener uno por ID (GET)
    getById: async (id) => {
        const response = await api.get(`/proveedores/${id}`);
        return response.data;
    },

    // 3. Crear nuevo (POST)
    create: async (providerData) => {
        const response = await api.post('/proveedores', providerData);
        return response.data;
    },

    // 4. Actualizar (PUT)
    update: async (id, providerData) => {
        const response = await api.put(`/proveedores/${id}`, providerData);
        return response.data;
    },

    // 5. Borrar (DELETE)
    delete: async (id) => {
        const response = await api.delete(`/proveedores/${id}`);
        return response.data;
    }
};
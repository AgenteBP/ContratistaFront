import api from '../api/axiosConfig';

export const supplierService = {
    // 1. Obtener todos (GET)
    getAll: async () => {
        const response = await api.get('/supplier');
        return response.data;
    },

    // 2. Obtener uno por ID (GET)
    getById: async (id) => {
        const response = await api.get(`/supplier/${id}`);
        return response.data;
    },

    // 3. Crear nuevo (POST)
    create: async (supplierData) => {
        const response = await api.post('/supplier', supplierData);
        return response.data;
    },

    // 4. Actualizar (PUT)
    update: async (id, supplierData) => {
        const response = await api.put(`/supplier/${id}`, supplierData);
        return response.data;
    },

    // 5. Borrar (DELETE)
    delete: async (id) => {
        const response = await api.delete(`/supplier/${id}`);
        return response.data;
    }
};
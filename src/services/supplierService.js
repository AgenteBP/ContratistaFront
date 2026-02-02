import api from '../api/axiosConfig';

export const supplierService = {
    // 1. Obtener todos (GET)
    getAll: async () => {
        const response = await api.get('/supplier/all');
        return response.data;
    },

    // 2. Obtener uno por ID (GET)
    // Nota: El backend actual usa /oneSupplier?cuit=... no por ID directo en este controller
    // Se deja pendiente validación con el usuario si existe endpoint por ID.
    getById: async (id) => {
        const response = await api.get(`/supplier/${id}`);
        return response.data;
    },

    // 3. Crear nuevo (POST)
    create: async (supplierData) => {
        const response = await api.post('/supplier/save', supplierData);
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
import api from '../api/axiosConfig';

export const supplierService = {
    // 1. Obtener todos (GET)
    getAll: async () => {
        const response = await api.get('/supplier/all');
        return response.data;
    },

    // 2. Obtener uno por CUIT (GET)
    getById: async (cuit) => {
        const response = await api.get(`/supplier/oneSupplier?cuit=${cuit}`);
        return response.data;
    },

    // 3. Crear nuevo (POST)
    create: async (supplierData) => {
        const response = await api.post('/supplier/save', supplierData);
        return response.data;
    },

    // 4. Actualizar (PUT)
    update: async (id, supplierData) => {
        // El backend espera /supplier/update con el ID en el body
        const response = await api.put('/supplier/update', supplierData);
        return response.data;
    },

    // 5. Borrar (DELETE)
    delete: async (id) => {
        const response = await api.delete(`/supplier/${id}`);
        return response.data;
    }
};
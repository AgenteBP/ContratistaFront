import api from '../api/axiosConfig';

export const auditorService = {
    // Obtener todos (GET)
    getAll: async () => {
        const response = await api.get('/auditors/getAll');
        return response.data;
    },

    // Crear nuevo (POST) - if needed
    create: async (auditorData) => {
        const response = await api.post('/auditors/save', auditorData);
        return response.data;
    }
};

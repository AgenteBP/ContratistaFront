import api from '../api/axiosConfig';

export const companyService = {
    // Obtener todos (GET)
    getAll: async () => {
        const response = await api.get('/company/getAll');
        return response.data;
    },

    // Obtener por grupo (GET)
    getByGroup: async (idGroup) => {
        const response = await api.get(`/company/byGroup/${idGroup}`);
        return response.data;
    },

    // Crear nuevo (POST) - if needed
    create: async (companyData) => {
        const response = await api.post('/company/save', companyData);
        return response.data;
    }
};

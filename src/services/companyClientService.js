import api from '../api/axiosConfig';

export const companyClientService = {
    // Obtener todos (GET)
    getAll: async () => {
        const response = await api.get('/companyClient/getAll');
        return response.data;
    },

    // Crear nuevo vínculo Usuario-Empresa (POST)
    create: async (companyClientDTO) => {
        const response = await api.post('/companyClient/save', companyClientDTO);
        return response.data;
    }
};

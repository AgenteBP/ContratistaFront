import api from '../api/axiosConfig';

export const groupService = {
    getAll: async () => {
        const response = await api.get('/group/all');
        return response.data;
    },

    create: async (groupData) => {
        const response = await api.post('/group/save', groupData);
        return response.data;
    },

    getDetails: async (idSupplier, idGroup) => {
        const params = { idSupplier, idGroup };
        const response = await api.get('/group_requirements/details', { params });
        return response.data;
    },

    getSpecific: async (idSupplier, idGroup) => {
        const params = { idSupplier, idGroup };
        const response = await api.get('/group_requirements/specific', { params });
        return response.data;
    }
};

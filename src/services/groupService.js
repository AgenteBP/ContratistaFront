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

    getDetails: async (idSupplier, idGroup, idActiveType = 5) => {
        const params = { idSupplier, idGroup };
        if (idActiveType) params.idActiveType = idActiveType;
        const response = await api.get('/group_requirements/details', { params });
        return response.data;
    }
};

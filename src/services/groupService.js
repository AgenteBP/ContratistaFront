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

    getDetails: async (idSupplier, idGroup, idActiveType = null) => {
        const params = { idSupplier, idGroup };
        if (idActiveType) params.idActiveType = idActiveType;
        const response = await api.get('/group_requirements/details', { params });
        return response.data;
    },

    getSpecific: async (idSupplier, idGroup, idActiveType = null) => {
        const params = { idSupplier, idGroup };
        if (idActiveType) params.idActiveType = idActiveType;
        const response = await api.get('/group_requirements/specific', { params });
        return response.data;
    },

    getByElement: async (idElement) => {
        const response = await api.get('/group_requirements/getByElement', { params: { idElement } });
        return response.data;
    },

    getSpecificResource: async (idSupplier, idGroup, idActive, idElement) => {
        const params = { idSupplier, idGroup, _t: Date.now() }; // Cache buster
        if (idActive != null) params.idActive = idActive;
        if (idElement != null) params.idElement = idElement;
        const response = await api.get('/group_requirements/specificResource', { params });
        return response.data;
    }
};

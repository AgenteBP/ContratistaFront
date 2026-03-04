import api from '../api/axiosConfig';

export const activeService = {
    getByType: async (idActiveType) => {
        const response = await api.get(`/actives/getByType/${idActiveType}`);
        return response.data;
    }
};

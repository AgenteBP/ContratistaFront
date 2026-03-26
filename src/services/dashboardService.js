import api from '../api/axiosConfig';

export const dashboardService = {
    getStats: async (userId, role, entityId = null) => {
        try {
            const params = { userId, role };
            if (entityId) params.entityId = entityId;
            const response = await api.get('/dashboard/stats', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }
};

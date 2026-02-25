import api from '../api/axiosConfig';

export const requirementService = {
    /**
     * Fetch required documents catalog
     * @param {Object} params - Filter options
     * @param {number} params.idGroup - Filter by Group ID
     * @param {number} params.idActiveType - Filter by Active Type ID
     * @returns {Promise<Array>}
     */
    getListRequirements: async (params = {}) => {
        try {
            const { idGroup, idActiveType } = params;
            let url = '/list_requirements';
            const queryParams = [];

            if (idGroup) queryParams.push(`idGroup=${idGroup}`);
            if (idActiveType) queryParams.push(`idActiveType=${idActiveType}`);

            if (queryParams.length > 0) {
                url += `?${queryParams.join('&')}`;
            }

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error("requirementService: Error fetching list requirements", error);
            throw error;
        }
    },

    /**
     * Fetch assigned requirements details for a supplier and group
     * @param {Object} params
     */
    getGroupRequirementsDetails: async (params) => {
        try {
            const { idSupplier, idGroup, idActiveType } = params;
            const queryParams = new URLSearchParams();
            if (idSupplier) queryParams.append('idSupplier', idSupplier);
            if (idGroup) queryParams.append('idGroup', idGroup);
            if (idActiveType) queryParams.append('idActiveType', idActiveType);

            const response = await api.get(`/group_requirements/details?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error('requirementService: Error in getGroupRequirementsDetails:', error);
            throw error;
        }
    },

    /**
     * Fetch supplier with full document context (Elements)
     * @param {string|number} cuit
     */
    getSupplierDocuments: async (cuit) => {
        try {
            const response = await api.get(`/supplier/oneSupplierForDocument?cuit=${cuit}`);
            return response.data;
        } catch (error) {
            console.error('requirementService: Error in getSupplierDocuments:', error);
            throw error;
        }
    }
};

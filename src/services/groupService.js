import api from '../api/axiosConfig';

// Deduplicación de requests en vuelo: si se llama getSpecificResource con los mismos parámetros
// mientras ya hay un request pendiente, devuelve la misma promise en lugar de hacer una nueva llamada HTTP.
const _inFlight = new Map();

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
        const key = `${idSupplier}_${idGroup}_${idActive}_${idElement}`;
        if (_inFlight.has(key)) return _inFlight.get(key);
        const params = { idSupplier, idGroup };
        if (idActive != null) params.idActive = idActive;
        if (idElement != null) params.idElement = idElement;
        const promise = api.get('/group_requirements/specificResource', { params })
            .then(r => r.data)
            .finally(() => _inFlight.delete(key));
        _inFlight.set(key, promise);
        return promise;
    }

    // TODO (optimización futura): implementar getSpecificResourceBatch para reducir N llamadas a 1.
    // Ver plan en .claude/plans/calm-napping-hanrahan.md — sección "Batch endpoint".
    // Requiere nuevo endpoint en backend: GET /group_requirements/specificResourceBatch?idElements=1,2,3
};

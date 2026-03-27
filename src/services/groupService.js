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
    },

    // Reemplaza N llamadas a getSpecificResource (una por elemento) con una sola llamada al backend.
    // Retorna un objeto { [idElement]: List<GroupRequirementsSpecificDTO> } para todos los elementos pedidos.
    getSpecificResourceBatch: async (idSupplier, idGroup, idActive, idElements) => {
        if (!idElements || idElements.length === 0) return {};
        // Spring acepta List<Integer> como multiples params: ?idElements=1&idElements=2&idElements=3
        const params = new URLSearchParams();
        params.append('idSupplier', idSupplier);
        params.append('idGroup', idGroup);
        if (idActive != null) params.append('idActive', idActive);
        idElements.forEach(id => params.append('idElements', id));
        const response = await api.get('/group_requirements/specificResourceBatch', { params });
        return response.data; // Map<Integer, List<GroupRequirementsSpecificDTO>>
    }
};

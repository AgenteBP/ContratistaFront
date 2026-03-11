import api from '../api/axiosConfig';

const elementService = {
    /**
     * Fetch all elements associated with a supplier
     * @param {number} idSupplier 
     * @returns {Promise<Array>}
     */
    getBySupplier: async (idSupplier) => {
        try {
            const response = await api.get(`/elements/getBySupplier?id=${idSupplier}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching elements for supplier ${idSupplier}:`, error);
            throw error;
        }
    },

    /**
     * Fetch elements filtered by supplier and active type (e.g. Machinery, Vehicle, Employee)
     * @param {number} idSupplier 
     * @param {number} idActive 
     * @returns {Promise<Array>}
     */
    getBySupplierAndActive: async (idSupplier, idActive) => {
        try {
            const response = await api.get(`/elements/getBySupplierAndActive?idSupplier=${idSupplier}&idActive=${idActive}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching filtered elements (Supplier: ${idSupplier}, Active: ${idActive}):`, error);
            throw error;
        }
    },

    /**
     * Fetch elements filtered by supplier and active TYPE (e.g. Vehicles = 2)
     * @param {number} idSupplier 
     * @param {number} idActiveType 
     * @returns {Promise<Array>}
     */
    getBySupplierAndActiveType: async (idSupplier, idActiveType) => {
        try {
            const response = await api.get(`/elements/getBySupplierAndActiveType?idSupplier=${idSupplier}&idActiveType=${idActiveType}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching filtered elements by Type (Supplier: ${idSupplier}, ActiveType: ${idActiveType}):`, error);
            throw error;
        }
    },

    /**
     * Fetch elements filtered by active type and authorized user role (e.g. Auditor/Admin)
     * @param {number} idActiveType 
     * @param {number} userId 
     * @param {string} role 
     * @returns {Promise<Array>}
     */
    getAuthorized: async (idActiveType, userId, role) => {
        try {
            const response = await api.get(`/elements/authorized?idActiveType=${idActiveType}&userId=${userId}&role=${role}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching authorized elements (Type: ${idActiveType}, User: ${userId}):`, error);
            throw error;
        }
    },

    /**
     * Fetch actives by type ID
     * @param {number} idActiveType 
     * @returns {Promise<Array>}
     */
    getActivesByType: async (idActiveType) => {
        try {
            const response = await api.get(`/actives/getByType/${idActiveType}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching actives by type ${idActiveType}:`, error);
            throw error;
        }
    },

    /**
     * Fetch a single element by ID
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    getById: async (id) => {
        try {
            const response = await api.get(`/elements/get/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching element ${id}:`, error);
            throw error;
        }
    },

    /**
     * Map backend element to UI Vehicle structure
     */
    mapToUIVehicle: (e, idSupplier, currentRole, suppliers) => {
        return {
            id: e.id_elements || e.idElements,
            codigo: e.data?.codigo || 'N/A',
            patente: e.data?.patente || 'No especificado',
            marca: e.data?.marca || 'N/A',
            modelo: e.data?.modelo || 'N/A',
            anio: e.data?.anio || 'N/A',
            tipo: e.active?.description || 'N/A',
            estado: e.data?.estado || 'ACTIVO',
            proveedor: currentRole?.role === 'PROVEEDOR'
                ? currentRole.entity_name
                : (e.supplier?.companyName || e.supplier?.company_name || suppliers?.find(s => s.id_supplier === idSupplier)?.company_name || 'N/A'),
            docStatus: e.data?.docStatus || 'PENDIENTE',
            motivo: e.data?.motivo || '',
            color: e.data?.color || 'No especificado',
            peso: e.data?.peso || 'No especificado',
            detalles_tecnicos: e.data?.detalles_tecnicos || {}
        };
    },

    /**
     * Map backend element to UI Employee structure
     */
    mapToUIEmployee: (e, idSupplier, currentRole, suppliers) => {
        return {
            id: e.id_elements || e.idElements,
            codigo: e.data?.codigo || 'N/A',
            nombre: e.data?.nombre || e.active?.description || 'No especificado',
            dni: e.data?.dni || 'N/A',
            legajo: e.data?.legajo || 'N/A',
            puesto: e.data?.puesto || e.active?.description || 'N/A',
            area: e.data?.area || 'N/A',
            estado: e.data?.estado || 'ACTIVO',
            habilitado: e.data?.habilitado ?? true,
            proveedor: currentRole?.role === 'PROVEEDOR'
                ? currentRole.entity_name
                : (e.supplier?.companyName || e.supplier?.company_name || suppliers?.find(s => s.id_supplier === idSupplier)?.company_name || 'N/A'),
            docStatus: e.data?.docStatus || 'PENDIENTE',
            motivo: e.data?.motivo || ''
        };
    },

    /**
     * Map backend element to UI Machinery structure
     */
    mapToUIMachinery: (e, idSupplier, currentRole, suppliers) => {
        return {
            id: e.id_elements || e.idElements,
            codigo: e.data?.codigo || 'N/A',
            nombre: e.data?.nombre || e.active?.description || 'No especificado',
            marca: e.data?.marca || 'N/A',
            modelo: e.data?.modelo || 'N/A',
            anio: e.data?.anio || 'N/A',
            serie: e.data?.serie || 'N/A',
            tipo: e.active?.description || 'N/A',
            estado: e.data?.estado || 'ACTIVO',
            proveedor: currentRole?.role === 'PROVEEDOR'
                ? currentRole.entity_name
                : (e.supplier?.companyName || e.supplier?.company_name || suppliers?.find(s => s.id_supplier === idSupplier)?.company_name || 'N/A'),
            docStatus: e.data?.docStatus || 'PENDIENTE',
            motivo: e.data?.motivo || ''
        };
    },

    /**
     * Save or update an element
     * @param {Object} elementData 
     * @returns {Promise<Object>}
     */
    save: async (elementData) => {
        try {
            const response = await api.post('/elements/save', elementData);
            return response.data;
        } catch (error) {
            console.error('Error saving element:', error);
            throw error;
        }
    }
};

export default elementService;

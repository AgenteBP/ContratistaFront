import api from '../api/axiosConfig';

export const auditorService = {
    // Obtener todos (GET)
    getAll: async () => {
        const response = await api.get('/auditors/getAll');
        return response.data;
    },

    // Crear nuevo (POST) - if needed
    create: async (auditorData) => {
        const response = await api.post('/auditors/save', auditorData);
        return response.data;
    },

    /**
     * Obtiene un auditor por ID (incluye empresas asignadas)
     */
    getById: async (id) => {
        const response = await api.get(`/auditors/getById/${id}`);
        return response.data;
    },

    /**
     * Asigna una empresa a un auditor
     */
    assignCompany: async (auditorId, companyId) => {
        const response = await api.post(`/auditors/${auditorId}/assignCompany/${companyId}`);
        return response.data;
    },

    /**
     * Elimina la asignación de una empresa a un auditor
     */
    removeCompany: async (auditorId, companyId) => {
        const response = await api.delete(`/auditors/${auditorId}/removeCompany/${companyId}`);
        return response.data;
    },

    /**
     * Obtiene todos los archivos que requieren auditoría (EN REVISIÓN)
     */
    getPendingFiles: async () => {
        const response = await api.get('/audit/pending');
        return response.data;
    },

    /**
     * Guarda una auditoría para un archivo específico
     * @param {Object} auditData { id_company_auditor, id_file_submitted, status, observation, date_audit }
     */
    saveFileAudit: async (auditData) => {
        const response = await api.post('/audit/save', auditData);
        return response.data;
    }
};

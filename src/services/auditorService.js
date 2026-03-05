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
     * Obtiene todos los archivos que requieren auditoría (EN REVISIÓN)
     */
    getPendingFiles: async () => {
        const response = await api.get('/audit/all'); // Assuming backend supports filtering or we filter in front
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

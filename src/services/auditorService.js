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
    getWithAuditTecReq: async () => {
        const response = await api.get('/supplier/withAuditTecReq');
        return response.data;
    },

    getElementsBySupplierForAuditTec: async (supplierId) => {
        const response = await api.get(`/elements/getBySupplierForAuditTec?id=${supplierId}`);
        return response.data;
    },

    saveAuditTechnique: async ({ idCompany, idSupplier, idAuditor, techniqueSurpassed, commentary, dateHistoryTec }) => {
        const response = await api.post('/company_supplier/save_audit_technique', {
            idCompany, idSupplier, idAuditor, techniqueSurpassed, commentary, dateHistoryTec,
        });
        return response.data;
    },

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
    },

    // --- Configuración Técnica ---

    getCostScale: async () => {
        const response = await api.get('/cost-scale/get');
        return response.data;
    },

    updateCostScale: async (data) => {
        const response = await api.put('/cost-scale/update', data);
        return response.data;
    },

    getTypicalWorkingDay: async () => {
        const response = await api.get('/typical-working-day/get');
        return response.data;
    },

    updateTypicalWorkingDay: async (data) => {
        const response = await api.put('/typical-working-day/update', data);
        return response.data;
    },

    getDailyAffect: async () => {
        const response = await api.get('/daily-affect/get');
        return response.data;
    },

    updateDailyAffect: async (data) => {
        const response = await api.put('/daily-affect/update', data);
        return response.data;
    },
};

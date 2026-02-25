import api from '../api/axiosConfig';

export const supplierService = {
    // 1. Obtener todos (GET)
    getAll: async () => {
        const response = await api.get('/supplier/all');
        return response.data;
    },

    /**
     * Utility to map Backend response to UI-friendly structure
     */
    mapToUISupplier: (response) => {
        if (!response) return null;
        return {
            id: response.cuit,
            internalId: response.id_supplier || response.idSupplier || response.id,
            razonSocial: response.company_name,
            cuit: response.cuit,
            nombreFantasia: response.fantasy_name,
            tipoPersona: response.type_person || 'JURIDICA',
            clasificacionAFIP: response.classification_afip || 'Responsable Inscripto',
            servicio: response.category_service || 'Mantenimiento',
            email: response.email_corporate,
            telefono: response.phone,
            empleadorAFIP: response.is_an_afip_employer,
            esTemporal: response.is_temporary_hiring,
            estado: response.active === 0 ? 'ACTIVO' : 'INACTIVO',
            pais: response.country,
            provincia: response.province,
            localidad: response.city,
            codigoPostal: response.postal_code,
            direccionFiscal: response.address_tax,
            direccionReal: response.address_real,
            idGroup: response.id_group,
            contactos: (response.contacts && response.contacts.list)
                ? response.contacts.list.map(c => ({
                    id: c.id || Date.now() + Math.random(),
                    nombre: c.nombre || '',
                    tipo: c.tipo || 'REPRESENTANTE LEGAL',
                    dni: c.dni || '',
                    email: c.email || '',
                    movil: c.movil || '',
                    telefono: c.telefono || ''
                }))
                : [],
            documentacion: (response.document_supplier && response.document_supplier.list)
                ? response.document_supplier.list.map(d => ({
                    tipo: d.tipo,
                    estado: d.estado || 'PENDIENTE',
                    archivo: d.archivo,
                    observacion: d.observacion,
                    fechaVencimiento: d.fechaVencimiento,
                    id: d.id || Date.now() + Math.random(),
                    modified: false
                }))
                : []
        };
    },

    // 2. Obtener uno por CUIT (Básico)
    getById: async (cuit) => {
        console.log("supplierService: getById (basic) called for", cuit);
        const cleanCuit = String(cuit).replace(/\D/g, '');
        try {
            const response = await api.get(`/supplier/oneSupplier?cuit=${cleanCuit}`);
            return response.data;
        } catch (error) {
            console.error("supplierService: getById Fetch error", error);
            throw error;
        }
    },

    // 6. Obtener uno por CUIT con Documentos (GET)
    getWithDocuments: async (cuit) => {
        console.log("supplierService: getWithDocuments called for", cuit);
        const cleanCuit = String(cuit).replace(/\D/g, '');
        try {
            const response = await api.get(`/supplier/oneSupplierForDocument?cuit=${cleanCuit}`);
            console.log("supplierService: Response data (docs)", response.data);
            const mapped = supplierService.mapToUISupplier(response.data);
            console.log("supplierService: Mapped UI data", mapped);
            return mapped;
        } catch (error) {
            console.error("supplierService: getWithDocuments Fetch error", error);
            throw error;
        }
    },

    // 3. Crear nuevo (POST)
    create: async (supplierData) => {
        const response = await api.post('/supplier/save', supplierData);
        return response.data;
    },

    // 4. Actualizar (PUT)
    update: async (id, supplierData) => {
        // El backend espera /supplier/update con el ID en el body
        const response = await api.put('/supplier/update', supplierData);
        return response.data;
    },

    // 5. Borrar (DELETE)
    delete: async (id) => {
        const response = await api.delete(`/supplier/${id}`);
        return response.data;
    }
};
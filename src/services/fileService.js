import api from '../api/axiosConfig';
import { fileToBase64 } from '../utils/fileUtils';

const formatForBackend = (dateInput) => {
    if (!dateInput) return null;
    
    // Si ya es un string en formato ISO, pasarlo directo
    if (typeof dateInput === 'string') {
        if (dateInput.includes('T')) return new Date(dateInput).toISOString();
        // Si es solo "YYYY-MM-DD", forzar que se interprete a las 12 PM local para evitar que 
        // el desfase de zona horaria lo mueva al dia anterior al pasarlo a UTC.
        return new Date(`${dateInput}T12:00:00`).toISOString();
    }

    // Si es objeto Date de PrimeReact Calendar
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;

    return d.toISOString(); // Jackson parsea ISO (Z) automáticamente a la Date correcta en el servidor
};

export const fileService = {
    /**
     * Obtiene el contenido binario (Blob) de un archivo específico por su ID
     * @param {number} idFileSubmitted - El ID del archivo a recuperar
     * @returns {Promise<Blob>} - El Blob binario del archivo
     */
    getFile: async (idFileSubmitted) => {
        try {
            const response = await api.get(`/files/${idFileSubmitted}`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error(`Error recogiendo el archivo con ID ${idFileSubmitted}`, error);
            throw error;
        }
    },

    /**
     * Elimina un archivo específico por su ID
     * @param {number} idFileSubmitted 
     * @returns {Promise<Object>}
     */
    deleteFile: async (idFileSubmitted) => {
        try {
            const response = await api.delete(`/files/${idFileSubmitted}`);
            return response.data;
        } catch (error) {
            console.error(`Error eliminando el archivo con ID ${idFileSubmitted}`, error);
            throw error;
        }
    },

    /**
     * Sube o actualiza un archivo para un elemento (resource) via /elements/saveFile/{id}
     */
    uploadFileForElement: async (file, { idElement, idActive, idSupplier, idGroupReq, idAttribute, idFileSubmitted = null, expirationDate = null }) => {
        const base64Data = await fileToBase64(file);
        const pureBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

        const payload = {
            id_file_submitted: idFileSubmitted,
            id_group_requirements: idGroupReq,
            id_attribute: idAttribute, // Removed the || 1 default so we can see if it's being dropped
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            file_content: pureBase64,
            date_submitted: formatForBackend(new Date()),
            expiration_date: formatForBackend(expirationDate)
        };

        if (!idAttribute) {
            console.error("ALERTA: idAttribute es undefined o null en uploadFileForElement!", { idElement, idGroupReq, idAttribute });
            alert("Error: No se encontró el ID del Atributo para este requisito. El archivo se guardará al azar.");
        }

        try {
            const response = await api.post(`/elements/saveFile/${idElement}`, payload);
            return response.data;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    },

    /**
     * Actualiza solo la fecha de vencimiento de un archivo ya subido
     */
    updateDateForElement: async ({ newDate, idElement, idActive, idSupplier, idGroupReq, idAttribute, idFileSubmitted, fileName = null }) => {
        const payload = {
            id_file_submitted: idFileSubmitted,
            id_group_requirements: idGroupReq,
            id_attribute: idAttribute,
            file_name: fileName,
            expiration_date: formatForBackend(newDate)
            // No enviamos file_content ni size, el backend actualizará solo lo enviado
        };

        try {
            const response = await api.post(`/elements/saveFile/${idElement}`, payload);
            return response.data;
        } catch (error) {
            console.error("Error updating date:", error);
            throw error;
        }
    }
};


import api from '../api/axiosConfig';

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
    }
};

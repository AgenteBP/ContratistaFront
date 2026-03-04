/**
 * Formats a string of numbers into CUIT/CUIL format: XX-XXXXXXXX-X
 * @param {string|number} value - The CUIT/CUIL string or number to format
 * @returns {string} The formatted CUIT/CUIL or the original value if it doesn't match the expected length
 */
export const formatCUIT = (value) => {
    if (!value) return '';

    // Remove all non-numeric characters
    const cleanValue = String(value).replace(/\D/g, '');

    if (cleanValue.length === 11) {
        return `${cleanValue.substring(0, 2)}-${cleanValue.substring(2, 10)}-${cleanValue.substring(10)}`;
    }

    return String(value);
};

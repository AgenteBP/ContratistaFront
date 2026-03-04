/**
 * Converts a base64 string to a Blob URL.
 * Standard window.open() often fails with very large 'data:' URIs.
 * Using a Blob URL is more reliable.
 * 
 * @param {string} base64 - The base64 string (can include data: prefix)
 * @param {string} type - The MIME type (default 'application/pdf')
 * @returns {string|null} - The generated Blob URL or null
 */
export const base64ToBlobUrl = (base64, type = 'application/pdf') => {
    if (!base64 || typeof base64 !== 'string') return null;
    try {
        // Handle data: URI prefix if present
        const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

        // Use binary string conversion
        const binStr = atob(base64Data);
        const len = binStr.length;
        const arr = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            arr[i] = binStr.charCodeAt(i);
        }

        const blob = new Blob([arr], { type });
        return URL.createObjectURL(blob);
    } catch (e) {
        console.error("fileUtils: Error converting base64 to blob", e);
        // If it already looks like a URL, return it as fallback
        if (base64.startsWith('http') || base64.startsWith('blob:')) return base64;
        return null;
    }
};

/**
 * Converts a File object to a base64 string.
 * @param {File} file 
 * @returns {Promise<string>}
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

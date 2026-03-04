// Mapping for Technical Document Tag to human-readable Label and Frequency
// (Hardcoded labels removed - descriptions now come from backend)
export const DOC_TYPE_LABELS = {}; // Empty fallback to avoid import errors
// export const DOC_TYPE_LABELS_ORIGINAL = {
//     'CONSTANCIA_AFIP': { label: 'Constancia de Inscripción AFIP', frecuencia: 'Mensual' },
//     'ESTATUTO': { label: 'Estatuto Social', frecuencia: 'Única vez' },
//     'FORM_931': { label: 'Formulario 931', frecuencia: 'Mensual' },
//     'HABILITACION_SEGURIDAD': { label: 'Habilitación Comercial / Seguridad', frecuencia: 'Con Vencimiento' },
//     'SEGURO_ACCIDENTES': { label: 'Seguro de Accidentes Personales', frecuencia: 'Mensual' },
//     'ART_CERTIFICADO': { label: 'Certificado de Cobertura ART', frecuencia: 'Mensual' },
//     'SEGURO_VIDA': { label: 'Seguro de Vida Obligatorio', frecuencia: 'Anual' },
//     'HABILITACION_VEHICULOS': { label: 'Habilitación de Vehículos / VTV', frecuencia: 'Anual' },
//     'SOLICITUD_USUARIOS': { label: 'Solicitud de Usuarios de Sistema', frecuencia: 'Única vez' },
//     'CERT_NO_DEUDA_EDESAL': { label: 'Certificado de No Deuda (Edesal)', frecuencia: 'Trimestral' },
//     'EMR_MANUAL_EDESAL': { label: 'Manual de Inducción Seguridad EMR (Edesal)', frecuencia: 'Bienal' },
//     'DDJJ_ETICA_EDESAL': { label: 'Declaración Jurada Ética (Edesal)', frecuencia: 'Anual' },
//     'HABILITACION_VIGILANCIA_EDESAL': { label: 'Habilitación Provincial de Seguridad (Edesal)', frecuencia: 'Anual' },
//     'ANEXO_SH_ROVELLA': { label: 'Anexo Seguridad e Higiene (Rovella)', frecuencia: 'Única vez' },
//     'FICHA_ALTA_ROVELLA': { label: 'Ficha Alta de Proveedor (Rovella)', frecuencia: 'Única vez' },
//     'POLIZA_OBRA_ROVELLA': { label: 'Póliza de Seguro de Obra (Rovella)', frecuencia: 'Mensual' },
//     'SAP_ROVELLA': { label: 'Seguro ACC Personales - Cláusula Rovella', frecuencia: 'Anual' }
// };

// Backend Periodicity Mapping
export const PERIODICITY_MAP = {
    'ANUAL': 1,
    'MENSUAL': 2,
    'SEMANAL': 3,
    'UNICA VEZ': 4
};

// Safe fallback helpers (labels now come from backend)
export const getDocLabel = (tipo) => {
    if (!tipo) return 'Documento';
    return tipo.replace(/_/g, ' ') || 'Documento';
};

export const getDocFrequency = (tipo) => {
    return 'N/A';
};

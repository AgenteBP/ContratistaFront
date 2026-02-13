export const MOCK_USERS = [
    {
        id: 1,
        username: 'bpaez',
        firstName: 'Braian',
        lastName: 'Paez',
        email: 'braian.paez@empresa.com',
        password: 'password123',
        role: 'PROVEEDOR',
        status: 'ACTIVO',
        lastLogin: '2025-10-23 09:12',
        rolesDetails: [
            {
                roleName: 'PROVEEDOR',
                entities: [
                    { id: 1, razonSocial: 'PAEZ BRAIAN ANDRES', cuit: '20-37202708-9', servicio: 'MANTENIMIENTO', grupo: 'DISTRIBUCIÓN', accesoHabilitado: 'NO', riesgo: 'RIESGO ALTO', esTemporal: 'No', estado: 'SIN COMPLETAR', empleadorAFIP: 'Si', facturasAPOC: 'No', altaSistema: '04/11/2025', bajaSistema: '', inhabilitadoEl: '', motivo: 'Falta documentación crítica' },
                    { id: 6, razonSocial: 'CONSTRUCTORA DEL NORTE S.A.', cuit: '30-60606060-9', servicio: 'INVERSION Y MANTENIMIENTO', grupo: 'EMPRESAS GRUPO', accesoHabilitado: 'NO', riesgo: 'RIESGO ALTO', esTemporal: 'No', estado: 'SIN COMPLETAR', empleadorAFIP: 'Si', facturasAPOC: 'Si', altaSistema: '01/01/2025', bajaSistema: '', inhabilitadoEl: '', motivo: 'Detectada factura APOC en validación' },
                    { id: 8, razonSocial: 'CONSULTORA PERFILES', cuit: '30-99887766-1', servicio: 'BAREMO', grupo: 'RR.HH.', accesoHabilitado: 'SI', riesgo: 'RIESGO BAJO', esTemporal: 'Si', estado: 'ACTIVO', empleadorAFIP: 'Si', facturasAPOC: 'No', altaSistema: '05/05/2024', bajaSistema: '', inhabilitadoEl: '', motivo: '' }
                ]
            },
            {
                roleName: 'RRHH',
                entities: [
                    { id: 501, name: 'Departamento RRHH Central', type: 'Departamento', date: '2025-01-01', status: 'Activo' }
                ]
            }
        ]
    },
    {
        id: 2,
        username: 'lmorandini',
        firstName: 'Lucia Anabel',
        lastName: 'Morandini Galdeano',
        email: 'lucia.morandini@empresa.com',
        role: 'ADMINISTRADOR',
        status: 'ACTIVO',
        lastLogin: '2025-10-23 10:00',
        rolesDetails: [
            {
                roleName: 'ADMINISTRADOR',
                entities: []
            },
            {
                roleName: 'PROVEEDOR',
                entities: [
                    { id: 2, razonSocial: 'SEGURIDAD TOTAL S.A.', cuit: '30-55555555-1', servicio: 'VIGILANCIA', grupo: 'COMERCIAL', accesoHabilitado: 'SI', riesgo: 'RIESGO MEDIO', esTemporal: 'No', estado: 'ACTIVO', empleadorAFIP: 'Si', facturasAPOC: 'No', altaSistema: '10/01/2024', bajaSistema: '', inhabilitadoEl: '', motivo: '' },
                    { id: 4, razonSocial: 'TECH SOLUTIONS GLOBAL', cuit: '33-70707070-4', servicio: 'BAREMO/MANTENIMIENTO TI', grupo: 'TI', accesoHabilitado: 'SI', riesgo: 'RIESGO BAJO', esTemporal: 'No', estado: 'ACTIVO', empleadorAFIP: 'Si', facturasAPOC: 'No', altaSistema: '15/06/2024', bajaSistema: '', inhabilitadoEl: '', motivo: '' },
                    { id: 8, razonSocial: 'CONSULTORA PERFILES', cuit: '30-99887766-1', servicio: 'BAREMO', grupo: 'RR.HH.', accesoHabilitado: 'SI', riesgo: 'RIESGO BAJO', esTemporal: 'Si', estado: 'ACTIVO', empleadorAFIP: 'Si', facturasAPOC: 'No', altaSistema: '05/05/2024', bajaSistema: '', inhabilitadoEl: '', motivo: '' }
                ]
            },
            {
                roleName: 'AUDITOR',
                entities: [
                    { id: 301, name: 'Auditoría Externa 2025', type: 'Proyecto', date: '2025-10-01', status: 'En Proceso' }
                ]
            }
        ]
    },
    {
        id: 3,
        username: 'admin',
        firstName: 'Administrador',
        lastName: 'Sistema',
        email: 'admin@empresa.com',
        role: 'ADMINISTRADOR',
        status: 'ACTIVO',
        lastLogin: '2025-10-22 10:30'
    },
    {
        id: 4,
        username: 'jdoe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'jdoe@proveedor.com',
        role: 'PROVEEDOR',
        status: 'ACTIVO',
        lastLogin: '2025-10-21 14:15'
    },
    {
        id: 5,
        username: 'audit_user',
        firstName: 'Maria',
        lastName: 'Gomez',
        email: 'maria.gomez@auditoria.com',
        role: 'AUDITOR',
        status: 'SUSPENDIDO',
        lastLogin: '2025-09-15 09:00'
    },
    {
        id: 6,
        username: 'carlos_p',
        firstName: 'Carlos',
        lastName: 'Perez',
        email: 'carlos.perez@tech.com',
        role: 'TECNICO',
        status: 'ACTIVO',
        lastLogin: '2025-10-22 08:45'
    },
    {
        id: 7,
        username: 'luisa_m',
        firstName: 'Luisa',
        lastName: 'Martinez',
        email: 'luisa.m@rrhh.com',
        role: 'RRHH',
        status: 'INACTIVO',
        lastLogin: '2025-08-01 11:20'
    }
];

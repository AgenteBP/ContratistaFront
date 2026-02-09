export const MOCK_VEHICLES = [
    { id: 1, patente: 'AE123CD', marca: 'Toyota', modelo: 'Hilux', anio: 2022, tipo: 'Camioneta', estado: 'ACTIVO', proveedor: 'PAEZ BRAIAN ANDRES', docStatus: 'COMPLETA' },
    { id: 11, patente: 'BB999CC', marca: 'Fiat', modelo: 'Fiorino', anio: 2020, tipo: 'Utilitario', estado: 'ACTIVO', proveedor: 'PAEZ BRAIAN ANDRES', docStatus: 'VENCIDA', motivo: 'VTV Vencida' },
    { id: 12, patente: 'CC888DD', marca: 'Renault', modelo: 'Kangoo', anio: 2023, tipo: 'Utilitario', estado: 'EN REVISIÓN', proveedor: 'PAEZ BRAIAN ANDRES', docStatus: 'PENDIENTE', motivo: 'Seguro en trámite' },
    { id: 13, patente: 'DD777EE', marca: 'Chevrolet', modelo: 'S10', anio: 2019, tipo: 'Camioneta', estado: 'ACTIVO', proveedor: 'PAEZ BRAIAN ANDRES', docStatus: 'INCOMPLETA', motivo: 'Falta Cédula Azul' },
    { id: 14, patente: 'EE666FF', marca: 'Peugeot', modelo: 'Partner', anio: 2021, tipo: 'Furgón', estado: 'ACTIVO', proveedor: 'PAEZ BRAIAN ANDRES', docStatus: 'COMPLETA' },
    { id: 2, patente: 'AD456EF', marca: 'Ford', modelo: 'Ranger', anio: 2021, tipo: 'Camioneta', estado: 'ACTIVO', proveedor: 'SEGURIDAD TOTAL S.A.', docStatus: 'COMPLETA' },
    { id: 3, patente: 'AF789GH', marca: 'Mercedes-Benz', modelo: 'Sprinter', anio: 2023, tipo: 'Furgón', estado: 'EN REVISIÓN', proveedor: 'LIMPIEZA EXPRESS SRL', docStatus: 'PENDIENTE', motivo: 'Documentación bajo revisión técnica.' },
    { id: 4, patente: 'AA001BB', marca: 'Volkswagen', modelo: 'Amarok', anio: 2020, tipo: 'Camioneta', estado: 'VENCIDO', proveedor: 'TECH SOLUTIONS GLOBAL', docStatus: 'VENCIDA', motivo: 'Seguro obligatorio vencido.' },
    { id: 5, patente: 'AB222CC', marca: 'Iveco', modelo: 'Daily', anio: 2019, tipo: 'Camión Liviano', estado: 'SUSPENDIDO', proveedor: 'LOPEZ MARIA EUGENIA', docStatus: 'INCOMPLETA', motivo: 'Falta revisión técnica obligatoria.' }
];

export const MOCK_EMPLOYEES = [
    { id: 1, nombre: 'Juan Pérez', dni: '35.123.456', legajo: 'E-001', puesto: 'Operario', area: 'Mantenimiento', estado: 'ACTIVO', habilitado: true, proveedor: 'PAEZ BRAIAN ANDRES', docStatus: 'COMPLETA' },
    { id: 11, nombre: 'Carlos Ruiz', dni: '29.999.888', legajo: 'E-011', puesto: 'Ayudante', area: 'Mantenimiento', estado: 'PENDIENTE', habilitado: false, proveedor: 'PAEZ BRAIAN ANDRES', docStatus: 'INCOMPLETA', motivo: 'Falta DNI Digital' },
    { id: 12, nombre: 'Ana Martinez', dni: '27.555.444', legajo: 'E-012', puesto: 'Administrativa', area: 'Administración', estado: 'ACTIVO', habilitado: true, proveedor: 'PAEZ BRAIAN ANDRES', docStatus: 'VENCIDA', motivo: 'Alta AFIP Vencida' },
    { id: 13, nombre: 'Pedro Gomez', dni: '30.111.222', legajo: 'E-013', puesto: 'Chofer', area: 'Logística', estado: 'ACTIVO', habilitado: true, proveedor: 'PAEZ BRAIAN ANDRES', docStatus: 'EN REVISIÓN', motivo: 'Licencia en renovación' },
    { id: 14, nombre: 'Sofia Lopez', dni: '40.666.777', legajo: 'E-014', puesto: 'Técnico', area: 'Calidad', estado: 'ACTIVO', habilitado: true, proveedor: 'PAEZ BRAIAN ANDRES', docStatus: 'COMPLETA' },
    { id: 15, nombre: 'Miguel Torres', dni: '33.222.111', legajo: 'E-015', puesto: 'Operario', area: 'Limpieza', estado: 'BAJA', habilitado: false, proveedor: 'PAEZ BRAIAN ANDRES', docStatus: 'INCOMPLETA', motivo: 'Documentación de baja pendiente' },
    { id: 2, nombre: 'María García', dni: '38.765.432', legajo: 'E-002', puesto: 'Supervisor', area: 'Vigilancia', estado: 'ACTIVO', habilitado: true, proveedor: 'SEGURIDAD TOTAL S.A.', docStatus: 'COMPLETA' },
    { id: 3, nombre: 'Ricardo Fort', dni: '22.111.999', legajo: 'E-003', puesto: 'Chofer', area: 'Logística', estado: 'EN REVISIÓN', habilitado: false, proveedor: 'LIMPIEZA EXPRESS SRL', docStatus: 'INCOMPLETA', motivo: 'Falta carga de ART actualizada.' },
    { id: 4, nombre: 'Esteban Quito', dni: '40.222.333', legajo: 'E-004', puesto: 'Técnico', area: 'Sistemas', estado: 'VENCIDO', habilitado: false, proveedor: 'TECH SOLUTIONS GLOBAL', docStatus: 'VENCIDA', motivo: 'Certificado de antecedentes vencido.' },
    { id: 5, nombre: 'Elena Nito', dni: '31.444.555', legajo: 'E-005', puesto: 'Administrativo', area: 'Administración', estado: 'DADO DE BAJA', habilitado: false, proveedor: 'LOPEZ MARIA EUGENIA', docStatus: 'INCOMPLETA', motivo: 'Desvinculación por fin de contrato temporal.' }
];

export const MOCK_MACHINERY = [
    { id: 1, nombre: 'Excavadora 200LC', marca: 'CAT', modelo: '320', anio: 2021, tipo: 'Excavadora', serie: 'CAT320-9988', estado: 'ACTIVO', proveedor: 'PAEZ BRAIAN ANDRES', docStatus: 'COMPLETA' },
    { id: 11, nombre: 'Mini Cargadora', marca: 'Bobcat', modelo: 'S450', anio: 2018, tipo: 'Minicargadora', serie: 'BOB-555', estado: 'PENDIENTE', proveedor: 'PAEZ BRAIAN ANDRES', docStatus: 'PENDIENTE', motivo: 'Ingreso reciente' },
    { id: 12, nombre: 'Grúa Torre', marca: 'Liebherr', modelo: '100EC', anio: 2015, tipo: 'Grúa', serie: 'LIE-111', estado: 'ACTIVO', proveedor: 'PAEZ BRAIAN ANDRES', docStatus: 'VENCIDA', motivo: 'Certificado de carga vencido' },
    { id: 13, nombre: 'Compresor', marca: 'Atlas Copco', modelo: 'XAS', anio: 2020, tipo: 'Compresor', serie: 'ATL-222', estado: 'EN REVISIÓN', proveedor: 'PAEZ BRAIAN ANDRES', docStatus: 'COMPLETA' },
    { id: 2, nombre: 'Motoniveladora 140K', marca: 'John Deere', modelo: '670G', anio: 2022, tipo: 'Motoniveladora', serie: 'JD670-4455', estado: 'ACTIVO', proveedor: 'TECH SOLUTIONS GLOBAL', docStatus: 'COMPLETA' },
    { id: 3, nombre: 'Montacargas CPCD30', marca: 'Heli', modelo: 'K2', anio: 2023, tipo: 'Montacargas', serie: 'HELI-2023-01', estado: 'EN REVISIÓN', proveedor: 'SEGURIDAD TOTAL S.A.', docStatus: 'PENDIENTE', motivo: 'Esperando validación de inspector.' },
    { id: 4, nombre: 'Generador 50kVA', marca: 'Cummins', modelo: 'C55D5', anio: 2020, tipo: 'Generador', serie: 'CUMM-55-1234', estado: 'VENCIDO', proveedor: 'LIMPIEZA EXPRESS SRL', docStatus: 'VENCIDA', motivo: 'Mantenimiento preventivo fuera de término.' }
];

import React, { useState, useEffect } from 'react';
import SupplierForm from './SupplierForm';
import { MOCK_SUPPLIERS } from '../../data/mockSuppliers';
import { useAuth } from '../../context/AuthContext';
import { supplierService } from '../../services/supplierService';
import { useNotification } from '../../context/NotificationContext';

const SupplierData = () => {
    const { user } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [supplierData, setSupplierData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Obtener CUIT del usuario logueado
                const userSupplier = user?.suppliers?.[0];
                const cuit = userSupplier?.cuit;

                if (!cuit) {
                    console.warn("El usuario no tiene un proveedor asociado con CUIT.");
                    // Fallback a mock por ID si no hay CUIT (dev mode legacy)
                    const mockById = MOCK_SUPPLIERS.find(p => p.id === 1);
                    setSupplierData(mockById);
                    setLoading(false);
                    return;
                }

                // 2. Intentar buscar en Backend
                console.log("Buscando datos recientes para CUIT:", cuit);
                const response = await supplierService.getById(cuit);

                if (response) {
                    // Map API response
                    const mappedData = {
                        id: response.cuit,
                        internalId: response.id_supplier,
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
                        estatus: response.active === 1 ? 'ACTIVO' : 'INACTIVO',
                        pais: response.country,
                        provincia: response.province,
                        localidad: response.city,
                        codigoPostal: response.postal_code,
                        direccionFiscal: response.address_tax,
                        direccionReal: response.address_real,
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
                                modified: false // Reset modified flag on fetch
                            }))
                            : []
                    };
                    setSupplierData(mappedData);
                } else {
                    throw new Error("No data from API");
                }

            } catch (error) {
                console.error("Error al cargar mis datos (backend), usando MOCK:", error);

                // 3. Fallback a MOCK si falla el backend
                // Intentamos buscar por CUIT en el mock, sino por ID default
                const userSupplier = user?.suppliers?.[0];
                const cuit = userSupplier?.cuit;

                const foundInMock = MOCK_SUPPLIERS.find(p => p.cuit === cuit) || MOCK_SUPPLIERS.find(p => p.id === 1);
                setSupplierData(foundInMock);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    const handleUpdate = async (updatedData) => {
        console.log("Intentando actualizar datos (RAW):", updatedData);

        // Mapeo para Backend (Snake Case vs Camel Case)
        const backendPayload = {
            id_supplier: updatedData.internalId,
            email_corporate: updatedData.email,
            phone: updatedData.telefono ? Number(updatedData.telefono) : null,
            address_real: updatedData.direccionReal,
            address_tax: updatedData.direccionFiscal,
            country: updatedData.pais,
            province: updatedData.provincia,
            city: updatedData.localidad,
            postal_code: updatedData.codigoPostal ? Number(updatedData.codigoPostal) : null,

            // MAPEO COMPLEJO: Arrays a Map/JSON
            // Sanitizamos 'contacts' para evitar problemas de tipos
            contacts: updatedData.contactos ? {
                list: updatedData.contactos.map(c => ({
                    id: c.id,
                    nombre: c.nombre ? String(c.nombre).trim() : '',
                    tipo: c.tipo ? String(c.tipo).trim() : '',
                    dni: c.dni ? String(c.dni).trim() : '',
                    email: c.email ? String(c.email).trim() : '',
                    movil: c.movil ? String(c.movil).trim() : '',
                    telefono: c.telefono ? String(c.telefono).trim() : '',
                }))
            } : null,

            // Sanitizamos 'document_supplier'
            document_supplier: updatedData.documentacion ? {
                list: updatedData.documentacion.map(d => ({
                    id: d.id,
                    tipo: d.tipo,
                    estado: d.estado,
                    archivo: d.archivo, // Nombre del archivo
                    observacion: d.observacion,
                    fechaVencimiento: d.fechaVencimiento instanceof Date ? d.fechaVencimiento.toISOString().split('T')[0] : d.fechaVencimiento,
                    // EXCLUIMOS fileUrl (blob) y fileObject para no enviar basura que pueda romper el backend
                }))
            } : null,

            // NOTA: 'company_name' y 'cuit' eliminados para evitar errores de propiedad desconocida
        };

        console.log("Payload para Backend:", backendPayload);

        try {
            if (updatedData.internalId) {
                // Update REAL
                await supplierService.update(updatedData.internalId, backendPayload);
                showSuccess('Operación Exitosa', 'Datos actualizados correctamente.');
            } else {
                // Update MOCK
                showSuccess('Simulación', 'Datos actualizados correctamente (Simulación Local).');
            }
        } catch (error) {
            console.error("Error al actualizar:", error);
            showError('Error', 'Error al actualizar los datos.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <i className="pi pi-spin pi-spinner text-4xl text-primary"></i>
            </div>
        );
    }

    if (!supplierData) {
        return <div className="p-8 text-center text-secondary">No se encontraron datos del proveedor asociado.</div>;
    }

    return (
        <div className="mx-auto max-w-7xl">
            <SupplierForm
                initialData={supplierData}
                partialEdit={true}
                onSubmit={handleUpdate}
                title="Mis Datos"
                subtitle="Complete su legajo y mantenga sus datos actualizados."
                headerInfo={{
                    name: supplierData.razonSocial,
                    cuit: supplierData.cuit,
                    status: supplierData.estatus, // 'ACTIVO', 'PENDIENTE', etc.
                    docStatus: (() => {
                        const docs = supplierData.documentacion || [];
                        if (docs.some(d => d.estado === 'VENCIDO')) return 'VENCIDO';

                        // Validar campos de ubicación obligatorios
                        const locationComplete = supplierData.pais &&
                            supplierData.provincia &&
                            supplierData.localidad &&
                            supplierData.codigoPostal &&
                            supplierData.direccionFiscal;

                        const allDocsValid = docs.every(d => d.estado === 'VIGENTE' || d.estado === 'PRESENTADO');

                        return (allDocsValid && locationComplete) ? 'COMPLETO' : 'PENDIENTE';
                    })()
                }}
            />
        </div>
    );
};

export default SupplierData;

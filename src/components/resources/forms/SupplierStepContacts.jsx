import React from 'react';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import StepHeader from '../../suppliers/StepHeader';
import { TIPOS_CONTACTO } from '../../../data/supplierConstants';

/**
 * SupplierStepContacts
 * 
 * Component for Step 3/4: Managing authorized contacts.
 */
const SupplierStepContacts = ({ 
    formData, 
    newContact,
    setNewContact,
    handleAddContact, 
    handleRemoveContact,
    readOnly, 
    partialEdit, 
    isEditingStep,
    handleStartEdit,
    handleStopEdit,
    isAdmin
}) => {
    const isStepEditing = !readOnly && (!partialEdit || (partialEdit && isEditingStep));

    return (
        <div className="p-0 md:p-8">
            <StepHeader 
                title="Contactos" 
                subtitle="Personas autorizadas para gestiones." 
                partialEdit={partialEdit}
                isEditingStep={isEditingStep}
                handleStartEdit={handleStartEdit}
                handleStopEdit={handleStopEdit}
            />

            {/* 1. Add Contact Form (Only if editing) */}
            {isStepEditing && (
                <div className="bg-white border-2 border-dashed border-secondary/20 rounded-xl p-5 mb-8 animate-fade-in shadow-sm max-w-5xl mx-auto">
                    <div className="mb-4">
                        <h4 className="text-md font-bold text-secondary-dark flex items-center gap-2">
                            <i className="pi pi-user-plus text-success"></i>
                            Datos de Contacto
                        </h4>
                        <p className="text-secondary text-[10px] mt-0.5">Información de representante.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <Input
                            size="sm"
                            label={<>Nombres y Apellidos {!isAdmin && <span className="text-red-500">*</span>}</>}
                            value={newContact.nombre}
                            onChange={(e) => setNewContact({ ...newContact, nombre: e.target.value })}
                            placeholder="Juan Pérez"
                        />
                        <Input
                            size="sm"
                            label="DNI"
                            value={newContact.dni}
                            onChange={(e) => setNewContact({ ...newContact, dni: e.target.value })}
                            placeholder="20.123.456"
                        />
                        <Input
                            size="sm"
                            label="Celular / WhatsApp"
                            value={newContact.movil}
                            onChange={(e) => setNewContact({ ...newContact, movil: e.target.value })}
                            placeholder="+54 9 11 ..."
                        />
                        <Input
                            size="sm"
                            label="Teléfono Fijo"
                            value={newContact.telefono}
                            onChange={(e) => setNewContact({ ...newContact, telefono: e.target.value })}
                            placeholder="+54 266 ..."
                        />
                        <Input
                            size="sm"
                            label={<>Correo electrónico {!isAdmin && <span className="text-red-500">*</span>}</>}
                            value={newContact.email}
                            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                            placeholder="contacto@empresa.com"
                        />
                        <div className="w-full">
                            <Select
                                size="sm"
                                label={<>Tipo de contacto {!isAdmin && <span className="text-red-500">*</span>}</>}
                                options={TIPOS_CONTACTO}
                                value={newContact.tipo}
                                onChange={(e) => setNewContact({ ...newContact, tipo: e.target.value })}
                                required={!isAdmin}
                            />
                        </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                        <button
                            onClick={handleAddContact}
                            className="bg-[#65a30d] hover:bg-[#4d7c0f] text-white px-5 py-2 rounded-lg font-bold shadow-md shadow-success/10 transition-all flex items-center gap-2 transform active:scale-95 text-xs"
                        >
                            <i className="pi pi-plus"></i> Agregar Nuevo
                        </button>
                    </div>
                </div>
            )}

            {/* 2. Contacts List (Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(formData.contactos || []).map((contacto, index) => (
                    <div key={contacto.id || index} className="bg-white border border-secondary/20 border-l-4 border-l-primary rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all relative group animate-fade-in">
                        {isStepEditing && (
                            <button
                                onClick={() => handleRemoveContact(contacto.id)}
                                className="absolute top-4 right-4 text-secondary/30 hover:text-red-500 transition-colors bg-white rounded-full p-1"
                                title="Eliminar contacto"
                            >
                                <i className="pi pi-times-circle text-lg"></i>
                            </button>
                        )}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-sm shadow-sm ring-2 ring-offset-2 ring-primary/10 shrink-0">
                                {contacto.nombre ? contacto.nombre.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-secondary-dark text-base truncate" title={contacto.nombre}>{contacto.nombre || 'Sin nombre'}</h5>
                                <span className="text-[9px] text-primary font-bold uppercase tracking-wider bg-primary/5 px-2 py-0.5 rounded border border-primary/10 inline-block">
                                    {contacto.tipo || 'General'}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 text-xs font-medium text-gray-700 border-t border-secondary/10 pt-3">
                            {contacto.email && (
                                <div className="flex items-center gap-2">
                                    <i className="pi pi-envelope text-primary/80 text-[11px]"></i>
                                    <span className="truncate">{contacto.email}</span>
                                </div>
                            )}
                            <div className="flex flex-wrap items-center gap-y-1 gap-x-4">
                                {contacto.movil && (
                                    <div className="flex items-center gap-2">
                                        <i className="pi pi-whatsapp text-primary/80 text-[11px]"></i>
                                        <span>{contacto.movil}</span>
                                    </div>
                                )}
                                {contacto.telefono && (
                                    <div className="flex items-center gap-2">
                                        <i className="pi pi-phone text-primary/80 text-[11px]"></i>
                                        <span>{contacto.telefono}</span>
                                    </div>
                                )}
                                {contacto.dni && (
                                    <div className="flex items-center gap-2">
                                        <i className="pi pi-id-card text-primary/80 text-[11px]"></i>
                                        <span>{contacto.dni}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {(formData.contactos || []).length === 0 && !isStepEditing && (
                    <div className="col-span-full text-center py-16 border-2 border-dashed border-secondary/20 rounded-xl text-secondary bg-secondary-light/20">
                        <i className="pi pi-users text-4xl mb-3 block opacity-20"></i>
                        <p className="font-medium">No hay contactos registrados.</p>
                        <p className="text-xs opacity-60">Haga clic en Modificar para agregar.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupplierStepContacts;

import React, { useState } from 'react';
import Input from './Input';
import SectionTitle from './SectionTitle';

const UserForm = ({ initialData = {}, onSubmit, readOnly = false }) => {
    const [formData, setFormData] = useState({
        username: initialData.username || '',
        password: initialData.password || '',
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="animate-fade-in w-full">
            <SectionTitle title="Datos del Usuario" subtitle="Información de acceso y perfil del nuevo usuario." />

            <div className="bg-white border border-secondary/20 rounded-xl shadow-sm p-5 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Input
                        label="Nombre de Usuario"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="ej. jdoe"
                        disabled={readOnly}
                        required
                    />
                    <Input
                        label="Contraseña"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="********"
                        disabled={readOnly}
                        required
                    />
                    <Input
                        label="Nombre"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Juan"
                        disabled={readOnly}
                    />
                    <Input
                        label="Apellido"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Pérez"
                        disabled={readOnly}
                    />
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="juan.perez@email.com"
                        disabled={readOnly}
                        icon="pi-envelope"
                    />
                </div>

                {!readOnly && (
                    <div className="flex justify-end pt-4 border-t border-secondary/10">
                        <button
                            onClick={handleSubmit}
                            className="text-white bg-primary hover:bg-primary-hover font-bold rounded-lg text-sm px-5 py-2.5 shadow-lg shadow-primary/30 transition-all flex items-center gap-2"
                        >
                            Siguiente Paso <i className="pi pi-arrow-right"></i>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserForm;

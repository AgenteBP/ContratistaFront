import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyForm from './CompanyForm';
import { companyService } from '../../services/companyService';
import { useNotification } from '../../context/NotificationContext';

const NewCompany = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (payload) => {
        setLoading(true);
        try {
            await companyService.create(payload);
            showNotification({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Empresa creada correctamente',
                life: 3000
            });
            navigate('/empresas');
        } catch (error) {
            console.error("Error creating company:", error);
            showNotification({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.message || 'No se pudo crear la empresa',
                life: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <CompanyForm
                onSubmit={handleSubmit}
                onBack={() => navigate('/empresas')}
                title="Nueva Empresa"
                subtitle="Complete los datos para registrar un nueva empresa en el sistema."
            />

            {loading && (
                <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <i className="pi pi-spin pi-spinner text-4xl text-primary"></i>
                </div>
            )}
        </div>
    );
};

export default NewCompany;

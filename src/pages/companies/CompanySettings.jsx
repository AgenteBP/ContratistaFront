import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { companyService } from '../../services/companyService';
import PageHeader from '../../components/ui/PageHeader';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useNotification } from '../../context/NotificationContext';

const CompanySettings = () => {
    const { currentRole } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [loading, setLoading] = useState(true);
    const [requiredTechnical, setRequiredTechnical] = useState(false);
    const [companyInfo, setCompanyInfo] = useState(null);

    useEffect(() => {
        loadSettings();
    }, [currentRole]);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const userCompanyId = currentRole?.id_company || currentRole?.id_entity;
            if (!userCompanyId) return;

            const companies = await companyService.getAll();
            const found = companies.find(c => (c.id_company || c.idCompany) === userCompanyId);

            if (found) {
                setCompanyInfo(found);
                setRequiredTechnical(found.required_technical ?? found.requiredTechnical);
            }
        } catch (error) {
            console.error("Error loading settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!companyInfo) return;
        try {
            await companyService.updateStatus(companyInfo.id_company, requiredTechnical);
            showSuccess('Éxito', 'Configuración de auditoría actualizada');
        } catch (error) {
            console.error("Error saving settings:", error);
            showError('Error', 'No se pudo guardar la configuración');
        }
    };

    if (loading) return <div className="p-4">Cargando...</div>;

    return (
        <div className="animate-fade-in w-full max-w-2xl mx-auto">
            <PageHeader 
                title="Configuración de la Empresa"
                subtitle="Administre las preferencias para sus proveedores y auditorías."
            />

            <div className="bg-white rounded-xl shadow-premium border border-secondary/10 p-8 mt-6">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-secondary/10">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
                        {companyInfo?.description?.charAt(0) || 'E'}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-secondary-dark">{companyInfo?.description}</h3>
                        <p className="text-sm text-secondary">CUIT: {companyInfo?.cuit}</p>
                    </div>
                </div>

                <h4 className="text-md font-bold text-secondary-dark mb-4 flex items-center gap-2">
                    <i className="pi pi-shield text-primary"></i>
                    Control de Auditoría Técnica
                </h4>

                <div className="bg-secondary-light rounded-lg p-5 border border-secondary/10">
                    <div className="flex items-start gap-4">
                        <Checkbox 
                            inputId="reqTechSetting" 
                            checked={requiredTechnical} 
                            onChange={e => setRequiredTechnical(e.checked)} 
                            className="mt-1"
                        />
                        <div>
                            <label htmlFor="reqTechSetting" className="text-sm font-bold text-secondary-dark cursor-pointer block mb-1">
                                Requerir Auditoría Técnica
                            </label>
                            <p className="text-xs text-secondary leading-relaxed">
                                Al activar esta opción, todos sus proveedores deberán aprobar una auditoría técnica para ser considerados "Aptos". 
                                Verá el estado de esta auditoría directamente en su listado de proveedores.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex justify-end border-t border-secondary/10 pt-8">
                    <PrimaryButton 
                        label="Guardar Configuración" 
                        icon="pi pi-save" 
                        onClick={handleSave}
                        className="py-3 px-8"
                    />
                </div>
            </div>
        </div>
    );
};

export default CompanySettings;

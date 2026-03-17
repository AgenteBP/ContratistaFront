import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyService } from '../../services/companyService';
import PageHeader from '../../components/ui/PageHeader';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useNotification } from '../../context/NotificationContext';

const EditCompany = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requiredTechnical, setRequiredTechnical] = useState(false);

    useEffect(() => {
        loadCompany();
    }, [id]);

    const loadCompany = async () => {
        try {
            setLoading(true);
            const data = await companyService.getAll(); // Using getAll for now and filtering
            const found = data.find(c => c.id_company === parseInt(id));
            if (found) {
                setCompany(found);
                setRequiredTechnical(found.required_technical || false);
            }
        } catch (error) {
            console.error("Error loading company:", error);
            showError('Error', 'No se pudo cargar la información de la empresa');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await companyService.updateStatus(id, requiredTechnical);
            showSuccess('Éxito', 'Configuración actualizada correctamente');
            navigate('/empresas');
        } catch (error) {
            console.error("Error updating company:", error);
            showError('Error', 'No se pudo actualizar la configuración');
        }
    };

    if (loading) return <div className="p-4">Cargando...</div>;
    if (!company) return <div className="p-4">Empresa no encontrada</div>;

    return (
        <div className="animate-fade-in w-full max-w-2xl mx-auto">
            <PageHeader 
                title={`Editar Empresa: ${company.description}`}
                subtitle="Configure los parámetros generales de la empresa."
            />

            <div className="bg-white rounded-xl shadow-premium border border-secondary/10 p-8 mt-6">
                <h3 className="text-lg font-bold text-secondary-dark mb-6 flex items-center gap-2">
                    <i className="pi pi-cog text-primary"></i>
                    Configuración de Auditoría
                </h3>

                <div className="flex items-center gap-3 p-4 bg-secondary-light rounded-lg border border-secondary/10">
                    <Checkbox 
                        inputId="reqTech" 
                        checked={requiredTechnical} 
                        onChange={e => setRequiredTechnical(e.checked)} 
                    />
                    <label htmlFor="reqTech" className="text-sm font-medium text-secondary-dark cursor-pointer select-none">
                        Exigir Auditoría Técnica a Proveedores
                    </label>
                </div>
                
                <p className="text-xs text-secondary mt-3 px-1 italic">
                    Si esta opción está activa, se habilitará la columna de Auditoría Técnica en el listado de proveedores y se requerirá que pasen la prueba técnica para estar habilitados.
                </p>

                <div className="mt-10 flex gap-4 justify-end border-t border-secondary/10 pt-8">
                    <button 
                        onClick={() => navigate('/empresas')}
                        className="text-secondary hover:text-secondary-dark font-bold text-xs transition-colors px-4 py-2"
                    >
                        Cancelar
                    </button>
                    <PrimaryButton 
                        label="Guardar Cambios" 
                        icon="pi pi-check" 
                        onClick={handleSave}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditCompany;

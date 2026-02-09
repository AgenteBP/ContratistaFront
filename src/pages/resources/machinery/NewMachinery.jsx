import React, { useState } from 'react';
import WizardSteps from '../../../components/ui/WizardSteps';
import { useNavigate } from 'react-router-dom';
import MachineryData from '../../../components/resources/forms/MachineryData';
import AssignmentData from '../../../components/resources/forms/AssignmentData';
import DocumentsData from '../../../components/resources/forms/DocumentsData';

const NewMachinery = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);

    // Global form state
    const [formData, setFormData] = useState({
        // Step 1: Machinery Data
        codigo: '',
        marca: '',
        modelo: '',
        patente: '',
        chasis: '',
        motor: '',
        anio: '',
        tipoMaquinaria: '',
        tieneChofer: false,
        choferAsignado: null,
        tieneGNC: false, // Potentially not relevant for machinery but keeping for consistency if needed or removing

        // Step 2: Assignment
        categoria: '',
        area: '',
        servicio: '',

        // Step 3: Documents
        documents: []
    });

    const handleStep1Submit = (step1Data) => {
        setFormData(prev => ({ ...prev, ...step1Data }));
        setCurrentStep(2);
    };

    const handleStep2Submit = (step2Data) => {
        setFormData(prev => ({ ...prev, ...step2Data }));
        setCurrentStep(3);
    };

    const handleFinalSubmit = (step3Data) => {
        const finalData = { ...formData, ...step3Data };
        console.log('FINAL MACHINERY DATA:', finalData);
        // Here we would call the service to save
        // navigate('/recursos/maquinaria'); 
        setCurrentStep(4); // Success step
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <MachineryData
                        data={formData}
                        onNext={handleStep1Submit}
                    />
                );
            case 2:
                return (
                    <AssignmentData
                        data={formData}
                        onChange={(name, val) => setFormData(prev => ({ ...prev, [name]: val }))}
                        onBack={handleBack}
                        onSubmit={handleStep2Submit}
                    />
                );
            case 3:
                return (
                    <DocumentsData
                        data={formData}
                        onBack={handleBack}
                        onSubmit={handleFinalSubmit}
                        type="MACHINERY"
                    />
                );
            case 4:
                return (
                    <div className="bg-white p-12 rounded-xl border border-secondary/20 text-center animate-fade-in max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-success-light rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="pi pi-check text-4xl text-success"></i>
                        </div>
                        <h2 className="text-3xl font-extrabold text-secondary-dark mb-2">¡Maquinaria Creada!</h2>
                        <p className="text-secondary mb-8 text-lg">
                            Se ha registrado correctamente el equipo <strong>{formData.marca} {formData.modelo}</strong> ({formData.codigo}).
                        </p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => navigate('/recursos/maquinaria')} className="text-secondary-dark bg-gray-100 hover:bg-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 transition-all">
                                Volver al Listado
                            </button>
                            <button onClick={() => window.location.reload()} className="text-white bg-primary hover:bg-primary-hover font-bold rounded-lg text-sm px-5 py-2.5 shadow-lg transition-all">
                                Crear Otra
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const steps = [
        { label: 'Datos Maquinaria' },
        { label: 'Datos Asignación' },
        { label: 'Documentación' }
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="mb-8 text-center">
                <p className="text-primary font-bold tracking-wider uppercase text-xs mb-2">Gestión de Recursos</p>
                <h1 className="text-3xl md:text-4xl font-extrabold text-secondary-dark">Nueva Maquinaria</h1>
            </div>

            <WizardSteps currentStep={currentStep} steps={steps} />

            {renderStep()}
        </div>
    );
};

export default NewMachinery;

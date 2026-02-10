import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-lg w-full text-center">
                {/* Ilustration Area */}
                <div className="relative mb-8">
                    <h1 className="text-[12rem] font-black text-primary/5 select-none leading-none">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 bg-primary/10 rounded-3xl rotate-12 flex items-center justify-center backdrop-blur-sm border border-primary/20 animate-bounce">
                            <i className="pi pi-search text-4xl text-primary"></i>
                        </div>
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-secondary-dark mb-3">Página no encontrada</h2>
                <p className="text-secondary text-lg mb-10 max-w-md mx-auto">
                    Lo sentimos, la página que buscas no existe o ha sido movida a otra ubicación.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        label="Ir al Inicio"
                        icon="pi pi-home"
                        className="p-button-primary p-button-raised py-3 px-6 rounded-xl font-bold shadow-lg shadow-primary/20"
                        onClick={() => navigate('/dashboard')}
                    />
                    <Button
                        label="Volver Atrás"
                        icon="pi pi-arrow-left"
                        className="p-button-text p-button-secondary py-3 px-6 rounded-xl font-bold"
                        onClick={() => navigate(-1)}
                    />
                </div>

                <div className="mt-12 pt-8 border-t border-secondary/10 text-secondary/40 text-sm">
                    Si crees que esto es un error del sistema, por favor contacta a soporte.
                </div>
            </div>
        </div>
    );
};

export default NotFound;

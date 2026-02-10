import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';

const ServerError = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-lg w-full text-center">
                {/* Ilustration Area */}
                <div className="relative mb-8">
                    <h1 className="text-[12rem] font-black text-red-500/5 select-none leading-none">500</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 bg-red-500/10 rounded-3xl -rotate-12 flex items-center justify-center backdrop-blur-sm border border-red-500/20">
                            <i className="pi pi-bolt text-4xl text-red-500"></i>
                        </div>
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-secondary-dark mb-3">Error del Servidor</h2>
                <p className="text-secondary text-lg mb-10 max-w-md mx-auto">
                    Estamos experimentando dificultades técnicas. Nuestro equipo ya ha sido notificado y está trabajando en ello.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        label="Reintentar navegación"
                        icon="pi pi-refresh"
                        className="p-button-danger p-button-raised py-3 px-6 rounded-xl font-bold shadow-lg shadow-red-500/20"
                        onClick={() => window.location.reload()}
                    />
                    <Button
                        label="Ir al Inicio"
                        icon="pi pi-home"
                        className="p-button-text p-button-secondary py-3 px-6 rounded-xl font-bold"
                        onClick={() => navigate('/dashboard')}
                    />
                </div>

                <div className="mt-12 pt-8 border-t border-secondary/10">
                    <div className="flex items-center justify-center gap-2 text-secondary/60 text-sm font-medium">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        Estado del Sistema: Interrupción Temporal
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServerError;

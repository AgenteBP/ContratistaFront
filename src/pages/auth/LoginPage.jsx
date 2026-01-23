import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

const LoginPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            const userRoles = [
                { id: 1, role: 'AUDITOR', entity: 'Tech Solutions', type: 'Auditoría Técnica' },
                { id: 2, role: 'EMPRESA', entity: 'Tech Solutions', type: 'Admin' },
                { id: 3, role: 'PROVEEDOR', entity: 'Pepito Holding', type: 'Proveedor' }
            ];
            
            if (userRoles.length > 1) {
                navigate('/select-role', { state: { roles: userRoles, user: 'Braian Paez' } });
            } else {
                navigate('/dashboard');
            }
        }, 1500);
    };

    // Estilos comunes para los inputs para asegurar consistencia
    const inputClasses = "w-full p-3 pl-10 text-secondary-dark border border-secondary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-lg shadow-sm transition-all";

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFBF2] relative overflow-hidden font-sans p-4">
            
            {/* --- FONDO Y DECORACIÓN --- */}
            <div className="absolute inset-0 bg-[#fdfdfd]"></div>
            <div className="absolute top-[-5%] right-[-5%] md:right-[10%] w-64 h-64 md:w-96 md:h-96 bg-gradient-to-br from-primary-light to-primary rounded-full opacity-30 blur-[80px] animate-pulse"></div>
            <div className="absolute bottom-[5%] left-[-5%] md:left-[10%] w-72 h-72 md:w-[500px] md:h-[500px] bg-gradient-to-tr from-success-light to-success rounded-full opacity-20 blur-[100px]"></div>

            {/* --- CONTENIDO CENTRADO --- */}
            <div className="z-10 w-full max-w-md flex flex-col items-center">
                
                {/* LOGO */}
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-hover flex items-center justify-center text-white shadow-lg">
                        <i className="pi pi-bolt text-sm"></i>
                    </div>
                    <span className="text-xl font-bold text-secondary-dark tracking-tight">GestiónDoc</span>
                </div>

                {/* TÍTULO */}
                <h2 className="text-3xl md:text-4xl font-extrabold text-secondary-dark mb-8 text-center tracking-tight">
                    ¡Qué bueno verte de nuevo!
                </h2>

                {/* --- TARJETA BLANCA --- */}
                <div className="bg-white p-8 md:p-10 rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] w-full border border-secondary/5 relative">
                    
                    <form onSubmit={handleLogin} className="space-y-5">
                        
                        {/* Email Input */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-secondary ml-1">Tu email</label>
                            
                            <div className="relative w-full">
                                {/* Icono Usuario posicionado absolutamente */}
                                <i className="pi pi-user absolute left-3 top-1/2 -translate-y-1/2 text-secondary/50 z-10 pointer-events-none" style={{ fontSize: '1rem' }} />
                                
                                <InputText 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    placeholder="ej. elon@tesla.com" 
                                    className={inputClasses} 
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-secondary ml-1">Tu contraseña</label>
                            
                            <div className="relative w-full">
                                {/* Icono Candado posicionado absolutamente */}
                                <i className="pi pi-lock absolute left-3 top-1/2 -translate-y-1/2 text-secondary/50 z-10 pointer-events-none" style={{ fontSize: '1rem' }} />
                                
                                <Password 
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    placeholder="ej. ilovemanagement123" 
                                    feedback={false}
                                    toggleMask
                                    // className para el contenedor del componente (el div wrapper)
                                    className="w-full"
                                    // inputClassName para el input HTML real dentro del componente
                                    inputClassName={inputClasses}
                                    // pt (PassThrough) para asegurar que el icono de "ojo" no rompa el diseño
                                    pt={{
                                        showIcon: { className: 'mr-3' },
                                        hideIcon: { className: 'mr-3' }
                                    }}
                                />
                            </div>
                        </div>

                        {/* BOTÓN "Sign in" */}
                        <Button 
                            label={loading ? "Ingresando..." : "Iniciar Sesión"} 
                            className="w-full bg-primary hover:bg-primary-hover border-none text-white font-bold text-lg py-3.5 rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/40 transform active:scale-95 transition-all duration-200 mt-4"
                            disabled={loading}
                            loading={loading}
                        />

                        {/* Links Footer */}
                        <div className="flex items-center justify-between text-xs md:text-sm font-bold pt-2">
                            <a href="#" className="text-primary hover:text-primary-active hover:underline transition-colors">¿No tienes cuenta?</a>
                            <a href="#" className="text-primary hover:text-primary-active hover:underline transition-colors">¿Olvidaste tu clave?</a>
                        </div>
                    </form>
                </div>

                {/* Footer de Logos */}
                <div className="mt-12 flex flex-wrap justify-center gap-4 md:gap-8 opacity-50 grayscale transition-all hover:grayscale-0">
                    <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-lg border border-secondary/10 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="text-xs font-bold text-secondary-dark">KWFinder</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-lg border border-secondary/10 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                        <span className="text-xs font-bold text-secondary-dark">SERPChecker</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-lg border border-secondary/10 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span className="text-xs font-bold text-secondary-dark">SERPWatcher</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoginPage;
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
            // Simulación de roles
            const userRoles = [
                { id: 1, role: 'AUDITOR', entity: 'Tech Solutions', type: 'Auditoría Técnica' },
                { id: 2, role: 'EMPRESA', entity: 'Tech Solutions', type: 'Admin' }
            ];
            
            if (userRoles.length > 1) {
                navigate('/select-role', { state: { roles: userRoles, user: 'Braian Paez' } });
            } else {
                navigate('/dashboard');
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFBF2] relative overflow-hidden font-sans p-4">
            
            {/* --- 1. FONDO Y DECORACIÓN (Manchas tipo Mangools) --- */}
            {/* Fondo base crema suave (similar a la imagen) o Slate muy claro */}
            <div className="absolute inset-0 bg-[#fdfdfd]"></div>

            {/* Mancha 1: Tu color Primary (Indigo) - Arriba Derecha */}
            <div className="absolute top-[-5%] right-[-5%] md:right-[10%] w-64 h-64 md:w-96 md:h-96 bg-gradient-to-br from-primary-light to-primary rounded-full opacity-30 blur-[80px] animate-pulse"></div>
            
            {/* Mancha 2: Tu color Success (Lime) - Abajo Izquierda (Replica la mancha naranja de la foto pero con tu paleta) */}
            <div className="absolute bottom-[5%] left-[-5%] md:left-[10%] w-72 h-72 md:w-[500px] md:h-[500px] bg-gradient-to-tr from-success-light to-success rounded-full opacity-20 blur-[100px]"></div>

            {/* Mancha solida flotante (Decorativa) */}
            <div className="absolute top-[20%] right-[15%] w-16 h-16 bg-success rounded-[2rem] rotate-12 opacity-80 hidden lg:block shadow-lg shadow-success/20"></div>
            <div className="absolute bottom-[20%] left-[15%] w-12 h-12 bg-primary rounded-xl -rotate-12 opacity-60 hidden lg:block"></div>


            {/* --- 2. CONTENIDO CENTRADO --- */}
            <div className="z-10 w-full max-w-md flex flex-col items-center">
                
                {/* LOGO (Arriba, fuera de la tarjeta) */}
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-hover flex items-center justify-center text-white shadow-lg">
                        <i className="pi pi-bolt text-sm"></i>
                    </div>
                    <span className="text-xl font-bold text-secondary-dark tracking-tight">GestiónDoc</span>
                </div>

                {/* TÍTULO (Fuera de la tarjeta, estilo "Good to see you again") */}
                <h2 className="text-3xl md:text-4xl font-extrabold text-secondary-dark mb-8 text-center tracking-tight">
                    ¡Qué bueno verte de nuevo!
                </h2>

                {/* --- 3. TARJETA BLANCA (Formulario) --- */}
                <div className="bg-white p-8 md:p-10 rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] w-full border border-secondary/5 relative">
                    
                    <form onSubmit={handleLogin} className="space-y-5">
                        
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-secondary ml-1">Tu email</label>
                            <span className="p-input-icon-left w-full">
                                <i className="pi pi-user text-secondary/50" />
                                <InputText 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    placeholder="ej. elon@tesla.com" 
                                    className="w-full p-3 pl-10 text-secondary-dark border border-secondary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-lg shadow-sm transition-all"
                                />
                            </span>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-secondary ml-1">Tu contraseña</label>
                            <div className="relative">
                                <Password 
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    placeholder="ej. ilovemanagement123" 
                                    feedback={false}
                                    toggleMask
                                    inputClassName="w-full p-3 pl-10 text-secondary-dark border border-secondary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-lg shadow-sm transition-all"
                                    className="w-full"
                                    pt={{
                                        iconField: { className: 'w-full' } // Fix PrimeReact styling
                                    }}
                                />
                                {/* Icono candado manual si PrimeReact lo oculta */}
                                <i className="pi pi-lock absolute left-3 top-1/2 -translate-y-1/2 text-secondary/50 z-10 pointer-events-none"></i>
                            </div>
                        </div>

                        {/* BOTÓN "Sign in" (Estilo Pill Verde/Lime como la referencia) */}
                        <Button 
                            label={loading ? "Ingresando..." : "Iniciar Sesión"} 
                            className="w-full bg-success hover:bg-success-hover border-none text-white font-bold text-lg py-3.5 rounded-full shadow-lg shadow-success/30 hover:shadow-success/40 transform active:scale-95 transition-all duration-200 mt-4"
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

                {/* Footer de Logos (Estilo Mangools footer) */}
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
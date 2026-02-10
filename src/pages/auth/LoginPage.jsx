import React, { useState } from 'react';
import './CSS/auth.css';
import { useNavigate } from 'react-router-dom';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const userData = await login(formData.email, formData.password);
            setLoading(false);
            navigate('/select-role', { state: { userProfile: userData } });
        } catch (error) {
            setLoading(false);
            setError("Usuario o contraseña incorrectos");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFBF2] relative overflow-hidden font-sans p-4">

            {/* --- 1. FONDO Y DECORACIÓN (Manchas tipo Mangools) --- */}
            {/* Fondo base crema suave (similar a la imagen) o Slate muy claro */}
            {/* <div className="absolute inset-0 bg-[#fdfdfd]"></div>

            {/* Mancha 1: Tu color Primary (Indigo) - Arriba Derecha */}
            {/*<div className="absolute top-[-5%] right-[-5%] md:right-[10%] w-64 h-64 md:w-96 md:h-96 bg-gradient-to-br from-primary-light to-primary rounded-full opacity-30 blur-[80px] animate-pulse"></div>
           
            {/* Mancha 2: Tu color Success (Lime) - Abajo Izquierda (Replica la mancha naranja de la foto pero con tu paleta) */}
            {/*<div className="absolute bottom-[5%] left-[-5%] md:left-[10%] w-72 h-72 md:w-[500px] md:h-[500px] bg-gradient-to-tr from-success-light to-success rounded-full opacity-20 blur-[100px]"></div>

            {/* Mancha solida flotante (Decorativa) */}
            {/* <div className="absolute top-[20%] right-[15%] w-16 h-16 bg-success rounded-[2rem] rotate-12 opacity-80 hidden lg:block shadow-lg shadow-success/20"></div>
            <div className="absolute bottom-[20%] left-[15%] w-12 h-12 bg-primary rounded-xl -rotate-12 opacity-60 hidden lg:block"></div>

            {/* --- 1. FONDO Y DECORACIÓN (Corporate Waves) --- */}
            {/* Fondo base degradado sutil Azul-Gris */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200"></div>

            {/* Onda decorativa inferior (SVG) */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="opacity-20 text-primary">
                    <path fill="currentColor" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>

            {/* Círculo difuminado grande para dar luz detrás del card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white rounded-full blur-3xl opacity-60"></div>


            {/* --- 2. CONTENIDO CENTRADO --- */}
            <div className="z-10 w-full max-w-md flex flex-col items-center">

                {/* LOGO (Arriba, fuera de la tarjeta) */}
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-hover flex items-center justify-center text-white shadow-lg">
                        <i className="pi pi-bolt text-sm"></i>
                    </div>
                    <span className="text-xl font-bold text-secondary-dark tracking-tight">ProCer</span>
                </div>

                {/* TÍTULO (Fuera de la tarjeta, estilo "Good to see you again") */}
                <h2 className="text-3xl md:text-4xl font-extrabold text-secondary-dark mb-8 text-center tracking-tight">
                    ¡Qué bueno verte de nuevo!
                </h2>

                {/* --- 3. TARJETA BLANCA (Formulario) --- */}
                <div className="bg-white p-8 md:p-10 rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] w-full border border-secondary/5 relative">

                    {error && (
                        <div className="mb-6 p-3.5 bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-xl flex items-center gap-3 animate-fade-in shadow-sm">
                            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                                <i className="pi pi-exclamation-circle text-white text-sm"></i>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-red-600 leading-tight">Acceso Denegado</span>
                                <span className="text-[11px] font-medium text-red-400">{error}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-secondary ml-1">Tu email</label>
                            <span className="p-input-icon-left w-full">
                                <i className="ml-3 pi pi-user text-secondary/50" />
                                <InputText
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="admin@email.com"
                                    className="w-full p-3 pl-10 text-secondary-dark border border-secondary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-lg shadow-sm transition-all"
                                />
                            </span>
                        </div>

                        {/* Password */}
                        {/*<div className="space-y-1.5">
                            <label className="block text-sm font-bold text-secondary ml-1">Tu contraseña</label>
                            <div className="relative">
                                <Password
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    placeholder="ej: ilovemanagement123"
                                    feedback={false}
                                    toggleMask
                                    inputClassName="w-full p-3 pl-10 text-secondary-dark border border-secondary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-lg shadow-sm transition-all"
                                    className="w-full"
                                    pt={{
                                        iconField: { className: 'w-full' }, // Fix PrimeReact styling
                                        root: { className: 'w-full' },           // Estira el contenedor principal
                                        input: { className: 'w-full' }          // Estira el campo de texto
                                    }}
                                />
                                {/* Icono candado manual si PrimeReact lo oculta
                                <i className="pi pi-lock absolute left-3 top-1/2 -translate-y-1/2 text-secondary/50 z-10 pointer-events-none"></i>
                            </div>
                        </div>*/}

                        {/* Password */}
                        <div className="space-y-1.5 w-full">
                            <label className="block text-sm font-bold text-secondary ml-1">Tu contraseña</label>

                            {/* Agregamos w-full aquí al padre relativo para asegurar que ocupe todo el espacio */}
                            <div className="relative w-full">
                                <Password
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="password"
                                    feedback={false}
                                    toggleMask

                                    // 1. ESTO ESTIRA LA CAJA CONTENEDORA
                                    className="w-full"
                                    style={{ width: '100%' }}

                                    // 2. ESTO ESTIRA EL INPUT INTERNO (La solución definitiva)
                                    inputStyle={{ width: '100%' }}

                                    // Tus clases de diseño (bordes, padding para el icono, etc)
                                    inputClassName="w-full p-3 pl-10 text-secondary-dark border border-secondary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-lg shadow-sm transition-all"

                                    // Puedes quitar el pt si usas inputStyle, pero si lo dejas no estorba
                                    pt={{
                                        iconField: { className: 'w-full' }
                                    }}
                                />

                                {/* Tu icono de candado manual */}
                                <i className="pi pi-lock absolute left-3 top-1/2 -translate-y-1/2 text-secondary/50 z-10 pointer-events-none"></i>
                            </div>
                        </div>

                        {/* BOTÓN "Sign in" (Estilo Pill Verde/Lime como la referencia) */}
                        <Button
                            label={loading ? "Procesando..." : "Iniciar Sesión"}
                            className="w-full bg-success hover:bg-success-hover border-none text-white font-bold text-lg py-3.5 rounded-full shadow-lg shadow-success/30 hover:shadow-success/40 transform active:scale-95 transition-all duration-200 mt-4"
                            disabled={loading}
                            loading={loading}

                        />

                        {/* Links Footer */}
                        <div className="flex items-center justify-between text-xs md:text-sm font-bold pt-2">
                            {/*<a href="#" className="text-primary hover:text-primary-active hover:underline transition-colors">¿No tienes cuenta?</a>*/}
                            <a href="#" className="text-primary hover:text-primary-active hover:underline transition-colors">¿Olvidaste tu clave?</a>
                        </div>
                    </form>
                </div>

                {/* Footer de Logos (Estilo Mangools footer) */}
                {/*<div className="mt-12 flex flex-wrap justify-center gap-4 md:gap-8 opacity-50 grayscale transition-all hover:grayscale-0">
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
                </div>*/}

            </div>
        </div>
    );
};

export default LoginPage;

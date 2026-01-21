import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Componente de Tarjeta de Rol (Interno para esta página)
const RoleCard = ({ roleData, onSelect }) => {
    
    // Configuración visual según el rol
    const config = {
        'EMPRESA': {
            color: 'primary',
            icon: 'pi-building',
            bg: 'bg-primary-light',
            text: 'text-primary',
            border: 'hover:border-primary',
            label: 'Cliente / Empresa'
        },
        'AUDITOR': {
            color: 'info', // Usamos Sky/Info para auditoría
            icon: 'pi-file-check', // Icono corregido de PrimeIcons
            bg: 'bg-info-light',
            text: 'text-info',
            border: 'hover:border-info',
            label: 'Auditor Externo/Interno'
        },
        'PROVEEDOR': {
            color: 'success', // Usamos Lime para contratistas
            icon: 'pi-briefcase',
            bg: 'bg-success-light',
            text: 'text-success',
            border: 'hover:border-success',
            label: 'Proveedor / Contratista'
        }
    };

    const theme = config[roleData.role] || config['EMPRESA'];

    return (
        <button 
            onClick={() => onSelect(roleData)}
            className={`group w-full text-left bg-white p-5 rounded-xl border border-secondary/20 shadow-sm ${theme.border} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-start gap-4 relative overflow-hidden`}
        >
            {/* Icono Grande */}
            <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-xl ${theme.bg} ${theme.text} group-hover:scale-110 transition-transform duration-300`}>
                <i className={`pi ${theme.icon}`}></i>
            </div>

            {/* Texto */}
            <div className="flex-1 z-10">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.text} mb-1 block`}>
                    {theme.label}
                </span>
                <h4 className="text-secondary-dark font-bold text-lg leading-tight mb-1">
                    {roleData.entity}
                </h4>
                <p className="text-secondary text-xs">
                    Perfil: <span className="font-medium text-secondary-dark">{roleData.type}</span>
                </p>
            </div>

            {/* Flecha de acción (aparece en hover) */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 group-hover:mr-0">
                <i className="pi pi-arrow-right text-secondary-dark"></i>
            </div>
        </button>
    );
};

const RoleSelectionPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Recuperamos los datos pasados desde el Login
    // En caso real, usarías un Contexto Global o Redux
    const { roles, user } = location.state || { 
        roles: [], 
        user: 'Usuario' 
    };

    const handleRoleSelect = (selectedContext) => {
        console.log("Contexto seleccionado:", selectedContext);
        // 1. Guardar en LocalStorage/Context: token, currentRoleId, currentEntityId
        // localStorage.setItem('currentRole', JSON.stringify(selectedContext));
        
        // 2. Redirigir al dashboard
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-secondary-light flex flex-col items-center justify-center p-4 relative">
            
            {/* Botón de volver / Logout */}
            <button 
                onClick={() => navigate('/login')}
                className="absolute top-6 left-6 text-secondary hover:text-danger text-sm font-medium flex items-center gap-2 transition-colors"
            >
                <i className="pi pi-arrow-left"></i> Cerrar Sesión
            </button>

            <div className="w-full max-w-2xl animate-fade-in-up">
                
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 shadow-sm flex items-center justify-center border border-secondary/10">
                        <span className="font-bold text-2xl text-primary">JP</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-secondary-dark mb-2">Hola, {user}</h2>
                    <p className="text-secondary">Detectamos múltiples perfiles asociados a tu cuenta.<br/>Selecciona con cuál deseas operar hoy.</p>
                </div>

                {/* Grid de Roles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roles.map((role) => (
                        <RoleCard 
                            key={role.id} 
                            roleData={role} 
                            onSelect={handleRoleSelect} 
                        />
                    ))}
                </div>

                <div className="mt-12 text-center">
                   <p className="text-xs text-secondary/60">
                       ¿No ves la empresa que buscas? <a href="#" className="underline hover:text-primary">Solicitar vinculación</a>
                   </p>
                </div>

            </div>
        </div>
    );
};

export default RoleSelectionPage;
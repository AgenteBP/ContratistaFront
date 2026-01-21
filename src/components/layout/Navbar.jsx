import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    
    // 1. DICCIONARIO DE NOMBRES
    const breadcrumbNameMap = {
        'dashboard': 'Inicio', // Agregamos esto para que se traduzca solo
        'proveedores': 'Proveedores',
        'nuevo': 'Nuevo Registro',
        'auditorias': 'Auditorías',
        'usuarios': 'Usuarios',
        'configuracion': 'Configuración',
    };

    // 2. FUNCIÓN GENERADORA
    const renderBreadcrumbs = () => {
        // Obtenemos la ruta y la limpiamos
        const path = location.pathname; 
        const pathnames = path.split('/').filter((x) => x);

        // Estilos reutilizables
        const linkClass = "hover:text-primary cursor-pointer hidden md:inline transition-colors text-secondary hover:underline";
        const activeClass = "font-bold text-secondary-dark capitalize text-sm";
        const separator = <i className="pi pi-chevron-right text-[10px] text-secondary/40 mx-2 hidden md:inline"></i>;

        // CASO ESPECIAL: Si estamos exactamente en Dashboard, solo mostramos "Inicio" sin enlaces
        if (path === '/dashboard') {
            return (
                <div className="flex items-center text-sm">
                   <span className={activeClass}>Inicio</span>
                </div>
            );
        }

        // CASO GENERAL: Breadcrumb completo (Inicio > Sección > ...)
        return (
            <div className="flex items-center text-sm">
                {/* Eslabón Fijo: Home */}
                <Link to="/" className={linkClass}>Inicio</Link>

                {pathnames.map((value, index) => {
                    // Si el path es 'dashboard', lo saltamos en la lista para no tener "Home > Inicio"
                    if (value === 'dashboard') return null;

                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;
                    const isId = !isNaN(value);
                    
                    // Nombre a mostrar
                    let displayName = isId ? `Detalle #${value}` : (breadcrumbNameMap[value] || value);

                    return (
                        <React.Fragment key={to}>
                            {separator}
                            {isLast ? (
                                <span className={activeClass}>{displayName}</span>
                            ) : (
                                <Link to={to} className={linkClass}>{displayName}</Link>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        );
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg px-4 py-3 w-full border-b border-secondary/20 shadow-sm ring-1 ring-secondary/5 md:border-b-0 md:rounded-xl md:shadow-md md:m-4 md:w-auto md:mx-6 transition-all">
            <div className="flex justify-between items-center">
                {renderBreadcrumbs()}
                
                {/* Perfil de Usuario */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex text-right flex-col leading-tight">
                        <span className="font-bold text-secondary-dark text-sm">Brian Paez</span>
                        <span className="text-xs text-secondary">Admin</span>
                    </div>
                    <img className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-white shadow-sm" src="https://ui-avatars.com/api/?name=Brian+Paez&background=4f46e5&color=fff" alt="User" />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
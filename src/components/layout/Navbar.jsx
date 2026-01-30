import React, { useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { OverlayPanel } from 'primereact/overlaypanel';

const Navbar = ({ onToggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const userMenuRef = useRef(null);

    // 1. DICCIONARIO DE NOMBRES
    const breadcrumbNameMap = {
        'dashboard': 'Inicio',
        'proveedores': 'Proveedores',
        'auditores': 'Auditores',
        'empresas': 'Empresas',
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
        const linkClass = "hover:text-primary cursor-pointer transition-colors text-secondary hover:underline";
        const activeClass = "font-bold text-secondary-dark capitalize text-sm";
        const separator = <i className="pi pi-chevron-right text-[10px] text-secondary/40 mx-2"></i>;

        // CASO ESPECIAL: Si estamos exactamente en Dashboard, solo mostramos "Inicio" sin enlaces
        if (path === '/dashboard') {
            return (
                <div className="flex items-center text-sm">
                    <span className={activeClass}>Inicio</span>
                </div>
            );
        }

        // PREPARAR DATOS
        // Nombre del último elemento (Página Actual)
        const lastValue = pathnames[pathnames.length - 1];
        const lastIsId = !isNaN(lastValue);
        const lastDisplayName = lastIsId ? `Detalle #${lastValue}` : (breadcrumbNameMap[lastValue] || lastValue);

        // Generar lista de padres (excluyendo el actual)
        const parentPaths = pathnames.slice(0, -1);

        return (
            <div className="flex items-center text-sm">

                {/* --- VISTA MÓVIL (Ellipsis "More" Style) --- */}
                <div className="md:hidden flex items-center h-10">

                    {/* Trigger de "Más" (...) si hay historial */}
                    {(parentPaths.length > 0 || path !== '/dashboard') && (
                        <>
                            <div
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary/5 hover:bg-secondary/10 transition-colors cursor-pointer mr-1"
                                onClick={(e) => menuRef.current?.toggle(e)}
                            >
                                <i className="pi pi-ellipsis-h text-secondary text-sm"></i>
                            </div>

                            {/* Separador */}
                            <i className="pi pi-chevron-right text-[10px] text-secondary/40 mx-1"></i>
                        </>
                    )}

                    {/* Título Página Actual */}
                    <span className={activeClass}>{lastDisplayName}</span>

                    {/* Dropdown Menu - Anchored to whatever clicked trigger, but semantically belongs here */}
                    <OverlayPanel ref={menuRef} my="left top" at="left bottom" className="shadow-xl border border-gray-100 bg-white rounded-xl p-0" style={{ maxWidth: '220px' }}>
                        <div className="flex flex-col items-center gap-2 p-3">
                            {/* Renderizamos padres en orden INVERSO */}
                            {parentPaths.length > 0 ? (
                                [...parentPaths].reverse().map((value, index) => {
                                    const realIndex = pathnames.indexOf(value);
                                    const to = `/${pathnames.slice(0, realIndex + 1).join('/')}`;
                                    const name = breadcrumbNameMap[value] || value;

                                    return (
                                        <div key={to} className="contents">
                                            <span
                                                onClick={(e) => { navigate(to); }}
                                                className="text-xs font-semibold text-gray-500 hover:text-primary cursor-pointer tracking-wide capitalize transition-colors hover:scale-105 transform duration-200"
                                            >
                                                {name}
                                            </span>
                                            {/* Flecha hacia arriba indica "nivel superior" */}
                                            {index < parentPaths.length - 1 && (
                                                <i className="pi pi-angle-up text-[10px] text-gray-300 mt-0.5"></i>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <span
                                    onClick={(e) => { navigate('/dashboard'); }}
                                    className="text-xs font-semibold text-gray-500 hover:text-primary cursor-pointer tracking-wide capitalize transition-colors hover:scale-105 transform duration-200"
                                >
                                    Inicio
                                </span>
                            )}
                            {/* Siempre agregar 'Inicio' si no estaba en la lista y no estamos en Dashboard */}
                            {parentPaths.length > 0 && pathnames[0] !== 'dashboard' && (
                                <div className="contents">
                                    <i className="pi pi-angle-up text-[10px] text-gray-300 mt-0.5"></i>
                                    <span onClick={(e) => { navigate('/dashboard'); }} className="text-xs font-semibold text-gray-500 hover:text-primary cursor-pointer tracking-wide capitalize transition-colors hover:scale-105 transform duration-200">Inicio</span>
                                </div>
                            )}
                        </div>
                    </OverlayPanel>
                </div>

                {/* --- VISTA DESKTOP (Completa) --- */}
                <div className="hidden md:flex items-center">
                    <Link to="/dashboard" className={linkClass}>
                        <i className="pi pi-home mr-1"></i>Inicio
                    </Link>

                    {pathnames.map((value, index) => {
                        if (value === 'dashboard') return null;

                        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                        const isLast = index === pathnames.length - 1;
                        const isId = !isNaN(value);
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
            </div>
        );
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg px-4 py-3 w-full border-b border-secondary/20 shadow-sm ring-1 ring-secondary/5 md:border-b-0 md:rounded-xl md:shadow-md md:m-4 md:w-auto md:mx-6 transition-all">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {/* Mobile Toggle Button */}
                    <button
                        onClick={onToggleSidebar}
                        className="md:hidden p-2 -ml-2 text-secondary hover:text-primary rounded-lg hover:bg-secondary-light/50 transition-colors"
                    >
                        <i className="pi pi-bars text-xl"></i>
                    </button>

                    {renderBreadcrumbs()}
                </div>

                {/* Perfil de Usuario (Menu Trigger) */}
                <div
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-xl transition-all border border-transparent hover:border-gray-100"
                    onClick={(e) => userMenuRef.current?.toggle(e)}
                >
                    <div className="hidden md:flex text-right flex-col leading-tight">
                        <span className="font-bold text-secondary-dark text-sm">Brian Paez</span>
                        <span className="text-xs text-secondary">Admin</span>
                    </div>
                    <img className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-100" src="https://ui-avatars.com/api/?name=Brian+Paez&background=6366f1&color=fff" alt="User" />
                    <i className="pi pi-angle-down text-secondary/50 text-xs hidden md:block"></i>
                </div>

                {/* User Dropdown Menu */}
                <OverlayPanel ref={userMenuRef} my="right top" at="right bottom" className="shadow-2xl border border-gray-100 bg-white rounded-xl p-0" style={{ maxWidth: '280px', width: '240px' }}>

                    {/* Header: User Info */}
                    <div className="flex flex-col items-center p-4 bg-gray-50/50 rounded-t-xl gap-2 border-b border-gray-100">
                        <img className="w-16 h-16 rounded-full border-4 border-white shadow-md mb-1" src="https://ui-avatars.com/api/?name=Brian+Paez&background=6366f1&color=fff&size=128" alt="Profile" />
                        <div className="text-center">
                            <h4 className="font-bold text-gray-800 text-base leading-tight">Brian Paez</h4>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">Administrador</span>
                            <p className="text-xs text-gray-400 mt-1 font-medium">brian.paez@contratista.com</p>
                        </div>
                    </div>

                    {/* Actions List */}
                    <div className="flex flex-col p-2 gap-1">
                        <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                            <i className="pi pi-user text-gray-400 group-hover:text-primary transition-colors"></i>
                            <span className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors">Mi Perfil</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg cursor-pointer transition-colors group">
                            <i className="pi pi-sign-out text-gray-400 group-hover:text-red-500 transition-colors"></i>
                            <span className="text-sm font-medium text-gray-600 group-hover:text-red-600 transition-colors">Cerrar Sesión</span>
                        </div>
                    </div>
                </OverlayPanel>
            </div>
        </nav>
    );
};

export default Navbar;
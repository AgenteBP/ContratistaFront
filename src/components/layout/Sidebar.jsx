import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

// 1. Componente auxiliar SidebarItem
const SidebarItem = ({ icon, label, to, badge, badgeColor, end = false, isExpanded }) => {

    // Función para obtener estilos según el color del badge
    const getBadgeStyle = (color) => {
        switch (color) {
            case 'danger': return { bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-600' };
            case 'warning': return { bg: 'bg-orange-100', text: 'text-orange-600', dot: 'bg-orange-600' };
            case 'success': return { bg: 'bg-green-100', text: 'text-green-600', dot: 'bg-green-600' };
            case 'info': return { bg: 'bg-blue-100', text: 'text-blue-600', dot: 'bg-blue-600' };
            default: return { bg: 'bg-primary-light', text: 'text-primary', dot: 'bg-primary' };
        }
    };

    const styles = getBadgeStyle(badgeColor);
    const isIcon = badge?.toString().startsWith('pi-');

    return (
        <li className="mr-1">
            <NavLink
                to={to}
                end={end}
                className={({ isActive }) => `
            w-full flex items-center p-3 rounded-lg group transition-all duration-200 overflow-hidden whitespace-nowrap relative border border-transparent
            ${isActive
                        ? 'bg-primary-light border-primary text-primary shadow-sm' // Estilo Activo: Light + Borde
                        : 'text-secondary-dark hover:bg-secondary-light'           // Estilo Inactivo
                    }
            ${!isExpanded ? 'justify-center px-0' : ''}
          `}
            >
                {({ isActive }) => (
                    <div className={`flex items-center min-w-0 ${isExpanded ? 'w-full' : 'justify-center w-auto'}`}>
                        {/* Icon Wrapper for Positioning Dot */}
                        <div className="relative flex items-center justify-center">
                            <i className={`pi ${icon} w-5 h-5 text-lg transition duration-75 flex-shrink-0 ${isActive ? 'text-primary' : 'text-secondary group-hover:text-secondary-dark'}`}></i>

                            {/* COMPACT MODE DOT */}
                            {!isExpanded && badge && (
                                <span className={`absolute -top-1 -right-1 flex h-2.5 w-2.5`}>
                                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 border border-white ${styles.dot}`}></span>
                                </span>
                            )}
                        </div>

                        <span className={`font-medium transition-all duration-200 ${isExpanded ? 'opacity-100 ms-3' : 'opacity-0 w-0 ms-0 hidden'}`}>
                            {label}
                        </span>

                        {/* EXPANDED MODE BADGE */}
                        {badge && isExpanded && (
                            <span className={`inline-flex items-center justify-center px-2 py-0.5 ms-auto text-xs font-bold rounded-full transition-colors ${isActive ? `${styles.dot} text-white` : `${styles.bg} ${styles.text}`}`}>
                                {isIcon ? <i className={`${badge} text-[10px]`}></i> : badge}
                            </span>
                        )}
                    </div>
                )}
            </NavLink>
        </li>
    );
};

// 2. Componente Principal Sidebar
const Sidebar = ({ isOpen, isPinned, togglePin, closeMobile }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    // Lógica para determinar si el sidebar se muestra expandido
    // En móvil (isOpen) siempre está expandido.
    // En desktop, si está fijado (isPinned) o si el usuario hace hover (isHovered).
    const isExpanded = isOpen || isPinned || isHovered;

    // Swipe gesture logic
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        if (isLeftSwipe && isOpen) {
            closeMobile();
        }
    };

    // Clases dinámicas para el contenedor
    const sidebarClasses = `
        fixed top-0 left-0 h-screen bg-white border-r border-secondary/20 
        transition-all duration-300 ease-out z-[60]
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        ${isExpanded ? 'w-64' : 'w-20'}
        ${(!isPinned && isHovered && !isOpen) ? 'shadow-2xl border-secondary/10' : ''} 
    `;

    // Estilos personalizados para el scrollbar minimalista
    const scrollbarStyles = `
        .minimal-scroll::-webkit-scrollbar { width: 4px; }
        .minimal-scroll::-webkit-scrollbar-track { background: transparent; }
        .minimal-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 4px; }
        .minimal-scroll:hover::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.2); }
    `;

    return (
        <>
            <style>{scrollbarStyles}</style>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm md:hidden animate-fade-in"
                    onClick={closeMobile}
                />
            )}

            <aside
                className={sidebarClasses}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseEnter={() => !isPinned && setIsHovered(true)}
                onMouseLeave={() => !isPinned && setIsHovered(false)}
            >
                <div className="h-full flex flex-col pl-3 pr-1 py-6">

                    {/* Logo / Header */}
                    <div className={`flex items-center mb-8 px-2 cursor-pointer overflow-hidden whitespace-nowrap ${isExpanded ? 'gap-3' : 'justify-center'}`} onClick={() => navigate('/proveedores')}>
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30 shrink-0 transition-all duration-300">
                            <i className="pi pi-chart-line font-bold text-xl"></i>
                        </div>
                        <span className={`self-center text-xl font-bold whitespace-nowrap text-secondary-dark tracking-tight transition-opacity duration-300 ${isExpanded ? 'opacity-100 ml-0' : 'opacity-0 w-0 ml-0 hidden'}`}>
                            FlowTrack
                        </span>
                    </div>

                    {/* Lista de Menú con Scroll Minimalista */}
                    <ul className="space-y-2 flex-1 overflow-y-auto overflow-x-hidden minimal-scroll">
                        <SidebarItem icon="pi-home" label="Inicio" to="/dashboard" end={true} isExpanded={isExpanded} />
                        <SidebarItem icon="pi-briefcase" label="Proveedores" to="/proveedores" isExpanded={isExpanded} badge="5" />
                        <SidebarItem icon="pi-user" label="Mis Datos" to="/proveedor" isExpanded={isExpanded} badge="!" badgeColor="danger" />
                        <SidebarItem icon="pi-shield" label="Auditores" to="/auditores" isExpanded={isExpanded} badge="5" />
                        <SidebarItem icon="pi-users" label="Usuarios" to="/usuarios" isExpanded={isExpanded} badge="7" />
                        <SidebarItem icon="pi-building" label="Empresas" to="/empresas" isExpanded={isExpanded} badge="5" />

                        <div className="pt-4 mt-4 border-t border-secondary/10">
                            <li className="mb-2 mr-1">
                                <button className={`w-full flex items-center p-3 rounded-lg text-secondary-dark hover:bg-secondary-light group transition-all duration-200 overflow-hidden whitespace-nowrap ${!isExpanded ? 'justify-center px-0' : ''}`}>

                                    <div className={`flex items-center min-w-0 ${isExpanded ? 'w-full' : 'justify-center w-auto'}`}>
                                        <div className="relative flex items-center justify-center">
                                            <i className="pi pi-file w-5 h-5 transition duration-75 text-secondary group-hover:text-secondary-dark text-lg flex-shrink-0"></i>
                                            {/* Dot for Documentos (mock logic) */}
                                            {!isExpanded && (
                                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 border border-white bg-blue-600"></span>
                                                </span>
                                            )}
                                        </div>

                                        <span className={`font-medium transition-all duration-200 ${isExpanded ? 'opacity-100 ms-3' : 'opacity-0 w-0 ms-0 hidden'}`}>Documentos</span>

                                        {isExpanded && (
                                            <span className="inline-flex items-center justify-center px-2 py-0.5 ms-auto text-xs font-bold rounded-full bg-blue-100 text-blue-600">3</span>
                                        )}
                                    </div>

                                </button>
                            </li>
                            <li className="mr-1">
                                <button className={`w-full flex items-center p-3 rounded-lg text-secondary-dark hover:bg-secondary-light group transition-all duration-200 overflow-hidden whitespace-nowrap ${!isExpanded ? 'justify-center px-0' : ''}`}>

                                    <div className={`flex items-center min-w-0 ${isExpanded ? 'w-full' : 'justify-center w-auto'}`}>
                                        <i className="pi pi-chart-bar w-5 h-5 transition duration-75 text-secondary group-hover:text-secondary-dark text-lg flex-shrink-0"></i>
                                        <span className={`font-medium transition-all duration-200 ${isExpanded ? 'opacity-100 ms-3' : 'opacity-0 w-0 ms-0 hidden'}`}>Reportes</span>
                                    </div>

                                </button>
                            </li>
                        </div>
                    </ul>

                    {/* Botón PIN (Solo Desktop) */}
                    <div className="hidden md:flex justify-center pt-4 border-t border-secondary/10">
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Evitar que el click afecte otros eventos si los hubiera
                                togglePin();
                            }}
                            className={`p-2 rounded-lg transition-all duration-300 ${isPinned ? 'text-primary bg-primary/10' : 'text-secondary hover:text-primary hover:bg-secondary-light'}`}
                            title={isPinned ? "Desfijar menú (Auto-ocultar)" : "Fijar menú siempre visible"}
                        >
                            <i className={`pi pi-thumbtack text-lg transition-transform duration-300 ${isPinned ? '-rotate-45' : ''}`}></i>
                        </button>
                    </div>

                </div>
            </aside>
        </>
    );
};

export default Sidebar;

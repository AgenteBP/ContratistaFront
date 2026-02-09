import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { TbBackhoe } from 'react-icons/tb';

// Helper for rendering icons
const renderIcon = (iconClassOrComponent, className = "") => {
    if (!iconClassOrComponent) return null;
    if (typeof iconClassOrComponent === 'string') {
        return <i className={`pi ${iconClassOrComponent} ${className}`}></i>;
    }
    if (React.isValidElement(iconClassOrComponent)) {
        return React.cloneElement(iconClassOrComponent, { className: `${iconClassOrComponent.props.className || ''} ${className}`.trim() });
    }
    return iconClassOrComponent;
};

// 1. Componente auxiliar SidebarItem
const SidebarItem = ({ icon, label, to, badge, badgeColor, end = false, isExpanded }) => {

    // ... (getBadgeStyle function remains)
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
                        ? 'bg-primary-light border-primary text-primary shadow-sm'
                        : 'text-secondary-dark hover:bg-secondary-light'
                    }
            ${!isExpanded ? 'justify-center px-0' : ''}
          `}
            >
                {({ isActive }) => (
                    <div className={`flex items-center min-w-0 ${isExpanded ? 'w-full' : 'justify-center w-auto'}`}>
                        <div className="relative flex items-center justify-center">
                            {renderIcon(icon, `w-5 h-5 text-lg transition duration-75 flex-shrink-0 ${isActive ? 'text-primary' : 'text-secondary group-hover:text-secondary-dark'}`)}

                            {!isExpanded && badge && (
                                <span className={`absolute -top-1 -right-1 flex h-2.5 w-2.5`}>
                                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 border border-white ${styles.dot}`}></span>
                                </span>
                            )}
                        </div>

                        <span className={`font-medium transition-all duration-200 ${isExpanded ? 'opacity-100 ms-3' : 'opacity-0 w-0 ms-0 hidden'}`}>
                            {label}
                        </span>

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

const SidebarSubmenu = ({ icon, label, items, isExpanded }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasActiveChild = items.some(item =>
        item.end
            ? window.location.pathname === item.to
            : window.location.pathname.startsWith(item.to)
    );

    useEffect(() => {
        if (!isExpanded) setIsOpen(false);
    }, [isExpanded]);

    return (
        <li className="mr-1">
            <button
                onClick={() => isExpanded && setIsOpen(!isOpen)}
                className={`w-full flex items-center p-3 rounded-lg group transition-all duration-200 overflow-hidden whitespace-nowrap relative border border-transparent
                ${hasActiveChild ? 'bg-primary-light/40 text-primary border-primary/20 shadow-sm' : 'text-secondary-dark hover:bg-secondary-light'}
                ${!isExpanded ? 'justify-center px-0' : ''}`}
            >
                <div className={`flex items-center min-w-0 ${isExpanded ? 'w-full' : 'justify-center w-auto'}`}>
                    {renderIcon(icon, `w-5 h-5 text-lg transition duration-75 flex-shrink-0 ${hasActiveChild ? 'text-primary' : 'text-secondary group-hover:text-secondary-dark'}`)}
                    <span className={`font-medium transition-all duration-200 ${isExpanded ? 'opacity-100 ms-3' : 'opacity-0 w-0 ms-0 hidden'}`}>
                        {label}
                    </span>
                    {isExpanded && (
                        <i className={`pi pi-chevron-down ms-auto text-xs text-secondary/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
                    )}
                </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen && isExpanded ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                <ul className="pl-2 pt-1 pb-2 space-y-1">
                    {items.map((item, idx) => (
                        <li key={idx}>
                            <NavLink
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) => `
                                    flex items-center p-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                    ${isActive
                                        ? 'text-primary bg-primary/5 font-bold'
                                        : 'text-secondary hover:text-secondary-dark hover:bg-secondary-light/50'
                                    }
                                `}
                            >
                                <div className={`mr-3 transition-colors ${(item.end ? window.location.pathname === item.to : window.location.pathname.startsWith(item.to)) ? 'text-primary' : 'text-secondary/70'}`}>
                                    {renderIcon(item.icon, "text-lg")}
                                </div>
                                <span>{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
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

    // --- Dynamic Menu Logic ---
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('currentRole');
            if (stored) {
                const parsed = JSON.parse(stored);
                setUserRole(parsed.role);
            }
        } catch (e) {
            console.error("Error reading role", e);
        }
    }, []);

    const getMenuItems = (role) => {
        // Base items reusable across roles
        const ITEM_INICIO = { type: 'item', icon: 'pi-home', label: 'Inicio', to: '/dashboard', end: true };
        const ITEM_REPORTES = {
            type: 'custom',
            render: (expanded) => (
                <li className="mr-1" key="reports">
                    <button className={`w-full flex items-center p-3 rounded-lg text-secondary-dark hover:bg-secondary-light group transition-all duration-200 overflow-hidden whitespace-nowrap ${!expanded ? 'justify-center px-0' : ''}`}>
                        <div className={`flex items-center min-w-0 ${expanded ? 'w-full' : 'justify-center w-auto'}`}>
                            <i className="pi pi-chart-bar w-5 h-5 transition duration-75 text-secondary group-hover:text-secondary-dark text-lg flex-shrink-0"></i>
                            <span className={`font-medium transition-all duration-200 ${expanded ? 'opacity-100 ms-3' : 'opacity-0 w-0 ms-0 hidden'}`}>Reportes</span>
                        </div>
                    </button>
                </li>
            )
        };

        const SUBMENU_DOCUMENTOS = {
            type: 'submenu',
            icon: 'pi-file',
            label: 'Documentos',
            items: [
                { label: 'General', to: '/documentos/general', icon: 'pi-th-large' },
                { label: 'Pendientes', to: '/documentos/pendientes', icon: 'pi-upload' },
                { label: 'Por Vencer', to: '/documentos/por-vencer', icon: 'pi-clock' },
                { label: 'Observados', to: '/documentos/observados', icon: 'pi-exclamation-circle' },
                { label: 'En Revisión', to: '/documentos/en-revision', icon: 'pi-eye' },
                { label: 'Vigentes', to: '/documentos/vigentes', icon: 'pi-check-circle' }
            ]
        };

        const SUBMENU_RECURSOS_STD = {
            type: 'submenu',
            icon: 'pi-box',
            label: 'Recursos',
            items: [
                { label: 'Resumen', to: '/recursos', icon: 'pi-objects-column', end: true },
                { label: 'Vehículos', to: '/recursos/vehiculos', icon: 'pi-car' },
                { label: 'Empleados', to: '/recursos/empleados', icon: 'pi-users' },
                { label: 'Maquinaria', to: '/recursos/maquinaria', icon: <TbBackhoe className="text-[26px]" /> }
            ]
        };

        // --- Role Configurations ---

        if (role === 'PROVEEDOR') {
            return [
                ITEM_INICIO,
                { type: 'item', icon: 'pi-user', label: 'Mis Datos', to: '/proveedor', badge: '!', badgeColor: 'danger' },
                SUBMENU_RECURSOS_STD,
                SUBMENU_DOCUMENTOS,
                ITEM_REPORTES
            ];
        }

        if (role === 'AUDITOR') {
            return [
                ITEM_INICIO,
                { type: 'item', icon: 'pi-briefcase', label: 'Proveedores', to: '/proveedores', end: true, badge: '5' },
                SUBMENU_RECURSOS_STD,
                { type: 'item', icon: 'pi-chart-bar', label: 'Auditoría Técnica', to: '/auditores/tecnica' },
                SUBMENU_DOCUMENTOS,
                ITEM_REPORTES
            ];
        }

        if (role === 'EMPRESA') {
            // "Recursos" renamed to "Datos" excluding "Proveedores" as first item
            return [
                ITEM_INICIO,
                {
                    type: 'submenu',
                    icon: 'pi-database', // Changed icon for "Datos" distinction
                    label: 'Datos',
                    items: [
                        { label: 'Proveedores', to: '/proveedores', icon: 'pi-briefcase' }, // Moved here
                        { label: 'Resumen', to: '/recursos', icon: 'pi-objects-column', end: true },
                        { label: 'Vehículos', to: '/recursos/vehiculos', icon: 'pi-car' },
                        { label: 'Empleados', to: '/recursos/empleados', icon: 'pi-users' },
                        { label: 'Maquinaria', to: '/recursos/maquinaria', icon: <TbBackhoe className="text-[26px]" /> }
                    ]
                },
                SUBMENU_DOCUMENTOS,
                ITEM_REPORTES
            ];
        }

        if (role === 'ADMIN') {
            return [
                ITEM_INICIO,
                { type: 'item', icon: 'pi-users', label: 'Usuarios', to: '/usuarios', end: true, badge: '7' },
                { type: 'item', icon: 'pi-building', label: 'Empresas', to: '/empresas', end: true, badge: '5' },
                { type: 'item', icon: 'pi-shield', label: 'Auditores', to: '/auditores', end: true, badge: '5' },
                { type: 'item', icon: 'pi-briefcase', label: 'Proveedores', to: '/proveedores', end: true },
                { type: 'item', icon: 'pi-user', label: 'Mis Datos', to: '/usuarios/1', badge: '', badgeColor: 'info' }, // Mocking admin profile
                { type: 'item', icon: 'pi-chart-bar', label: 'Auditoría Técnica', to: '/auditores/tecnica' },
                SUBMENU_DOCUMENTOS,
                ITEM_REPORTES
            ];
        }

        // Default / Fallback (similar to Admin but simpler)
        return [ITEM_INICIO, SUBMENU_RECURSOS_STD, SUBMENU_DOCUMENTOS];
    };

    const renderMenuItems = (expanded) => {
        const items = getMenuItems(userRole);
        return items.map((item, idx) => {
            if (item.type === 'custom') return item.render(expanded);
            if (item.type === 'submenu') {
                return <SidebarSubmenu key={idx} icon={item.icon} label={item.label} items={item.items} isExpanded={expanded} />;
            }
            return (
                <SidebarItem
                    key={idx}
                    icon={item.icon}
                    label={item.label}
                    to={item.to}
                    end={item.end}
                    isExpanded={expanded}
                    badge={item.badge}
                    badgeColor={item.badgeColor}
                />
            );
        });
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
                        {renderMenuItems(isExpanded)}
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

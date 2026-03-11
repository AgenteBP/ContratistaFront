import React, { useRef, useState, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onToggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, currentRole, logout, selectRole } = useAuth();
    const menuRef = useRef(null);
    const userMenuRef = useRef(null);
    const switcherRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');

    // --- Dynamic User Info ---
    // Mapeo de códigos de rol a etiquetas amigables
    const roleLabels = {
        'PROVEEDOR': 'Proveedor',
        'EMPRESA': 'Empresa',
        'AUDITOR': 'Auditor Técnico',
        'ADMIN': 'Administrador'
    };

    const fullName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : (user?.name || 'Usuario');

    const userInfo = currentRole ? {
        user: fullName,
        email: user?.username || user?.email || 'usuario@contratista.com',
        role: currentRole.role,
        roleLabel: roleLabels[currentRole.role] || currentRole.role,
        entityName: currentRole.entity_name || currentRole.entity?.name || currentRole.entity?.entity || '',
        id_entity: currentRole.id_entity
    } : null;

    // --- Profile Switcher Logic ---
    const availableProfiles = useMemo(() => {
        if (!user) return [];
        const profiles = [];

        user.roles?.forEach(roleName => {
            if (roleName === 'ADMIN') {
                profiles.push({
                    role: 'ADMIN',
                    roleId: 'admin-root',
                    id_entity: 0,
                    name: 'Gestión Central',
                    type: 'ADMIN'
                });
            }
            if (roleName === 'AUDITOR' && user.auditors) {
                user.auditors.forEach(a => {
                    profiles.push({
                        role: 'AUDITOR',
                        roleId: 'auditor-root',
                        id_entity: a.id_auditor,
                        name: `Registro: ${a.registration_number}`,
                        type: a.type_auditor
                    });
                });
            }
            if (roleName === 'CUSTOMER' && user.clients) {
                user.clients.forEach(c => {
                    profiles.push({
                        role: 'EMPRESA',
                        roleId: 'customer-root',
                        id_entity: c.id_company_client,
                        name: c.companyDescription,
                        id_company: c.id_company
                    });
                });
            }
            if (roleName === 'SUPPLIER' && user.suppliers) {
                user.suppliers.forEach(s => {
                    profiles.push({
                        role: 'PROVEEDOR',
                        roleId: 'supplier-root',
                        id_entity: s.id_supplier,
                        name: s.company_name,
                        cuit: s.cuit
                    });
                });
            }
        });
        return profiles;
    }, [user]);

    const otherProfiles = availableProfiles.filter(p =>
        p.role !== currentRole?.role || p.id_entity !== currentRole?.id_entity
    );

    const handleRoleSwitch = (profile) => {
        selectRole({
            role: profile.role,
            roleId: profile.roleId,
            type: profile.type || profile.role,
            id_entity: profile.id_entity,
            entity_name: profile.name,
            ...profile
        });
        switcherRef.current?.hide();
        setSearchQuery('');
        navigate('/dashboard');
    };

    const filteredProfiles = useMemo(() => {
        return otherProfiles.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.role.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [otherProfiles, searchQuery]);

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
        'recursos': 'Recursos',
        'empleados': 'Empleados',
        'vehiculos': 'Vehículos',
        'maquinaria': 'Maquinaria',
        'tecnica': 'Técnica',

        'auditoria': 'Auditoría',
    };

    // Helper para formato Título (Camel Case visual)
    const toTitleCase = (str) => {
        return str.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
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
        // Usamos el mapa, o formateamos el valor si no existe
        const lastDisplayName = lastIsId ? `Detalle #${lastValue}` : (breadcrumbNameMap[lastValue] || toTitleCase(lastValue));

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

                    {/* Título Página Actual (Solo en Desktop) */}
                    <span className={`hidden md:block ${activeClass}`}>{lastDisplayName}</span>

                    {/* Dropdown Menu - Anchored to whatever clicked trigger, but semantically belongs here */}
                    <OverlayPanel ref={menuRef} my="left top" at="left bottom" className="shadow-xl border border-gray-100 bg-white rounded-xl p-0" style={{ maxWidth: '220px' }}>
                        <div className="flex flex-col items-center gap-2 p-3">
                            {/* Renderizamos padres en orden INVERSO */}
                            {parentPaths.length > 0 ? (
                                [...parentPaths].reverse().map((value, index) => {
                                    const realIndex = pathnames.indexOf(value);
                                    const to = `/${pathnames.slice(0, realIndex + 1).join('/')}`;
                                    const name = breadcrumbNameMap[value] || toTitleCase(value);

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
                        let displayName = isId ? `Detalle #${value}` : (breadcrumbNameMap[value] || toTitleCase(value));

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
                <div className="flex items-center gap-1 md:gap-3">
                    {/* Mobile Toggle Button */}
                    <button
                        onClick={onToggleSidebar}
                        className="md:hidden p-2 -ml-2 text-secondary hover:text-primary rounded-lg hover:bg-secondary-light/50 transition-colors"
                    >
                        <i className="pi pi-bars text-xl"></i>
                    </button>

                    {renderBreadcrumbs()}
                </div>

                <div className="flex items-center gap-1 md:gap-3">
                    {/* Role Context / Switcher Trigger */}
                    {userInfo && (() => {
                        const activeTheme = {
                            'PROVEEDOR': { color: 'text-success', bg: 'bg-success/5', border: 'border-success/20', iconBg: 'bg-success/10', icon: 'pi-briefcase', short: 'PRO' },
                            'EMPRESA': { color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20', iconBg: 'bg-primary/10', icon: 'pi-building', short: 'EMP' },
                            'AUDITOR': { color: 'text-info', bg: 'bg-info/5', border: 'border-info/20', iconBg: 'bg-info/10', icon: 'pi-file-check', short: userInfo?.roleLabel?.includes('Técnico') ? 'TEC' : 'LEG' },
                            'ADMIN': { color: 'text-secondary-dark', bg: 'bg-secondary/5', border: 'border-secondary/20', iconBg: 'bg-secondary/10', icon: 'pi-cog', short: 'ADM' }
                        }[userInfo?.role] || { color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', iconBg: 'bg-gray-100', icon: 'pi-user', short: 'USR' };

                        const isSwitchable = availableProfiles.length > 1;

                        return (
                            <div
                                onClick={(e) => isSwitchable && switcherRef.current?.toggle(e)}
                                className={`
                                    flex items-center justify-center transition-all shadow-sm
                                    md:px-4 md:py-2 md:gap-3 md:rounded-full md:border md:${activeTheme.bg} md:${activeTheme.border}
                                    w-10 h-10 rounded-full md:w-auto md:h-auto ${activeTheme.bg} border ${activeTheme.border} md:border-inherit
                                    ${isSwitchable ? 'cursor-pointer group hover:bg-white/50' : 'cursor-default opacity-95'}
                                `}
                                title={isSwitchable ? "Cambiar de perfil" : "Rol actual"}
                            >
                                <div className={`
                                    flex items-center justify-center transition-transform duration-500 shrink-0
                                    md:w-6 md:h-6 md:rounded-full md:${activeTheme.iconBg} ${activeTheme.color}
                                    text-lg md:text-[10px]
                                `}>
                                    <i className={`pi ${isSwitchable ? 'pi-sync group-hover:rotate-180 transition-transform duration-500' : activeTheme.icon} font-bold`}></i>
                                </div>

                                <div className="hidden md:flex flex-col min-w-0 pr-1 overflow-hidden">
                                    <span className={`text-[8px] leading-tight font-black ${activeTheme.color} uppercase tracking-[0.15em] mb-0.5 whitespace-nowrap`}>
                                        {userInfo?.roleLabel}
                                    </span>
                                    <span className="text-xs font-bold text-secondary-dark truncate max-w-[120px] md:max-w-[160px] leading-none">
                                        {userInfo?.entityName || (userInfo?.role === 'ADMIN' ? 'Gestión Central' : 'Mi Cuenta')}
                                    </span>
                                </div>
                                {isSwitchable && (
                                    <div className="hidden md:flex items-center justify-center pl-1">
                                        <i className={`pi pi-angle-down text-[10px] ${activeTheme.color} opacity-60`}></i>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    <div
                        className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 p-1.5 rounded-full transition-all border border-transparent hover:border-gray-100"
                        onClick={(e) => userMenuRef.current?.toggle(e)}
                    >
                        <img className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-100" src={`https://ui-avatars.com/api/?name=${userInfo?.user || 'U'}&background=6366f1&color=fff`} alt="User" />
                        <i className="hidden sm:block pi pi-angle-down text-secondary/50 text-[10px] ml-0.5"></i>
                    </div>
                </div>

                {/* User Dropdown Menu */}
                <OverlayPanel
                    ref={userMenuRef}
                    my="right top"
                    at="right bottom"
                    className="shadow-2xl border border-gray-100 bg-white rounded-xl p-0 navbar-user-dropdown"
                    style={{ maxWidth: '280px', minWidth: '240px' }}
                >

                    {/* Header: User Info */}
                    <div className="flex flex-col items-center p-5 bg-gray-50/50 rounded-t-xl gap-2 border-b border-gray-100">
                        <img className="w-16 h-16 rounded-full border-4 border-white shadow-md mb-1" src={`https://ui-avatars.com/api/?name=${userInfo?.user || 'U'}&background=6366f1&color=fff&size=128`} alt="Profile" />
                        <div className="text-center w-full">
                            <h4 className="font-bold text-gray-800 text-lg leading-tight truncate px-2">{userInfo?.user || 'Usuario'}</h4>
                            <p className="text-xs text-secondary/60 mt-0.5 font-medium">{userInfo?.email}</p>
                        </div>
                    </div>

                    {/* Profile Switcher Section (REMOVED - MOVED TO DEDICATED SELECTOR) */}

                    {/* Actions List */}
                    <div className="flex flex-col p-2 gap-1">
                        <Link to={userInfo?.role === 'PROVEEDOR' ? '/proveedor' : '/usuarios/1'} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group text-decoration-none">
                            <i className="pi pi-user text-gray-400 group-hover:text-primary transition-colors"></i>
                            <span className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors">Mi Perfil</span>
                        </Link>
                        <div
                            className="flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg cursor-pointer transition-colors group"
                            onClick={() => {
                                logout();
                                navigate('/login');
                            }}
                        >
                            <i className="pi pi-sign-out text-gray-400 group-hover:text-red-500 transition-colors"></i>
                            <span className="text-sm font-medium text-gray-600 group-hover:text-red-600 transition-colors">Cerrar Sesión</span>
                        </div>
                    </div>
                </OverlayPanel>

                {/* Dedicated Switcher Panel */}
                <OverlayPanel
                    ref={switcherRef}
                    className="shadow-2xl border border-gray-100 bg-white rounded-2xl p-0 overflow-hidden"
                    style={{ width: '320px' }}
                    onHide={() => setSearchQuery('')}
                >
                    <div className="flex flex-col">
                        {/* Search Header */}
                        <div className="p-3 bg-gray-50/80 border-b border-gray-100">
                            <div className="relative">
                                <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                                <input
                                    type="text"
                                    placeholder="Buscar empresa o rol..."
                                    className="w-full bg-white border border-gray-200 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Profiles List */}
                        <div className="max-h-[350px] overflow-y-auto p-1 py-1 scroll-smooth">
                            {/* Perfil Actual (Modo Lectura - SOLO EN MÓVIL) */}
                            {userInfo && (
                                <div className="mb-2 border-b border-gray-100 pb-2 sm:hidden">
                                    <div className="px-3 py-1 text-[9px] font-black text-secondary/40 uppercase tracking-widest">
                                        Perfil Activo
                                    </div>
                                    <div className="flex items-center gap-3 p-2.5 mx-1 bg-gray-50/80 rounded-xl border border-primary/20 shadow-inner opacity-90 cursor-default">
                                        {(() => {
                                            const activeTheme = {
                                                'PROVEEDOR': { icon: 'pi-briefcase', color: 'text-success', bg: 'bg-success/20' },
                                                'EMPRESA': { icon: 'pi-building', color: 'text-primary', bg: 'bg-primary/20' },
                                                'AUDITOR': { icon: 'pi-file-check', color: 'text-info', bg: 'bg-info/20' },
                                                'ADMIN': { icon: 'pi-cog', color: 'text-secondary-dark', bg: 'bg-secondary/20' }
                                            }[userInfo.role] || { icon: 'pi-user', color: 'text-gray-500', bg: 'bg-gray-100' };

                                            return (
                                                <>
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeTheme.bg} ${activeTheme.color} flex-shrink-0`}>
                                                        <i className={`pi ${activeTheme.icon} text-base`}></i>
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-xs font-black text-gray-900 truncate leading-tight">{userInfo.entityName || userInfo.user}</span>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${activeTheme.bg} ${activeTheme.color} uppercase tracking-wider`}>
                                                                {userInfo.roleLabel}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}

                            {filteredProfiles.length > 0 ? (
                                <>
                                    <div className="px-3 py-1 text-[9px] font-black text-secondary/40 uppercase tracking-widest mt-1">
                                        Cambiar a otro perfil
                                    </div>
                                    {filteredProfiles.map((profile, idx) => {
                                        const theme = {
                                            'EMPRESA': { icon: 'pi-building', color: 'text-primary', bg: 'bg-primary/5' },
                                            'AUDITOR': { icon: 'pi-file-check', color: 'text-info', bg: 'bg-info/5' },
                                            'PROVEEDOR': { icon: 'pi-briefcase', color: 'text-success', bg: 'bg-success/5' },
                                            'ADMIN': { icon: 'pi-cog', color: 'text-secondary-dark', bg: 'bg-secondary/5' }
                                        }[profile.role] || { icon: 'pi-user', color: 'text-gray-500', bg: 'bg-gray-50' };

                                        return (
                                            <div
                                                key={`${profile.role}-${profile.id_entity}-${idx}`}
                                                onClick={() => handleRoleSwitch(profile)}
                                                className="flex items-center gap-3 p-2.5 mx-1 hover:bg-gray-50 rounded-xl cursor-pointer transition-all group border border-transparent hover:border-gray-100"
                                            >
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${theme.bg} ${theme.color} flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm`}>
                                                    <i className={`pi ${theme.icon} text-base`}></i>
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs font-bold text-gray-800 truncate leading-tight">{profile.name}</span>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${theme.bg} ${theme.color} uppercase tracking-wider`}>
                                                            {roleLabels[profile.role] || profile.role}
                                                        </span>
                                                    </div>
                                                </div>
                                                <i className="pi pi-chevron-right ml-auto text-[10px] text-gray-300 group-hover:translate-x-0.5 transition-transform"></i>
                                            </div>
                                        );
                                    })}
                                </>
                            ) : (
                                <div className="p-10 text-center">
                                    <i className="pi pi-search text-gray-200 text-3xl mb-2"></i>
                                    <p className="text-xs text-gray-400 font-medium">No se encontraron resultados</p>
                                </div>
                            )}
                        </div>

                        {/* Footer tip */}
                        <div className="p-2 bg-gray-50/50 text-[10px] text-center text-gray-400 font-bold border-top border-gray-100 uppercase tracking-wider">
                            cambiar de perfil
                        </div>
                    </div>
                </OverlayPanel>
            </div>
        </nav>
    );
};

export default Navbar;
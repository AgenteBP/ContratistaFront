import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

// 1. Componente auxiliar SidebarItem
const SidebarItem = ({ icon, label, to, badge, end = false }) => (
    <li>
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) => `
        w-full flex items-center p-3 rounded-lg group transition-all duration-200 
        ${isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/30' // Estilo Activo
                    : 'text-secondary-dark hover:bg-secondary-light'      // Estilo Inactivo
                }
      `}
        >
            {({ isActive }) => (
                <>
                    <i className={`pi ${icon} w-5 h-5 transition duration-75 ${isActive ? 'text-white' : 'text-secondary group-hover:text-secondary-dark'}`}></i>
                    <span className="ms-3 font-medium">{label}</span>
                    {badge && <span className={`inline-flex items-center justify-center px-2 ms-3 text-xs font-medium rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-secondary-light text-secondary-dark'}`}>{badge}</span>}
                </>
            )}
        </NavLink>
    </li>
);

// 2. Componente Principal Sidebar
const Sidebar = () => {
    const navigate = useNavigate();

    return (
        <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r border-secondary/20 hidden md:block transition-transform">
            <div className="h-full px-4 py-6 overflow-y-auto">

                {/* Logo / Header del Sidebar */}
                <div className="flex items-center gap-3 mb-8 px-2 cursor-pointer" onClick={() => navigate('/proveedores')}>
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/30">
                        <i className="pi pi-chart-line font-bold"></i>
                    </div>
                    <span className="self-center text-xl font-bold whitespace-nowrap text-secondary-dark tracking-tight">
                        FlowTrack
                    </span>
                </div>

                {/* Lista de Menú */}
                <ul className="space-y-2">

                    {/* Item: Inicio */}
                    <SidebarItem
                        icon="pi-home"
                        label="Inicio"
                        to="/dashboard"
                        end={true}
                    />

                    {/* Item: Lista de Proveedores */}
                    <SidebarItem
                        icon="pi-briefcase"
                        label="Proveedores"
                        to="/proveedores"
                    />

                    {/* Item: Perfil Proveedor (Mis Datos) */}
                    <SidebarItem
                        icon="pi-user"
                        label="Mis Datos"
                        to="/proveedor"
                    />

                    {/* Item: Lista de Auditores */}
                    <SidebarItem
                        icon="pi-shield"
                        label="Auditores"
                        to="/auditores"
                    />

                    {/* Item: Lista de Usuarios */}
                    <SidebarItem
                        icon="pi-users"
                        label="Usuarios"
                        to="/usuarios"
                    />

                    {/* Item: Lista de Empresas */}
                    <SidebarItem
                        icon="pi-building"
                        label="Empresas"
                        to="/empresas"
                    />

                    {/* Items futuros */}
                    <li>
                        <button className="w-full flex items-center p-3 rounded-lg text-secondary-dark hover:bg-secondary-light group transition-all duration-200">
                            <i className="pi pi-file w-5 h-5 transition duration-75 text-secondary group-hover:text-secondary-dark"></i>
                            <span className="ms-3 font-medium">Documentos</span>
                            <span className="inline-flex items-center justify-center px-2 ms-3 text-xs font-medium rounded-full bg-secondary-light text-secondary-dark">3</span>
                        </button>
                    </li>
                    <li>
                        <button className="w-full flex items-center p-3 rounded-lg text-secondary-dark hover:bg-secondary-light group transition-all duration-200">
                            <i className="pi pi-chart-bar w-5 h-5 transition duration-75 text-secondary group-hover:text-secondary-dark"></i>
                            <span className="ms-3 font-medium">Reportes</span>
                        </button>
                    </li>

                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;

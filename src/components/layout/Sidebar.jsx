import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// 1. Componente auxiliar SidebarItem
// Lo definimos aquí mismo porque solo lo usa el Sidebar, no hace falta exportarlo.
const SidebarItem = ({ icon, label, active, badge, onClick }) => (
  <li>
    <button 
      onClick={onClick} 
      className={`w-full flex items-center p-3 rounded-lg group transition-all duration-200 
      ${active 
        ? 'bg-primary text-white shadow-md shadow-primary/30' // Estilo Activo
        : 'text-secondary-dark hover:bg-secondary-light'      // Estilo Inactivo
      }`}
    >
      <i className={`pi ${icon} w-5 h-5 transition duration-75 ${active ? 'text-white' : 'text-secondary group-hover:text-secondary-dark'}`}></i>
      <span className="ms-3 font-medium">{label}</span>
      {badge && <span className={`inline-flex items-center justify-center px-2 ms-3 text-xs font-medium rounded-full ${active ? 'bg-white/20 text-white' : 'bg-secondary-light text-secondary-dark'}`}>{badge}</span>}
    </button>
  </li>
);

// 2. Componente Principal Sidebar
const Sidebar = () => {
  const navigate = useNavigate(); // Hook para cambiar de ruta
  const location = useLocation(); // Hook para leer la ruta actual (URL)

  // Función simple para verificar si la ruta actual coincide con el botón
  const isActive = (path) => location.pathname === path;

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
          
          {/* Item: Inicio (Por ahora redirige a proveedores, luego puedes crear un Dashboard real) */}
          <SidebarItem 
            icon="pi-home" 
            label="Inicio" 
            active={location.pathname === '/dashboard'}
            onClick={() => navigate('/dashboard')}
          />

          {/* Item: Nuevo Proveedor */}
          <SidebarItem 
            icon="pi-user-plus" 
            label="Nuevo" 
            active={isActive('/proveedores/nuevo')} 
            onClick={() => navigate('/proveedores/nuevo')} 
          />

          {/* Item: Lista de Proveedores */}
          <SidebarItem 
            icon="pi-users" 
            label="Proveedores" 
            active={isActive('/proveedores')} 
            onClick={() => navigate('/proveedores')} 
          />

          {/* Items futuros (sin funcionalidad aún) */}
          <SidebarItem icon="pi-file" label="Documentos" badge="3" onClick={() => {}} />
          <SidebarItem icon="pi-chart-bar" label="Reportes" onClick={() => {}} />

        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
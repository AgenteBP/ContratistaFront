// RoleSelectionPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

/**
 * RoleCard: tarjeta para cada rol.
 * - Si roleData.entities tiene más de 1 elemento, muestra un Dropdown similar a PROVEEDOR.
 * - Si solo hay 1 entidad, muestra el nombre de la entidad como título (compacto).
 * - El botón "Entrar" confirma la entidad seleccionada y pasa el contexto al callback onSelect.
 */
const RoleCard = ({ roleData, onSelect }) => {
  const entities = roleData.entities ?? (roleData.entity ? [roleData.entity] : []);
  const options = useMemo(() => {
    return entities.map((e, idx) => {
      if (typeof e === 'string') return { label: e, value: e };
      const label = e.name || e.entity || e.label || e.nombre || `Entidad ${idx + 1}`;
      return { label, value: e };
    });
  }, [entities]);

  const [selectedOption, setSelectedOption] = useState(options.length ? options[0].value : null);
  const isMultiEntity = options.length > 1;

  useEffect(() => {
    setSelectedOption(options.length ? options[0].value : null);
  }, [options]);

  const config = {
    'EMPRESA': { icon: 'pi-building', bg: 'bg-primary-light', text: 'text-primary', solidBg: 'bg-primary', border: 'hover:border-primary', label: 'Cliente / Empresa' },
    'AUDITOR': { icon: 'pi-file-check', bg: 'bg-info-light', text: 'text-info', solidBg: 'bg-info', border: 'hover:border-info', label: 'Auditor Técnico' },
    'PROVEEDOR': { icon: 'pi-briefcase', bg: 'bg-success-light', text: 'text-success', solidBg: 'bg-success', border: 'hover:border-success', label: 'Proveedor' },
    'ADMIN': { icon: 'pi-cog', bg: 'bg-slate-100', text: 'text-slate-600', solidBg: 'bg-slate-600', border: 'hover:border-slate-400', label: 'ADMINISTRADOR' }
  };

  const theme = config[roleData.role] || config['EMPRESA'];

  const confirmSelection = (e) => {
    e?.stopPropagation?.();
    const val = selectedOption ?? (options[0]?.value);
    const selectedEntity = typeof val === 'string' ? { name: val } : { id: val?.id, name: val?.name || val?.entity };
    onSelect({ role: roleData.role, roleId: roleData.id, selectedEntity });
  };

  return (
    <div
      role="button"
      onClick={() => !isMultiEntity && confirmSelection()}
      className={`group w-full bg-white rounded-xl border border-secondary/20 shadow-sm ${theme.border} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex overflow-hidden cursor-pointer h-full min-h-[140px]`}
    >
      {/* Contenedor Izquierdo (Icono + Info) con padding */}
      <div className="flex-1 flex items-center gap-4 p-4 md:p-5">
        {/* Icono Redimensionado */}
        <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-xl ${theme.bg} ${theme.text} group-hover:scale-105 transition-transform duration-300`}>
          <i className={`pi ${theme.icon}`}></i>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          <span className={`text-[12px] font-extrabold uppercase tracking-widest ${theme.text} block mb-0.5`}>
            {theme.label}
          </span>

          <h4 className="text-secondary-dark font-bold text-base md:text-lg leading-tight truncate">
            {isMultiEntity ? "" : (options[0]?.label)}
          </h4>

          {/* Dropdown solo si es necesario */}
          {isMultiEntity && (
            <div className="w-full max-w-xs mt-2" onClick={(e) => e.stopPropagation()}>
              <p className='text-secondary text-xs mb-1'>
                {roleData.role === 'PROVEEDOR' ? 'Seleccione proveedor:' :
                  roleData.role === 'AUDITOR' ? 'Seleccione proveedor:' :
                    roleData.role === 'EMPRESA' ? 'Seleccione empresa:' : 'Seleccione entidad:'}
              </p>
              <Dropdown
                value={selectedOption}
                options={options}
                onChange={(e) => setSelectedOption(e.value)}
                placeholder="Seleccioná..."
                className="w-full p-inputtext-sm"
                pt={{
                  root: { className: 'h-9 items-center border-secondary/20' }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Botón de Acción Lateral (Full Height) */}
      <div
        className={`w-16 flex items-center justify-center transition-all duration-300 ${theme.solidBg} opacity-75 group-hover:opacity-100 group-hover:brightness-90 flex-shrink-0`}
        onClick={(e) => confirmSelection(e)}
      >
        <i className="pi pi-arrow-right text-white text-xl group-hover:translate-x-1 transition-transform"></i>
      </div>
    </div>
  );
};


const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Recuperamos los datos pasados desde el Login
  const { roles, user } = location.state || {
    roles: [],
    user: 'Usuario'
  };

  const handleRoleSelect = (selectedContext) => {
    console.log("Contexto seleccionado:", selectedContext);
    // Guardar en localStorage como ejemplo
    try {
      localStorage.setItem('currentRole', JSON.stringify({
        role: selectedContext.role,
        roleId: selectedContext.roleId,
        entity: selectedContext.selectedEntity
      }));
    } catch (err) {
      console.warn('No se pudo guardar en localStorage:', err);
    }

    // Redirigir al dashboard (puedes enviar state si querés)
    navigate('/dashboard', { state: { selectedContext } });
  };

  return (
    <div className="min-h-screen bg-secondary-light flex flex-col items-center justify-center p-4 relative">
      <button
        onClick={() => navigate('/login')}
        className="absolute top-6 left-6 text-secondary hover:text-danger text-sm font-medium flex items-center gap-2 transition-colors"
      >
        <i className="pi pi-arrow-left"></i> Cerrar Sesión
      </button>

      <div className="w-full max-w-5xl animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 shadow-sm flex items-center justify-center border border-secondary/10">
            <span className="font-bold text-2xl text-primary">BP</span>
          </div>
          <h2 className="text-3xl font-extrabold text-secondary-dark mb-2">Hola, {user}</h2>
          <p className="text-secondary">Detectamos múltiples perfiles asociados a tu cuenta.<br />Selecciona con cuál deseas operar hoy.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

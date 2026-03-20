import React from 'react';

const formatDate = (val) => {
    if (!val || typeof val !== 'string') return val;
    const [y, m, d] = val.split('T')[0].split('-');
    return `${d}/${m}/${y}`;
};

const Field = ({ label, value }) => {
    if (!value && value !== 0) return null;
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-secondary/50 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-medium text-secondary-dark">{value}</span>
        </div>
    );
};

const Section = ({ title, children }) => (
    <div className="flex flex-col gap-3">
        <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest border-b border-secondary/10 pb-1">{title}</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {children}
        </div>
    </div>
);

const EmployeeDetail = ({ d }) => (
    <>
        <Section title="Datos Personales">
            <Field label="Nombre" value={[d.nombre, d.apellido].filter(Boolean).join(' ')} />
            <Field label="DNI" value={d.dni} />
            <Field label="CUIL" value={d.cuil} />
            <Field label="Género" value={d.genero === 'M' ? 'Masculino' : d.genero === 'F' ? 'Femenino' : d.genero} />
            <Field label="Fecha Nacimiento" value={formatDate(d.fechaNacimiento)} />
            <Field label="Teléfono" value={d.telefono} />
            <Field label="Provincia" value={d.provincia} />
            <Field label="Localidad" value={d.localidad} />
        </Section>
        <Section title="Asignación Laboral">
            <Field label="Categoría" value={d.categoria} />
            <Field label="Área" value={d.area} />
            <Field label="Servicio" value={d.servicio} />
            <Field label="Sindicato" value={d.sindicato} />
            <Field label="Convenio" value={d.convenio} />
            <Field label="Fecha Inicio" value={formatDate(d.fechaInicio)} />
            {d.esChofer && <Field label="Rol" value="Conductor habilitado" />}
        </Section>
    </>
);

const VehicleDetail = ({ d, activeDesc }) => (
    <>
        <Section title="Identificación">
            <Field label="Patente" value={d.patente} />
            <Field label="Marca" value={d.marca} />
            <Field label="Modelo" value={d.modelo} />
            <Field label="Año" value={d.anio} />
            <Field label="Tipo" value={activeDesc} />
            <Field label="Categoría" value={d.categoriaVehiculo} />
        </Section>
        <Section title="Características">
            <Field label="Combustible" value={d.tipoCombustible} />
            <Field label="Chasis" value={d.chasis} />
            <Field label="Motor" value={d.motor} />
            {d.capacidadCarga && <Field label="Cap. Carga" value={d.capacidadCarga} />}
            {d.cantidadAsientos && <Field label="Asientos" value={d.cantidadAsientos} />}
            <Field label="GNC" value={d.tieneGNC ? 'Sí' : d.tieneGNC === false ? 'No' : null} />
        </Section>
        {d.tieneChofer && d.choferAsignado && (
            <Section title="Conductor">
                <Field label="Nombre" value={[d.choferAsignado.nombre, d.choferAsignado.apellido].filter(Boolean).join(' ')} />
                <Field label="DNI" value={d.choferAsignado.dni} />
            </Section>
        )}
    </>
);

const MachineryDetail = ({ d, activeDesc }) => (
    <>
        <Section title="Identificación">
            <Field label="Tipo" value={activeDesc} />
            <Field label="Marca" value={d.marca} />
            <Field label="Modelo" value={d.modelo} />
            <Field label="Año" value={d.anio} />
            <Field label="Patente / Serie" value={d.patente} />
        </Section>
        <Section title="Características">
            <Field label="Chasis" value={d.chasis} />
            <Field label="Motor" value={d.motor} />
            {d.datos?.toneladas && <Field label="Toneladas" value={d.datos.toneladas} />}
            <Field label="GNC" value={d.tieneGNC ? 'Sí' : d.tieneGNC === false ? 'No' : null} />
        </Section>
        {d.tieneChofer && d.choferAsignado && (
            <Section title="Operador">
                <Field label="Nombre" value={[d.choferAsignado.nombre, d.choferAsignado.apellido].filter(Boolean).join(' ')} />
                <Field label="DNI" value={d.choferAsignado.dni} />
            </Section>
        )}
    </>
);

const typeConfig = {
    employees: { label: 'Empleado', icon: 'pi-user', color: 'bg-blue-50 text-blue-500' },
    vehicles:  { label: 'Vehículo', icon: 'pi-car',  color: 'bg-emerald-50 text-emerald-500' },
    machinery: { label: 'Maquinaria', icon: 'pi-cog', color: 'bg-amber-50 text-amber-500' },
};

const ResourceDetailContent = ({ el, type, isAuditorOrAdmin, onNavigateSupplier, onNavigateDocs, onClose }) => {
    const d = el.data || {};
    const cfg = typeConfig[type] || typeConfig.employees;
    const activeDesc = el.active?.description || '';

    const machineryBrandModel = [d.marca, d.modelo].filter(v => typeof v === 'string' && v.trim()).join(' ');
    const title = type === 'employees'
        ? [d.nombre, d.apellido].filter(Boolean).join(' ') || activeDesc
        : type === 'vehicles'
            ? d.patente || activeDesc
            : activeDesc || machineryBrandModel || 'Maquinaria';

    const subtitle = type === 'employees'
        ? d.dni ? `DNI ${d.dni}` : activeDesc
        : type === 'vehicles'
            ? [d.marca, d.modelo].filter(Boolean).join(' ')
            : machineryBrandModel || '';

    return (
        <div className="flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-start gap-4 p-6 pb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                    <i className={`pi ${cfg.icon} text-xl`}></i>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest mb-0.5">{cfg.label}</p>
                    <h3 className="font-black text-secondary-dark text-lg leading-tight truncate">{title}</h3>
                    {subtitle && <p className="text-xs text-secondary mt-0.5">{subtitle}</p>}
                </div>
                <button onClick={onClose} className="text-secondary/40 hover:text-secondary transition-colors mt-0.5 shrink-0">
                    <i className="pi pi-times text-sm"></i>
                </button>
            </div>

            {/* Proveedor (solo para admin/auditor) */}
            {isAuditorOrAdmin && el.proveedor && (
                <div className="mx-6 mb-4 flex items-center justify-between gap-3 bg-slate-50 border border-secondary/10 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <i className="pi pi-building text-secondary/40 text-sm shrink-0"></i>
                        <div className="min-w-0">
                            <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest">Proveedor</p>
                            <p className="text-sm font-semibold text-secondary-dark truncate">{el.proveedor}</p>
                        </div>
                    </div>
                    {el.proveedorCuit && (
                        <button
                            onClick={() => onNavigateSupplier(el.proveedorCuit)}
                            className="shrink-0 text-[10px] font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                        >
                            <i className="pi pi-arrow-right text-[9px]"></i> Ver proveedor
                        </button>
                    )}
                </div>
            )}

            <div className="w-full h-px bg-secondary/10 mx-0"></div>

            {/* Body */}
            <div className="flex flex-col gap-5 p-6 overflow-y-auto flex-1 min-h-0">
                {type === 'employees' && <EmployeeDetail d={d} />}
                {type === 'vehicles'  && <VehicleDetail  d={d} activeDesc={activeDesc} />}
                {type === 'machinery' && <MachineryDetail d={d} activeDesc={activeDesc} />}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center gap-3 px-6 py-4 bg-secondary-light/20 border-t border-secondary/10 rounded-b-2xl">
                <button
                    onClick={onNavigateDocs}
                    className="text-secondary-dark text-xs font-bold flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                    <i className="pi pi-file text-xs"></i> Ver documentación
                </button>
                <button
                    onClick={onClose}
                    className="bg-white border border-secondary/20 hover:bg-secondary-light text-secondary-dark px-5 py-2 rounded-lg font-bold transition-all text-sm"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
};

export default ResourceDetailContent;

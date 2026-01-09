import React, { useState, useEffect } from 'react';

/* --- 1. IMPORTACIONES DE PRIMEREACT --- */
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';

/* --- 2. UI KIT TIPO FLOWBITE --- */

const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-6 border-b border-gray-200 pb-4">
    <h3 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h3>
    <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
  </div>
);

const Label = ({ children, required }) => (
  <label className="block mb-2 text-sm font-medium text-gray-900">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const Input = ({ label, icon, ...props }) => (
  <div className="w-full">
    {label && <Label>{label}</Label>}
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-gray-500">
          <i className={`pi ${icon}`}></i>
        </div>
      )}
      <input
        {...props}
        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-all ${icon ? 'ps-10' : ''} ${props.disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
      />
    </div>
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="w-full">
    {label && <Label>{label}</Label>}
    <select
      {...props}
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none"
    >
      {options.map((opt, i) => <option key={i}>{opt}</option>)}
    </select>
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <label className="inline-flex items-center cursor-pointer group">
    <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    <span className="ms-3 text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
  </label>
);

const SidebarItem = ({ icon, label, active, badge, onClick }) => (
  <li>
    <button onClick={onClick} className={`w-full flex items-center p-3 rounded-lg group transition-all duration-200 ${active ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}>
      <i className={`pi ${icon} w-5 h-5 transition duration-75 ${active ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'}`}></i>
      <span className="ms-3 font-medium">{label}</span>
      {badge && <span className="inline-flex items-center justify-center px-2 ms-3 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">{badge}</span>}
    </button>
  </li>
);

/* --- 3. PÁGINAS (VISTAS) --- */

// PÁGINA 1: FORMULARIO (Nuevo Proveedor)
const NewProviderPage = () => {
  const [empleador, setEmpleador] = useState(true);
  const steps = ['Proveedor', 'Ubicación', 'Contacto', 'Documentos'];

  return (
    <div className="animate-fade-in w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Nuevo Proveedor</h1>
          <p className="text-gray-500 mt-1">Complete la información fiscal y operativa.</p>
        </div>
        <div className="flex gap-3">
          <button className="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium rounded-lg text-sm px-5 py-2.5 shadow-sm transition-all">
            Guardar Borrador
          </button>
          <button className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 shadow-lg shadow-blue-700/30 transition-all flex items-center gap-2">
            <i className="pi pi-save"></i> Guardar
          </button>
        </div>
      </div>

      <ol className="flex items-center w-full mb-10 text-sm font-medium text-center text-gray-500 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        {steps.map((step, index) => (
          <li key={index} className={`flex md:w-full items-center ${index < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10" : ""} ${index === 0 ? 'text-blue-600' : ''}`}>
            <span className="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200">
              {index === 0 ? (
                <span className="mr-2 w-6 h-6 rounded-full flex items-center justify-center border border-blue-600 bg-blue-600 text-white">1</span>
              ) : (
                <span className="mr-2 w-6 h-6 rounded-full flex items-center justify-center border border-gray-300">{index + 1}</span>
              )}
              {step}
            </span>
          </li>
        ))}
      </ol>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-8">
          <SectionTitle title="Datos Fiscales" subtitle="Información registrada ante AFIP." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Input label="Razón Social" defaultValue="" placeholder="Ingrese Razón Social" />
            <Input label="CUIT" icon="pi-id-card" placeholder="XX-XXXXXXXX-X" />
            <Input label="Nombre de Fantasía" placeholder="Nombre comercial" />
            <Input label="Tipo de Persona" value="JURIDICA" disabled />
            <div className="w-full">
              <Label>Grupo</Label>
              <Select options={['Seleccione...', 'MANTENIMIENTO', 'TI', 'SEGURIDAD']} />
            </div>
          </div>
          <SectionTitle title="Contacto y Operaciones" subtitle="Datos para la gestión diaria." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input label="Email Corporativo" icon="pi-envelope" placeholder="contacto@empresa.com" />
            <Input label="Teléfono" icon="pi-phone" placeholder="+54 11 ..." />
            <Select label="Rubro Principal" options={['Seleccione...', 'Mantenimiento', 'Limpieza', 'Seguridad', 'Logística']} />
            <div className="w-full">
              <Label>Nivel de Riesgo</Label>
              <div className="relative">
                <input className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" value="A DEFINIR" readOnly />
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <Toggle label="¿Es Empleador ante AFIP?" checked={empleador} onChange={() => setEmpleador(!empleador)} />
            <Toggle label="¿Contratación Temporal?" checked={false} onChange={() => { }} />
          </div>
        </div>
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-between items-center">
          <button className="text-gray-500 hover:text-red-600 font-medium text-sm transition-colors">Cancelar operación</button>
          <div className="flex gap-3">
            <button className="text-white bg-gray-900 hover:bg-black font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center gap-2 shadow-md transition-all">Siguiente Paso <i className="pi pi-arrow-right"></i></button>
          </div>
        </div>
      </div>
    </div>
  );
};

// PÁGINA 2: PROVEEDORES / CONTRATISTAS (Tabla Completa)
// const ProvidersPage = () => {
//   const [filters, setFilters] = useState(null);
//   const [globalFilterValue, setGlobalFilterValue] = useState('');
//   const [expandedRows, setExpandedRows] = useState(null);

//   // DATOS (Mismos datos)
//   const [proveedores] = useState([
//     { id: 75, razonSocial: 'PAEZ BRAIAN ANDRES', cuit: '20-37202708-9', servicio: 'MANTENIMIENTO', grupo: 'DISTRIBUCIÓN', accesoHabilitado: 'NO', riesgo: 'RIESGO ALTO', esTemporal: 'No', estado: 'SIN COMPLETAR', empleadorAFIP: 'Si', facturasAPOC: 'No', altaSistema: '04/11/2025', bajaSistema: '', inhabilitadoEl: '', motivo: 'Falta documentación crítica' },
//     { id: 76, razonSocial: 'SEGURIDAD TOTAL S.A.', cuit: '30-55555555-1', servicio: 'VIGILANCIA', grupo: 'COMERCIAL', accesoHabilitado: 'SI', riesgo: 'RIESGO MEDIO', esTemporal: 'No', estado: 'ACTIVO', empleadorAFIP: 'Si', facturasAPOC: 'No', altaSistema: '10/01/2024', bajaSistema: '', inhabilitadoEl: '', motivo: '' },
//     { id: 77, razonSocial: 'LIMPIEZA EXPRESS SRL', cuit: '30-12345678-9', servicio: 'LIMPIEZA DE OFICINAS', grupo: 'SERVICIOS GENERALES', accesoHabilitado: 'NO', riesgo: 'RIESGO BAJO', esTemporal: 'Si', estado: 'DADO DE BAJA', empleadorAFIP: 'Si', facturasAPOC: 'No', altaSistema: '01/03/2023', bajaSistema: '01/12/2023', inhabilitadoEl: '01/12/2023', motivo: 'Fin de contrato' },
//     {
//       id: 78,
//       razonSocial: 'TECH SOLUTIONS GLOBAL',
//       cuit: '33-70707070-4',
//       servicio: 'BAREMO/MANTENIMIENTO TI',
//       grupo: 'TI',
//       accesoHabilitado: 'SI',
//       riesgo: 'RIESGO BAJO',
//       esTemporal: 'No',
//       estado: 'ACTIVO',
//       empleadorAFIP: 'Si',
//       facturasAPOC: 'No',
//       altaSistema: '15/06/2024',
//       bajaSistema: '',
//       inhabilitadoEl: '',
//       motivo: ''
//     },
//     {
//       id: 79,
//       razonSocial: 'LOPEZ MARIA EUGENIA',
//       cuit: '27-28282828-3',
//       servicio: 'CALLCENTER',
//       grupo: 'RR.HH.',
//       accesoHabilitado: 'SI',
//       riesgo: 'RIESGO MEDIO',
//       esTemporal: 'Si',
//       estado: 'SUSPENDIDO',
//       empleadorAFIP: 'No',
//       facturasAPOC: 'No',
//       altaSistema: '20/02/2025',
//       bajaSistema: '',
//       inhabilitadoEl: '05/03/2025',
//       motivo: 'Seguro de accidentes vencido'
//     },
//     {
//       id: 80,
//       razonSocial: 'CONSTRUCTORA DEL NORTE S.A.',
//       cuit: '30-60606060-9',
//       servicio: 'INVERSION Y MANTENIMIENTO',
//       grupo: 'EMPRESAS GRUPO',
//       accesoHabilitado: 'NO',
//       riesgo: 'RIESGO ALTO',
//       esTemporal: 'No',
//       estado: 'SIN COMPLETAR',
//       empleadorAFIP: 'Si',
//       facturasAPOC: 'Si',
//       altaSistema: '01/01/2025',
//       bajaSistema: '',
//       inhabilitadoEl: '',
//       motivo: 'Detectada factura APOC en validación'
//     },
//     {
//       id: 81,
//       razonSocial: 'FLOTA RÁPIDA LOGÍSTICA',
//       cuit: '30-44444444-2',
//       servicio: 'MOVILES Y EQUIPOS',
//       grupo: 'DISTRIBUCIÓN',
//       accesoHabilitado: 'SI',
//       riesgo: 'RIESGO ALTO',
//       esTemporal: 'No',
//       estado: 'ACTIVO',
//       empleadorAFIP: 'Si',
//       facturasAPOC: 'No',
//       altaSistema: '11/11/2023',
//       bajaSistema: '',
//       inhabilitadoEl: '',
//       motivo: ''
//     },
//     {
//       id: 82,
//       razonSocial: 'CONSULTORA PERFILES',
//       cuit: '30-99887766-1',
//       servicio: 'BAREMO',
//       grupo: 'RR.HH.',
//       accesoHabilitado: 'SI',
//       riesgo: 'RIESGO BAJO',
//       esTemporal: 'Si',
//       estado: 'ACTIVO',
//       empleadorAFIP: 'Si',
//       facturasAPOC: 'No',
//       altaSistema: '05/05/2024',
//       bajaSistema: '',
//       inhabilitadoEl: '',
//       motivo: ''
//     },
//     {
//       id: 83,
//       razonSocial: 'HERRERA JUAN CARLOS',
//       cuit: '20-11223344-5',
//       servicio: 'SERVICIO TÉCNICO',
//       grupo: 'UNIPERSONAL',
//       accesoHabilitado: 'NO',
//       riesgo: 'RIESGO MEDIO',
//       esTemporal: 'No',
//       estado: 'DADO DE BAJA',
//       empleadorAFIP: 'No',
//       facturasAPOC: 'No',
//       altaSistema: '10/10/2022',
//       bajaSistema: '15/01/2023',
//       inhabilitadoEl: '15/01/2023',
//       motivo: 'Abandono de servicio'
//     },
//     {
//       id: 84,
//       razonSocial: 'AUTOS DEL SUR S.A.',
//       cuit: '33-55667788-9',
//       servicio: 'ALQUILER DE VEHICULOS',
//       grupo: 'SERVICIOS GENERALES',
//       accesoHabilitado: 'SI',
//       riesgo: 'RIESGO MEDIO',
//       esTemporal: 'No',
//       estado: 'SUSPENDIDO',
//       empleadorAFIP: 'Si',
//       facturasAPOC: 'No',
//       altaSistema: '01/08/2024',
//       bajaSistema: '',
//       inhabilitadoEl: '02/09/2024',
//       motivo: 'Falta VTV actualizada de flota'
//     }
//   ]);

//   const servicios = ['ALQUILER DE VEHICULOS', 'BAREMO', 'CALLCENTER', 'INVERSION Y MANTENIMIENTO', 'LIMPIEZA DE OFICINAS', 'MANTENIMIENTO', 'VIGILANCIA', 'MOVILES Y EQUIPOS'];
//   const grupos = ['COMERCIAL', 'DISTRIBUCIÓN', 'EMPRESAS GRUPO', 'RR.HH.', 'SERVICIO TÉCNICO', 'SERVICIOS GENERALES', 'TI', 'UNIPERSONAL'];
//   const estadoOptions = ['ACTIVO', 'DADO DE BAJA', 'SIN COMPLETAR', 'SUSPENDIDO'];
//   const opcionesSiNo = ['SI', 'NO'];

//   useEffect(() => { initFilters(); }, []);

//   const initFilters = () => {
//     setFilters({
//       global: { value: null, matchMode: FilterMatchMode.CONTAINS },
//       razonSocial: { value: null, matchMode: FilterMatchMode.CONTAINS },
//       cuit: { value: null, matchMode: FilterMatchMode.CONTAINS },
//       servicio: { value: null, matchMode: FilterMatchMode.EQUALS },
//       grupo: { value: null, matchMode: FilterMatchMode.EQUALS },
//       estado: { value: null, matchMode: FilterMatchMode.EQUALS },
//       accesoHabilitado: { value: null, matchMode: FilterMatchMode.EQUALS }
//     });
//     setGlobalFilterValue('');
//   };

//   const onGlobalFilterChange = (e) => {
//     const value = e.target.value;
//     let _filters = { ...filters };
//     _filters['global'].value = value;
//     setFilters(_filters);
//     setGlobalFilterValue(value);
//   };

//   // --- BADGES Y COMPONENTES VISUALES ---
//   const RiskBadge = ({ nivel }) => {
//     const colors = { 'RIESGO ALTO': 'bg-red-100 text-red-800 border-red-200', 'RIESGO MEDIO': 'bg-orange-100 text-orange-800 border-orange-200', 'RIESGO BAJO': 'bg-green-100 text-green-800 border-green-200' };
//     return <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${colors[nivel] || 'bg-gray-100'}`}>{nivel}</span>;
//   };

//   const BooleanBadge = ({ value, isAccess }) => {
//     const isYes = value?.toUpperCase() === 'SI' || value === 'Si';
//     let colorClass = isAccess ? (isYes ? 'bg-green-100 text-green-700 font-bold' : 'bg-red-100 text-red-700 font-bold') : (isYes ? 'text-blue-700 font-medium' : 'text-gray-600');
//     return <span className={`text-[10px] px-1.5 py-0.5 rounded ${colorClass}`}>{value?.toUpperCase()}</span>;
//   };

//   const StatusBadge = ({ status }) => {
//     const config = { 'ACTIVO': { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', border: 'border-green-200' }, 'SIN COMPLETAR': { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500', border: 'border-yellow-200' }, 'DADO DE BAJA': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' }, 'SUSPENDIDO': { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500', border: 'border-gray-200' } };
//     const style = config[status] || config['ACTIVO'];
//     return (
//       <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${style.bg} ${style.text} ${style.border}`}>
//         <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>{status}
//       </span>
//     );
//   };

//   const rowExpansionTemplate = (data) => (
//     <div className="bg-gray-50 border-t border-gray-200 p-4 shadow-inner animate-fade-in text-sm">
//       <div className="flex items-center gap-2 mb-3">
//         <i className="pi pi-id-card text-blue-600"></i>
//         <h5 className="font-bold text-gray-800">Ficha #{data.id}</h5>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <div className="space-y-2">
//           <h6 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Clasificación</h6>
//           <div><span className="block text-[10px] text-gray-500">Servicio</span><span className="font-medium text-gray-900">{data.servicio}</span></div>
//           <div><span className="block text-[10px] text-gray-500">Grupo</span><span className="font-medium text-gray-900">{data.grupo}</span></div>
//           <div><span className="block text-[10px] text-gray-500">Riesgo</span><RiskBadge nivel={data.riesgo} /></div>
//         </div>
//         <div className="space-y-2">
//           <h6 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estado</h6>
//           <div className="flex justify-between md:block"><span className="text-[10px] text-gray-500">Acceso</span><div className="mt-0.5"><BooleanBadge value={data.accesoHabilitado} isAccess={true} /></div></div>
//           <div className="flex justify-between md:block"><span className="text-[10px] text-gray-500">Temporal</span><div className="mt-0.5"><BooleanBadge value={data.esTemporal} /></div></div>
//           <div className="flex justify-between md:block"><span className="text-[10px] text-gray-500">APOC</span><div className="mt-0.5"><BooleanBadge value={data.facturasAPOC} /></div></div>
//         </div>
//         <div className="space-y-2">
//           <h6 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Historial</h6>
//           <div><span className="block text-[10px] text-gray-500">Alta</span><span className="font-mono text-gray-700">{data.altaSistema}</span></div>
//           {data.bajaSistema && <div><span className="block text-[10px] text-gray-500">Baja</span><span className="font-mono text-red-600">{data.bajaSistema}</span></div>}
//         </div>
//         <div className="space-y-2">
//           <h6 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Notas</h6>
//           <div><span className="block text-[10px] text-gray-500">Empleador AFIP</span><span className="font-medium text-gray-900">{data.empleadorAFIP}</span></div>
//           {data.motivo && <div className="bg-yellow-50 p-1.5 rounded border border-yellow-100"><p className="text-[10px] text-gray-700 italic">"{data.motivo}"</p></div>}
//         </div>
//       </div>
//     </div>
//   );

//   const renderHeader = () => (
//     <div className="flex flex-col md:flex-row justify-between items-center bg-white p-3 border-b border-gray-200 gap-3">
//       <div className="flex gap-2">
//         <button onClick={initFilters} className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline">Limpiar Filtros</button>
//       </div>
//       <div className="relative w-full md:w-auto">
//         <div className="absolute inset-y-0 start-0 flex items-center ps-2.5 pointer-events-none"><i className="pi pi-search text-gray-400 text-xs"></i></div>
//         <input type="text" value={globalFilterValue} onChange={onGlobalFilterChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-8 p-1.5 outline-none" placeholder="Buscar..." />
//       </div>
//     </div>
//   );

//   // Inputs de Filtros: Altura reducida (h-8) y padding mínimo
//   const createTextFilter = (options) => <InputText value={options.value || ''} onChange={(e) => options.filterApplyCallback(e.target.value)} placeholder="Filtrar..." unstyled className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:ring-blue-500 focus:border-blue-500 block w-full px-2 h-7 outline-none font-normal" />;

//   const createDropdownFilter = (options, list, placeholder = "Todos") => (
//     <Dropdown value={options.value} options={list} onChange={(e) => options.filterApplyCallback(e.value)} placeholder={placeholder} className="p-column-filter w-full"
//       pt={{
//         root: { className: 'w-full bg-gray-50 border border-gray-300 rounded h-7 flex items-center' },
//         input: { className: 'text-xs px-2 text-gray-900' },
//         trigger: { className: 'w-6 text-gray-500 flex items-center justify-center' },
//         panel: { className: 'text-xs' },
//         item: { className: 'p-2' }
//       }}
//     />
//   );

//   const customSortIcon = (options) => {
//     if (options.sorted) return options.sortOrder === 1 ? <i className="pi pi-arrow-up text-[10px] ml-1 text-blue-600"></i> : <i className="pi pi-arrow-down text-[10px] ml-1 text-blue-600"></i>;
//     return <i className="pi pi-sort-alt text-[10px] ml-1 text-gray-300 opacity-30"></i>;
//   };

//   const actionTemplate = () => (<div className="flex justify-center"><button className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded p-1.5 transition-colors"><i className="pi pi-ellipsis-v text-xs"></i></button></div>);
//   const header = renderHeader();

//   return (
//     <div className="animate-fade-in w-full">
//       <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-4">
//         <div>
//           <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Proveedores</h1>
//           <p className="text-gray-500 mt-1 text-sm">Base de datos de contratistas.</p>
//         </div>
//         <div className="flex gap-2 w-full md:w-auto">
//           <button className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-xs px-4 py-2 shadow-md transition-all flex items-center justify-center gap-2 w-full md:w-auto">
//             <i className="pi pi-plus text-xs"></i> <span className="hidden md:inline">Nuevo Proveedor</span><span className="md:hidden">Nuevo</span>
//           </button>
//         </div>
//       </div>

//       <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden w-full">
//         <DataTable
//           value={proveedores}
//           paginator
//           rows={5}
//           rowsPerPageOptions={[5, 10, 25, 50]}
//           header={header}
//           filters={filters}
//           filterDisplay="row"
//           globalFilterFields={['razonSocial', 'cuit', 'servicio', 'estado']}
//           emptyMessage="No se encontraron datos."
//           sortMode="multiple" removableSort
//           expandedRows={expandedRows}
//           onRowToggle={(e) => setExpandedRows(e.data)}
//           rowExpansionTemplate={rowExpansionTemplate}
//           dataKey="id"
//           sortIcon={customSortIcon}
//           size="small" // Tabla compacta nativa
//           stripedRows // Filas cebradas para lectura fácil
//           tableClassName="w-full text-sm text-left text-gray-500"

//           // ESTILOS AVANZADOS PARA COMPACTAR
//           pt={{
//             thead: { className: 'text-sm text-gray-700 uppercase bg-gray-50 border-b border-gray-200' },
//             // px-3 py-2 (antes py-3) -> Reduce altura de header
//             headerCell: { className: 'px-3 py-2 font-bold hover:bg-gray-100 transition-colors cursor-pointer focus:shadow-none align-top group' },
//             // px-3 py-1.5 (antes py-3) -> Reduce altura de filas
//             bodyCell: { className: 'px-3 py-1.5 align-middle' },
//             // Configuración del Paginador para hacerlo pequeño
//             paginator: {
//               root: { className: 'flex justify-between items-center p-2 border-t border-gray-200 text-sm' },
//               current: { className: 'h-8 leading-8' },
//               RPPDropdown: {
//                 root: { className: 'h-8 text-sm flex items-center bg-gray-50 border border-gray-300 rounded ml-2' },
//                 input: { className: 'p-1 text-sm' },
//                 trigger: { className: 'w-6' }
//               }
//             }
//           }}
//         >
//           <Column expander={true} style={{ width: '2rem' }} className="2xl:hidden" headerClassName="2xl:hidden" />

//           <Column field="id" header="#" sortable className="font-mono text-[10px] text-gray-400 w-10"></Column>
//           <Column field="razonSocial" header="Razón Social" sortable filter filterElement={createTextFilter} showFilterMenu={false} className="font-bold text-gray-900"></Column>
//           <Column field="cuit" header="CUIT" sortable filter filterElement={createTextFilter} showFilterMenu={false} className="font-mono text-[14px] hidden sm:table-cell" headerClassName="hidden sm:table-cell"></Column>
//           <Column field="servicio" header="Servicio" sortable filter filterElement={(opts) => createDropdownFilter(opts, servicios)} showFilterMenu={false} className="hidden lg:table-cell" headerClassName="hidden lg:table-cell"></Column>
//           <Column field="grupo" header="Grupo" sortable filter filterElement={(opts) => createDropdownFilter(opts, grupos)} showFilterMenu={false} className="hidden xl:table-cell" headerClassName="hidden xl:table-cell"></Column>
//           <Column field="estado" header="estado" sortable body={(d) => <StatusBadge status={d.estado} />} filter filterElement={(opts) => createDropdownFilter(opts, estadoOptions)} showFilterMenu={false} filterMenuStyle={{ width: '10rem' }}></Column>
//           <Column header="Acciones" body={actionTemplate} style={{ width: '50px', textAlign: 'center' }}></Column>
//         </DataTable>
//       </div>
//       <p className="mt-4 text-[10px] text-gray-400 text-center 2xl:hidden pb-4">
//         Toque la flecha para ver detalles.
//       </p>
//     </div>
//   );
// };
// PÁGINA 2: PROVEEDORES (CALIBRADO: Texto legible + Paginador compacto)
const ProvidersPage = () => {
  const [filters, setFilters] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [expandedRows, setExpandedRows] = useState(null);

  // DATOS
  const [proveedores] = useState([
    { id: 75, razonSocial: 'PAEZ BRAIAN ANDRES', cuit: '20-37202708-9', servicio: 'MANTENIMIENTO', grupo: 'DISTRIBUCIÓN', accesoHabilitado: 'NO', riesgo: 'RIESGO ALTO', esTemporal: 'No', estado: 'SIN COMPLETAR', empleadorAFIP: 'Si', facturasAPOC: 'No', altaSistema: '04/11/2025', bajaSistema: '', inhabilitadoEl: '', motivo: 'Falta documentación crítica' },
    { id: 76, razonSocial: 'SEGURIDAD TOTAL S.A.', cuit: '30-55555555-1', servicio: 'VIGILANCIA', grupo: 'COMERCIAL', accesoHabilitado: 'SI', riesgo: 'RIESGO MEDIO', esTemporal: 'No', estado: 'ACTIVO', empleadorAFIP: 'Si', facturasAPOC: 'No', altaSistema: '10/01/2024', bajaSistema: '', inhabilitadoEl: '', motivo: '' },
    { id: 77, razonSocial: 'LIMPIEZA EXPRESS SRL', cuit: '30-12345678-9', servicio: 'LIMPIEZA DE OFICINAS', grupo: 'SERVICIOS GENERALES', accesoHabilitado: 'NO', riesgo: 'RIESGO BAJO', esTemporal: 'Si', estado: 'DADO DE BAJA', empleadorAFIP: 'Si', facturasAPOC: 'No', altaSistema: '01/03/2023', bajaSistema: '01/12/2023', inhabilitadoEl: '01/12/2023', motivo: 'Fin de contrato' },
    { id: 78, razonSocial: 'TECH SOLUTIONS GLOBAL', cuit: '33-70707070-4', servicio: 'BAREMO/MANTENIMIENTO TI', grupo: 'TI', accesoHabilitado: 'SI', riesgo: 'RIESGO BAJO', esTemporal: 'No', estado: 'ACTIVO', empleadorAFIP: 'Si', facturasAPOC: 'No', altaSistema: '15/06/2024', bajaSistema: '', inhabilitadoEl: '', motivo: '' },
    { id: 79, razonSocial: 'LOPEZ MARIA EUGENIA', cuit: '27-28282828-3', servicio: 'CALLCENTER', grupo: 'RR.HH.', accesoHabilitado: 'SI', riesgo: 'RIESGO MEDIO', esTemporal: 'Si', estado: 'SUSPENDIDO', empleadorAFIP: 'No', facturasAPOC: 'No', altaSistema: '20/02/2025', bajaSistema: '', inhabilitadoEl: '05/03/2025', motivo: 'Seguro de accidentes vencido' },
    { id: 80, razonSocial: 'CONSTRUCTORA DEL NORTE S.A.', cuit: '30-60606060-9', servicio: 'INVERSION Y MANTENIMIENTO', grupo: 'EMPRESAS GRUPO', accesoHabilitado: 'NO', riesgo: 'RIESGO ALTO', esTemporal: 'No', estado: 'SIN COMPLETAR', empleadorAFIP: 'Si', facturasAPOC: 'Si', altaSistema: '01/01/2025', bajaSistema: '', inhabilitadoEl: '', motivo: 'Detectada factura APOC en validación' },
    { id: 81, razonSocial: 'FLOTA RÁPIDA LOGÍSTICA', cuit: '30-44444444-2', servicio: 'MOVILES Y EQUIPOS', grupo: 'DISTRIBUCIÓN', accesoHabilitado: 'SI', riesgo: 'RIESGO ALTO', esTemporal: 'No', estado: 'ACTIVO', empleadorAFIP: 'Si', facturasAPOC: 'No', altaSistema: '11/11/2023', bajaSistema: '', inhabilitadoEl: '', motivo: '' },
    { id: 82, razonSocial: 'CONSULTORA PERFILES', cuit: '30-99887766-1', servicio: 'BAREMO', grupo: 'RR.HH.', accesoHabilitado: 'SI', riesgo: 'RIESGO BAJO', esTemporal: 'Si', estado: 'ACTIVO', empleadorAFIP: 'Si', facturasAPOC: 'No', altaSistema: '05/05/2024', bajaSistema: '', inhabilitadoEl: '', motivo: '' },
    { id: 83, razonSocial: 'HERRERA JUAN CARLOS', cuit: '20-11223344-5', servicio: 'SERVICIO TÉCNICO', grupo: 'UNIPERSONAL', accesoHabilitado: 'NO', riesgo: 'RIESGO MEDIO', esTemporal: 'No', estado: 'DADO DE BAJA', empleadorAFIP: 'No', facturasAPOC: 'No', altaSistema: '10/10/2022', bajaSistema: '15/01/2023', inhabilitadoEl: '15/01/2023', motivo: 'Abandono de servicio' },
    { id: 84, razonSocial: 'AUTOS DEL SUR S.A.', cuit: '33-55667788-9', servicio: 'ALQUILER DE VEHICULOS', grupo: 'SERVICIOS GENERALES', accesoHabilitado: 'SI', riesgo: 'RIESGO MEDIO', esTemporal: 'No', estado: 'SUSPENDIDO', empleadorAFIP: 'Si', facturasAPOC: 'No', altaSistema: '01/08/2024', bajaSistema: '', inhabilitadoEl: '02/09/2024', motivo: 'Falta VTV actualizada de flota' }
  ]);

  const servicios = ['ALQUILER DE VEHICULOS', 'BAREMO', 'CALLCENTER', 'INVERSION Y MANTENIMIENTO', 'LIMPIEZA DE OFICINAS', 'MANTENIMIENTO', 'VIGILANCIA', 'MOVILES Y EQUIPOS'];
  const grupos = ['COMERCIAL', 'DISTRIBUCIÓN', 'EMPRESAS GRUPO', 'RR.HH.', 'SERVICIO TÉCNICO', 'SERVICIOS GENERALES', 'TI', 'UNIPERSONAL'];
  const estadoOptions = ['ACTIVO', 'DADO DE BAJA', 'SIN COMPLETAR', 'SUSPENDIDO'];
  const opcionesSiNo = ['SI', 'NO'];

  useEffect(() => { initFilters(); }, []);

  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      razonSocial: { value: null, matchMode: FilterMatchMode.CONTAINS },
      cuit: { value: null, matchMode: FilterMatchMode.CONTAINS },
      servicio: { value: null, matchMode: FilterMatchMode.EQUALS },
      grupo: { value: null, matchMode: FilterMatchMode.EQUALS },
      estado: { value: null, matchMode: FilterMatchMode.EQUALS },
      accesoHabilitado: { value: null, matchMode: FilterMatchMode.EQUALS }
    });
    setGlobalFilterValue('');
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  // --- BADGES ---
  const RiskBadge = ({ nivel }) => {
    const colors = { 'RIESGO ALTO': 'bg-red-100 text-red-800 border-red-200', 'RIESGO MEDIO': 'bg-orange-100 text-orange-800 border-orange-200', 'RIESGO BAJO': 'bg-green-100 text-green-800 border-green-200' };
    return <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${colors[nivel] || 'bg-gray-100'}`}>{nivel}</span>;
  };

  const BooleanBadge = ({ value, isAccess }) => {
    const isYes = value?.toUpperCase() === 'SI' || value === 'Si';
    let colorClass = isAccess ? (isYes ? 'bg-green-100 text-green-700 font-bold' : 'bg-red-100 text-red-700 font-bold') : (isYes ? 'text-blue-700 font-medium' : 'text-gray-600');
    return <span className={`text-[11px] px-2 py-0.5 rounded ${colorClass}`}>{value?.toUpperCase()}</span>;
  };

  const StatusBadge = ({ status }) => {
    const config = { 'ACTIVO': { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', border: 'border-green-200' }, 'SIN COMPLETAR': { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500', border: 'border-yellow-200' }, 'DADO DE BAJA': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' }, 'SUSPENDIDO': { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500', border: 'border-gray-200' } };
    const style = config[status] || config['ACTIVO'];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${style.bg} ${style.text} ${style.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>{status}
      </span>
    );
  };

  const rowExpansionTemplate = (data) => (
    <div className="bg-gray-50 border-t border-gray-200 p-4 shadow-inner animate-fade-in text-sm">
      <div className="flex items-center gap-2 mb-3">
        <i className="pi pi-id-card text-blue-600"></i>
        <h5 className="font-bold text-gray-800">Ficha del Proveedor #{data.id}</h5>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <h6 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Clasificación</h6>
          <div><span className="block text-[10px] text-gray-500">Servicio</span><span className="font-medium text-gray-900">{data.servicio}</span></div>
          <div><span className="block text-[10px] text-gray-500">Grupo</span><span className="font-medium text-gray-900">{data.grupo}</span></div>
          <div><span className="block text-[10px] text-gray-500">Riesgo</span><RiskBadge nivel={data.riesgo} /></div>
        </div>
        <div className="space-y-2">
          <h6 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estado</h6>
          <div className="flex justify-between md:block"><span className="text-[10px] text-gray-500">Acceso</span><div className="mt-0.5"><BooleanBadge value={data.accesoHabilitado} isAccess={true} /></div></div>
          <div className="flex justify-between md:block"><span className="text-[10px] text-gray-500">Temporal</span><div className="mt-0.5"><BooleanBadge value={data.esTemporal} /></div></div>
          <div className="flex justify-between md:block"><span className="text-[10px] text-gray-500">APOC</span><div className="mt-0.5"><BooleanBadge value={data.facturasAPOC} /></div></div>
        </div>
        <div className="space-y-2">
          <h6 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Historial</h6>
          <div><span className="block text-[10px] text-gray-500">Alta</span><span className="font-mono text-gray-700">{data.altaSistema}</span></div>
          {data.bajaSistema && <div><span className="block text-[10px] text-gray-500">Baja</span><span className="font-mono text-red-600">{data.bajaSistema}</span></div>}
        </div>
        <div className="space-y-2">
          <h6 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Notas</h6>
          <div><span className="block text-[10px] text-gray-500">Empleador AFIP</span><span className="font-medium text-gray-900">{data.empleadorAFIP}</span></div>
          {data.motivo && <div className="bg-yellow-50 p-1.5 rounded border border-yellow-100"><p className="text-[11px] text-gray-700 italic">"{data.motivo}"</p></div>}
        </div>
      </div>
    </div>
  );

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-center bg-white p-3 border-b border-gray-200 gap-3">
      <div className="flex gap-2">
        <button onClick={initFilters} className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline">Limpiar Filtros</button>
      </div>
      <div className="relative w-full md:w-auto">
        <div className="absolute inset-y-0 start-0 flex items-center ps-2.5 pointer-events-none"><i className="pi pi-search text-gray-400 text-xs"></i></div>
        <input type="text" value={globalFilterValue} onChange={onGlobalFilterChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-8 p-1.5 outline-none" placeholder="Buscar..." />
      </div>
    </div>
  );

  // Inputs de Filtros: Ajustados a text-sm para leer mejor
  const createTextFilter = (options) => <InputText value={options.value || ''} onChange={(e) => options.filterApplyCallback(e.target.value)} placeholder="Filtrar..." unstyled className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full px-2 h-8 outline-none font-normal" />;
  
  const createDropdownFilter = (options, list, placeholder = "Todos") => (
    <Dropdown value={options.value} options={list} onChange={(e) => options.filterApplyCallback(e.value)} placeholder={placeholder} className="p-column-filter w-full"
      pt={{
        root: { className: 'w-full bg-gray-50 border border-gray-300 rounded h-8 flex items-center' },
        input: { className: 'text-sm px-2 text-gray-900' },
        trigger: { className: 'w-6 text-gray-500 flex items-center justify-center' },
        panel: { className: 'text-sm' },
        item: { className: 'p-2' }
      }}
    />
  );

  const customSortIcon = (options) => {
    if (options.sorted) return options.sortOrder === 1 ? <i className="pi pi-arrow-up text-[10px] ml-1 text-blue-600"></i> : <i className="pi pi-arrow-down text-[10px] ml-1 text-blue-600"></i>;
    return <i className="pi pi-sort-alt text-[10px] ml-1 text-gray-300 opacity-30"></i>;
  };

  const actionTemplate = () => (<div className="flex justify-center"><button className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded p-1.5 transition-colors"><i className="pi pi-ellipsis-v text-xs"></i></button></div>);
  const header = renderHeader();

  return (
    <div className="animate-fade-in w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Proveedores</h1>
          <p className="text-gray-500 mt-1 text-xs">Base de datos de contratistas.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-xs px-4 py-2 shadow-md transition-all flex items-center justify-center gap-2 w-full md:w-auto">
            <i className="pi pi-plus"></i> <span className="hidden md:inline">Nuevo Proveedor</span><span className="md:hidden">Nuevo</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden w-full">
        <DataTable
          value={proveedores}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25, 50]}
          header={header}
          filters={filters}
          filterDisplay="row"
          globalFilterFields={['razonSocial', 'cuit', 'servicio', 'estado']}
          emptyMessage="No se encontraron datos."
          sortMode="multiple" removableSort
          expandedRows={expandedRows}
          onRowToggle={(e) => setExpandedRows(e.data)}
          rowExpansionTemplate={rowExpansionTemplate}
          dataKey="id"
          sortIcon={customSortIcon}
          size="small"
          stripedRows
          // AQUI: Cambiado a text-sm para mejor legibilidad
          tableClassName="w-full text-sm text-left text-gray-500"
          
          pt={{
            thead: { className: 'text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200' },
            // Padding un poco más relajado (py-2.5) para que no se vea apretado con text-sm
            headerCell: { className: 'px-3 py-2.5 font-bold hover:bg-gray-100 transition-colors cursor-pointer focus:shadow-none align-top group' },
            bodyRow: ({ context }) => ({ className: `border-b transition-colors` }),
            bodyCell: { className: 'px-3 py-2.5 align-middle' },
            
            // CONFIGURACION AGRESIVA DEL PAGINADOR PARA HACERLO PEQUEÑO
            paginator: {
              root: { className: 'flex justify-between items-center p-2 border-t border-gray-200 text-xs' },
              current: { className: 'h-8 leading-8' },
              RPPDropdown: {
                 root: { className: 'h-7 text-xs flex items-center bg-gray-50 border border-gray-300 rounded ml-2 focus:ring-2 focus:ring-blue-100' },
                 input: { className: 'p-1 text-xs font-medium' },
                 trigger: { className: 'w-6 flex items-center justify-center text-gray-500' },
                 panel: { className: 'text-xs bg-white border border-gray-200 shadow-lg rounded-md p-0' }, // Panel contenedor
                 item: { className: 'p-1.5 hover:bg-gray-100 cursor-pointer text-xs' }, // Items de la lista (5, 10...)
                 wrapper: { className: 'max-h-[200px]' }
              }
            }
          }}
        >
          <Column expander={true} style={{ width: '2rem' }} className="2xl:hidden" headerClassName="2xl:hidden" />
          
          <Column field="id" header="#" sortable className="font-mono text-sm text-gray-400 w-10"></Column>
          <Column field="razonSocial" header="Razón Social" sortable filter filterElement={createTextFilter} showFilterMenu={false} className="font-bold text-gray-900"></Column>
          <Column field="cuit" header="CUIT" sortable filter filterElement={createTextFilter} showFilterMenu={false} className="font-mono text-sm hidden sm:table-cell" headerClassName="hidden sm:table-cell"></Column>
          <Column field="servicio" header="Servicio" sortable filter filterElement={(opts) => createDropdownFilter(opts, servicios)} showFilterMenu={false} className="hidden lg:table-cell" headerClassName="hidden lg:table-cell"></Column>
          <Column field="grupo" header="Grupo" sortable filter filterElement={(opts) => createDropdownFilter(opts, grupos)} showFilterMenu={false} className="hidden xl:table-cell" headerClassName="hidden xl:table-cell"></Column>
          <Column field="estado" header="estado" sortable body={(d) => <StatusBadge status={d.estado} />} filter filterElement={(opts) => createDropdownFilter(opts, estadoOptions)} showFilterMenu={false} filterMenuStyle={{ width: '10rem' }}></Column>
          <Column header="Acciones" body={actionTemplate} style={{ width: '50px', textAlign: 'center' }}></Column>
        </DataTable>
      </div>
      <p className="mt-4 text-[10px] text-gray-400 text-center 2xl:hidden pb-4">
        Toque la flecha para ver detalles.
      </p>
    </div>
  );
};

/* --- 4. APP PRINCIPAL --- */

function App() {
  const [currentView, setCurrentView] = useState('proveedores');

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">

      {/* SIDEBAR */}
      <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r border-gray-200 hidden md:block transition-transform">
        <div className="h-full px-4 py-6 overflow-y-auto">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <i className="pi pi-chart-line font-bold"></i>
            </div>
            <span className="self-center text-xl font-bold whitespace-nowrap text-gray-800 tracking-tight">
              FlowTrack
            </span>
          </div>
          <ul className="space-y-2">
            <SidebarItem icon="pi-home" label="Inicio" />
            <SidebarItem icon="pi-user-plus" label="Nuevo" active={currentView === 'Nuevo Proveedor'} onClick={() => setCurrentView('Nuevo Proveedor')} />
            <SidebarItem icon="pi-users" label="Proveedores" active={currentView === 'proveedores'} onClick={() => setCurrentView('proveedores')} />
            <SidebarItem icon="pi-file" label="Documentos" badge="3" />
            <SidebarItem icon="pi-chart-bar" label="Reportes" />
          </ul>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen relative w-full">
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg px-4 py-3 w-full border-b border-gray-200 shadow-sm ring-1 ring-slate-900/5 md:border-b-0 md:rounded-xl md:shadow-md md:m-4 md:w-auto md:mx-6 transition-all">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span className="hover:text-blue-600 cursor-pointer hidden md:inline">Home</span>
              <i className="pi pi-chevron-right text-xs hidden md:inline"></i>
              <span className="font-medium text-gray-900 capitalize text-lg md:text-sm">{currentView}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex text-right flex-col leading-tight">
                <span className="font-bold text-gray-900 text-sm">Brian Paez</span>
                <span className="text-xs text-gray-500">Admin</span>
              </div>
              <img className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-white shadow-sm" src="https://ui-avatars.com/api/?name=Brian+Paez&background=0D8ABC&color=fff" alt="User" />
            </div>
          </div>
        </nav>

        {/* CONTENIDO */}
        <div className="p-3 lg:p-6 w-full max-w-full z-0">
          {currentView === 'Nuevo Proveedor' ? <NewProviderPage /> : <ProvidersPage />}
        </div>
      </main>
    </div>
  );
}

export default App;
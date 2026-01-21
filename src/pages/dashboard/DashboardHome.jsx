// import React, { useState, useEffect } from 'react';
// import { Chart } from 'primereact/chart';
// import { DataTable } from 'primereact/datatable';
// import { Column } from 'primereact/column';
// import { useNavigate } from 'react-router-dom';

// // --- COMPONENTE TARJETA (Adaptado a tu tailwind.config.js) ---
// const StatCard = ({ title, value, icon, type = 'primary', subtext }) => {
    
//     // Mapeamos tus tipos semánticos a las clases exactas de tu config
//     const styles = {
//         primary: { 
//             iconBg: 'bg-primary-light', 
//             iconText: 'text-primary', 
//             badgeBg: 'bg-primary-light', 
//             badgeText: 'text-primary-active' // Usamos active/hover para mejor lectura
//         },
//         success: { 
//             // ¡AQUÍ ESTÁ TU LIME!
//             iconBg: 'bg-success-light', 
//             iconText: 'text-success', 
//             badgeBg: 'bg-success-light', 
//             badgeText: 'text-success-hover' // Usamos el tono más oscuro del lime para leer mejor
//         },
//         warning: { 
//             iconBg: 'bg-warning-light', 
//             iconText: 'text-warning', 
//             badgeBg: 'bg-warning-light', 
//             badgeText: 'text-warning-hover' 
//         },
//         danger: { 
//             iconBg: 'bg-danger-light', 
//             iconText: 'text-danger', 
//             badgeBg: 'bg-danger-light', 
//             badgeText: 'text-danger-hover' 
//         },
//         info: { 
//             // Tu Sky
//             iconBg: 'bg-info-light', 
//             iconText: 'text-info', 
//             badgeBg: 'bg-info-light', 
//             badgeText: 'text-info-hover' 
//         },
//     };

//     const style = styles[type] || styles.primary;

//     return (
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary/10 hover:shadow-md transition-all relative overflow-hidden group">
//             <div className="flex justify-between items-start z-10 relative">
//                 <div>
//                     <p className="text-secondary text-sm font-medium mb-1 tracking-wide">{title}</p>
//                     <h3 className="text-3xl font-bold text-secondary-dark">{value}</h3>
//                 </div>
                
//                 {/* ICONO: Usa tus fondos 'light' y texto vibrante */}
//                 <div className={`p-3 rounded-xl ${style.iconBg} ${style.iconText} transition-transform group-hover:scale-110`}>
//                     <i className={`pi ${icon} text-xl`}></i>
//                 </div>
//             </div>
            
//             <div className="mt-5 flex items-center gap-2">
//                 {/* BADGE: Usa tus colores semánticos */}
//                 <span className={`text-xs font-bold px-2.5 py-1 rounded-md border border-transparent ${style.badgeBg} ${style.badgeText}`}>
//                     {subtext}
//                 </span>
//             </div>

//             {/* Decoración de fondo */}
//             <i className={`pi ${icon} absolute -bottom-5 -right-5 text-9xl opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none`}></i>
//         </div>
//     );
// };

// const DashboardHome = () => {
//     const navigate = useNavigate();
//     const [chartData, setChartData] = useState({});
//     const [chartOptions, setChartOptions] = useState({});

//     useEffect(() => {
//         // Colores extraídos de tu config para el gráfico
//         const limeColor = '#84cc16'; // Tu Success
//         const redColor = '#ef4444';  // Tu Danger
        
//         const documentStyle = getComputedStyle(document.documentElement);
//         const textColor = documentStyle.getPropertyValue('--text-color') || '#334155';
//         const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#64748b';
//         const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#e2e8f0';

//         const data = {
//             labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
//             datasets: [
//                 {
//                     label: 'Cumplimiento (Lime)',
//                     data: [65, 59, 80, 81, 86, 92],
//                     fill: true,
//                     borderColor: limeColor, // Línea Lime
//                     backgroundColor: 'rgba(132, 204, 22, 0.1)', // Fondo Lime muy suave
//                     tension: 0.4,
//                     pointBackgroundColor: '#ffffff',
//                     pointBorderColor: limeColor,
//                     pointBorderWidth: 2,
//                 },
//                 {
//                     label: 'Rechazos',
//                     data: [28, 48, 40, 19, 10, 5],
//                     fill: false,
//                     borderColor: redColor,
//                     borderDash: [5, 5],
//                     tension: 0.4,
//                     pointBackgroundColor: '#ffffff',
//                     pointBorderColor: redColor,
//                 }
//             ]
//         };

//         const options = {
//             maintainAspectRatio: false,
//             aspectRatio: 0.6,
//             plugins: { legend: { labels: { color: textColor, usePointStyle: true, boxWidth: 6 } } },
//             scales: {
//                 x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder, drawBorder: false } },
//                 y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder, drawBorder: false } }
//             },
//             interaction: { mode: 'index', intersect: false },
//         };

//         setChartData(data);
//         setChartOptions(options);
//     }, []);

//     // Datos Mock (Alertas)
//     const alertas = [
//         { id: 75, empresa: 'Seguridad Total S.A.', asunto: 'Seguro Vencido', fecha: 'Hoy', prioridad: 'ALTA' },
//         { id: 78, empresa: 'Limpieza Express', asunto: 'Falta F931', fecha: 'Ayer', prioridad: 'MEDIA' },
//         { id: 90, empresa: 'Tech Solutions', asunto: 'Nómina incompleta', fecha: '20 Ene', prioridad: 'BAJA' },
//     ];

//     const prioridadTemplate = (rowData) => {
//         // Usamos tus clases: bg-danger-light, text-danger, etc.
//         const colors = { 
//             'ALTA': 'bg-danger-light text-danger border-danger/20', 
//             'MEDIA': 'bg-warning-light text-warning border-warning/20', 
//             'BAJA': 'bg-info-light text-info border-info/20' 
//         };
//         return <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colors[rowData.prioridad]}`}>{rowData.prioridad}</span>;
//     };

//     const actionTemplate = (rowData) => (
//         <button 
//             onClick={() => navigate(`/proveedores/${rowData.id}`)}
//             className="text-secondary hover:text-primary transition-colors text-xs font-bold flex items-center justify-end w-full gap-1 group"
//             title="Ver detalles"
//         >
//             <span className="group-hover:underline">Ver</span> <i className="pi pi-arrow-right text-[10px]"></i>
//         </button>
//     );

//     return (
//         <div className="animate-fade-in space-y-8">
            
//             {/* --- HEADER --- */}
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-secondary/10 pb-6">
//                 <div>
//                     <h1 className="text-2xl font-extrabold text-secondary-dark tracking-tight">Tablero de Control</h1>
//                     <p className="text-secondary text-sm mt-1">Visión general del estado de cumplimiento.</p>
//                 </div>
//                 <div className="flex gap-3">
//                     <span className="bg-white border border-secondary/20 px-3 py-1.5 rounded-lg text-xs font-medium text-secondary shadow-sm flex items-center gap-2">
//                         {/* Usamos success (Lime) para el indicador de sistema */}
//                         <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span> Sistema Online
//                     </span>
//                     <button className="bg-secondary-dark text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg hover:bg-black transition-colors flex items-center gap-2">
//                         <i className="pi pi-file-pdf"></i> Reporte PDF
//                     </button>
//                 </div>
//             </div>

//             {/* --- TARJETAS KPIs (Con tu paleta) --- */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
//                 {/* 1. Proveedores -> PRIMARY (Indigo) */}
//                 <StatCard 
//                     title="Proveedores" 
//                     value="41" 
//                     icon="pi-briefcase" 
//                     type="primary"
//                     subtext="3 Inhabilitados" 
//                 />
                
//                 {/* 2. Empleados -> SUCCESS (Lime Eléctrico) */}
//                 <StatCard 
//                     title="Recursos Activos" 
//                     value="279" 
//                     icon="pi-users" 
//                     type="success"
//                     subtext="98% Documentación OK" 
//                 />

//                 {/* 3. Vehículos -> INFO (Sky) */}
//                 <StatCard 
//                     title="Flota Vehicular" 
//                     value="151" 
//                     icon="pi-car" 
//                     type="info"
//                     subtext="12 Vencimientos" 
//                 />

//                 {/* 4. Alertas -> WARNING (Amber) */}
//                 <StatCard 
//                     title="Inconsistencias" 
//                     value="22" 
//                     icon="pi-exclamation-triangle" 
//                     type="warning"
//                     subtext="Documentos Rechazados" 
//                 />
//             </div>

//             {/* --- GRÁFICOS Y TABLAS --- */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
//                 {/* Gráfico */}
//                 <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-secondary/20 shadow-sm">
//                     <div className="flex justify-between items-center mb-6">
//                         <h3 className="font-bold text-secondary-dark text-lg">Tendencia</h3>
//                         <div className="flex gap-2">
//                              {/* Referencias manuales con tus colores */}
//                              <span className="w-3 h-3 rounded-full bg-success"></span><span className="text-xs text-secondary">Cumplimiento</span>
//                              <span className="w-3 h-3 rounded-full bg-danger"></span><span className="text-xs text-secondary">Rechazos</span>
//                         </div>
//                     </div>
//                     <div className="h-[300px]">
//                         <Chart type="line" data={chartData} options={chartOptions} />
//                     </div>
//                 </div>

//                 {/* Alertas */}
//                 <div className="bg-white p-0 rounded-xl border border-secondary/20 shadow-sm flex flex-col overflow-hidden">
//                     <div className="p-5 border-b border-secondary/10 bg-gray-50/50 flex justify-between items-center">
//                         <h3 className="font-bold text-secondary-dark">Avisos Recientes</h3>
//                         <span className="text-xs bg-warning-light text-warning-hover px-2 py-0.5 rounded-full font-bold">3 Pendientes</span>
//                     </div>
                    
//                     <div className="p-2 flex-1">
//                         <DataTable value={alertas} className="text-sm" unstyled pt={{
//                             table: { className: 'w-full' },
//                             thead: { className: 'hidden' }, 
//                             bodyRow: { className: 'border-b border-secondary/5 last:border-0 hover:bg-gray-50 transition-colors' },
//                             bodyCell: { className: 'py-3 px-3' }
//                         }}>
//                             <Column body={(data) => (
//                                 <div>
//                                     <p className="font-bold text-secondary-dark text-xs mb-0.5">{data.empresa}</p>
//                                     <p className="text-secondary text-[10px]">{data.asunto}</p>
//                                 </div>
//                             )} />
//                             <Column body={prioridadTemplate} />
//                             <Column body={actionTemplate} className="text-right" />
//                         </DataTable>
//                     </div>

//                     <div className="p-3 bg-gray-50 border-t border-secondary/10">
//                         <button className="w-full py-2 text-center text-xs text-secondary hover:text-primary font-bold bg-white border border-secondary/20 rounded-lg hover:shadow-sm transition-all">
//                             Ver todas las alertas
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default DashboardHome;

import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useNavigate } from 'react-router-dom';

// --- TARJETA DEFINITIVA: AUDITORÍA + DISEÑO VISUAL ---
const StatCard = ({ title, value, icon, type = 'primary', footerLeft, footerRight }) => {
    
    // Estilos visuales (Iconos y Textos)
    const styles = {
        primary: { 
            iconBg: 'bg-primary-light', iconText: 'text-primary', 
            badgeBg: 'bg-primary-light', badgeText: 'text-primary-active',
        },
        success: { 
            iconBg: 'bg-success-light', iconText: 'text-success', 
            badgeBg: 'bg-success-light', badgeText: 'text-success-hover',
        },
        warning: { 
            iconBg: 'bg-warning-light', iconText: 'text-warning', 
            badgeBg: 'bg-warning-light', badgeText: 'text-warning-hover',
        },
        info: { 
            iconBg: 'bg-info-light', iconText: 'text-info', 
            badgeBg: 'bg-info-light', badgeText: 'text-info-hover',
        },
        danger: {
            iconBg: 'bg-danger-light', iconText: 'text-danger', 
            badgeBg: 'bg-danger-light', badgeText: 'text-danger',
        }
    };

    const style = styles[type] || styles.primary;

    return (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-secondary/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-default">
            
            {/* 1. CABECERA: Título, Valor e Ícono en Burbuja */}
            <div className="flex justify-between items-start z-10 relative mb-2">
                <div>
                    <p className="text-secondary text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-3xl font-extrabold text-secondary-dark">{value}</h3>
                </div>
                
                {/* La burbuja de color que te gustaba */}
                <div className={`p-3 rounded-xl ${style.iconBg} ${style.iconText} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <i className={`pi ${icon} text-xl`}></i>
                </div>
            </div>
            
            {/* 2. FOOTER DIVIDIDO: Datos de Auditoría */}
            <div className="flex items-center justify-between text-xs font-medium pt-4 mt-2 border-t border-secondary/5 relative z-10">
                <div className="flex items-center gap-1.5 text-secondary">
                   {footerLeft}
                </div>
                {/* Badge de Alerta (lado derecho) */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${style.badgeBg} ${style.badgeText}`}>
                   {footerRight}
                </div>
            </div>

            {/* 3. EFECTO DE FONDO (El que te gustaba) */}
            {/* Al hacer hover en la tarjeta (group-hover), este ícono pasa de opacidad 0.05 a 0.15 */}
            <i className={`pi ${icon} absolute -bottom-6 -right-6 text-9xl opacity-[0.05] group-hover:opacity-[0.15] group-hover:rotate-12 transition-all duration-500 pointer-events-none`}></i>
        </div>
    );
};

const DashboardHome = () => {
    const navigate = useNavigate();
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        const limeColor = '#84cc16'; // Success
        const redColor = '#ef4444';  // Danger
        const textColor = '#334155';
        const textColorSecondary = '#64748b';
        const surfaceBorder = '#e2e8f0';

        const data = {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Documentación Correcta',
                    data: [120, 135, 145, 160, 190, 210],
                    fill: true,
                    borderColor: limeColor,
                    backgroundColor: 'rgba(132, 204, 22, 0.05)', // Fondo muy suave
                    tension: 0.4,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: limeColor,
                    pointBorderWidth: 2,
                },
                {
                    label: 'Rechazos / Vencidos',
                    data: [15, 20, 12, 18, 10, 22],
                    fill: false,
                    borderColor: redColor,
                    borderDash: [5, 5],
                    tension: 0.4,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: redColor,
                }
            ]
        };

        const options = {
            maintainAspectRatio: false,
            aspectRatio: 0.6,
            plugins: { legend: { labels: { color: textColor, usePointStyle: true, boxWidth: 6 } } },
            scales: {
                x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder, drawBorder: false } },
                y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder, drawBorder: false } }
            },
            interaction: { mode: 'index', intersect: false },
        };

        setChartData(data);
        setChartOptions(options);
    }, []);

    // Datos Mock
    const alertas = [
        { id: 75, recurso: 'Camioneta Toyota Hilux', empresa: 'Tech Solutions', asunto: 'VTV Vencida', fecha: 'Hoy', estado: 'VENCIDO' },
        { id: 78, recurso: 'Juan Perez (Leg. 104)', empresa: 'Limpieza Express', asunto: 'Cert. de Cobertura Rechazado', fecha: 'Ayer', estado: 'RECHAZADO' },
        { id: 90, recurso: 'Alen & Dana S.R.L.', empresa: 'Alen & Dana', asunto: 'F931 Incompleto', fecha: '20 Ene', estado: 'FALTANTE' },
    ];

    const estadoTemplate = (rowData) => {
        const colors = { 
            'VENCIDO': 'bg-danger-light text-danger', 
            'RECHAZADO': 'bg-warning-light text-warning', 
            'FALTANTE': 'bg-secondary-light text-secondary-dark' 
        };
        return <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${colors[rowData.estado]}`}>{rowData.estado}</span>;
    };

    const actionTemplate = (rowData) => (
        <button 
            onClick={() => navigate(`/proveedores/${rowData.id}`)}
            className="text-secondary hover:text-primary transition-colors text-xs font-bold flex items-center justify-end w-full gap-1"
        >
            <i className="pi pi-search"></i>
        </button>
    );

    return (
        <div className="animate-fade-in space-y-8">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-secondary/10 pb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-secondary-dark tracking-tight">Tablero de Control</h1>
                    <p className="text-secondary text-sm mt-1">Estado de cumplimiento documental.</p>
                </div>
                <div className="flex gap-3">
                    <span className="bg-white border border-secondary/20 px-3 py-1.5 rounded-lg text-xs font-medium text-secondary shadow-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span> Auditoría Activa
                    </span>
                    <button className="bg-secondary-dark text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg hover:bg-black transition-colors flex items-center gap-2">
                        <i className="pi pi-download"></i> Exportar
                    </button>
                </div>
            </div>

            {/* --- KPIs VISUALES --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Proveedores (Indigo) */}
                <StatCard 
                    title="Empresas" 
                    value="41" 
                    icon="pi-briefcase" 
                    type="primary"
                    footerLeft={<span><i className="pi pi-check-circle text-success mr-1"></i>29 Al día</span>}
                    footerRight={<span><i className="pi pi-exclamation-circle mr-1"></i>12 Deben docs</span>}
                />
                
                {/* 2. Empleados (Lime) */}
                <StatCard 
                    title="Empleados" 
                    value="279" 
                    icon="pi-users" 
                    type="success"
                    footerLeft={<span><i className="pi pi-check text-success mr-1"></i>95% Cubiertos</span>}
                    footerRight={<span><i className="pi pi-user-minus mr-1"></i>14 Sin cobertura</span>}
                />

                {/* 3. Flota (Sky) */}
                <StatCard 
                    title="Flota Total" 
                    value="226" 
                    icon="pi-car" 
                    type="info"
                    footerLeft={<span><i className="pi pi-truck mr-1"></i>151 Veh / 75 Máq</span>}
                    footerRight={<span><i className="pi pi-clock mr-1"></i>8 Vencidos</span>}
                />

                {/* 4. Inconsistencias (Red) */}
                <StatCard 
                    title="Inconsistencias" 
                    value="22" 
                    icon="pi-file-excel" 
                    type="danger"
                    footerLeft={<span>Rechazados por auditor</span>}
                    footerRight={<span><i className="pi pi-arrow-up-right mr-1"></i>Alta Prioridad</span>}
                />
            </div>

            {/* --- SECCIÓN INFERIOR --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Gráfico */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-secondary/20 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-secondary-dark">Evolución Semestral</h3>
                        <span className="text-xs text-secondary bg-gray-100 px-2 py-1 rounded">Documentación</span>
                    </div>
                    <div className="h-[300px]">
                        <Chart type="line" data={chartData} options={chartOptions} />
                    </div>
                </div>

                {/* Tabla de Alertas */}
                <div className="bg-white p-0 rounded-xl border border-secondary/20 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-5 border-b border-secondary/10 bg-gray-50/30 flex justify-between items-center">
                        <h3 className="font-bold text-secondary-dark">Alertas Recientes</h3>
                        <span className="text-xs bg-danger-light text-danger px-2 py-0.5 rounded-full font-bold">3 Críticas</span>
                    </div>
                    
                    <div className="p-2 flex-1">
                        <DataTable value={alertas} className="text-sm" unstyled pt={{
                            table: { className: 'w-full' },
                            thead: { className: 'hidden' }, 
                            bodyRow: { className: 'border-b border-secondary/5 last:border-0 hover:bg-gray-50 transition-colors' },
                            bodyCell: { className: 'py-3 px-3' }
                        }}>
                            <Column body={(data) => (
                                <div>
                                    <p className="font-bold text-secondary-dark text-xs mb-0.5">{data.recurso}</p>
                                    <p className="text-secondary text-[10px]">{data.asunto} • <span className="font-medium text-secondary-dark">{data.empresa}</span></p>
                                </div>
                            )} />
                            <Column body={estadoTemplate} />
                            <Column body={actionTemplate} className="text-right" />
                        </DataTable>
                    </div>

                    <div className="p-3 bg-gray-50 border-t border-secondary/10">
                        <button className="w-full py-2 text-center text-xs text-secondary hover:text-primary font-bold bg-white border border-secondary/20 rounded-lg hover:shadow-sm transition-all">
                            Ver todas las inconsistencias
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
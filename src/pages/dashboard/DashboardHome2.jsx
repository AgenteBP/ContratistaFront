import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useNavigate } from 'react-router-dom';

// --- NUEVO DISEÑO: KPI CON COLOR SÓLIDO ---
const StatCard = ({ title, value, icon, color, subtext }) => (
    // 1. Usamos la prop 'color' (ej: bg-primary) para todo el fondo de la tarjeta
    // 2. Forzamos el texto a blanco (text-white)
    <div className={`${color} rounded-xl p-6 shadow-md hover:shadow-lg transition-all relative overflow-hidden text-white border border-white/10`}>
        
        <div className="flex justify-between items-start z-10 relative">
            <div>
                {/* Texto secundario con transparencia para que no compita con el número */}
                <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold">{value}</h3>
            </div>
            
            {/* Ícono en una burbuja semitransparente (Glassmorphism) */}
            <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm text-white shadow-inner">
                <i className={`pi ${icon} text-xl`}></i>
            </div>
        </div>
        
        <div className="mt-4 flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/20 text-white border border-white/10">
                {subtext}
            </span>
        </div>

        {/* Decoración de fondo gigante y sutil */}
        <i className={`pi ${icon} absolute -bottom-6 -right-6 text-9xl opacity-[0.15] pointer-events-none rotate-12`}></i>
    </div>
);

const DashboardHome = () => {
    const navigate = useNavigate();
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        // Configuración del gráfico (igual que antes)
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color') || '#334155';
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#64748b';
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#e2e8f0';

        const data = {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Cumplimiento Promedio',
                    data: [65, 59, 80, 81, 86, 92],
                    fill: true,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Documentación Faltante',
                    data: [28, 48, 40, 19, 10, 5],
                    fill: false,
                    borderColor: '#ef4444',
                    borderDash: [5, 5],
                    tension: 0.4
                }
            ]
        };

        const options = {
            maintainAspectRatio: false,
            aspectRatio: 0.6,
            plugins: {
                legend: { labels: { color: textColor } }
            },
            scales: {
                x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
                y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } }
            }
        };

        setChartData(data);
        setChartOptions(options);
    }, []);

    // Datos Mock
    const alertas = [
        { id: 75, empresa: 'Seguridad Total S.A.', asunto: 'Seguro Vencido', fecha: 'Hoy', prioridad: 'ALTA' },
        { id: 78, empresa: 'Limpieza Express', asunto: 'Falta F931', fecha: 'Ayer', prioridad: 'MEDIA' },
        { id: 90, empresa: 'Tech Solutions', asunto: 'Nómina incompleta', fecha: '20 Ene', prioridad: 'BAJA' },
    ];

    const prioridadTemplate = (rowData) => {
        const colors = { 'ALTA': 'bg-danger-light text-danger', 'MEDIA': 'bg-warning-light text-warning', 'BAJA': 'bg-info-light text-info' };
        return <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${colors[rowData.prioridad]}`}>{rowData.prioridad}</span>;
    };

    const actionTemplate = (rowData) => (
        <button 
            onClick={() => navigate(`/proveedores/${rowData.id}`)}
            className="text-secondary hover:text-primary transition-colors text-xs font-bold flex items-center justify-end w-full gap-1"
            title="Ver detalles del proveedor"
        >
            <i className="pi pi-eye"></i> Ver
        </button>
    );

    return (
        <div className="animate-fade-in space-y-6">
            
            {/* Header Informativo */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-secondary-dark tracking-tight">Tablero de Control</h1>
                    <p className="text-secondary text-sm">Resumen de cumplimiento de contratistas.</p>
                </div>
                <div className="flex gap-2">
                    <span className="bg-white border border-secondary/20 px-3 py-1.5 rounded-lg text-xs font-medium text-secondary shadow-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-success"></span> Cuenta Activa
                    </span>
                    <button className="bg-secondary-dark text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg hover:bg-black transition-colors">
                        <i className="pi pi-download mr-2"></i> Exportar Reporte
                    </button>
                </div>
            </div>

            {/* --- SECCIÓN DE TARJETAS (Ahora con colores sólidos) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Azul (Primary) */}
                <StatCard 
                    title="Total Proveedores" 
                    value="41" 
                    icon="pi-briefcase" 
                    color="bg-primary" // Se pintará todo de azul índigo
                    subtext="3 Inhabilitados"
                />
                
                {/* 2. Verde (Success) */}
                <StatCard 
                    title="Recursos Activos" 
                    value="279" 
                    icon="pi-users" 
                    color="bg-success" // Se pintará todo de verde esmeralda
                    subtext="98% Cumplimiento"
                />

                {/* 3. Celeste/Azul claro */}
                <StatCard 
                    title="Vehículos" 
                    value="151" 
                    icon="pi-car" 
                    color="bg-blue-500" // Azul sólido
                    subtext="12 Vencimientos prox."
                />

                {/* 4. Naranja (Warning) - Destaca mucho para alertas */}
                <StatCard 
                    title="Inconsistencias" 
                    value="22" 
                    icon="pi-exclamation-circle" 
                    color="bg-warning" // Naranja sólido
                    subtext="Documentación rechazada"
                />
            </div>

            {/* Gráficos y Tablas (Se mantienen blancos para contraste) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-secondary/20 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-secondary-dark">Evolución del Cumplimiento</h3>
                        <span className="text-xs text-secondary bg-gray-100 px-2 py-1 rounded">Últimos 6 meses</span>
                    </div>
                    <div className="h-[300px]">
                        <Chart type="line" data={chartData} options={chartOptions} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-secondary/20 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-secondary-dark">Avisos Recientes</h3>
                        <span className="text-xs bg-danger-light text-danger px-2 py-1 rounded-full font-bold">3 Urgentes</span>
                    </div>
                    
                    <DataTable value={alertas} className="text-sm" unstyled pt={{
                        table: { className: 'w-full' },
                        thead: { className: 'hidden' }, 
                        bodyRow: { className: 'border-b border-secondary/10 last:border-0 hover:bg-gray-50 transition-colors' },
                        bodyCell: { className: 'py-3' }
                    }}>
                        <Column body={(data) => (
                            <div>
                                <p className="font-bold text-secondary-dark text-xs">{data.empresa}</p>
                                <p className="text-secondary text-[10px]">{data.asunto}</p>
                            </div>
                        )} />
                        <Column body={prioridadTemplate} />
                        <Column body={actionTemplate} className="text-right" />
                    </DataTable>

                    <button className="mt-auto w-full text-center text-xs text-secondary hover:text-primary font-medium pt-4 border-t border-secondary/10">
                        Ver listado completo de alertas <i className="pi pi-arrow-right ml-1"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
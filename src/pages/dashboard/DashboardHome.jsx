import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useNavigate } from 'react-router-dom';

// --- COMPONENTE TARJETA OPTIMIZADO ---
const StatCard = ({ title, value, icon, type = 'primary', details = [], onClick }) => {
    
    // Mapeo de estilos (Tipografía de la V1 + Colores Semánticos)
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
            badgeBg: 'bg-danger-light', badgeText: 'text-danger-hover',
        }
    };

    const style = styles[type] || styles.primary;

    return (
        <div 
            onClick={onClick}
            className="bg-white rounded-xl p-6 shadow-sm border border-secondary/10 hover:shadow-md transition-all duration-300 relative overflow-hidden group cursor-pointer"
        >
            {/* 1. CABECERA: Tipografía V1 (Más limpia, sin uppercase forzado) */}
            <div className="flex justify-between items-start z-10 relative mb-4">
                <div>
                    <p className="text-secondary text-sm font-medium mb-1 tracking-wide">{title}</p>
                    <h3 className="text-3xl font-bold text-secondary-dark">{value}</h3>
                </div>
                
                {/* Burbuja de color */}
                <div className={`p-3 rounded-xl ${style.iconBg} ${style.iconText} transition-transform duration-300 group-hover:scale-110`}>
                    <i className={`pi ${icon} text-xl`}></i>
                </div>
            </div>
            
            {/* 2. FOOTER: Apilado vertical para evitar amontonamiento */}
            <div className="space-y-2 pt-3 border-t border-secondary/5 relative z-10">
                {details.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-secondary font-medium flex items-center gap-1.5">
                            {/* Icono dinámico según el tipo de detalle */}
                            <i className={`pi ${item.icon || 'pi-circle-fill'} ${item.iconColor || 'text-secondary'} text-[10px]`}></i>
                            {item.label}
                        </span>
                        {/* Badge sutil */}
                        <span className={`px-2 py-0.5 rounded font-bold ${item.badgeClass || 'bg-gray-100 text-secondary'}`}>
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>

            {/* 3. FONDO: Versión V1 (Estático, sin rotación, solo opacidad) */}
            <i className={`pi ${icon} absolute -bottom-5 -right-5 text-9xl opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none`}></i>
        </div>
    );
};

const DashboardHome = () => {
    const navigate = useNavigate();
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        const limeColor = '#84cc16'; 
        const redColor = '#ef4444';
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
                    backgroundColor: 'rgba(132, 204, 22, 0.05)', 
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
            responsive: true,
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

    // Datos Mock Alertas
    const alertas = [
        { id: 75, recurso: 'Camioneta Toyota Hilux', empresa: 'Tech Solutions', asunto: 'VTV Vencida', fecha: 'Hoy', estado: 'VENCIDO' },
        { id: 78, recurso: 'Juan Perez (Leg. 104)', empresa: 'Limpieza Express', asunto: 'Cert. de Cobertura', fecha: 'Ayer', estado: 'RECHAZADO' },
        { id: 90, recurso: 'Alen & Dana S.R.L.', empresa: 'Alen & Dana', asunto: 'F931 Incompleto', fecha: '20 Ene', estado: 'FALTANTE' },
    ];

    const estadoTemplate = (rowData) => {
        const colors = { 
            'VENCIDO': 'bg-danger-light text-danger', 
            'RECHAZADO': 'bg-warning-light text-warning', 
            'FALTANTE': 'bg-secondary-light text-secondary-dark' 
        };
        return <span className={`px-2 py-0.5 rounded text-[10px] font-bold border border-transparent ${colors[rowData.estado]}`}>{rowData.estado}</span>;
    };

    const actionTemplate = (rowData) => (
        <button 
            onClick={() => navigate(`/proveedores/${rowData.id}`)}
            className="text-secondary hover:text-primary transition-colors text-xs font-bold flex items-center justify-end w-full gap-1 group"
        >
            <span className="hidden group-hover:inline">Ver</span> <i className="pi pi-chevron-right text-[10px]"></i>
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
                    {/* <span className="bg-white border border-secondary/20 px-3 py-1.5 rounded-lg text-xs font-medium text-secondary shadow-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span> Sistema Online
                    </span> */}
                    <button className="bg-secondary-dark text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg hover:bg-black transition-colors flex items-center gap-2">
                        <i className="pi pi-file-pdf"></i> Reporte
                    </button>
                </div>
            </div>

            {/* --- KPIs VISUALES --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Proveedores */}
                <StatCard 
                    title="Empresas" 
                    value="41" 
                    icon="pi-briefcase" 
                    type="primary"
                    onClick={() => navigate('/empresas?filter=active')}
                    details={[
                        { label: 'Documentación al día', value: '29', icon: 'pi-check-circle', iconColor: 'text-success', badgeClass: 'bg-success-light text-success-hover' },
                        { label: 'Con pendientes', value: '12', icon: 'pi-info-circle', iconColor: 'text-warning', badgeClass: 'bg-warning-light text-warning-hover' }
                    ]}
                />
                
                {/* 2. Empleados */}
                <StatCard 
                    title="Recursos Humanos" 
                    value="279" 
                    icon="pi-users" 
                    type="success"
                    onClick={() => navigate('/empleados')}
                    details={[
                        { label: 'Habilitados ingreso', value: '265', icon: 'pi-check-circle', iconColor: 'text-success', badgeClass: 'bg-success-light text-success-hover' },
                        { label: 'Sin cobertura ART', value: '14', icon: 'pi-ban', iconColor: 'text-danger', badgeClass: 'bg-danger-light text-danger-hover' }
                    ]}
                />

                {/* 3. Flota */}
                <StatCard 
                    title="Flota Vehicular" 
                    value="226" 
                    icon="pi-car" 
                    type="info"
                    onClick={() => navigate('/flota')}
                    details={[
                        { label: 'Vehículos/Máquinas', value: '151/75', icon: 'pi-truck', iconColor: 'text-info', badgeClass: 'bg-info-light text-info-hover' },
                        { label: 'Vencimientos prox.', value: '8', icon: 'pi-clock', iconColor: 'text-warning', badgeClass: 'bg-warning-light text-warning-hover' }
                    ]}
                />

                {/* 4. Inconsistencias (DIVIDIDAS) */}
                <StatCard 
                    title="Auditoría" 
                    value="22" 
                    icon="pi-file-excel" 
                    type="danger"
                    onClick={() => navigate('/auditoria/bandeja-entrada')}
                    details={[
                        { label: 'Rechazo Legal', value: '15', icon: 'pi-briefcase', iconColor: 'text-danger', badgeClass: 'bg-danger-light text-danger' },
                        { label: 'Rechazo Técnico', value: '7', icon: 'pi-cog', iconColor: 'text-danger', badgeClass: 'bg-danger-light text-danger' }
                    ]}
                />
            </div>

            {/* --- SECCIÓN INFERIOR --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Gráfico (Con min-w-0 para evitar desborde) */}
                <div className="lg:col-span-2 min-w-0 bg-white p-6 rounded-xl border border-secondary/20 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-secondary-dark text-lg">Evolución Semestral</h3>
                        <div className="flex gap-3">
                             <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success"></span><span className="text-xs text-secondary">OK</span></div>
                             <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger"></span><span className="text-xs text-secondary">Error</span></div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full relative">
                        <Chart type="line" data={chartData} options={chartOptions} className="h-full"/>
                    </div>
                </div>

                {/* Tabla de Alertas */}
                <div className="bg-white p-0 rounded-xl border border-secondary/20 shadow-sm flex flex-col overflow-hidden min-w-0 hover:shadow-md transition-shadow">
                    <div className="p-5 border-b border-secondary/10 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-secondary-dark">Alertas Recientes</h3>
                        <span className="text-xs bg-danger-light text-danger px-2 py-0.5 rounded-full font-bold">3 Pendientes</span>
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
                        <button 
                            onClick={() => navigate('/alertas')}
                            className="w-full py-2 text-center text-xs text-secondary hover:text-primary font-bold bg-white border border-secondary/20 rounded-lg hover:shadow-sm transition-all"
                        >
                            Ver todas las alertas
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
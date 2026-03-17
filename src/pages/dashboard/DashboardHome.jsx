import React, { useState, useEffect } from 'react';
import { Chart as PrimeChart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// --- COMPONENTE TARJETA OPTIMIZADO ---
const StatCard = ({ title, value, icon, type = 'primary', details = [], onClick }) => {

    // Mapeo de estilos (Tipografía de la V1 + Colores Semánticos)
    const styles = {
        primary: {
            iconBg: 'bg-primary-light', iconText: 'text-primary',
            badgeBg: 'bg-primary-light', badgeText: 'text-primary-active',
        },
        success: {
            iconBg: 'bg-success-light', iconText: 'text-[#84cc16]',
            badgeBg: 'bg-success-light', badgeText: 'text-[#84cc16]',
        },
        warning: {
            iconBg: 'bg-warning-light', iconText: 'text-[#f59e0b]',
            badgeBg: 'bg-warning-light', badgeText: 'text-[#f59e0b]',
        },
        info: {
            iconBg: 'bg-info-light', iconText: 'text-info',
            badgeBg: 'bg-info-light', badgeText: 'text-info-hover',
        },
        danger: {
            iconBg: 'bg-danger-light', iconText: 'text-[#ef4444]',
            badgeBg: 'bg-danger-light', badgeText: 'text-[#ef4444]',
        }
    };

    const style = styles[type] || styles.primary;

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl p-6 shadow-sm border border-secondary/10 hover:shadow-md transition-all duration-300 relative overflow-hidden group cursor-pointer"
        >
            <div className="flex justify-between items-start z-10 relative mb-4">
                <div>
                    <p className="text-secondary text-sm font-medium mb-1 tracking-wide">{title}</p>
                    <h3 className="text-3xl font-bold text-secondary-dark">{value}</h3>
                </div>

                <div className={`p-3 rounded-xl ${style.iconBg} ${style.iconText} transition-transform duration-300 group-hover:scale-110`}>
                    <i className={`pi ${icon} text-xl`}></i>
                </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-secondary/5 relative z-10">
                {details.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-secondary font-medium flex items-center gap-1.5">
                            <i className={`pi ${item.icon || 'pi-circle-fill'} ${item.iconColor || 'text-secondary'} text-[10px]`}></i>
                            {item.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-bold ${item.badgeClass || 'bg-gray-100 text-secondary'}`}>
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>

            <i className={`pi ${icon} absolute -bottom-5 -right-5 text-9xl opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none`}></i>
        </div>
    );
};

const DashboardHome = () => {
    const navigate = useNavigate();

    const limeColor = '#84cc16'; // System Success
    const redColor = '#ef4444'; // System Danger
    const orangeColor = '#f59e0b'; // System Warning

    const alertas = [
        { id: 75, recurso: 'Camioneta Toyota Hilux', empresa: 'Tech Solutions', asunto: 'VTV Vencida', fecha: 'Hoy', estado: 'VENCIDO' },
        { id: 78, recurso: 'Juan Perez (Leg. 104)', empresa: 'Limpieza Express', asunto: 'Cert. de Cobertura', fecha: 'Ayer', estado: 'RECHAZADO' },
        { id: 90, recurso: 'Alen & Dana S.R.L.', empresa: 'Alen & Dana', asunto: 'F931 Incompleto', fecha: '20 Ene', estado: 'FALTANTE' },
    ];

    const estadoTemplate = (rowData) => {
        const colors = {
            'VENCIDO': 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20',
            'RECHAZADO': 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20',
            'FALTANTE': 'bg-secondary/10 text-secondary-dark border-secondary/20'
        };
        return <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colors[rowData.estado]}`}>{rowData.estado}</span>;
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
                    <button className="bg-secondary-dark text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg hover:bg-black transition-colors flex items-center gap-2">
                        <i className="pi pi-file-pdf"></i> Reporte
                    </button>
                </div>
            </div>

            {/* --- KPIs VISUALES --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Empresas"
                    value="41"
                    icon="pi-briefcase"
                    type="primary"
                    onClick={() => navigate('/empresas?filter=active')}
                    details={[
                        { label: 'Documentación al día', value: '29', icon: 'pi-check-circle', iconColor: 'text-[#84cc16]', badgeClass: 'bg-[#84cc16]/10 text-[#84cc16]' },
                        { label: 'Con pendientes', value: '12', icon: 'pi-info-circle', iconColor: 'text-[#f59e0b]', badgeClass: 'bg-[#f59e0b]/10 text-[#f59e0b]' }
                    ]}
                />

                <StatCard
                    title="Recursos Humanos"
                    value="279"
                    icon="pi-users"
                    type="success"
                    onClick={() => navigate('/empleados')}
                    details={[
                        { label: 'Habilitados ingreso', value: '265', icon: 'pi-check-circle', iconColor: 'text-[#84cc16]', badgeClass: 'bg-[#84cc16]/10 text-[#84cc16]' },
                        { label: 'Sin cobertura ART', value: '14', icon: 'pi-ban', iconColor: 'text-[#ef4444]', badgeClass: 'bg-[#ef4444]/10 text-[#ef4444]' }
                    ]}
                />

                <StatCard
                    title="Flota Vehicular"
                    value="226"
                    icon="pi-car"
                    type="info"
                    onClick={() => navigate('/flota')}
                    details={[
                        { label: 'Vehículos/Máquinas', value: '151/75', icon: 'pi-truck', iconColor: 'text-info', badgeClass: 'bg-info-light text-info-hover' },
                        { label: 'Vencimientos prox.', value: '8', icon: 'pi-clock', iconColor: 'text-[#f59e0b]', badgeClass: 'bg-[#f59e0b]/10 text-[#f59e0b]' }
                    ]}
                />

                <StatCard
                    title="Auditoría"
                    value="22"
                    icon="pi-file-excel"
                    type="danger"
                    onClick={() => navigate('/auditoria/bandeja-entrada')}
                    details={[
                        { label: 'Rechazo Legal', value: '15', icon: 'pi-briefcase', iconColor: 'text-[#ef4444]', badgeClass: 'bg-[#ef4444]/10 text-[#ef4444]' },
                        { label: 'Rechazo Técnico', value: '7', icon: 'pi-cog', iconColor: 'text-[#ef4444]', badgeClass: 'bg-[#ef4444]/10 text-[#ef4444]' }
                    ]}
                />
            </div>

            {/* --- SECCIÓN VISUALIZACIONES --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfico 1: Estatus por Recursos (Stacked Bar) */}
                <div className="lg:col-span-2 bg-white p-7 rounded-2xl border border-secondary/10 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-secondary-dark text-lg">Estatus por Recursos</h3>
                            <p className="text-secondary text-sm">Distribución de documentos cargados vs. pendientes por módulo.</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#84cc16]"></div>
                                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Cargados</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Pendientes</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <Bar
                            data={{
                                labels: ['PROVEEDORES', 'EMPLEADOS', 'VEHÍCULOS', 'MAQUINARIAS'],
                                datasets: [
                                    {
                                        label: 'Cargados',
                                        data: [41, 151, 143, 63],
                                        backgroundColor: '#84cc16',
                                        borderRadius: 6,
                                    },
                                    {
                                        label: 'Pendientes',
                                        data: [3, 130, 46, 14],
                                        backgroundColor: '#ef4444',
                                        borderRadius: 6,
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    x: { 
                                        stacked: true,
                                        grid: { display: false },
                                        ticks: { font: { size: 10, weight: 'bold' }, color: '#64748b' }
                                    },
                                    y: { 
                                        stacked: true,
                                        grid: { color: 'rgba(148, 163, 184, 0.05)' },
                                        ticks: { font: { size: 10 }, color: '#94a3b8' }
                                    },
                                },
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        backgroundColor: '#1e293b',
                                        padding: 12,
                                        titleFont: { size: 12 },
                                        bodyFont: { size: 12 },
                                        cornerRadius: 10,
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Gráfico 2: Cumplimiento Global (Trend Line) */}
                <div className="bg-white p-7 rounded-2xl border border-secondary/10 shadow-sm flex flex-col justify-between">
                    <div className="space-y-1">
                        <h3 className="font-bold text-secondary-dark text-lg">Cumplimiento Global</h3>
                        <p className="text-secondary text-sm">Tendencia histórica de cumplimiento.</p>
                    </div>

                    <div className="h-[200px] w-full pt-4">
                        <Line 
                            data={{
                                labels: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN'],
                                datasets: [{
                                    data: [50, 65, 54, 70, 85, 92],
                                    borderColor: '#84cc16',
                                    tension: 0.4,
                                    pointRadius: 4,
                                    pointBackgroundColor: '#fff',
                                    pointBorderWidth: 2,
                                    borderWidth: 3,
                                    fill: true,
                                    backgroundColor: 'rgba(132, 204, 22, 0.1)'
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: { 
                                    x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#94a3b8' } }, 
                                    y: { min: 0, max: 100, ticks: { display: false }, grid: { display: false } } 
                                }
                            }}
                        />
                    </div>

                    <div className="pt-6 border-t border-secondary/5 mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Estatus Actual</span>
                            <span className="text-xl font-black text-secondary-dark font-sans tracking-tight">92%</span>
                        </div>
                        <div className="w-full h-2 bg-secondary/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#84cc16] transition-all duration-1000" style={{ width: '92%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN ALERTAS --- */}
            <div className="bg-white p-0 rounded-2xl border border-secondary/10 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 border-b border-secondary/5 bg-slate-50/50 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-secondary-dark text-lg">Alertas Recientes</h3>
                        <p className="text-secondary text-sm">Inconsistencias y vencimientos detectados automáticamente.</p>
                    </div>
                    <span className="text-xs bg-[#ef4444]/10 text-[#ef4444] px-3 py-1 rounded-full font-bold border border-[#ef4444]/20">3 Pendientes</span>
                </div>

                <div className="p-4">
                    <DataTable value={alertas} className="text-sm" unstyled pt={{
                        table: { className: 'w-full border-separate border-spacing-y-2' },
                        thead: { className: 'hidden' },
                        bodyRow: { className: 'group transition-all' },
                        bodyCell: { className: 'py-3 px-4 first:rounded-l-xl last:rounded-r-xl bg-slate-50/30 border-y border-secondary/5 first:border-l last:border-r group-hover:bg-slate-50 transition-colors' }
                    }}>
                        <Column body={(data) => (
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${data.estado === 'VENCIDO' ? 'bg-[#ef4444]' : 'bg-[#f59e0b]'} shadow-sm`}></div>
                                <div>
                                    <p className="font-bold text-secondary-dark text-sm">{data.recurso}</p>
                                    <p className="text-secondary text-xs">{data.asunto} • <span className="font-medium text-secondary-dark">{data.empresa}</span></p>
                                </div>
                            </div>
                        )} />
                        <Column body={estadoTemplate} />
                        <Column body={actionTemplate} className="text-right" />
                    </DataTable>
                </div>

                <div className="p-4 bg-slate-50/50 border-t border-secondary/5">
                    <button
                        onClick={() => navigate('/alertas')}
                        className="w-full py-3 text-center text-sm text-secondary hover:text-primary font-bold bg-white border border-secondary/10 rounded-xl hover:shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                        Ver todas las alertas <i className="pi pi-arrow-right text-xs"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
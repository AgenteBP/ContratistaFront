import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { supplierService } from '../../services/supplierService';
import { groupService } from '../../services/groupService';
import { useResourceStats } from '../../hooks/useResourceStats';
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

// --- DetailRow para los detalles de las cards ---
const DetailRow = ({ icon, iconColor, label, value }) => (
    <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-secondary/70">
            <i className={`pi ${icon} text-[10px] ${iconColor}`} />
            {label}
        </span>
        <span className="font-bold text-secondary-dark">{value ?? '—'}</span>
    </div>
);

const DashboardHome = () => {
    const navigate = useNavigate();
    const { user, currentRole, isAuditorTecnico } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authSuppliers, setAuthSuppliers] = useState([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(false);
    const [groups, setGroups] = useState([]);
    const { stats: hookStats, loading: hookLoading } = useResourceStats();

    // Alertas estáticas (fuera del scope de cambios)
    const alertas = [
        { id: 75, recurso: 'Camioneta Toyota Hilux', empresa: 'Tech Solutions', asunto: 'VTV Vencida', fecha: 'Hoy', estado: 'VENCIDO' },
        { id: 78, recurso: 'Juan Perez (Leg. 104)', empresa: 'Limpieza Express', asunto: 'Cert. de Cobertura', fecha: 'Ayer', estado: 'RECHAZADO' },
        { id: 90, recurso: 'Alen & Dana S.R.L.', empresa: 'Alen & Dana', asunto: 'F931 Incompleto', fecha: '20 Ene', estado: 'FALTANTE' },
    ];

    // Cargar estadísticas del dashboard
    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.id || !currentRole?.role) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await dashboardService.getStats(
                    user.id,
                    currentRole.role,
                    currentRole.id_entity
                );
                setStats(data);
                // Simular loading por cards
                            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                setStats(null);
                            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user?.id, currentRole?.role, currentRole?.id_entity]);

    // Cargar proveedores autorizados (para EMPRESA, AUDITOR, ADMIN)
    useEffect(() => {
        if (!user?.id || !currentRole?.role) return;

        const fetchSuppliers = async () => {
            setLoadingSuppliers(true);
            try {
                const [suppliersData, groupsData] = await Promise.all([
                    supplierService.getAuthorizedSuppliers(user.id, currentRole.role, currentRole.id_entity),
                    groupService.getAll()
                ]);
                setAuthSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
                setGroups(Array.isArray(groupsData) ? groupsData : []);
            } catch {
                setAuthSuppliers([]);
                setGroups([]);
            } finally {
                setLoadingSuppliers(false);
            }
        };

        fetchSuppliers();
    }, [user?.id, currentRole?.role, currentRole?.id_entity]);

    // Función para obtener cards según el rol
    const getCardsConfig = () => {
        const role = currentRole?.role;
        const s = stats;

        // Totales calculados desde el hook (más confiables que la API para algunos roles)
        const totalEnRevision  = (hookStats?.employees?.enRevision ?? 0) + (hookStats?.vehicles?.enRevision ?? 0) + (hookStats?.machinery?.enRevision ?? 0);
        const totalVencidos    = (hookStats?.employees?.vencidos ?? 0) + (hookStats?.vehicles?.vencidos ?? 0) + (hookStats?.machinery?.vencidos ?? 0);
        const totalConObs      = (hookStats?.employees?.conObservacion ?? 0) + (hookStats?.vehicles?.conObservacion ?? 0) + (hookStats?.machinery?.conObservacion ?? 0);
        const totalPorVencer   = (hookStats?.employees?.expiringSoon ?? 0) + (hookStats?.vehicles?.expiringSoon ?? 0) + (hookStats?.machinery?.expiringSoon ?? 0);
        const totalProviders     = authSuppliers.length > 0 ? authSuppliers.length : (hookStats?.totalProviders || s?.suppliers?.total || 0);
        const suppliersApproved  = authSuppliers.filter(sup => sup.is_tec_success === true).length;
        const suppliersRejected  = authSuppliers.filter(sup => sup.is_tec_success === false).length;
        const suppliersPending   = authSuppliers.filter(sup => sup.is_tec_success === null || sup.is_tec_success === undefined).length;

        if (role === 'ADMIN') {
            return [
                {
                    title: 'Empresas',
                    value: s?.companies?.total ?? '—',
                    icon: 'pi-building',
                    type: 'primary',
                    watermark: true,
                    onClick: () => navigate('/empresas'),
                    children: [
                        <DetailRow key="1" icon="pi-check-circle" iconColor="text-[#84cc16]" label="Activas" value={s?.companies?.active} />,
                        <DetailRow key="2" icon="pi-clock" iconColor="text-[#f59e0b]" label="Inactivas" value={s?.companies?.total && s?.companies?.active ? s?.companies.total - s?.companies.active : '—'} />
                    ]
                },
                {
                    title: 'Proveedores',
                    value: s?.suppliers?.total ?? '—',
                    icon: 'pi-briefcase',
                    type: 'success',
                    watermark: true,
                    onClick: () => navigate('/proveedores'),
                    children: [
                        <DetailRow key="1" icon="pi-check-circle" iconColor="text-[#84cc16]" label="Aprobados" value={suppliersApproved} />,
                        <DetailRow key="2" icon="pi-times-circle" iconColor="text-[#ef4444]" label="Rechazados" value={suppliersRejected} />,
                        <DetailRow key="3" icon="pi-clock" iconColor="text-[#f59e0b]" label="Pendientes" value={suppliersPending} />
                    ]
                },
                {
                    title: 'Recursos',
                    value: (s?.elements?.employees ?? 0) + (s?.elements?.vehicles ?? 0) + (s?.elements?.machinery ?? 0),
                    icon: 'pi-box',
                    type: 'info',
                    watermark: true,
                    onClick: () => navigate('/recursos'),
                    children: [
                        <DetailRow key="1" icon="pi-users" iconColor="text-info" label="Empleados" value={s?.elements?.employees} />,
                        <DetailRow key="2" icon="pi-car" iconColor="text-info" label="Vehículos" value={s?.elements?.vehicles} />,
                        <DetailRow key="3" icon="pi-cog" iconColor="text-info" label="Maquinaria" value={s?.elements?.machinery} />
                    ]
                },
                {
                    title: 'Auditorías Pend.',
                    value: s != null ? (s?.suppliers?.tec_pending ?? 0) + (s?.pending_audit_files ?? 0) : '—',
                    icon: 'pi-file-excel',
                    type: 'danger',
                    watermark: true,
                    onClick: () => navigate('/auditores/tecnica'),
                    children: [
                        <DetailRow key="1" icon="pi-wrench" iconColor="text-[#ef4444]" label="Pend. técnica" value={s?.suppliers?.tec_pending ?? '—'} />,
                        <DetailRow key="2" icon="pi-book" iconColor="text-[#f59e0b]" label="Pend. legal" value={s?.pending_audit_files ?? 0} />
                    ]
                }
            ];
        } else if (role === 'EMPRESA') {
            const suppActivos    = authSuppliers.filter(sup => sup.active === 0).length;
            const suppInactivos  = authSuppliers.filter(sup => sup.active === 1).length;
            const suppSuspendidos = authSuppliers.filter(sup => sup.active === 2).length;
            return [
                {
                    title: 'Proveedores',
                    value: totalProviders || '—',
                    icon: 'pi-briefcase',
                    type: 'primary',
                    watermark: true,
                    onClick: () => navigate('/proveedores'),
                    children: [
                        <DetailRow key="1" icon="pi-check-circle" iconColor="text-[#84cc16]" label="Activos" value={suppActivos} />,
                        <DetailRow key="2" icon="pi-times-circle" iconColor="text-[#ef4444]" label="Doc./auditoría pend." value={suppInactivos} />,
                        <DetailRow key="3" icon="pi-ban" iconColor="text-[#f59e0b]" label="Suspendidos" value={suppSuspendidos} />
                    ]
                },
                {
                    title: 'Empleados',
                    value: hookStats?.employees?.total ?? s?.elements?.employees ?? '—',
                    icon: 'pi-users',
                    type: 'info',
                    watermark: true,
                    onClick: () => navigate('/recursos/empleados'),
                    children: [
                        <DetailRow key="1" icon="pi-check-circle" iconColor="text-[#84cc16]" label="Habilitados" value={hookStats?.employees?.habilitados} />,
                        <DetailRow key="2" icon="pi-times-circle" iconColor="text-[#ef4444]" label="No Habilitados" value={hookStats?.employees?.docPendiente} />
                    ]
                },
                {
                    title: 'Vehículos',
                    value: hookStats?.vehicles?.total ?? s?.elements?.vehicles ?? '—',
                    icon: 'pi-car',
                    type: 'warning',
                    watermark: true,
                    onClick: () => navigate('/recursos/vehiculos'),
                    children: [
                        <DetailRow key="1" icon="pi-check-circle" iconColor="text-[#84cc16]" label="Habilitados" value={hookStats?.vehicles?.habilitados} />,
                        <DetailRow key="2" icon="pi-times-circle" iconColor="text-[#ef4444]" label="No Habilitados" value={hookStats?.vehicles?.docPendiente} />
                    ]
                },
                {
                    title: 'Maquinaria',
                    value: hookStats?.machinery?.total ?? s?.elements?.machinery ?? '—',
                    icon: 'pi-cog',
                    type: 'success',
                    watermark: true,
                    onClick: () => navigate('/recursos/maquinaria'),
                    children: [
                        <DetailRow key="1" icon="pi-check-circle" iconColor="text-[#84cc16]" label="Habilitadas" value={hookStats?.machinery?.habilitados} />,
                        <DetailRow key="2" icon="pi-times-circle" iconColor="text-[#ef4444]" label="No Habilitadas" value={hookStats?.machinery?.docPendiente} />
                    ]
                }
            ];
        } else if (role === 'PROVEEDOR') {
            return [
                {
                    title: 'Mi Legajo',
                    value: s?.docs?.total ?? '—',
                    icon: 'pi-briefcase',
                    type: 'primary',
                    watermark: true,
                    onClick: () => navigate('/documentos/general'),
                    children: [
                        <DetailRow key="1" icon="pi-check-circle" iconColor="text-[#84cc16]" label="Vigentes" value={s?.docs?.valid} />,
                        <DetailRow key="2" icon="pi-eye" iconColor="text-[#3b82f6]" label="En revisión" value={s?.docs?.review} />,
                        <DetailRow key="3" icon="pi-clock" iconColor="text-[#f59e0b]" label="Pendientes" value={s?.docs?.pending} />
                    ]
                },
                {
                    title: 'Empleados',
                    value: hookStats?.employees?.total ?? s?.elements?.employees ?? '—',
                    icon: 'pi-users',
                    type: 'info',
                    watermark: true,
                    onClick: () => navigate('/recursos/empleados'),
                    children: [
                        <DetailRow key="1" icon="pi-check-circle" iconColor="text-[#84cc16]" label="Habilitados" value={hookStats?.employees?.habilitados} />,
                        <DetailRow key="2" icon="pi-times-circle" iconColor="text-[#ef4444]" label="No Habilitados" value={hookStats?.employees?.docPendiente} />
                    ]
                },
                {
                    title: 'Vehículos',
                    value: hookStats?.vehicles?.total ?? s?.elements?.vehicles ?? '—',
                    icon: 'pi-car',
                    type: 'warning',
                    watermark: true,
                    onClick: () => navigate('/recursos/vehiculos'),
                    children: [
                        <DetailRow key="1" icon="pi-check-circle" iconColor="text-[#84cc16]" label="Habilitados" value={hookStats?.vehicles?.habilitados} />,
                        <DetailRow key="2" icon="pi-times-circle" iconColor="text-[#ef4444]" label="No Habilitados" value={hookStats?.vehicles?.docPendiente} />
                    ]
                },
                {
                    title: 'Maquinaria',
                    value: hookStats?.machinery?.total ?? s?.elements?.machinery ?? '—',
                    icon: 'pi-cog',
                    type: 'success',
                    watermark: true,
                    onClick: () => navigate('/recursos/maquinaria'),
                    children: [
                        <DetailRow key="1" icon="pi-check-circle" iconColor="text-[#84cc16]" label="Habilitadas" value={hookStats?.machinery?.habilitados} />,
                        <DetailRow key="2" icon="pi-times-circle" iconColor="text-[#ef4444]" label="No Habilitadas" value={hookStats?.machinery?.docPendiente} />
                    ]
                }
            ];
        } else if (role === 'AUDITOR') {
            // AUDITOR TÉCNICO
            if (isAuditorTecnico) {
                const pendientes     = s?.suppliers?.tec_pending  || suppliersPending  || 0;
                const aprobados      = s?.suppliers?.tec_approved || suppliersApproved || 0;
                const rechazados     = s?.suppliers?.tec_rejected || suppliersRejected || 0;
                const totalAsig      = s?.suppliers?.total || totalProviders || 0;
                const groupBreakdown = Object.entries(
                    authSuppliers.reduce((acc, sup) => {
                        const key = sup.id_group ?? '__sin_grupo__';
                        acc[key] = (acc[key] || 0) + 1;
                        return acc;
                    }, {})
                ).map(([gId, count]) => {
                    const g = groups.find(gr => String(gr.idGroup ?? gr.id_group ?? gr.id) === String(gId));
                    const name = gId === '__sin_grupo__' ? 'Sin grupo' : (g?.descripcion || g?.description || g?.name || `Grupo ${gId}`);
                    return { name, count };
                }).sort((a, b) => b.count - a.count);
                return [
                    {
                        title: 'Total Asignados',
                        value: totalAsig || '—',
                        icon: 'pi-briefcase',
                        type: 'primary',
                        watermark: true,
                        onClick: () => navigate('/proveedores'),
                        children: groupBreakdown.map((g, i) => (
                            <DetailRow key={i} icon="pi-sitemap" iconColor="text-primary" label={g.name} value={g.count} />
                        ))
                    },
                    {
                        title: 'Aprobados',
                        value: aprobados || '—',
                        icon: 'pi-check-circle',
                        type: 'success',
                        watermark: true,
                        onClick: () => navigate('/proveedores'),
                        children: [
                            <DetailRow key="1" icon="pi-percentage" iconColor="text-success" label="Del total" value={totalAsig ? `${Math.round((aprobados / totalAsig) * 100)}%` : '—'} />
                        ]
                    },
                    {
                        title: 'Pendientes',
                        value: pendientes || '—',
                        icon: 'pi-clock',
                        type: 'warning',
                        watermark: true,
                        onClick: () => navigate('/auditores/tecnica'),
                        children: [
                            <DetailRow key="1" icon="pi-percentage" iconColor="text-warning" label="Del total" value={totalAsig ? `${Math.round((pendientes / totalAsig) * 100)}%` : '—'} />
                        ]
                    },
                    {
                        title: 'Rechazados',
                        value: rechazados || '—',
                        icon: 'pi-ban',
                        type: 'danger',
                        watermark: true,
                        onClick: () => navigate('/auditores/tecnica/historial'),
                        children: [
                            <DetailRow key="1" icon="pi-percentage" iconColor="text-danger" label="Del total" value={totalAsig ? `${Math.round((rechazados / totalAsig) * 100)}%` : '—'} />
                        ]
                    }
                ];
            } else {
                // AUDITOR LEGAL
                const docsRevision = s?.pending_audit_files ?? totalEnRevision;
                return [
                    {
                        title: 'Docs en Revisión',
                        value: s != null ? (docsRevision ?? 0) : '—',
                        icon: 'pi-file',
                        type: 'danger',
                        watermark: true,
                        onClick: () => navigate('/auditoria-legal/inbox'),
                        children: [
                            <DetailRow key="1" icon="pi-file" iconColor="text-[#ef4444]" label="Documentos pendientes" value={docsRevision ?? 0} />
                        ]
                    },
                    {
                        title: 'Proveedores',
                        value: s != null ? totalProviders : '—',
                        icon: 'pi-briefcase',
                        type: 'primary',
                        watermark: true,
                        onClick: () => navigate('/proveedores'),
                        children: [
                            <DetailRow key="1" icon="pi-check-circle" iconColor="text-[#84cc16]" label="Aprobados" value={suppliersApproved} />,
                            <DetailRow key="2" icon="pi-times-circle" iconColor="text-[#ef4444]" label="Rechazados" value={suppliersRejected} />
                        ]
                    },
                    {
                        title: 'Vencidos / Por Vencer',
                        value: s != null ? totalVencidos + totalPorVencer : '—',
                        icon: 'pi-clock',
                        type: 'warning',
                        watermark: true,
                        onClick: () => navigate('/documentos/por-vencer'),
                        children: [
                            <DetailRow key="1" icon="pi-times-circle" iconColor="text-[#ef4444]" label="Vencidos" value={totalVencidos} />,
                            <DetailRow key="2" icon="pi-clock" iconColor="text-[#f59e0b]" label="Por vencer" value={totalPorVencer} />
                        ]
                    },
                    {
                        title: 'Observados',
                        value: s != null ? totalConObs : '—',
                        icon: 'pi-exclamation-circle',
                        type: 'info',
                        watermark: true,
                        onClick: () => navigate('/documentos/observados'),
                        children: [
                            <DetailRow key="1" icon="pi-exclamation-circle" iconColor="text-info" label="Con observaciones" value={totalConObs} />
                        ]
                    }
                ];
            }
        }

        // Fallback: 4 cards genéricas mientras carga o si el rol no coincide
        return [
            { title: 'Proveedores', value: s?.suppliers?.total ?? '—', icon: 'pi-briefcase', type: 'primary', watermark: true, onClick: () => navigate('/proveedores'), children: [] },
            { title: 'Empleados',   value: s?.elements?.employees ?? '—', icon: 'pi-users',    type: 'info',    watermark: true, onClick: () => navigate('/recursos/empleados'), children: [] },
            { title: 'Vehículos',   value: s?.elements?.vehicles ?? '—',  icon: 'pi-car',      type: 'warning', watermark: true, onClick: () => navigate('/recursos/vehiculos'), children: [] },
            { title: 'Maquinaria',  value: s?.elements?.machinery ?? '—', icon: 'pi-cog',      type: 'success', watermark: true, onClick: () => navigate('/recursos/maquinaria'), children: [] },
        ];
    };

    const cards = getCardsConfig();

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
                {cards.map((config, idx) => (
                    <StatCard
                        key={idx}
                        title={config.title}
                        value={config.value}
                        icon={config.icon}
                        type={config.type}
                        loading={loading || hookLoading || loadingSuppliers}
                        watermark={config.watermark}
                        onClick={config.onClick}
                    >
                        <div className="space-y-2">
                            {config.children}
                        </div>
                    </StatCard>
                ))}
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

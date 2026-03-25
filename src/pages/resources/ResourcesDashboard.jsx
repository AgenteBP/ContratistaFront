import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TabView, TabPanel } from 'primereact/tabview';
import VehiclesList from './vehicles/VehiclesList';
import EmployeesList from './employees/EmployeesList';
import MachineryList from './machinery/MachineryList';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { TbBackhoe } from 'react-icons/tb';
import { useAuth } from '../../context/AuthContext';
import AdminSupplierFilterModal from '../../components/resources/AdminSupplierFilterModal';
import { useResourceStats } from '../../hooks/useResourceStats';


const DETAIL_ROWS = {
    habilitados: { key: 'habilitados', label: 'Habilitados', icon: 'pi-check-circle', iconColor: 'text-success', badgeClass: 'bg-success-light text-success-hover' },
    enRevision: { key: 'enRevision', label: 'En revisión', icon: 'pi-clock', iconColor: 'text-blue-500', badgeClass: 'bg-blue-100 text-blue-600' },
    conObservacion: { key: 'conObservacion', label: 'Con observaciones', icon: 'pi-exclamation-circle', iconColor: 'text-warning', badgeClass: 'bg-warning-light text-warning-hover' },
    vencidos: { key: 'vencidos', label: 'Vencidos', icon: 'pi-times-circle', iconColor: 'text-danger', badgeClass: 'bg-danger-light text-danger-hover' },
    docPendiente: { key: 'docPendiente', label: 'Documentación pendiente', icon: 'pi-ban', iconColor: 'text-secondary', badgeClass: 'bg-gray-100 text-secondary' },
};

const buildDetails = (s, isAuditorLegal) => {
    const keys = isAuditorLegal
        ? ['enRevision', 'habilitados', 'conObservacion', 'vencidos', 'docPendiente']
        : ['habilitados', 'docPendiente', 'vencidos', 'conObservacion', 'enRevision'];
    const alwaysShow = isAuditorLegal ? ['enRevision', 'habilitados'] : ['habilitados', 'docPendiente'];

    return keys.map(key => {
        const row = { ...DETAIL_ROWS[key], value: s[key] };
        if (key === 'enRevision' && isAuditorLegal)
            row.badgeClass = 'bg-blue-200 text-blue-700';
        return row;
    }).filter(d => d.value > 0 || alwaysShow.includes(d.key));
};

const ResourcesDashboard = () => {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);
    const { currentRole, isAuditorLegal } = useAuth();

    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (currentRole?.role === 'ADMIN' && !selectedSupplier) {
            setModalVisible(true);
        }
    }, [currentRole, selectedSupplier]);

    const explicitIdSupplier = selectedSupplier?.supplier?.value || selectedSupplier?.supplier?.id || null;
    const { stats, loading } = useResourceStats(explicitIdSupplier);

    const role = currentRole?.role;
    const isMultiProvider = role !== 'PROVEEDOR';

    const cardSubtitle = (s) =>
        isMultiProvider && s.providerCount > 0 ? `de ${s.providerCount} proveedores` : null;

    const summaryData = [
        {
            title: 'Empleados',
            value: stats.employees.total,
            subtitle: cardSubtitle(stats.employees),
            icon: 'pi-users',
            type: 'success',
            details: buildDetails(stats.employees, isAuditorLegal),
        },
        {
            title: 'Vehículos',
            value: stats.vehicles.total,
            subtitle: cardSubtitle(stats.vehicles),
            icon: 'pi-car',
            type: 'primary',
            details: buildDetails(stats.vehicles, isAuditorLegal),
        },
        {
            title: 'Maquinaria',
            value: stats.machinery.total,
            subtitle: cardSubtitle(stats.machinery),
            icon: <TbBackhoe />,
            type: 'warning',
            watermarkSize: "text-[13rem]",
            iconSize: "text-3xl",
            details: buildDetails(stats.machinery, isAuditorLegal),
        },
    ];

    return (
        <div className="animate-fade-in w-full pb-8 space-y-6">
            <PageHeader
                title="Gestión de Recursos"
                subtitle="Administración de flota, personal y equipos especiales."
                icon="pi pi-box"
                actionButton={
                    currentRole?.role === 'ADMIN' && (
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                            {selectedSupplier && (
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="text-right sm:text-left bg-white px-4 py-2 rounded-xl shadow-sm border border-secondary/10 min-w-[120px]">
                                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Grupo Seleccionado</p>
                                        <p className="text-sm font-bold text-secondary-dark truncate" title={selectedSupplier.group?.label}>
                                            {selectedSupplier.group?.label}
                                        </p>
                                    </div>
                                    <div className="text-right sm:text-left bg-white px-4 py-2 rounded-xl shadow-sm border border-secondary/10 min-w-[120px]">
                                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Empresa Seleccionada</p>
                                        <p className="text-sm font-bold text-secondary-dark truncate" title={selectedSupplier.company?.label}>
                                            {selectedSupplier.company?.label}
                                        </p>
                                    </div>
                                    <div className="text-right sm:text-left bg-white px-4 py-2 rounded-xl shadow-sm border border-secondary/10 min-w-[140px]">
                                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Proveedor Seleccionado</p>
                                        <p className="text-sm font-bold text-primary truncate" title={selectedSupplier.supplier?.label}>
                                            {selectedSupplier.supplier?.label}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={() => setModalVisible(true)}
                                className="bg-white border border-secondary/20 hover:bg-secondary-light text-secondary-dark font-bold rounded-lg shadow-sm text-sm px-4 py-2 mt-2 sm:mt-0 transition-all flex items-center justify-center gap-2"
                                title="Filtrar por Proveedor"
                            >
                                <i className="pi pi-filter"></i> Cambiar
                            </button>
                        </div>
                    )
                }
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {summaryData.map((item, index) => (
                    <StatCard
                        key={index}
                        title={item.title}
                        value={item.value}
                        subtitle={item.subtitle}
                        icon={item.icon}
                        type={item.type}
                        loading={loading}
                        isActive={activeIndex === index}
                        onClick={() => setActiveIndex(index)}
                        watermark
                    >
                        {item.details.length > 0 && (
                            <div className="space-y-2 pt-3 border-t border-secondary/5">
                                {item.details.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <span className="text-secondary font-medium flex items-center gap-1.5">
                                            <i className={`pi ${d.icon} text-[10px] ${d.iconColor || 'text-secondary'}`} />
                                            {d.label}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded font-bold ${d.badgeClass || 'bg-gray-100 text-secondary'}`}>
                                            {d.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </StatCard>
                ))}
            </div>

            {currentRole?.role === 'ADMIN' && !selectedSupplier ? (
                <div className="bg-white rounded-3xl shadow-xl shadow-secondary/5 border border-secondary/10 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <i className="pi pi-filter text-2xl text-primary"></i>
                    </div>
                    <h3 className="text-xl font-bold text-secondary-dark mb-2">Seleccione un Proveedor</h3>
                    <p className="text-secondary max-w-md mx-auto">
                        Para visualizar o gestionar los recursos, por favor seleccione una empresa y su correspondiente proveedor utilizando el filtro.
                    </p>
                    <button
                        onClick={() => setModalVisible(true)}
                        className="mt-6 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg shadow-sm text-sm px-6 py-2.5 transition-all flex items-center gap-2 mx-auto"
                    >
                        <i className="pi pi-filter"></i> Abrir Selector
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl shadow-secondary/5 border border-secondary/10 overflow-hidden">
                    <TabView
                        activeIndex={activeIndex}
                        onTabChange={(e) => setActiveIndex(e.index)}
                        pt={{
                            navContainer: { className: 'bg-secondary-light/30 border-b border-secondary/10 px-6 pt-2' },
                            nav: { className: 'flex gap-2' },
                            navLink: { className: 'border-b-2 border-transparent transition-all duration-300 hover:bg-white/50' },
                            inkbar: { className: 'bg-primary h-0.5 rounded-full' },
                            panelContainer: { className: 'p-0' }
                        }}
                    >

                        <TabPanel
                            header={
                                <div className={`flex items-center gap-3 py-4 px-4 transition-all duration-300 ${activeIndex === 0 ? 'text-primary' : 'text-secondary hover:text-secondary-dark'}`}>
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${activeIndex === 0 ? 'bg-primary/10 shadow-sm' : 'bg-transparent'}`}>
                                        <i className="pi pi-users text-sm"></i>
                                    </div>
                                    <span className="font-bold text-sm tracking-tight">Empleados</span>
                                </div>
                            }
                        >
                            <EmployeesList
                                isEmbedded={true}
                                explicitIdSupplier={selectedSupplier?.supplier?.value || selectedSupplier?.supplier?.id}
                                explicitIdGroup={selectedSupplier?.group?.value || selectedSupplier?.group?.id}
                            />
                        </TabPanel>

                        <TabPanel
                            header={
                                <div className={`flex items-center gap-3 py-4 px-4 transition-all duration-300 ${activeIndex === 1 ? 'text-primary' : 'text-secondary hover:text-secondary-dark'}`}>
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${activeIndex === 1 ? 'bg-primary/10 shadow-sm' : 'bg-transparent'}`}>
                                        <i className="pi pi-car text-sm"></i>
                                    </div>
                                    <span className="font-bold text-sm tracking-tight">Vehículos</span>
                                </div>
                            }
                        >
                            <VehiclesList
                                isEmbedded={true}
                                explicitIdSupplier={selectedSupplier?.supplier?.value || selectedSupplier?.supplier?.id}
                                explicitIdGroup={selectedSupplier?.group?.value || selectedSupplier?.group?.id}
                            />
                        </TabPanel>



                        <TabPanel
                            header={
                                <div className={`flex items-center gap-3 py-4 px-4 transition-all duration-300 ${activeIndex === 2 ? 'text-primary' : 'text-secondary hover:text-secondary-dark'}`}>
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${activeIndex === 2 ? 'bg-primary/10 shadow-sm' : 'bg-transparent'}`}>
                                        <TbBackhoe className="text-2xl" />
                                    </div>
                                    <span className="font-bold text-sm tracking-tight">Maquinaria</span>
                                </div>
                            }
                        >
                            <MachineryList
                                isEmbedded={true}
                                explicitIdSupplier={selectedSupplier?.supplier?.value || selectedSupplier?.supplier?.id}
                                explicitIdGroup={selectedSupplier?.group?.value || selectedSupplier?.group?.id}
                            />
                        </TabPanel>
                    </TabView>
                </div>
            )}

            <AdminSupplierFilterModal
                visible={modalVisible}
                onConfirm={(supp) => {
                    setSelectedSupplier(supp);
                    setModalVisible(false);
                }}
                onCancel={() => {
                    setModalVisible(false);
                    navigate('/dashboard');
                }}
            />
        </div>
    );
};

export default ResourcesDashboard;

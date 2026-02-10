import React, { useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import VehiclesList from './vehicles/VehiclesList';
import EmployeesList from './employees/EmployeesList';
import MachineryList from './machinery/MachineryList';
import PageHeader from '../../components/ui/PageHeader';
import { TbBackhoe } from 'react-icons/tb';

// --- COMPONENTE TARJETA OPTIMIZADO (Reutilizado del DashboardHome) ---
const StatCard = ({ title, value, icon, type = 'primary', details = [], onClick, isActive, watermarkSize = "text-[11rem]", iconSize = "text-xl" }) => {

    const styles = {
        primary: {
            iconBg: 'bg-primary-light', iconText: 'text-primary',
            badgeBg: 'bg-primary-light', badgeText: 'text-primary-active',
            border: 'border-primary'
        },
        success: {
            iconBg: 'bg-success-light', iconText: 'text-success',
            badgeBg: 'bg-success-light', badgeText: 'text-success-hover',
            border: 'border-success'
        },
        warning: {
            iconBg: 'bg-warning-light', iconText: 'text-warning',
            badgeBg: 'bg-warning-light', badgeText: 'text-warning-hover',
            border: 'border-warning'
        },
        info: {
            iconBg: 'bg-blue-100', iconText: 'text-blue-600',
            badgeBg: 'bg-blue-100', badgeText: 'text-blue-600',
            border: 'border-blue-500'
        },
        danger: {
            iconBg: 'bg-danger-light', iconText: 'text-danger',
            badgeBg: 'bg-danger-light', badgeText: 'text-danger-hover',
            border: 'border-danger'
        }
    };

    const style = styles[type] || styles.primary;

    const renderIcon = (iconClassOrComponent, className = "") => {
        if (typeof iconClassOrComponent === 'string') {
            return <i className={`pi ${iconClassOrComponent} ${className}`}></i>;
        }
        // Clone the component to add className if it's a valid element
        if (React.isValidElement(iconClassOrComponent)) {
            return React.cloneElement(iconClassOrComponent, { className: `${iconClassOrComponent.props.className || ''} ${className}`.trim() });
        }
        return iconClassOrComponent;
    };

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-all duration-300 relative overflow-hidden group cursor-pointer ${isActive ? `ring-2 ring-offset-2 ${style.border} border-transparent` : 'border-secondary/10'}`}
        >
            <div className="flex justify-between items-start z-10 relative mb-4">
                <div>
                    <p className="text-secondary text-sm font-medium mb-1 tracking-wide">{title}</p>
                    <h3 className="text-3xl font-bold text-secondary-dark">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${style.iconBg} ${style.iconText} transition-all duration-300 group-hover:scale-110 flex items-center justify-center`}>
                    {renderIcon(icon, iconSize)}
                </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-secondary/5 relative z-10">
                {details.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-secondary font-medium flex items-center gap-1.5">
                            {renderIcon(item.icon, `text-[10px] ${item.iconColor || 'text-secondary'}`)}
                            {item.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-bold ${item.badgeClass || 'bg-gray-100 text-secondary'}`}>
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>

            <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none">
                {renderIcon(icon, watermarkSize)}
            </div>
        </div>
    );
};

const ResourcesDashboard = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    // Mock Data adapted for StatCard
    const summaryData = [
        {
            title: 'Vehículos',
            value: '45',
            icon: 'pi-car',
            type: 'primary', // Blue-ish in DashboardHome
            details: [
                { label: 'Habilitados', value: '38', icon: 'pi-check-circle', iconColor: 'text-success', badgeClass: 'bg-success-light text-success-hover' },
                { label: 'Vencidos / Rev.', value: '7', icon: 'pi-exclamation-circle', iconColor: 'text-warning', badgeClass: 'bg-warning-light text-warning-hover' }
            ]
        },
        {
            title: 'Empleados',
            value: '128',
            icon: 'pi-users',
            type: 'success', // Green
            details: [
                { label: 'Habilitados', value: '115', icon: 'pi-check-circle', iconColor: 'text-success', badgeClass: 'bg-success-light text-success-hover' },
                { label: 'Sin doc.', value: '13', icon: 'pi-ban', iconColor: 'text-danger', badgeClass: 'bg-danger-light text-danger-hover' }
            ]
        },
        {
            title: 'Maquinaria',
            value: '32',
            icon: <TbBackhoe />,
            type: 'warning', // Orange
            watermarkSize: "text-[13rem]",
            iconSize: "text-3xl", // Larger primary icon specifically for this one
            details: [
                { label: 'Operativas', value: '28', icon: 'pi-check-circle', iconColor: 'text-success', badgeClass: 'bg-success-light text-success-hover' },
                { label: 'En taller', value: '4', icon: 'pi-wrench', iconColor: 'text-secondary', badgeClass: 'bg-gray-100 text-secondary' }
            ]
        },
    ];

    return (
        <div className="animate-fade-in w-full pb-8 space-y-6">
            <PageHeader
                title="Gestión de Recursos"
                subtitle="Administración de flota, personal y equipos especiales."
                icon="pi pi-box"
            />

            {/* Summary Cards with StatCard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {summaryData.map((item, index) => (
                    <StatCard
                        key={index}
                        {...item}
                        isActive={activeIndex === index}
                        onClick={() => setActiveIndex(index)}
                    />
                ))}
            </div>

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
                                    <i className="pi pi-car text-sm"></i>
                                </div>
                                <span className="font-bold text-sm tracking-tight">Vehículos</span>
                            </div>
                        }
                    >
                        <VehiclesList isEmbedded={true} />
                    </TabPanel>

                    <TabPanel
                        header={
                            <div className={`flex items-center gap-3 py-4 px-4 transition-all duration-300 ${activeIndex === 1 ? 'text-primary' : 'text-secondary hover:text-secondary-dark'}`}>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${activeIndex === 1 ? 'bg-primary/10 shadow-sm' : 'bg-transparent'}`}>
                                    <i className="pi pi-users text-sm"></i>
                                </div>
                                <span className="font-bold text-sm tracking-tight">Empleados</span>
                            </div>
                        }
                    >
                        <EmployeesList isEmbedded={true} />
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
                        <MachineryList isEmbedded={true} />
                    </TabPanel>
                </TabView>
            </div>
        </div>
    );
};

export default ResourcesDashboard;

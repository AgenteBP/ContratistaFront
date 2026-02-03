import React, { useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import VehiclesList from './VehiclesList';
import EmployeesList from './EmployeesList';
import MachineryList from './MachineryList';
import PageHeader from '../../components/ui/PageHeader';

const ResourcesDashboard = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className="animate-fade-in w-full pb-8">
            <PageHeader
                title="Gestión de Recursos"
                subtitle="Administración de flota, personal y equipos especiales."
            />

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
                                    <i className="pi pi-cog text-sm"></i>
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

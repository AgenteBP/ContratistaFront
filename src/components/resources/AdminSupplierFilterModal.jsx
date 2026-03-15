import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import Dropdown from '../../components/ui/Dropdown';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { groupService } from '../../services/groupService';
import { companyService } from '../../services/companyService';
import { supplierService } from '../../services/supplierService';

const AdminSupplierFilterModal = ({ visible, onConfirm, onCancel }) => {
    const [groups, setGroups] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [loadingSuppliers, setLoadingSuppliers] = useState(false);

    useEffect(() => {
        if (visible) {
            loadGroups();
        }
    }, [visible]);

    const loadGroups = async () => {
        setLoadingGroups(true);
        try {
            const data = await groupService.getAll();
            const formatted = data.map(g => ({
                label: g.description || g.name || `Grupo ${g.idGroup}`,
                value: g.idGroup,
                ...g
            }));
            // Sort alphabetically
            formatted.sort((a,b) => a.label.localeCompare(b.label));
            setGroups(formatted);
        } catch (error) {
            console.error("Error loading groups:", error);
        } finally {
            setLoadingGroups(false);
        }
    };

    const handleGroupChange = async (e) => {
        const groupId = e.value;
        setSelectedGroup(groupId);
        
        // Reset downward cascade
        setSelectedCompany(null);
        setSelectedSupplier(null);
        setCompanies([]);
        setSuppliers([]);

        if (groupId) {
            setLoadingCompanies(true);
            try {
                const data = await companyService.getByGroup(groupId);
                const formatted = data.map(c => ({
                    label: c.description || c.name || `Empresa ${c.idCompany}`,
                    value: c.idCompany,
                    ...c
                }));
                // Sort alphabetically
                formatted.sort((a,b) => a.label.localeCompare(b.label));
                setCompanies(formatted);
            } catch (error) {
                console.error("Error loading companies:", error);
            } finally {
                setLoadingCompanies(false);
            }
        }
    };

    const handleCompanyChange = async (e) => {
        const companyId = e.value;
        setSelectedCompany(companyId);
        
        // Reset downward cascade
        setSelectedSupplier(null);
        setSuppliers([]);
        
        if (companyId) {
            setLoadingSuppliers(true);
            try {
                const data = await supplierService.getByCompany(companyId);
                const formatted = data.map(s => ({
                    label: s.company_name || s.fantasy_name || s.razonSocial || s.companyName || s.fantasyName || `Proveedor ${s.id_supplier || s.internalId || s.id}`,
                    value: s.id_supplier || s.internalId || s.id,
                    ...s // Keep full object in case
                }));
                // Sort alphabetically
                formatted.sort((a,b) => a.label.localeCompare(b.label));
                setSuppliers(formatted);
            } catch (error) {
                console.error("Error loading suppliers:", error);
            } finally {
                setLoadingSuppliers(false);
            }
        }
    };

    const handleConfirm = () => {
        if (selectedSupplier) {
            const supplierObj = suppliers.find(s => s.value === selectedSupplier);
            const companyObj = companies.find(c => c.value === selectedCompany);
            const groupObj = groups.find(g => g.value === selectedGroup);
            onConfirm({
                supplier: supplierObj,
                company: companyObj,
                group: groupObj
            });
        }
    };

    const footer = (
        <div className="flex justify-end gap-3 rounded-b-xl">
            {onCancel && (
                <button 
                    onClick={onCancel} 
                    className="text-secondary hover:bg-gray-100 font-bold rounded-lg text-sm px-5 py-2.5 transition-all outline-none"
                >
                    Cancelar
                </button>
            )}
            <PrimaryButton 
                label="Confirmar" 
                onClick={handleConfirm} 
                disabled={!selectedSupplier} 
                icon="pi pi-check"
            />
        </div>
    );

    return (
        <Dialog 
            visible={visible} 
            onHide={() => onCancel && onCancel()} 
            blockScroll={true}
            header={
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <i className="pi pi-filter text-xl"></i>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-secondary-dark leading-tight">Seleccionar Proveedor</h3>
                        <p className="text-sm font-normal text-secondary mt-1">Filtrar recursos por proveedor específico</p>
                    </div>
                </div>
            }
            footer={footer}
            className="w-full max-w-md mx-4"
            pt={{
                content: { className: 'p-6 bg-white overflow-visible' },
                header: { className: 'p-6 border-b border-secondary/10 bg-white rounded-t-xl' },
                footer: { className: 'p-4 border-t border-secondary/10 bg-secondary-light/30 rounded-b-xl' },
                mask: { className: 'bg-secondary-dark/60 backdrop-blur-sm' }
            }}
            closable={!!onCancel}
        >
            <div className="space-y-6 pt-2">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary-dark">1. Seleccione el Grupo</label>
                    <Dropdown
                        options={groups}
                        value={selectedGroup}
                        onChange={handleGroupChange}
                        placeholder={loadingGroups ? "Cargando grupos..." : "Seleccionar Grupo"}
                        className="w-full"
                        filter
                        disabled={loadingGroups}
                        appendTo="self"
                    />
                </div>

                <div className={`space-y-2 transition-opacity duration-300 ${!selectedGroup ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <label className="text-sm font-bold text-secondary-dark">2. Seleccione la Empresa</label>
                    <Dropdown
                        options={companies}
                        value={selectedCompany}
                        onChange={handleCompanyChange}
                        placeholder={loadingCompanies ? "Cargando empresas..." : "Seleccionar Empresa"}
                        className="w-full"
                        filter
                        disabled={!selectedGroup || loadingCompanies}
                        appendTo="self"
                    />
                </div>
                
                {selectedGroup && companies.length === 0 && !loadingCompanies && (
                    <div className="p-3 bg-warning-light/50 border border-warning/20 rounded-lg text-xs text-warning-hover mt-[-10px]">
                        <i className="pi pi-info-circle mr-2"></i> No se encontraron empresas para este grupo.
                    </div>
                )}

                <div className={`space-y-2 transition-opacity duration-300 ${!selectedCompany ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <label className="text-sm font-bold text-secondary-dark">3. Seleccione el Proveedor</label>
                    <Dropdown
                        options={suppliers}
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.value)}
                        placeholder={loadingSuppliers ? "Cargando proveedores..." : "Seleccionar Proveedor"}
                        className="w-full"
                        filter
                        disabled={!selectedCompany || loadingSuppliers}
                        appendTo="self"
                    />
                </div>
                
                {selectedCompany && suppliers.length === 0 && !loadingSuppliers && (
                    <div className="p-3 bg-warning-light/50 border border-warning/20 rounded-lg text-xs text-warning-hover mt-[-10px]">
                        <i className="pi pi-info-circle mr-2"></i> No se encontraron proveedores para esta empresa.
                    </div>
                )}
            </div>
        </Dialog>
    );
};

export default AdminSupplierFilterModal;

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';

const AUDIT_VALIDITY_DAYS = 30;

const AuditHistory = () => {
    const navigate = useNavigate();

    // Auditorías (Simulando Backend)
    const [audits, setAudits] = useState(() => {
        const saved = localStorage.getItem('technical_audits_v1');
        return saved ? JSON.parse(saved) : {};
    });

    const [statusFilter, setStatusFilter] = useState('TODOS');

    // Modal de Auditoría
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [auditForm, setAuditForm] = useState({ status: 'APROBADO', observations: '' });

    useEffect(() => {
        localStorage.setItem('technical_audits_v1', JSON.stringify(audits));
    }, [audits]);

    const handleOpenAudit = (provider) => {
        setSelectedProvider(provider);
        const existingAudit = audits[provider.id];
        if (existingAudit) {
            setAuditForm({
                status: existingAudit.status,
                observations: existingAudit.observations || ''
            });
        } else {
            setAuditForm({ status: 'APROBADO', observations: '' });
        }
        setIsAuditModalOpen(true);
    };

    const saveAuditToBackend = async (providerId, auditData) => {
        setAudits(prev => ({
            ...prev,
            [providerId]: {
                ...auditData,
                date: new Date().toISOString()
            }
        }));
    };

    const handleSaveAudit = () => {
        saveAuditToBackend(selectedProvider.id, auditForm);
        setIsAuditModalOpen(false);
    };

    const getAuditStatus = (providerId) => {
        const audit = audits[providerId];
        if (!audit) return { label: 'PENDIENTE', icon: 'pi-circle', color: 'text-secondary/40' };

        const auditDate = new Date(audit.date);
        const daysSince = (new Date() - auditDate) / (1000 * 60 * 60 * 24);

        if (daysSince > AUDIT_VALIDITY_DAYS) {
            return { label: 'VENCIDO', icon: 'pi-clock', color: 'text-warning' };
        }

        if (audit.status === 'OBSERVADO') {
            return { label: 'OBSERVADO', icon: 'pi-exclamation-triangle', color: 'text-warning' };
        }

        return { label: 'APROBADO', icon: 'pi-check-circle', color: 'text-success' };
    };

    const baseProviders = [
        { id: 1, name: 'Prana' },
        { id: 2, name: 'Ingelmec' },
        { id: 3, name: 'Proton' },
        { id: 4, name: 'Origen' },
        { id: 5, name: 'AV Avance' },
        { id: 6, name: 'Paven' },
        { id: 7, name: 'Toto' },
        { id: 8, name: 'Fenix' },
        { id: 9, name: 'Ohm SRL' },
        { id: 10, name: 'Ohm SAS' },
    ];

    const filteredProviders = useMemo(() => {
        let list = baseProviders.map(p => ({
            ...p,
            audit: getAuditStatus(p.id)
        }));

        if (statusFilter !== 'TODOS') {
            list = list.filter(d => d.audit.label === statusFilter);
        }

        return list;
    }, [audits, statusFilter]);

    return (
        <div className="p-4 md:p-8 space-y-8 animate-fade-in bg-slate-50 min-h-screen">
            {/* MODAL DE AUDITORÍA (SOBER REDESIGN) */}
            <Dialog
                visible={isAuditModalOpen}
                onHide={() => setIsAuditModalOpen(false)}
                header={null}
                closable={false}
                className="audit-dialog-sober"
                breakpoints={{ '960px': '75vw', '641px': '95vw' }}
                style={{ width: '32rem' }}
                pt={{
                    root: { className: 'rounded-xl overflow-hidden border-none shadow-2xl' },
                    header: { className: 'hidden' },
                    content: { className: 'p-0 bg-white' }
                }}
            >
                <div className="flex flex-col h-full bg-white">
                    <div className="px-6 py-4 border-b border-secondary/10 flex justify-between items-center bg-slate-50/50 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <i className="pi pi-shield text-primary"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-secondary-dark leading-tight">Ejecutar Auditoría</h3>
                                <p className="text-secondary text-[10px] font-medium leading-none mt-1 uppercase tracking-wider">{selectedProvider?.name}</p>
                            </div>
                        </div>
                        <button onClick={() => setIsAuditModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-200/50 flex items-center justify-center transition-all text-secondary">
                            <i className="pi pi-times text-[10px]"></i>
                        </button>
                    </div>

                    <div className="p-6 space-y-6 flex-1">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-secondary/60 uppercase tracking-widest px-1">Estado de Auditoría</label>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setAuditForm({ ...auditForm, status: 'APROBADO' })}
                                    className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${auditForm.status === 'APROBADO' ? 'border-success bg-success/5 text-success' : 'border-slate-50 text-secondary/40 hover:border-success/20 hover:text-success/60'}`}
                                >
                                    <i className="pi pi-check-circle text-lg"></i>
                                    <span className="font-bold uppercase tracking-wider text-[11px]">Aprobado</span>
                                </button>
                                <button
                                    onClick={() => setAuditForm({ ...auditForm, status: 'OBSERVADO' })}
                                    className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${auditForm.status === 'OBSERVADO' ? 'border-warning bg-warning/5 text-warning-hover' : 'border-slate-50 text-secondary/40 hover:border-warning/20 hover:text-warning/60'}`}
                                >
                                    <i className="pi pi-exclamation-triangle text-lg"></i>
                                    <span className="font-bold uppercase tracking-wider text-[11px]">Observado</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-secondary/60 uppercase tracking-widest px-1">Detalles y Observaciones</label>
                            <InputTextarea
                                value={auditForm.observations}
                                onChange={(e) => setAuditForm({ ...auditForm, observations: e.target.value })}
                                rows={4}
                                className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all p-4 text-secondary-dark text-sm bg-slate-50 border outline-none"
                                placeholder="Describa los hallazgos aquí..."
                            />
                        </div>

                        {selectedProvider && audits[selectedProvider.id] && (
                            <div className="text-[10px] text-secondary/50 font-medium px-1 flex items-center gap-2">
                                <i className="pi pi-info-circle"></i>
                                Última auditoría realizada el {new Date(audits[selectedProvider.id].date).toLocaleDateString()}
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-slate-50/50 border-t border-secondary/10 flex gap-3">
                        <button
                            onClick={() => setIsAuditModalOpen(false)}
                            className="flex-1 py-3 bg-white border border-secondary/20 rounded-xl text-secondary font-bold hover:bg-slate-100 transition-all text-xs uppercase tracking-wider"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSaveAudit}
                            className="flex-[1.5] py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/10 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                        >
                            <i className="pi pi-save"></i>
                            Confirmar
                        </button>
                    </div>
                </div>
            </Dialog>

            <PageHeader
                title="Historial de Auditorías"
                subtitle="Registro histórico y estado de las evaluaciones técnicas a proveedores."
            />

            <div className="bg-white rounded-xl border border-secondary/20 shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-slate-50/50 border-b border-secondary/10 flex flex-wrap items-center gap-4 justify-between">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <span className="hidden sm:block text-[10px] font-bold text-secondary uppercase tracking-wider mr-2">Filtrar por Estado:</span>

                        {/* VISTA DESKTOP: Pills */}
                        <div className="hidden sm:flex items-center gap-1.5 p-1 bg-white rounded-xl border border-secondary/10 shadow-sm">
                            {[
                                { id: 'TODOS', label: 'Todos', icon: 'pi-filter-slash' },
                                { id: 'PENDIENTE', label: 'Pendientes', icon: 'pi-circle' },
                                { id: 'APROBADO', label: 'Aprobados', icon: 'pi-check-circle' },
                                { id: 'OBSERVADO', label: 'Observados', icon: 'pi-exclamation-triangle' },
                            ].map(stat => (
                                <button
                                    key={stat.id}
                                    onClick={() => setStatusFilter(stat.id)}
                                    className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center gap-2 ${statusFilter === stat.id ? 'bg-primary/10 text-primary' : 'text-secondary hover:text-secondary-dark hover:bg-slate-50'}`}
                                >
                                    <i className={`pi ${stat.icon} text-[11px]`}></i>
                                    {stat.label}
                                </button>
                            ))}
                        </div>

                        {/* VISTA MOBILE */}
                        <div className="sm:hidden flex items-center w-full bg-white rounded-xl border border-secondary/10 shadow-sm overflow-hidden h-11">
                            <div className="px-3 border-r border-secondary/5 bg-slate-50/50 h-full flex items-center shrink-0">
                                <span className="text-[9px] font-black text-secondary/40 uppercase tracking-tighter">Filtrar</span>
                            </div>
                            <Dropdown
                                value={statusFilter}
                                options={[
                                    { id: 'TODOS', label: 'Todos los registros', icon: 'pi-filter-slash' },
                                    { id: 'PENDIENTE', label: 'Pendientes', icon: 'pi-circle' },
                                    { id: 'APROBADO', label: 'Aprobados', icon: 'pi-check-circle' },
                                    { id: 'OBSERVADO', label: 'Observados', icon: 'pi-exclamation-triangle' },
                                ]}
                                onChange={(e) => setStatusFilter(e.value)}
                                optionLabel="label"
                                optionValue="id"
                                className="flex-1 border-none bg-transparent"
                                pt={{
                                    root: { className: 'h-full flex items-center px-3 border-none shadow-none focus-within:ring-0 outline-none' },
                                    label: { className: 'text-secondary-dark font-bold text-[9px] p-0 uppercase' },
                                    trigger: { className: 'text-primary' },
                                    input: { className: 'outline-none border-none border-0' }
                                }}
                                valueTemplate={(option) => {
                                    const selected = [
                                        { id: 'TODOS', label: 'Todos', icon: 'pi-filter-slash' },
                                        { id: 'PENDIENTE', label: 'Pendientes', icon: 'pi-circle' },
                                        { id: 'APROBADO', label: 'Aprobados', icon: 'pi-check-circle' },
                                        { id: 'OBSERVADO', label: 'Observados', icon: 'pi-exclamation-triangle' },
                                    ].find(o => o.id === statusFilter);
                                    return (
                                        <div className="flex items-center gap-2">
                                            <i className={`pi ${selected?.icon || 'pi-filter'} text-[10px] text-primary`}></i>
                                            <span className="text-secondary-dark text-[9px] font-bold uppercase">{selected?.label || 'Todos'}</span>
                                        </div>
                                    );
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] uppercase font-bold text-secondary bg-slate-50 border-b border-secondary/10">
                            <tr>
                                <th className="px-6 py-4">Proveedor</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Última Auditoría</th>
                                <th className="px-6 py-4 w-1/3">Observaciones</th>
                                <th className="px-6 py-4 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary/5 font-medium">
                            {filteredProviders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-secondary">
                                        No se encontraron auditorías con este estado.
                                    </td>
                                </tr>
                            ) : filteredProviders.map(p => {
                                const adt = audits[p.id];
                                return (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                                        <td
                                            className="px-6 py-4 font-bold text-primary hover:underline cursor-pointer transition-colors text-sm whitespace-normal"
                                            onClick={() => navigate(`/proveedores/${p.id}`)}
                                        >
                                            {p.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <i className={`pi ${p.audit.icon} ${p.audit.color}`}></i>
                                                <span className={`text-xs font-bold uppercase ${p.audit.color}`}>{p.audit.label}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-secondary text-xs">
                                            {adt ? new Date(adt.date).toLocaleDateString() : 'Nunca'}
                                        </td>
                                        <td className="px-6 py-4 text-secondary text-xs italic opacity-80">
                                            {adt && adt.observations ? (
                                                <span className="line-clamp-2">{adt.observations}</span>
                                            ) : (
                                                <span className="text-secondary/40">Sin observaciones</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                className="px-4 py-2 bg-white border border-secondary/20 hover:border-primary/50 hover:bg-slate-50 rounded-lg text-primary text-xs font-bold transition-all shadow-sm"
                                                onClick={() => handleOpenAudit(p)}
                                            >
                                                Auditar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditHistory;

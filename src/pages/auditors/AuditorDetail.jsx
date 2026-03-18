import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/Badges';
import AuditorForm from './AuditorForm';
import { formatCUIT } from '../../utils/formatUtils';
import { auditorService } from '../../services/auditorService';
import { companyService } from '../../services/companyService';
import { useNotification } from '../../context/NotificationContext';

const AuditorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();
    const [activeIndex, setActiveIndex] = useState(0);

    const [auditor, setAuditor] = useState(null);
    const [allCompanies, setAllCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [auditorData, companiesData] = await Promise.all([
                auditorService.getById(id),
                companyService.getAll()
            ]);
            setAuditor(auditorData);
            setAllCompanies(companiesData);
        } catch (err) {
            console.error("Error loading auditor detail:", err);
            setError("No se pudo cargar la información del auditor.");
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (company) => {
        try {
            await auditorService.assignCompany(id, company.idCompany);
            showSuccess('Empresa Asignada', `Se ha asignado ${company.description} al auditor.`);
            // Recargar datos para ver el cambio
            const updatedAuditor = await auditorService.getById(id);
            setAuditor(updatedAuditor);
        } catch (err) {
            showError('Error', 'No se pudo asignar la empresa.');
        }
    };

    const handleRemove = async (company) => {
        try {
            await auditorService.removeCompany(id, company.idCompany);
            showSuccess('Empresa Desasignada', `Se ha quitado ${company.description} del auditor.`);
            // Recargar datos para ver el cambio
            const updatedAuditor = await auditorService.getById(id);
            setAuditor(updatedAuditor);
        } catch (err) {
            showError('Error', 'No se pudo desasignar la empresa.');
        }
    };

    // Filtrar empresas disponibles (que no estén ya asignadas)
    const availableCompanies = useMemo(() => {
        if (!allCompanies || !auditor) return [];
        const assignedIds = auditor.assignedCompanies?.map(c => c.idCompany) || [];
        return allCompanies.filter(c =>
            !assignedIds.includes(c.idCompany) &&
            (c.description.toLowerCase().includes(searchTerm.toLowerCase()) || c.cuit?.includes(searchTerm))
        );
    }, [allCompanies, auditor, searchTerm]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 animate-pulse">
                <i className="pi pi-spin pi-spinner text-4xl text-primary mb-4"></i>
                <p className="text-secondary-dark font-medium">Cargando detalles...</p>
            </div>
        );
    }

    if (error || !auditor) {
        return (
            <div className="p-10 text-center animate-fade-in">
                <i className="pi pi-exclamation-triangle text-4xl text-warning mb-4"></i>
                <h2 className="text-2xl font-bold text-secondary-dark">{error || "Auditor no encontrado"}</h2>
                <button
                    onClick={() => navigate('/auditores')}
                    className="mt-4 text-primary hover:underline font-bold"
                >
                    Volver al listado
                </button>
            </div>
        );
    }

    const fullName = `${auditor.user?.firstName || ''} ${auditor.user?.lastName || ''}`.trim() || 'Auditor';

    return (
        <div className="animate-fade-in w-full max-w-6xl mx-auto p-4 md:p-8">
            {/* ENCABEZADO */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                            {fullName.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-secondary-dark tracking-tight leading-tight">
                                {fullName}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <StatusBadge status={auditor.user?.active ? "ACTIVO" : "INACTIVO"} />
                                <span className="text-xs text-secondary bg-secondary-light px-2 py-0.5 rounded-full font-mono">ID: {auditor.id_auditor}</span>
                                <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/20">
                                    {auditor.type_auditor === 'LEGAL' ? 'AUDITOR LEGAL' : 'AUDITOR TÉCNICO'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => navigate('/auditores')} className="bg-white border border-secondary/30 text-secondary-dark hover:bg-secondary-light px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
                        <i className="pi pi-arrow-left text-xs"></i> Volver
                    </button>
                    <button
                        onClick={() => navigate(`/usuarios/${auditor.user?.id}`)}
                        className="bg-primary text-white hover:bg-primary-hover px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/30 transition-all flex items-center gap-2 transform active:scale-95"
                    >
                        <i className="pi pi-pencil"></i> Editar Perfil
                    </button>
                </div>
            </div>

            {/* CONTENIDO CON PESTAÑAS */}
            <div className="mt-8">
                <div className="text-sm font-medium text-center text-secondary border-b border-secondary/10 mb-6">
                    <ul className="flex flex-wrap -mb-px">
                        <li className="me-2">
                            <button
                                onClick={() => setActiveIndex(0)}
                                className={`
                                    inline-flex items-center gap-2 p-4 border-b-2 rounded-t-lg transition-all
                                    ${activeIndex === 0
                                        ? 'text-primary border-primary active group'
                                        : 'border-transparent hover:text-secondary-dark hover:border-secondary/30'
                                    }
                                `}
                            >
                                <i className={`pi pi-user ${activeIndex === 0 ? 'text-primary' : 'text-secondary/50 group-hover:text-secondary'}`}></i>
                                Perfil
                            </button>
                        </li>
                        <li className="me-2">
                            <button
                                onClick={() => setActiveIndex(1)}
                                className={`
                                    inline-flex items-center gap-2 p-4 border-b-2 rounded-t-lg transition-all
                                    ${activeIndex === 1
                                        ? 'text-primary border-primary active group'
                                        : 'border-transparent hover:text-secondary-dark hover:border-secondary/30'
                                    }
                                `}
                            >
                                <i className={`pi pi-building ${activeIndex === 1 ? 'text-primary' : 'text-secondary/50 group-hover:text-secondary'}`}></i>
                                Empresas Asignadas
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Tab Panels */}
                <div className="animate-fade-in">
                    {activeIndex === 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-secondary/20 p-6 animate-fade-in max-w-4xl">
                            <AuditorForm
                                initialData={{
                                    nombre: auditor.user?.firstName || '',
                                    apellido: auditor.user?.lastName || '',
                                    matricula: auditor.registration_number,
                                    tipo: auditor.type_auditor,
                                    empresas: auditor.assignedCompanies || []
                                }}
                                readOnly={true}
                            />
                        </div>
                    )}

                    {activeIndex === 1 && (
                        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-6 h-[580px]">

                            {/* COLUMNA IZQUIERDA: DISPONIBLES */}
                            <div className="flex flex-col bg-white rounded-xl border border-secondary/20 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-secondary/10 flex flex-col gap-3">
                                    <h4 className="text-secondary-dark font-bold text-sm uppercase tracking-wide">
                                        Empresas Disponibles
                                    </h4>
                                    <div className="relative">
                                        <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-secondary"></i>
                                        <input
                                            type="text"
                                            placeholder="Buscar empresa por nombre o CUIT..."
                                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-secondary/30 focus:border-primary focus:ring-1 focus:ring-primary/50 text-sm transition-all placeholder:text-secondary/50"
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            value={searchTerm}
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                                    {availableCompanies.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-secondary/40 text-sm p-4 text-center">
                                            <i className="pi pi-search text-2xl mb-2"></i>
                                            <p>{searchTerm ? "No se encontraron resultados" : "Empieza a escribir para buscar"}</p>
                                        </div>
                                    ) : (
                                        availableCompanies.map((company) => (
                                            <div
                                                key={company.idCompany}
                                                className="group p-4 rounded-xl border border-secondary/20 bg-white hover:border-primary/50 hover:shadow-md transition-all flex items-center justify-between cursor-default"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-bold text-secondary-dark text-sm truncate">{company.description}</p>
                                                    <p className="text-xs text-secondary mt-1">CUIT: {formatCUIT(company.cuit)}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleAssign(company)}
                                                    className="w-9 h-9 rounded-full bg-secondary-light/50 text-secondary hover:bg-primary hover:text-white flex items-center justify-center transition-all shadow-sm transform active:scale-95"
                                                    title="Asignar empresa"
                                                >
                                                    <i className="pi pi-plus font-bold text-xs"></i>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* COLUMNA DERECHA: ASIGNADAS */}
                            <div className="flex flex-col bg-white rounded-xl border border-secondary/20 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-secondary/10 flex justify-between items-center bg-gray-50/50">
                                    <h4 className="text-primary font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                                        Asignadas <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs ml-1">{auditor.assignedCompanies?.length || 0}</span>
                                    </h4>
                                </div>

                                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                                    {!auditor.assignedCompanies?.length ? (
                                        <div className="h-full flex flex-col items-center justify-center text-secondary/40 text-sm p-4 text-center">
                                            <i className="pi pi-folder-open text-2xl mb-2"></i>
                                            <p>Sin asignaciones</p>
                                        </div>
                                    ) : (
                                        auditor.assignedCompanies.map((company) => (
                                            <div
                                                key={company.idCompany}
                                                className="group p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all flex items-center justify-between cursor-default shadow-sm"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-bold text-primary-dark text-sm truncate">{company.description}</p>
                                                    <p className="text-xs text-secondary mt-1">CUIT: {formatCUIT(company.cuit)}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemove(company)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-secondary/20 text-secondary hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm transform active:scale-95"
                                                    title="Desasignar empresa"
                                                >
                                                    <i className="pi pi-minus font-bold text-xs"></i>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditorDetail;

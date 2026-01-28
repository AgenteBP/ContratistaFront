import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_EMPRESAS } from '../../data/mockCompanies';
import { StatusBadge } from '../../components/ui/Badges';

const CompanyList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCompanies = MOCK_EMPRESAS.filter(c =>
        c.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.cuit.includes(searchTerm) ||
        c.rubro.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-dark">Empresas</h1>
                    <p className="text-secondary text-sm">Gestione el directorio de clientes y sus configuraciones.</p>
                </div>
                <button
                    onClick={() => navigate('/empresas/nueva')}
                    className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg shadow-lg shadow-primary/30 transition-all flex items-center gap-2 transform active:scale-95"
                >
                    <i className="pi pi-plus"></i>
                    Nueva Empresa
                </button>
            </div>

            <div className="bg-white rounded-xl border border-secondary/20 shadow-sm overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-secondary/10 bg-gray-50/50 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-secondary"></i>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, CUIT o rubro..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-secondary/30 focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                            onChange={(e) => setSearchTerm(e.target.value)}
                            value={searchTerm}
                        />
                    </div>
                </div>

                {/* List Content */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-secondary text-xs uppercase tracking-wider border-b border-secondary/10">
                                <th className="p-4 font-bold">Razón Social</th>
                                <th className="p-4 font-bold">CUIT</th>
                                <th className="p-4 font-bold">Rubro</th>
                                <th className="p-4 font-bold">Grupo</th>
                                <th className="p-4 font-bold text-center">Estado</th>
                                <th className="p-4 font-bold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary/10">
                            {filteredCompanies.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-secondary">
                                        <div className="flex flex-col items-center gap-2">
                                            <i className="pi pi-search text-2xl opacity-50"></i>
                                            <p>No se encontraron empresas.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCompanies.map((company) => (
                                    <tr key={company.id} className="hover:bg-primary/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {company.razonSocial.charAt(0)}
                                                </div>
                                                <span className="font-bold text-secondary-dark">{company.razonSocial}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-secondary font-mono">{company.cuit}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded bg-gray-100 text-xs font-medium text-secondary-dark border border-secondary/10">
                                                {company.rubro}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-secondary">{company.grupo}</td>
                                        <td className="p-4 text-center">
                                            <StatusBadge status={company.estatus} />
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="text-secondary hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10">
                                                <i className="pi pi-pencil"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CompanyList;

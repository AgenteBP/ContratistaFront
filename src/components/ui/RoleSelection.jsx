import React, { useState, useEffect } from 'react';
import SectionTitle from './SectionTitle';
import { userService } from '../../services/userService';

const RoleSelection = ({ onSelect, onBack, readOnly = false }) => {
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);

    useEffect(() => {
        const fetchRoles = async () => {
            const availableRoles = await userService.getAvailableRoles();
            setRoles(availableRoles);
        };
        fetchRoles();
    }, []);

    const handleSelect = (roleId) => {
        if (readOnly) return;
        setSelectedRole(roleId);
    };

    const handleNext = () => {
        if (selectedRole) {
            onSelect(selectedRole);
        }
    };

    return (
        <div className="animate-fade-in w-full">
            <SectionTitle title="Asignación de Rol" subtitle="Defina el rol principal para este usuario." />

            <div className="bg-white border border-secondary/20 rounded-xl shadow-sm p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            onClick={() => handleSelect(role.id)}
                            className={`
                                cursor-pointer rounded-xl p-6 border-2 transition-all duration-300 hover:shadow-lg
                                ${selectedRole === role.id
                                    ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                                    : 'border-secondary/20 hover:border-primary/50 bg-white'
                                }
                                ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}
                            `}
                        >
                            <div className={`p-3 rounded-full w-fit mb-4 ${selectedRole === role.id ? 'bg-primary text-white' : 'bg-secondary-light text-secondary-dark'}`}>
                                <i className={`pi ${role.id === 'PROVEEDOR' ? 'pi-truck' : role.id === 'EMPRESA' ? 'pi-building' : 'pi-shield'} text-xl`}></i>
                            </div>
                            <h3 className={`text-lg font-bold mb-2 ${selectedRole === role.id ? 'text-primary' : 'text-secondary-dark'}`}>
                                {role.name}
                            </h3>
                            <p className="text-secondary text-sm leading-relaxed">
                                {role.description}
                            </p>
                        </div>
                    ))}
                </div>

                {!readOnly && (
                    <div className="flex justify-between pt-4 border-t border-secondary/10">
                        {/* Back Button Container */}
                        <div>
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="text-secondary hover:text-secondary-dark font-medium rounded-lg text-sm px-5 py-2.5 transition-all flex items-center gap-2 hover:bg-gray-100"
                                >
                                    <i className="pi pi-arrow-left"></i> Volver
                                </button>
                            )}
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={!selectedRole}
                            className={`
                                font-bold rounded-lg text-sm px-5 py-2.5 shadow-lg transition-all flex items-center gap-2
                                ${selectedRole
                                    ? 'text-white bg-primary hover:bg-primary-hover shadow-primary/30'
                                    : 'text-secondary bg-gray-200 cursor-not-allowed shadow-none'
                                }
                            `}
                        >
                            Siguiente Paso <i className="pi pi-arrow-right"></i>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoleSelection;

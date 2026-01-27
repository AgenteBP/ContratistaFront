import React, { useState, useEffect } from 'react';
import WizardSteps from '../../components/ui/WizardSteps';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import UserForm from '../../components/ui/UserForm';
import RoleSelection from '../../components/ui/RoleSelection';
import ProviderForm from './ProviderForm';
import AuditorForm from '../auditors/AuditorForm';
import SelectionToggle from '../../components/ui/SelectionToggle';
import { userService } from '../../services/userService';
import { providerService } from '../../services/providerService';
import { MOCK_USERS } from '../../data/mockUsers';
import { MOCK_PROVEEDORES } from '../../data/mockProviders';
import { Dropdown } from 'primereact/dropdown';

const NewProvider = () => {
  const { id } = useParams(); // ID del usuario si estamos agregando rol
  const navigate = useNavigate();
  // Using URLSearchParams to get query params
  const [searchParams] = useSearchParams();
  const preSelectedRole = searchParams.get('role');

  // State del Wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [userMode, setUserMode] = useState('NEW'); // 'NEW' | 'EXISTING'
  const [providerMode, setProviderMode] = useState('NEW'); // 'NEW' | 'EXISTING'

  // Data acumulada
  const [userData, setUserData] = useState(null);
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || null);
  const [createdUser, setCreatedUser] = useState(null);
  const [selectedExistingProvider, setSelectedExistingProvider] = useState(null);

  // Efecto para cargar usuario existente si hay ID
  useEffect(() => {
    if (id) {
      // Simular fetch de usuario
      const existingUser = MOCK_USERS.find(u => u.id === parseInt(id));
      if (existingUser) {
        setUserData(existingUser);
        setCreatedUser(existingUser);

        // Check for preSelectedRole
        if (preSelectedRole) {
          // Validate if role exists/is valid could be done here, but let's assume valid for now
          setSelectedRole(preSelectedRole);
          setCurrentStep(3); // Jump directly to form
        } else {
          setCurrentStep(2); // Normal flow: Role Selection
        }
      } else {
        alert("Usuario no encontrado");
        navigate('/usuarios');
      }
    }
  }, [id, navigate, preSelectedRole]);

  // --- HANDLERS ---

  // Paso 1: Usuario completado
  const handleUserSubmit = (data) => {
    setUserData(data);
    // Solo saltamos al paso 3 si el rol fue PRE-SELECCIONADO desde la URL (ej: botón Nuevo Proveedor)
    // De lo contrario, dejar que el usuario elija/confirme el rol en el paso 2
    if (preSelectedRole) {
      setCurrentStep(3);
    } else {
      setCurrentStep(2);
    }
  };

  // Paso 2: Rol seleccionado
  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setCurrentStep(3);
  };

  // Paso 3: Entidad completada (Provider)
  const handleProviderSubmit = async () => {
    try {
      let userToUse = createdUser;

      // 1. Crear Usuario (SOLO SI NO EXISTE)
      if (!id) {
        userToUse = await userService.create(userData);
        setCreatedUser(userToUse);
      }

      // 2. Asignar Rol
      await userService.assignRole(userToUse.id, selectedRole);

      // 3. Crear O Asociar Provider (si aplica)
      if (selectedRole === 'PROVEEDOR') {
        if (selectedExistingProvider) {
          console.log(`Asociando proveedor existente ID ${selectedExistingProvider.id} a usuario ${userToUse.id}`);
          // providerService.associate(userToUse.id, selectedExistingProvider.id);
        } else {
          console.log("Creando NUEVO proveedor asociado al usuario " + userToUse.id);
          // providerService.create(userToUse.id, formData...);
        }
      }

      setCurrentStep(4);
    } catch (error) {
      console.error("Error en el wizard:", error);
      alert("Hubo un error al crear los registros.");
    }
  };

  // Handler para Volver
  const handleBack = () => {
    // Si el rol fue pre-seleccionado (no modificable), y estamos en el paso 3 (formulario),
    // volver directamente al paso 1 (usuario), saltando la selección de rol.
    if (preSelectedRole && currentStep === 3) {
      setCurrentStep(1);
      return;
    }

    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Helper para saber si el usuario ya tiene el rol
  const userHasRole = (role) => {
    if (!userData) return false;
    // Chequeo simple basado en rolesDetails del mock
    return userData.rolesDetails && userData.rolesDetails.some(r => r.roleName === role);
  };

  // --- RENDERIZADO POR PASO ---

  const renderStep = () => {
    const isExistingRole = selectedRole && userHasRole(selectedRole);
    // Determinar si mostrar el botón de volver en el paso actual
    // Si hay ID y estamos en el paso 2, NO mostramos volver (porque el paso 1 no existe en este flujo)
    const showBack = !(id && currentStep === 2) && currentStep > 1;

    switch (currentStep) {
      case 1:
        return (
          <div className={`bg-white rounded-xl border border-secondary/20 shadow-sm animate-fade-in ${searchParams.get('mode') === 'NEW' ? 'p-0 border-none shadow-none bg-transparent' : 'p-6'}`}>

            {/* Si NO venimos forzados a modo NEW, mostramos el toggle */}
            {searchParams.get('mode') !== 'NEW' && (
              <SelectionToggle
                options={[
                  { label: 'Crear Nuevo Usuario', value: 'NEW' },
                  { label: 'Buscar Existente', value: 'EXISTING' }
                ]}
                value={userMode}
                onChange={setUserMode}
              />
            )}

            <div className={searchParams.get('mode') === 'NEW' ? 'mt-0' : 'mt-6'}>
              {userMode === 'NEW' ? (
                <UserForm
                  initialData={userData || {}}
                  onSubmit={handleUserSubmit}
                />
              ) : (
                <div className="flex flex-col gap-6 max-w-md mx-auto text-center py-4">
                  <div className="bg-blue-50 text-blue-700 p-4 rounded-lg flex items-start gap-3 text-sm text-left">
                    <i className="pi pi-info-circle text-lg mt-0.5"></i>
                    <p>Seleccione un usuario ya registrado para asignarle un nuevo rol o entidad.</p>
                  </div>

                  <div className="text-left">
                    <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Buscar Usuario</label>
                    <Dropdown
                      value={userData}
                      options={MOCK_USERS}
                      onChange={(e) => setUserData(e.value)}
                      optionLabel="username"
                      itemTemplate={(option) => (
                        <div className="flex flex-col">
                          <span className="font-bold">{option.firstName} {option.lastName}</span>
                          <span className="text-xs text-secondary">@{option.username}</span>
                        </div>
                      )}
                      filter
                      filterBy="username,firstName,lastName"
                      placeholder="Escriba para buscar..."
                      className="w-full"
                      pt={{
                        root: { className: 'w-full border border-secondary/30 rounded-lg h-10 flex items-center' },
                        input: { className: 'text-sm px-3' }
                      }}
                    />
                  </div>

                  <button
                    onClick={() => handleUserSubmit(userData)}
                    disabled={!userData}
                    className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-lg
                                ${userData ? 'bg-primary hover:bg-primary-hover shadow-primary/30' : 'bg-gray-300 cursor-not-allowed'}
                            `}
                  >
                    Continuar <i className="pi pi-arrow-right ml-2"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col gap-4 animate-fade-in">
            {id && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-start gap-3">
                <i className="pi pi-info-circle mt-0.5 text-lg"></i>
                <div>
                  <p className="font-bold">Selección de Contexto</p>
                  <p>Si seleccionas un rol que el usuario ya posee, se le permitirá asociar una <strong>nueva entidad</strong> (ej: otra empresa) a dicho rol.</p>
                </div>
              </div>
            )}
            <RoleSelection
              selectedRole={selectedRole}
              onSelect={handleRoleSelect}
              onBack={showBack ? handleBack : undefined}
            />
          </div>
        );
      case 3:
        if (selectedRole === 'PROVEEDOR') {
          return (
            <div className="bg-white p-6 rounded-xl border border-secondary/20 shadow-sm animate-fade-in">
              <SelectionToggle
                options={[
                  { label: isExistingRole ? "Agregar Nueva Entidad" : "Crear Nueva Empresa", value: 'NEW' },
                  { label: "Asociar Empresa Existente", value: 'EXISTING' }
                ]}
                value={providerMode}
                onChange={setProviderMode}
              />

              <div className="mt-6">
                {providerMode === 'NEW' ? (
                  <ProviderForm
                    title={isExistingRole ? "Agregar Nueva Entidad Proveedor" : "Datos del Proveedor"}
                    subtitle={isExistingRole
                      ? `El usuario ya es Proveedor. Complete los datos de la NUEVA empresa a asociar.`
                      : `Configurando el primer perfil de proveedor para ${userData?.username}`}
                    onSubmit={handleProviderSubmit}
                    onBack={handleBack}
                  />
                ) : (
                  <div className="flex flex-col gap-6 max-w-md mx-auto text-center py-4">
                    <div className="bg-blue-50 text-blue-700 p-4 rounded-lg flex items-start gap-3 text-sm text-left">
                      <i className="pi pi-info-circle text-lg mt-0.5"></i>
                      <p>Seleccione una empresa ya registrada para asociarla a este usuario.</p>
                    </div>

                    <div className="text-left">
                      <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Buscar Empresa / Proveedor</label>
                      <Dropdown
                        value={selectedExistingProvider}
                        options={MOCK_PROVEEDORES}
                        optionLabel="razonSocial"
                        onChange={(e) => setSelectedExistingProvider(e.value)}
                        itemTemplate={(option) => (
                          <div className="flex flex-col">
                            <span className="font-bold">{option.razonSocial}</span>
                            <span className="text-xs text-secondary">CUIT: {option.cuit}</span>
                          </div>
                        )}
                        filter
                        filterBy="razonSocial,cuit"
                        placeholder="Buscar por Razón Social o CUIT..."
                        className="w-full"
                        pt={{
                          root: { className: 'w-full border border-secondary/30 rounded-lg h-10 flex items-center' },
                          input: { className: 'text-sm px-3' }
                        }}
                      />
                    </div>

                    <button
                      onClick={handleProviderSubmit}
                      disabled={!selectedExistingProvider}
                      className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-lg
                                    ${selectedExistingProvider ? 'bg-primary hover:bg-primary-hover shadow-primary/30' : 'bg-gray-300 cursor-not-allowed'}
                                `}
                    >
                      Asociar y Finalizar <i className="pi pi-check ml-2"></i>
                    </button>
                    <div className="mt-4 flex justify-start">
                      <button
                        onClick={handleBack}
                        className="text-secondary hover:text-black font-medium flex items-center gap-2"
                      >
                        <i className="pi pi-arrow-left"></i> Volver
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        }
        if (selectedRole === 'AUDITOR') {
          return (
            <AuditorForm
              initialData={{ nombre: userData?.firstName, apellido: userData?.lastName }}
              onSubmit={handleProviderSubmit}
              onBack={handleBack}
            />
          );
        }

        return (
          <div className="bg-white p-8 rounded-xl border border-secondary/20 text-center">
            <i className="pi pi-info-circle text-4xl text-primary mb-4"></i>
            <h2 className="text-xl font-bold text-secondary-dark">Configuración de {selectedRole}</h2>
            <p className="text-secondary mt-2">Formulario específico en desarrollo.</p>
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-secondary/10">
              <button
                onClick={handleBack}
                className="text-secondary hover:text-black font-medium flex items-center gap-2"
              >
                <i className="pi pi-arrow-left"></i> Volver
              </button>
              <button onClick={handleProviderSubmit} className="text-white bg-primary px-5 py-2.5 rounded-lg font-bold">
                Finalizar y Guardar
              </button>
            </div>
          </div>
        );
      case 4:
        const isExistingRoleFinal = selectedRole && userHasRole(selectedRole);
        return (
          <div className="bg-white p-12 rounded-xl border border-secondary/20 text-center animate-fade-in">
            <div className="w-20 h-20 bg-success-light rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="pi pi-check text-4xl text-success"></i>
            </div>
            <h2 className="text-3xl font-extrabold text-secondary-dark mb-2">¡Operación Exitosa!</h2>
            <p className="text-secondary mb-8 text-lg">
              {id ? (
                isExistingRoleFinal ? (
                  <>Se ha asociado una <strong>nueva entidad</strong> del tipo <strong>{selectedRole}</strong> al usuario <strong>{userData?.username}</strong>.</>
                ) : (
                  <>Se ha agregado el nuevo rol <strong>{selectedRole}</strong> al usuario <strong>{userData?.username}</strong> {selectedExistingProvider ? ` y se ha asociado a ${selectedExistingProvider.razonSocial}` : ''}.</>
                )
              ) : (
                <>Se ha creado el usuario <strong>{createdUser?.username}</strong> con el rol <strong>{selectedRole}</strong>.</>
              )}
            </p>

            <div className="flex justify-center gap-4">
              <button onClick={() => navigate('/proveedores')} className="text-secondary-dark bg-gray-100 hover:bg-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 transition-all">
                Ir al Listado
              </button>
              {id && (
                <button onClick={() => navigate(`/usuarios/${id}`)} className="text-white bg-primary hover:bg-primary-hover font-bold rounded-lg text-sm px-5 py-2.5 shadow-lg transition-all">
                  Volver al Usuario
                </button>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">

      {/* Header Global del Wizard */}
      <div className="mb-8 text-center">
        <p className="text-primary font-bold tracking-wider uppercase text-xs mb-2">Gestión de Usuarios</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-secondary-dark">
          {id
            ? 'Agregar Nuevo Rol'
            : (preSelectedRole === 'PROVEEDOR'
              ? 'Nuevo Proveedor'
              : (preSelectedRole === 'AUDITOR' ? 'Nuevo Auditor' : 'Nuevo Usuario')
            )
          }
        </h1>
      </div>

      {/* Pasos dinámicos del Wizard */}
      {(() => {
        // Definir los labels dinámicamente
        const stepsItems = [
          { label: 'Datos Usuario' },
          {
            label: 'Asignación Rol',
            context: (currentStep > 2 || selectedRole) ? selectedRole : null
          },
          {
            label: selectedRole === 'AUDITOR' ? 'Datos Auditor' : (selectedRole === 'PROVEEDOR' ? 'Datos Proveedor' : 'Datos Entidad')
          }
        ];

        return <WizardSteps currentStep={currentStep} steps={stepsItems} id={id} />;
      })()}

      {/* Contexto del Usuario Activo (Solo pasos 2 y 3) */}
      {userData && (currentStep === 2 || currentStep === 3) && (
        <div className="max-w-xl mx-auto mb-8 animate-fade-in text-center">
          <div className="inline-flex items-center gap-3 bg-white px-5 py-2 rounded-full shadow-sm border border-secondary/20">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs ring-2 ring-white">
              {userData.firstName?.charAt(0) || 'U'}{userData.lastName?.charAt(0) || ''}
            </div>
            <div className="text-left leading-tight">
              <p className="text-xs text-secondary font-bold uppercase tracking-wider">Usuario</p>
              <p className="text-sm font-semibold text-secondary-dark">{userData.firstName} {userData.lastName} <span className="text-secondary font-normal">(@{userData.username})</span></p>
            </div>
          </div>
        </div>
      )}

      {renderStep()}
    </div>
  );
};

export default NewProvider;
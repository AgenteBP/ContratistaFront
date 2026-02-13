import React, { useState, useEffect } from 'react';
import WizardSteps from '../../components/ui/WizardSteps';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import UserForm from '../../components/ui/UserForm';
import RoleSelection from '../../components/ui/RoleSelection';
import SupplierForm from './SupplierForm';
import AuditorForm from '../auditors/AuditorForm';
import CompanyForm from '../companies/CompanyForm';
import SelectionToggle from '../../components/ui/SelectionToggle';
import { userService } from '../../services/userService';
import { supplierService } from '../../services/supplierService';
import { auditorService } from '../../services/auditorService';
import { companyService } from '../../services/companyService';
import { groupService } from '../../services/groupService';
import { companyClientService } from '../../services/companyClientService';
import { MOCK_USERS } from '../../data/mockUsers';
import { MOCK_SUPPLIERS } from '../../data/mockSuppliers';
import { formatCUIT } from '../../utils/formatUtils';
import Dropdown from '../../components/ui/Dropdown';

const NewSupplier = () => {
  const { id } = useParams(); // ID del usuario si estamos agregando rol
  const navigate = useNavigate();
  // Using URLSearchParams to get query params
  const [searchParams] = useSearchParams();
  const preSelectedRole = searchParams.get('role');

  // State del Wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [userMode, setUserMode] = useState('NEW'); // 'NEW' | 'EXISTING'
  const [supplierMode, setSupplierMode] = useState('NEW'); // 'NEW' | 'EXISTING'

  // Data acumulada
  const [userData, setUserData] = useState(null);
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || null);
  const [createdUser, setCreatedUser] = useState(null);
  const [selectedExistingSupplier, setSelectedExistingSupplier] = useState(null);

  // Real Data State
  const [users, setUsers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [auditors, setAuditors] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load Users and Suppliers on Mount
  // Load Users and Suppliers on Mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1. Fetch Users (Critical)
      try {
        const usersData = await userService.getAll();
        setUsers(usersData || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }

      // 2. Fetch Suppliers (Critical)
      try {
        const suppliersData = await supplierService.getAll();
        setSuppliers(suppliersData || []);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }

      // 3. Fetch Auditors (Optional/New)
      try {
        const auditorsData = await auditorService.getAll();
        setAuditors(auditorsData || []);
      } catch (error) {
        console.error("Error fetching auditors (Check Backend):", error);
      }

      // 4. Fetch Companies (Optional/New)
      try {
        const companiesData = await companyService.getAll();
        setCompanies(companiesData || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }

      setLoading(false);
    };

    const fetchGroups = async () => {
      try {
        const data = await groupService.getAll();
        setGroups(data || []);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchData();
    fetchGroups();
  }, []);


  // Efecto para cargar usuario existente si hay ID
  useEffect(() => {
    if (id) {
      const fetchExistingUser = async () => {
        try {
          const user = await userService.getById(id);
          if (user) {
            setUserData(user);
            setCreatedUser(user);

            if (preSelectedRole) {
              setSelectedRole(preSelectedRole);
              setCurrentStep(3);
            } else {
              setCurrentStep(2);
            }
          }
        } catch (error) {
          console.error("Error fetching user by ID:", error);
        }
      };

      if (id) fetchExistingUser(); // Call API instead of Mock

      // Fallback logic removed for cleaner implementation
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

  // Paso 3: Entidad completada (Supplier)
  const handleSupplierSubmit = async (supplierFormData) => {
    try {
      // 1. Prepare Data for Backend
      // We need to send a SupplierInsertDTO which includes the user RegisterRequest

      // Map frontend role name to backend enum
      let backendRole = selectedRole;
      if (selectedRole === 'PROVEEDOR') {
        backendRole = 'SUPPLIER';
      } else if (selectedRole === 'EMPRESA') {
        backendRole = 'CUSTOMER';
      }

      // Construct RegisterRequest part
      const registerRequest = {
        userName: userData.username,
        password: userData.password || 'default123', // Handle password if missing in existing
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: backendRole, // 'SUPPLIER', 'AUDITOR', 'CUSTOMER'
        active: true
      };

      // Construct Supplier part (Only if PROVEEDOR for now)
      if (selectedRole === 'PROVEEDOR') {

        let supplierPayload = {};

        if (supplierMode === 'EXISTING' && selectedExistingSupplier) {
          // LINKING EXISTING SUPPLIER
          supplierPayload = {
            registerRequest: registerRequest,
            // Minimal data to identify supplier (Backend looks up by CUIT)
            cuit: selectedExistingSupplier.cuit,
            // We can pass other fields but they won't be updated by default logic
            company_name: selectedExistingSupplier.company_name,
            fantasy_name: selectedExistingSupplier.fantasy_name,
            // ... other fields as needed to pass validation if strictly required, 
            // but backend mainly needs CUIT for existing check.
          };
        } else if (supplierFormData) {
          // CREATING NEW SUPPLIER (or updating DTO struct)
          supplierPayload = {
            // User Data embedded
            registerRequest: registerRequest,

            // Supplier Data
            company_name: supplierFormData.razonSocial,
            cuit: Number(supplierFormData.cuit.replace(/-/g, '')), // Strip dashes if any
            fantasy_name: supplierFormData.nombreFantasia,
            type_person: supplierFormData.tipoPersona,
            classification_afip: supplierFormData.clasificacionAFIP,
            category_service: supplierFormData.servicio,
            email_corporate: supplierFormData.email,
            phone: supplierFormData.telefono ? Number(supplierFormData.telefono) : null,
            is_an_afip_employer: supplierFormData.empleadorAFIP,
            is_temporary_hiring: supplierFormData.esTemporal,

            // Address
            country: supplierFormData.pais,
            province: supplierFormData.provincia,
            city: supplierFormData.localidad,
            postal_code: supplierFormData.codigoPostal ? Number(supplierFormData.codigoPostal) : null,
            address_tax: supplierFormData.direccionFiscal,
            address_real: supplierFormData.direccionReal,

            // CONTACTS - APPLYING FIX HERE
            contacts: supplierFormData.contactos ? {
              list: supplierFormData.contactos.map(c => ({
                ...c, // SPREAD ORIGINAL FIELDS TO PRESERVE DATA (Fix)
                id: c.id,
                nombre: c.nombre ? String(c.nombre).trim() : '',
                tipo: c.tipo ? String(c.tipo).trim() : '',
                dni: c.dni ? String(c.dni).trim() : '',
                email: c.email ? String(c.email).trim() : '',
                movil: c.movil ? String(c.movil).trim() : '',
                telefono: c.telefono ? String(c.telefono).trim() : '',
              }))
            } : null,

            // Documents
            document_supplier: supplierFormData.documentacion ? {
              list: supplierFormData.documentacion.map(d => ({
                id: d.id,
                tipo: d.tipo,
                estado: d.estado,
                archivo: d.archivo,
                observacion: d.observacion,
                fechaVencimiento: d.fechaVencimiento instanceof Date ? d.fechaVencimiento.toISOString().split('T')[0] : d.fechaVencimiento
              }))
            } : null
          };
        }

        console.log("PAYLOAD FOR BACKEND:", supplierPayload);

        // CALL API
        const response = await supplierService.create(supplierPayload);
        console.log("Response:", response);

      } else if (selectedRole === 'AUDITOR') {
        let auditorPayload = {};

        if (supplierMode === 'EXISTING' && selectedExistingSupplier) {
          // ...
          console.warn("Linking existing auditor not yet fully implemented in backend DTO structure.");
        } else if (supplierFormData) {
          // CREATING NEW AUDITOR
          // We need to match AuditsInsertDTO structure from AuditorsController

          // Map auditor type to backend enum
          let auditorType = supplierFormData.tipo;
          if (auditorType === 'TECNICO') auditorType = 'TECHNICAL';
          if (auditorType === 'LEGAL') auditorType = 'LEGAL';

          auditorPayload = {
            registerRequest: registerRequest,
            registration_number: supplierFormData.matricula,
            type_auditor: auditorType,
            // Extracts the first company ID if any selected in AuditorForm
            id_company: supplierFormData.empresas?.[0]?.idCompany || supplierFormData.empresas?.[0]?.id || null
          };
        }

        console.log("AUDITOR PAYLOAD:", auditorPayload);
        const response = await auditorService.create(auditorPayload);
        console.log("Auditor Created:", response);

      } else if (selectedRole === 'EMPRESA') {
        let companyId = null;

        if (supplierMode === 'NEW' && supplierFormData) {
          // 1. Create the Company with Group (using new unified service method implicitly via controller)
          const response = await companyService.create(supplierFormData);
          companyId = response.idCompany;
        } else if (selectedExistingSupplier) {
          // Use ID from existing selection
          companyId = selectedExistingSupplier.idCompany || selectedExistingSupplier.id;
        }

        if (companyId) {
          // 2. Create the CompanyClient mapping
          const companyClientPayload = {
            id_company: companyId,
            userName: userData.username,
            password: userData.password || 'default123',
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: 'CUSTOMER',
            active: true,
            rank: 'Representante'
          };

          console.log("COMPANY CLIENT PAYLOAD:", companyClientPayload);
          const response = await companyClientService.create(companyClientPayload);
          console.log("Company Client Linked:", response);
        } else {
          throw new Error("No se pudo identificar o crear la empresa para asociar.");
        }
      } else {
        // Default User creation without entity
        if (!userData.id) {
          // await userService.create(registerRequest);
        }
      }

      setCurrentStep(4);
    } catch (error) {
      console.error("Error en el wizard:", error);
      alert("Hubo un error al crear los registros. Verifique consola.");
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
    // Chequeo basado en rolesDetails o roles array
    if (userData.roles) {
      // API returns roles as array of strings or objects? Check MapToUserDTO
      // DTO returns List<Role> which enum. So likely strings or objects depending on JSON serialization.
      // Let's assume array of strings or objects with 'name'
      return userData.roles.some(r => r === role || r.name === role || r.roleName === role);
    }
    return false;
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
          <div className="bg-white rounded-xl border border-secondary/20 shadow-sm animate-fade-in p-4 md:p-6">

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
                      options={users} // REAL DATA
                      onChange={(e) => setUserData(e.value)}
                      optionLabel="username"
                      itemTemplate={(option) => (
                        <div className="flex flex-col">
                          <span className="font-bold">
                            {(option.firstName || '')} {(option.lastName || '')}
                            {(!option.firstName && !option.lastName) && <span className="text-gray-400">Sin Nombre</span>}
                          </span>
                          <span className="text-xs text-secondary">@{option.username}</span>
                        </div>
                      )}
                      filter
                      filterBy="username,firstName,lastName"
                      placeholder={loading ? "Cargando..." : "Escriba para buscar..."}
                      className="w-full h-10"
                      disabled={loading || users.length === 0}
                      emptyMessage="No hay usuarios disponibles"
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
                value={supplierMode}
                onChange={setSupplierMode}
              />

              <div className="mt-6">
                {supplierMode === 'NEW' ? (
                  <SupplierForm
                    title={isExistingRole ? "Agregar Nueva Entidad Proveedor" : "Datos del Proveedor"}
                    subtitle={isExistingRole
                      ? `El usuario ya es Proveedor. Complete los datos de la NUEVA empresa a asociar.`
                      : `Configurando el primer perfil de proveedor para ${userData?.username}`}
                    onSubmit={handleSupplierSubmit}
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
                        value={selectedExistingSupplier}
                        options={suppliers} // REAL DATA
                        optionLabel="company_name" // DTO field name
                        onChange={(e) => setSelectedExistingSupplier(e.value)}
                        itemTemplate={(option) => (
                          <div className="flex flex-col">
                            <span className="font-bold">{option.company_name}</span>
                            <span className="text-xs text-secondary">CUIT: {formatCUIT(option.cuit)}</span>
                          </div>
                        )}
                        filter
                        filterBy="company_name,cuit"
                        placeholder={loading ? "Cargando..." : "Buscar por Razón Social o CUIT..."}
                        className="w-full h-10"
                        disabled={loading}
                      />
                    </div>

                    <button
                      onClick={handleSupplierSubmit}
                      disabled={!selectedExistingSupplier}
                      className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-lg
                                    ${selectedExistingSupplier ? 'bg-primary hover:bg-primary-hover shadow-primary/30' : 'bg-gray-300 cursor-not-allowed'}
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
            <div className="bg-white p-6 rounded-xl border border-secondary/20 shadow-sm animate-fade-in">
              <SelectionToggle
                options={[
                  { label: isExistingRole ? "Agregar Nuevo Rol Auditor" : "Crear Nuevo Auditor", value: 'NEW' },
                  { label: "Asociar Auditor Existente", value: 'EXISTING' }
                ]}
                value={supplierMode}
                onChange={setSupplierMode}
              />

              <div className="mt-6">
                {supplierMode === 'NEW' ? (
                  <AuditorForm
                    initialData={{ nombre: userData?.firstName, apellido: userData?.lastName }}
                    onSubmit={handleSupplierSubmit}
                    onBack={handleBack}
                    companies={companies}
                  />
                ) : (
                  <div className="flex flex-col gap-6 max-w-md mx-auto text-center py-4">
                    <div className="bg-blue-50 text-blue-700 p-4 rounded-lg flex items-start gap-3 text-sm text-left">
                      <i className="pi pi-info-circle text-lg mt-0.5"></i>
                      <p>Seleccione un auditor ya registrado para vincularlo a este usuario.</p>
                    </div>

                    <div className="text-left">
                      <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Buscar Auditor</label>
                      <Dropdown
                        value={selectedExistingSupplier}
                        options={auditors}
                        optionLabel="registration_number"
                        onChange={(e) => setSelectedExistingSupplier(e.value)}
                        itemTemplate={(option) => (
                          <div className="flex flex-col">
                            <span className="font-bold">
                              {option.user ? `${option.user.firstName || ''} ${option.user.lastName || ''}` : 'Sin Usuario'}
                            </span>
                            <span className="text-xs text-secondary">Matrícula: {option.registration_number || '-'} - {option.type_auditor || ''}</span>
                          </div>
                        )}
                        filter
                        filterBy="registration_number"
                        placeholder={loading ? "Cargando..." : "Buscar por Matrícula..."}
                        className="w-full h-10"
                        disabled={loading || auditors.length === 0}
                        emptyMessage="No hay auditores disponibles"
                      />
                    </div>

                    <button
                      onClick={handleSupplierSubmit}
                      disabled={!selectedExistingSupplier}
                      className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-lg
                                            ${selectedExistingSupplier ? 'bg-primary hover:bg-primary-hover shadow-primary/30' : 'bg-gray-300 cursor-not-allowed'}
                                        `}
                    >
                      Vincular Auditor <i className="pi pi-check ml-2"></i>
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

        if (selectedRole === 'EMPRESA') {
          return (
            <div className="bg-white p-6 rounded-xl border border-secondary/20 shadow-sm animate-fade-in">
              <SelectionToggle
                options={[
                  { label: "Crear Nueva Empresa", value: 'NEW' },
                  { label: "Asociar Empresa Existente", value: 'EXISTING' }
                ]}
                value={supplierMode}
                onChange={(mode) => {
                  setSupplierMode(mode);
                  setSelectedExistingSupplier(null);
                  setSelectedGroup(null);
                  setFilteredCompanies([]);
                }}
              />

              <div className="mt-6">
                {supplierMode === 'NEW' ? (
                  <CompanyForm
                    title="Nueva Empresa"
                    subtitle="Registre una nueva empresa en el sistema."
                    onSubmit={handleSupplierSubmit}
                    onBack={handleBack}
                  />
                ) : (
                  <div className="flex flex-col gap-6 max-w-md mx-auto text-center py-4">
                    <div className="bg-blue-50 text-blue-700 p-4 rounded-lg flex items-start gap-3 text-sm text-left">
                      <i className="pi pi-info-circle text-lg mt-0.5"></i>
                      <p>Seleccione primero el grupo para filtrar las empresas disponibles.</p>
                    </div>

                    {/* Grupo Selection */}
                    <div className="text-left">
                      <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">1. Seleccionar Grupo</label>
                      <Dropdown
                        value={selectedGroup}
                        options={groups}
                        optionLabel="description"
                        onChange={async (e) => {
                          setSelectedGroup(e.value);
                          setSelectedExistingSupplier(null);
                          if (e.value) {
                            setLoading(true);
                            try {
                              const results = await companyService.getByGroup(e.value.idGroup);
                              setFilteredCompanies(results || []);
                            } catch (err) {
                              console.error("Error filtering companies:", err);
                              setFilteredCompanies([]);
                            } finally {
                              setLoading(false);
                            }
                          } else {
                            setFilteredCompanies([]);
                          }
                        }}
                        itemTemplate={(option) => {
                          const desc = option.description ? option.description.toUpperCase() : '';
                          const isEdesal = desc.includes('EDESAL');
                          return (
                            <div className="flex items-center gap-2">
                              {isEdesal ?
                                <i className="pi pi-bolt text-primary"></i> :
                                <i className="pi pi-building text-secondary"></i>
                              }
                              <span>{option.description}</span>
                            </div>
                          );
                        }}
                        valueTemplate={(option, props) => {
                          if (option) {
                            const desc = option.description ? option.description.toUpperCase() : '';
                            const isEdesal = desc.includes('EDESAL');
                            return (
                              <div className="flex items-center gap-2">
                                {isEdesal ?
                                  <i className="pi pi-bolt text-primary"></i> :
                                  <i className="pi pi-building text-secondary"></i>
                                }
                                <span>{option.description}</span>
                              </div>
                            );
                          }
                          return <span>{props.placeholder}</span>;
                        }}
                        placeholder="Seleccione un grupo..."
                        className="w-full h-10"
                        filter
                      />
                    </div>

                    {/* Empresa Selection */}
                    <div className="text-left">
                      <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">2. Buscar Empresa</label>
                      <Dropdown
                        value={selectedExistingSupplier}
                        options={filteredCompanies}
                        optionLabel="description"
                        onChange={(e) => setSelectedExistingSupplier(e.value)}
                        itemTemplate={(option) => (
                          <div className="flex flex-col">
                            <span className="font-bold">{option.description}</span>
                            {option.requiredTechnical && <span className="text-xs text-secondary">Requiere Técnico</span>}
                          </div>
                        )}
                        filter
                        filterBy="description"
                        placeholder={loading ? "Cargando..." : (selectedGroup ? "Seleccione una empresa..." : "Primero elija un grupo")}
                        className="w-full h-10"
                        disabled={loading || !selectedGroup || filteredCompanies.length === 0}
                        emptyMessage={selectedGroup ? "No hay empresas en este grupo" : "Seleccione un grupo primero"}
                      />
                    </div>

                    <button
                      onClick={handleSupplierSubmit}
                      disabled={!selectedExistingSupplier}
                      className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-lg
                                        ${selectedExistingSupplier ? 'bg-primary hover:bg-primary-hover shadow-primary/30' : 'bg-gray-300 cursor-not-allowed'}
                                    `}
                    >
                      Vincular Empresa <i className="pi pi-check ml-2"></i>
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
              <button onClick={handleSupplierSubmit} className="text-white bg-primary px-5 py-2.5 rounded-lg font-bold">
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
                  <>Se ha agregado el nuevo rol <strong>{selectedRole}</strong> al usuario <strong>{userData?.username}</strong> {selectedExistingSupplier ? ` y se ha asociado a ${selectedExistingSupplier.razonSocial}` : ''}.</>
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

export default NewSupplier;
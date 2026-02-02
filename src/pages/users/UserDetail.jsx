import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { StatusBadge } from '../../components/ui/Badges';
import { InputText } from 'primereact/inputtext';

const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [filteredEntities, setFilteredEntities] = useState([]);

    // Password state
    const [password, setPassword] = useState('');
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const roleOptions = ['PROVEEDOR', 'AUDITOR', 'EMPRESA'];

    useEffect(() => {
        loadUser();
    }, [id]);

    const loadUser = async () => {
        try {
            // Intentar obtener usuario real
            // Nota: Si el endpoint getById falla, podrias obtener todos y buscar, 
            // pero probemos primero getById
            const data = await userService.getById(id);

            // Si la API retorna null o vacio
            if (!data) {
                console.error("Usuario no encontrado");
                return;
            }

            console.log("UserDetail API Response:", data); // DEBUG
            console.log("Suppliers check:", data.suppliers, "Length:", data.suppliers?.length);
            console.log("Auditors check:", data.auditors, "Length:", data.auditors?.length);
            console.log("Clients check:", data.clients, "Length:", data.clients?.length);
            console.log("Roles check:", data.roles);

            const processedUser = {
                ...data,
                // Mapeos seguros
                firstName: data.firstName || null,
                lastName: data.lastName || null,
                username: data.username || null,
                email: data.email || data.username || null, // Fallback a username si no hay email
                status: data.active ? 'ACTIVO' : 'INACTIVO',
                lastLogin: data.lastLogin || null,
                // Si la API no trae password (seguridad), dejamos string vacio o null
                password: null,
            };

            const NO_DATA = 'NO SE ENCONTRÓ';

            // Construir rolesDetails a partir de las listas planas del DTO
            const rolesDetails = [];

            // 1. Proveedores
            if (data.suppliers && data.suppliers.length > 0) {
                rolesDetails.push({
                    roleName: 'PROVEEDOR',
                    entities: data.suppliers.map(s => ({
                        id: s.id_supplier,
                        // Campos específicos para las columnas de PROVEEDOR
                        razonSocial: s.fantasy_name || s.company_name || NO_DATA,
                        cuit: s.cuit || NO_DATA,
                        servicio: s.classification_afip || NO_DATA, // Usamos clasificacion como servicio por ahora
                        estatus: 'ACTIVO', // No viene estatus en el DTO de supplier, asumimos activo o requerimos cambio en back

                        // Campos genéricos si se cambia de vista
                        name: s.fantasy_name || s.company_name || NO_DATA,
                        type: s.classification_afip || NO_DATA,
                        date: '-',
                        details: s
                    }))
                });
            }

            // 2. Auditores
            if (data.auditors && data.auditors.length > 0) {
                rolesDetails.push({
                    roleName: 'AUDITOR',
                    entities: data.auditors.map(a => ({
                        id: a.id_auditor,
                        name: a.registration_number ? `Matrícula: ${a.registration_number}` : NO_DATA,
                        type: a.type_auditor || NO_DATA,
                        date: '-',
                        details: a
                    }))
                });
            }

            // 3. Clientes / Empresas
            if (data.clients && data.clients.length > 0) {
                rolesDetails.push({
                    // Mapeamos el rol de BD 'CUSTOMER' al nombre UI 'EMPRESA'
                    roleName: 'EMPRESA',
                    entities: data.clients.map(c => ({
                        id: c.id_company_client,
                        name: c.companyDescription || (c.id_company ? `Empresa ID: ${c.id_company}` : NO_DATA),

                        // Campos específicos para columnas de EMPRESA
                        puesto: c.rank || NO_DATA,
                        cuit: c.cuit || NO_DATA, // Speculative
                        rubro: c.rubro || NO_DATA, // Speculative
                        activo: c.hasOwnProperty('active') ? c.active : true, // Asumimos true si no viene, o false? DTO tiene active boolean.

                        type: c.rank || NO_DATA,
                        date: '-',
                        details: c
                    }))
                });
            }

            // Agregar roles que tiene asignados pero sin entidades aun
            if (data.roles) {
                data.roles.forEach(role => {
                    // Normalizar nombres de roles Back -> UI
                    let normalizedRole = role;
                    if (role === 'CUSTOMER') normalizedRole = 'EMPRESA';

                    if (!rolesDetails.find(r => r.roleName === normalizedRole)) {
                        rolesDetails.push({ roleName: normalizedRole, entities: [] });
                    }
                });
            }

            processedUser.rolesDetails = rolesDetails;

            setUser(processedUser);
            setPassword('');

            // Seleccionar primer rol disponible
            // Prioridad: PROVEEDOR -> AUDITOR -> EMPRESA -> Cualquiera
            const preferredRoles = ['PROVEEDOR', 'AUDITOR', 'EMPRESA'];
            const firstAvailable = preferredRoles.find(r => rolesDetails.some(rd => rd.roleName === r));

            if (firstAvailable) {
                setSelectedRole(firstAvailable);
            } else if (rolesDetails.length > 0) {
                setSelectedRole(rolesDetails[0].roleName);
            } else {
                setSelectedRole('PROVEEDOR');
            }

        } catch (error) {
            console.error("Error al cargar detalle de usuario:", error);
            // Fallback opcional a Mock si falla API (solo para dev)
            // const foundUser = MOCK_USERS.find(u => u.id === parseInt(id));
            // if (foundUser) setUser(foundUser);
        }
    };

    useEffect(() => {
        if (user && selectedRole) {
            if (user.rolesDetails && Array.isArray(user.rolesDetails)) {
                const roleDetail = user.rolesDetails.find(r => r.roleName === selectedRole);
                setFilteredEntities(roleDetail ? roleDetail.entities : []);
            } else {
                setFilteredEntities([]);
            }
        }
    }, [user, selectedRole]);

    const viewSupplierDetail = (supplierId) => {
        navigate(`/proveedores/${supplierId}`);
    };

    const NoDataBadge = () => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-400 border border-gray-200">
            NO ENCONTRADO
        </span>
    );

    const checkData = (value) => {
        if (value === 'NO SE ENCONTRÓ' || value === null || value === undefined || value === '') return <NoDataBadge />;
        return value;
    };

    const actionTemplate = (rowData) => {
        if (selectedRole === 'PROVEEDOR') {
            return (
                <button
                    onClick={() => viewSupplierDetail(rowData.id)}
                    className="text-primary hover:text-primary-dark font-bold text-xs underline hover:scale-105 transition-transform"
                >
                    Ver más
                </button>
            );
        }
        if (selectedRole === 'EMPRESA') {
            return (
                <button
                    onClick={() => navigate('/empresas')} // Temporal: ir a lista completa
                    className="text-primary hover:text-primary-dark font-bold text-xs underline hover:scale-105 transition-transform"
                >
                    Ver más
                </button>
            );
        }
        return <span className="text-xs text-secondary/50 italic">Prox.</span>;
    };

    if (!user) return <div className="p-8 text-center text-secondary">Cargando usuario...</div>;

    return (
        <div className="animate-fade-in w-full max-w-6xl mx-auto">
            <div className="mb-6">
                <button onClick={() => navigate('/usuarios')} className="text-secondary hover:text-primary mb-2 flex items-center gap-1 text-sm font-medium transition-colors">
                    <i className="pi pi-arrow-left text-xs"></i> Volver a Usuarios
                </button>
                <h1 className="text-3xl font-extrabold text-secondary-dark tracking-tight">Detalle de Usuario</h1>
            </div>

            {/* Tarjeta de Información Completa */}
            <div className="bg-white border border-secondary/20 rounded-xl shadow-sm p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-secondary/10 pb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-2xl">
                            {user.firstName?.charAt(0) || ''}{user.lastName?.charAt(0) || ''}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-secondary-dark">{user.firstName} {user.lastName}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="bg-secondary-light text-secondary-dark text-xs px-2 py-0.5 rounded font-mono">@{user.username}</span>
                                <StatusBadge status={user.status} />
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">Último Acceso</label>
                        <p className="font-mono text-sm text-secondary-dark">{user.lastLogin || '-'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <div className="space-y-0">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider block">Nombre</label>
                        <InputText
                            value={user.firstName || ''}
                            readOnly
                            className="w-full text-secondary-dark text-sm font-medium rounded-none py-2 focus:shadow-none bg-transparent border-0 border-b border-gray-200"
                        />
                    </div>
                    <div className="space-y-0">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider block">Apellido</label>
                        <InputText
                            value={user.lastName || ''}
                            readOnly
                            className="w-full text-secondary-dark text-sm font-medium rounded-none py-2 focus:shadow-none bg-transparent border-0 border-b border-gray-200"
                        />
                    </div>
                    <div className="space-y-0">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider block">Email</label>
                        <InputText
                            value={user.email || ''}
                            readOnly
                            className="w-full text-secondary-dark text-sm font-medium rounded-none py-2 focus:shadow-none bg-transparent border-0 border-b border-gray-200"
                            tooltip={user.email}
                            tooltipOptions={{ position: 'top' }}
                        />
                    </div>

                    {/* Contraseña */}
                    <div className="space-y-0">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider block">Contraseña</label>
                        <div className="relative">
                            <InputText
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                readOnly={!isEditingPassword}
                                className={`w-full text-sm font-medium rounded-md py-2 pl-3 focus:shadow-none transition-colors border-gray-200 
                                    ${!isEditingPassword
                                        ? 'bg-gray-50 text-secondary'
                                        : 'bg-white text-secondary-dark border-primary ring-1 ring-primary/20'
                                    }`}
                                placeholder={!isEditingPassword ? '••••••••' : ''}
                            />

                            {/* Floating Icons Actions */}
                            <div className="absolute right-0 top-0 bottom-0 flex items-center px-2 gap-1">
                                {/* Toggle Visibility Button */}
                                <div className="border-r border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="w-7 h-7 flex items-center justify-center text-secondary hover:text-primary transition-colors"
                                        title={showPassword ? "Ocultar" : "Mostrar"}
                                    >
                                        <i className={`pi ${showPassword ? 'pi-eye-slash' : 'pi-eye'} text-xs`}></i>
                                    </button>
                                </div>
                                {/* Edit/Save Button */}
                                <button
                                    type="button"
                                    onClick={() => setIsEditingPassword(!isEditingPassword)}
                                    className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
                                    title={isEditingPassword ? "Guardar" : "Editar"}
                                >
                                    <i className={`pi ${isEditingPassword ? 'pi-check text-primary font-bold hover:text-primary/100 ' : 'pi-pencil text-secondary hover:text-primary'} text-xs animate-wiggle`}></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección de Roles y Entidades */}
            <div className="bg-white border border-secondary/20 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-secondary/20 bg-secondary-light/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-secondary-dark flex items-center gap-2">
                        <i className="pi pi-briefcase text-primary"></i> Entidades Asociadas
                    </h3>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-sm text-secondary font-medium whitespace-nowrap">Rol:</span>
                        <div className="flex items-center gap-2">
                            <Dropdown
                                value={selectedRole}
                                options={roleOptions}
                                onChange={(e) => setSelectedRole(e.value)}
                                className="w-full sm:w-48"
                                placeholder="Seleccionar Rol"
                                pt={{
                                    root: { className: 'w-full bg-white border border-secondary/30 rounded h-9 flex items-center px-2 focus-within:ring-2 focus-within:ring-primary/50' },
                                    input: { className: 'text-sm text-secondary-dark flex-1' },
                                    trigger: { className: 'text-secondary w-6 flex justify-center' },
                                    panel: { className: 'text-sm bg-white border border-secondary/20 shadow-lg rounded-md mt-1' },
                                    item: { className: 'p-2 hover:bg-secondary-light cursor-pointer text-secondary-dark' }
                                }}
                            />
                            <button
                                onClick={() => navigate(`/usuarios/${id}/nuevo-rol`)}
                                className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-secondary-dark text-white rounded hover:bg-black transition-colors shadow-sm"
                                title="Agregar nuevo Rol"
                            >
                                <i className="pi pi-plus font-bold text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-0">
                    <DataTable
                        value={filteredEntities}
                        emptyMessage={
                            <div className="p-8 text-center">
                                <i className="pi pi-folder-open text-4xl text-secondary/30 mb-2"></i>
                                <p className="text-secondary mb-3">No hay entidades asociadas para el rol <strong>{selectedRole}</strong>.</p>
                                <button
                                    onClick={() => navigate(`/usuarios/${id}/nuevo-rol?role=${selectedRole}`)}
                                    className="text-primary hover:text-primary-active font-medium text-sm hover:underline"
                                >
                                    <i className="pi pi-plus-circle mr-1"></i>
                                    Asociar {selectedRole === 'EMPRESA' ? 'una Empresa' : selectedRole === 'PROVEEDOR' ? 'un Proveedor' : `un ${selectedRole}`}
                                </button>
                            </div>
                        }
                        size="small"
                        stripedRows
                        tableClassName="w-full text-sm text-left text-secondary"
                        pt={{
                            thead: { className: 'text-xs text-secondary-dark uppercase bg-gray-50 border-b border-secondary/10' },
                            headerCell: { className: 'px-4 py-3 font-semibold' },
                            bodyRow: { className: 'border-b border-secondary/5 last:border-0' },
                            bodyCell: { className: 'px-4 py-3 align-middle text-secondary-dark' }
                        }}
                    >
                        {selectedRole === 'PROVEEDOR' ? [
                            <Column key="prov-id" field="id" header="#" className="font-mono text-xs text-secondary/70 w-16 pl-6" headerClassName="pl-6"></Column>,
                            <Column key="prov-rs" field="razonSocial" header="Razón Social" className="font-bold" body={(d) => checkData(d.razonSocial)}></Column>,
                            <Column key="prov-cuit" field="cuit" header="CUIT" className="font-mono text-xs" body={(d) => checkData(d.cuit)}></Column>,
                            <Column key="prov-serv" field="servicio" header="Clasificación AFIP" body={(d) => checkData(d.servicio)}></Column>,
                            <Column key="prov-stat" field="estatus" header="Estatus" body={(d) => <StatusBadge status={d.estatus} />}></Column>,
                            <Column key="prov-act" header="Acción" body={actionTemplate} className="text-center w-24 pr-6" headerClassName="pr-6"></Column>
                        ] : selectedRole === 'EMPRESA' ? [
                            <Column key="emp-name" field="name" header="Empresa" className="font-bold w-1/4 pl-6" body={(d) => checkData(d.name)} headerClassName="pl-6"></Column>,
                            <Column key="emp-puesto" field="puesto" header="Puesto" body={(d) => checkData(d.puesto)}></Column>,
                            <Column key="emp-cuit" field="cuit" header="CUIT" className="font-mono text-xs" body={(d) => checkData(d.cuit)}></Column>,
                            <Column key="emp-rubro" field="rubro" header="Rubro" body={(d) => checkData(d.rubro)}></Column>,
                            <Column key="emp-active" field="activo" header="Estado" body={(d) => d.activo ? <StatusBadge status="ACTIVO" /> : <StatusBadge status="INACTIVO" />}></Column>,
                            <Column key="emp-act" header="Acción" body={actionTemplate} className="pr-6 text-center" headerClassName="pr-6"></Column>
                        ] : [
                            // AUDITOR (u otros)
                            <Column key="def-id" field="id" header="ID" className="pl-6" headerClassName="pl-6"></Column>,
                            <Column key="def-name" field="name" header="Nombre" className="font-bold" body={(d) => checkData(d.name)}></Column>,
                            <Column key="def-type" field="type" header="Tipo" body={(d) => checkData(d.type)}></Column>,
                            <Column key="def-act" header="Acción" body={actionTemplate} className="pr-6" headerClassName="pr-6"></Column>
                        ]}
                    </DataTable>
                </div>
            </div>
        </div>
    );
};

export default UserDetail;

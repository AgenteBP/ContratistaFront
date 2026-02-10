import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

// 1. CREACIÓN DEL CONTEXTO
// Este es el contenedor donde vivirán los datos de sesión.
const AuthContext = createContext();

// 2. PROVEEDOR (AuthProvider)
// Este componente envuelve la app y gestiona el estado real.
export const AuthProvider = ({ children }) => {
    // 1. CARGA INICIAL SINCRÓNICA
    // Leer del localStorage inmediatamente evita el estado 'loading' y errores de montaje en el Router
    const getStoredItem = (key, isJson = false) => {
        try {
            const item = localStorage.getItem(key);
            if (!item || item === 'undefined' || item === 'null') return null;
            return isJson ? JSON.parse(item) : item;
        } catch (e) {
            console.error(`Error parsing ${key} from storage`, e);
            return null;
        }
    };

    const [user, setUser] = useState(() => getStoredItem('currentUser', true));
    const [currentRole, setCurrentRole] = useState(() => getStoredItem('currentRole', true));
    const [token, setToken] = useState(() => getStoredItem('authToken'));
    const [loading, setLoading] = useState(false); // Ya no necesitamos esperar al useEffect

    useEffect(() => {
        const syncSession = () => {
            const role = getStoredItem('currentRole', true);
            const usr = getStoredItem('currentUser', true);
            const tkn = getStoredItem('authToken');

            setCurrentRole(role);
            setUser(usr);
            setToken(tkn);
        };

        const handleStorageChange = (e) => {
            // e.key === null significa que se llamó a localStorage.clear() (Logout)
            if (e.key === null || e.key === 'currentUser' || e.key === 'authToken') {
                const stillHasUser = localStorage.getItem('currentUser');

                syncSession();

                // Si se cerró la sesión y no estamos en el login, redirigimos forzosamente
                if (!stillHasUser && window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            } else if (e.key === 'currentRole') {
                syncSession();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // 2. FUNCIONES DE SESIÓN HÍBRIDAS (Mock si vacío, Real si completo)
    const login = async (email, password) => {
        const cleanEmail = email?.trim();
        const cleanPassword = password?.trim();

        // MOCK Fallback: Si los inputs están vacíos (o solo espacios), modo prueba
        if (!cleanEmail && !cleanPassword) {
            console.log("Ingresando con modo MOCK (Braian Paez)");
            const mockUser = {
                id: 1,
                firstName: "Braian",
                lastName: "Paez",
                username: "braian@email.com",
                active: true,
                roles: ["SUPPLIER", "AUDITOR", "CUSTOMER", "ADMIN"],
                suppliers: [
                    { id_supplier: 1, company_name: "Lalo Industries", cuit: "20-37202708-9", type_person: "", active: 1, elements: [] },
                    { id_supplier: 2, company_name: "Pepito Holdings", cuit: "30-55555555-1", type_person: "", active: 1, elements: [] }
                ],
                auditors: [{ id_auditor: 2, registration_number: "12345678", type_auditor: "TECHNICAL" }],
                clients: [
                    { id_company_client: 1, rank: "boss", id_company: 1, companyDescription: "EDESAL" },
                    { id_company_client: 2, rank: "admin", id_company: 2, companyDescription: "Tech Solutions" }
                ]
            };
            setUser(mockUser);
            localStorage.setItem('currentUser', JSON.stringify(mockUser));
            return mockUser;
        }

        // LOGIN REAL
        try {
            const response = await api.post('/auth/login', { userName: cleanEmail, password: cleanPassword });
            const { token: authToken, id: userId } = response.data;

            if (!userId) {
                throw new Error("El backend no devolvió el ID del usuario. Por favor, verifica la implementación de TokenResponse.java");
            }

            localStorage.setItem('authToken', authToken);
            setToken(authToken);

            // Obtener perfil detallado
            const profileResponse = await api.get(`/auth/users/${userId}`);
            const userData = profileResponse.data;

            setUser(userData);
            localStorage.setItem('currentUser', JSON.stringify(userData));

            return userData;
        } catch (error) {
            throw error;
        }
    };

    const selectRole = (roleContext) => {
        setCurrentRole(roleContext);
        localStorage.setItem('currentRole', JSON.stringify(roleContext));
    };

    const logout = () => {
        setUser(null);
        setCurrentRole(null);
        setToken(null);

        // LIMPIEZA SELECTIVA: Solo borramos lo relacionado con la autenticación. 
        // No usamos .clear() para preservar preferencias (Modo Oscuro, avisos, etc).
        localStorage.removeItem('currentRole');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
    };

    // 3. MONITOR DE INACTIVIDAD (SLIDING EXPIRATION)
    useEffect(() => {
        if (!user) return; // Solo monitorear si hay una sesión activa

        const INACTIVITY_LIMIT = 60 * 60 * 1000; // 1 Hora en milisegundos
        let inactivityTimer;

        const resetTimer = () => {
            if (inactivityTimer) clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                console.log("Sesión expirada por inactividad prolongada");
                logout();
                // Redirección forzosa al login tras inactividad
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }, INACTIVITY_LIMIT);
        };

        // Eventos que reinician el reloj de inactividad
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        resetTimer(); // Iniciar contador

        events.forEach(event => window.addEventListener(event, resetTimer));

        return () => {
            if (inactivityTimer) clearTimeout(inactivityTimer);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [user]); // Se reinicia el efecto si el usuario cambia (o se desloguea)

    // 4. HELPERS DE ROLES (Protegidos contra nulls)
    const role = currentRole?.role;
    const type = currentRole?.type;

    // Normalizamos el tipo para los helpers de forma segura
    const normalizedType = type?.toString().toLowerCase() || '';
    const isTecnico = normalizedType.includes('tecnic') || type === 'TECNICO';
    const isLegal = normalizedType.includes('legal') || type === 'LEGAL';

    const authValues = {
        user,
        currentRole,
        token,
        loading,
        login,
        selectRole,
        logout,
        isAdmin: role === 'ADMIN',
        isAuditor: role === 'AUDITOR',
        isAuditorTecnico: role === 'AUDITOR' && isTecnico,
        isAuditorLegal: role === 'AUDITOR' && isLegal,
        isEmpresa: role === 'EMPRESA',
        isProveedor: role === 'PROVEEDOR'
    };

    return (
        <AuthContext.Provider value={authValues}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// 3. HOOK PERSONALIZADO (useAuth)
// Es un atajo para que los componentes no tengan que importar useContext(AuthContext)
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};

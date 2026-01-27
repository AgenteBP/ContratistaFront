import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 1. Layouts
import MainLayout from './components/layout/MainLayout';

// 2. Páginas de Autenticación (Nuevas)
import LoginPage from './pages/auth/LoginPage';
import RoleSelectionPage from './pages/auth/RoleSelectionPage';

// 3. Páginas del Sistema (Privadas)
import DashboardHome from './pages/dashboard/DashboardHome';
import ProvidersList from './pages/providers/ProvidersList';
import NewProvider from './pages/providers/NewProvider';
import ProviderDetail from './pages/providers/ProviderDetail';
import ProviderData from './pages/providers/ProviderData';
import UsersList from './pages/users/UsersList';
import UserDetail from './pages/users/UserDetail';
import AuditorsList from './pages/auditors/AuditorsList';
import AuditorDetail from './pages/auditors/AuditorDetail';
import CompanyList from './pages/companies/CompanyList';
import CompanyForm from './pages/companies/CompanyForm';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* --- ZONA PÚBLICA (Sin MainLayout) --- */}

                {/* 1. Redirección inicial: Al entrar a la raíz, mandar al login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* 2. Pantallas de acceso */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/select-role" element={<RoleSelectionPage />} />


                {/* --- ZONA PRIVADA (Con MainLayout) --- */}
                {/* Usamos Layout Route: MainLayout se renderiza una vez y sus hijas cambian en el <Outlet /> */}
                <Route element={<MainLayout />}>

                    {/* Aquí definimos qué Dashboard mostrar. */}
                    <Route path="/dashboard" element={<DashboardHome />} />

                    {/* Rutas de Proveedores */}
                    <Route path="/proveedores" element={<ProvidersList />} />
                    <Route path="/proveedor" element={<ProviderData />} />
                    <Route path="/proveedores/nuevo" element={<NewProvider />} />
                    <Route path="/proveedores/:id" element={<ProviderDetail />} />

                    {/* Rutas de Auditores */}
                    <Route path="/auditores" element={<AuditorsList />} />
                    <Route path="/auditores/:id" element={<AuditorDetail />} />

                    {/* Rutas de Empresas */}
                    <Route path="/empresas" element={<CompanyList />} />
                    <Route path="/empresas/nueva" element={<CompanyForm />} />

                    {/* Rutas de Usuarios */}
                    <Route path="/usuarios" element={<UsersList />} />
                    <Route path="/usuarios/nuevo" element={<NewProvider />} />
                    <Route path="/usuarios/:id/nuevo-rol" element={<NewProvider />} />
                    <Route path="/usuarios/:id" element={<UserDetail />} />

                    {/* Si ponen una ruta cualquiera interna, mandar al dashboard */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />

                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;

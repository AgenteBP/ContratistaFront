import React from 'react';
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route, Navigate } from 'react-router-dom';

// 1. Layouts
import MainLayout from './components/layout/MainLayout';

// 2. Páginas de Autenticación (Nuevas)
import LoginPage from './pages/auth/LoginPage';
import RoleSelectionPage from './pages/auth/RoleSelectionPage';

// 3. Páginas del Sistema (Privadas)
import DashboardHome from './pages/dashboard/DashboardHome';
import SuppliersList from './pages/suppliers/SuppliersList';
import NewSupplier from './pages/suppliers/NewSupplier';
import SupplierDetail from './pages/suppliers/SupplierDetail';
import SupplierData from './pages/suppliers/SupplierData';
import UsersList from './pages/users/UsersList';
import UserDetail from './pages/users/UserDetail';
import AuditorsList from './pages/auditors/AuditorsList';
import AuditorDetail from './pages/auditors/AuditorDetail';
import CompanyList from './pages/companies/CompanyList';
import CompanyForm from './pages/companies/CompanyForm';

// Definición del Router usando Data APIs para soportar features nuevas como useBlocker
const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            {/* 1. Redirección inicial */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* 2. Pantallas de acceso */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/select-role" element={<RoleSelectionPage />} />

            {/* 3. ZONA PRIVADA (Con MainLayout) */}
            <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardHome />} />

                {/* Proveedores */}
                <Route path="/proveedores" element={<SuppliersList />} />
                <Route path="/proveedor" element={<SupplierData />} />
                <Route path="/proveedores/nuevo" element={<NewSupplier />} />
                <Route path="/proveedores/:id" element={<SupplierDetail />} />

                {/* Auditores */}
                <Route path="/auditores" element={<AuditorsList />} />
                <Route path="/auditores/:id" element={<AuditorDetail />} />

                {/* Empresas */}
                <Route path="/empresas" element={<CompanyList />} />
                <Route path="/empresas/nueva" element={<CompanyForm />} />

                {/* Usuarios */}
                <Route path="/usuarios" element={<UsersList />} />
                <Route path="/usuarios/nuevo" element={<NewSupplier />} />
                <Route path="/usuarios/:id/nuevo-rol" element={<NewSupplier />} />
                <Route path="/usuarios/:id" element={<UserDetail />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
        </>
    )
);

function App() {
    return (
        <RouterProvider router={router} />
    );
}

export default App;

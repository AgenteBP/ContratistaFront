import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 1. Importamos el Layout (El "Marco" de la ventana)
import MainLayout from './components/layout/MainLayout';

// 2. Importamos las Páginas (El "Contenido" que cambia)
import DashboardHome from './pages/dashboard/DashboardHome';
import ProvidersList from './pages/providers/ProvidersList';
import NewProvider from './pages/providers/NewProvider';
import ProviderDetail from './pages/providers/ProviderDetail';

function App() {
  return (
    <BrowserRouter>
      {/* El MainLayout envuelve todo. 
         Todo lo que esté dentro de <MainLayout>...</MainLayout> 
         se pasará automáticamente como la prop {children} al layout.
      */}
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Rutas del Dashboard */}
          <Route path="/dashboard" element={<DashboardHome />} />

          {/* Rutas de Proveedores */}
          <Route path="/proveedores" element={<ProvidersList />} />
          <Route path="/proveedores/nuevo" element={<NewProvider />} />
          <Route path="/proveedores/:id" element={<ProviderDetail />} />

          {/* Ruta comodín (404) -> Mandar al dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
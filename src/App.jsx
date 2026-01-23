// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// // 1. Importamos el Layout (El "Marco" de la ventana)
// import MainLayout from './components/layout/MainLayout';

// // 2. Importamos las Páginas (El "Contenido" que cambia)
// import DashboardHome from './pages/dashboard/DashboardHome';
// import ProvidersList from './pages/providers/ProvidersList';
// import NewProvider from './pages/providers/NewProvider';
// import ProviderDetail from './pages/providers/ProviderDetail';

// function App() {
//   return (
//     <BrowserRouter>
//       {/* El MainLayout envuelve todo. 
//          Todo lo que esté dentro de <MainLayout>...</MainLayout> 
//          se pasará automáticamente como la prop {children} al layout.
//       */}
//       <MainLayout>
//         <Routes>
//           <Route path="/" element={<Navigate to="/dashboard" replace />} />

//           {/* Rutas del Dashboard */}
//           <Route path="/dashboard" element={<DashboardHome />} />

//           {/* Rutas de Proveedores */}
//           <Route path="/proveedores" element={<ProvidersList />} />
//           <Route path="/proveedores/nuevo" element={<NewProvider />} />
//           <Route path="/proveedores/:id" element={<ProviderDetail />} />

//           {/* Ruta comodín (404) -> Mandar al dashboard */}
//           <Route path="*" element={<Navigate to="/dashboard" replace />} />
//         </Routes>
//       </MainLayout>
//     </BrowserRouter>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 1. Layouts
import MainLayout from './components/layout/MainLayout';

// 2. Páginas de Autenticación (Nuevas)
import LoginPage from './pages/auth/LoginPage'; // Asumo que guardaste el archivo aquí
import RoleSelectionPage from './pages/auth/RoleSelectionPage'; // Asumo que guardaste el archivo aquí

// 3. Páginas del Sistema (Privadas)
import DashboardHome from './pages/dashboard/DashboardHome';
import ProvidersList from './pages/providers/ProvidersList';
import NewProvider from './pages/providers/NewProvider';
import ProviderDetail from './pages/providers/ProviderDetail';
import UsersList from './pages/users/UsersList';
import UserDetail from './pages/users/UserDetail';

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
          <Route path="/proveedores/nuevo" element={<NewProvider />} />
          <Route path="/proveedores/:id" element={<ProviderDetail />} />

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
// src/pages/providers/NewProvider.jsx
import React from 'react';
import ProviderForm from './ProviderForm'; // Importamos el form

const NewProvider = () => {
  const handleCreate = () => {
    console.log("Creando nuevo proveedor...");
  };

  return (
    // Ya no necesitamos el <div> con margin aquí, ProviderForm maneja el layout completo
    <ProviderForm 
        title="Nuevo Proveedor" 
        subtitle="Alta de nuevo proveedor y configuración inicial."
        onSubmit={handleCreate} 
    />
  );
};

export default NewProvider;
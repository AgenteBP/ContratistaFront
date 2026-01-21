import React from 'react';

// 1. Tienes que poner "export" aquí
export const RiskBadge = ({ nivel }) => {
  const colors = { 
    'RIESGO ALTO': 'bg-danger-light text-danger border-danger', 
    'RIESGO MEDIO': 'bg-warning-light text-warning border-warning', 
    'RIESGO BAJO': 'bg-success-light text-success border-success' 
  };
  return <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${colors[nivel] || 'bg-secondary-light text-secondary'}`}>{nivel}</span>;
};

// 2. Tienes que poner "export" aquí también (Este es el que te falla)
export const BooleanBadge = ({ value, isAccess }) => {
  const isYes = value?.toUpperCase() === 'SI' || value === 'Si';
  let colorClass = isAccess 
      ? (isYes ? 'bg-success-light text-success font-bold' : 'bg-danger-light text-danger font-bold') 
      : (isYes ? 'text-info font-medium' : 'text-secondary');
  return <span className={`text-[11px] px-2 py-0.5 rounded ${colorClass}`}>{value?.toUpperCase()}</span>;
};

// 3. Y aquí también
export const StatusBadge = ({ status }) => {
  const config = { 
    'ACTIVO': { bg: 'bg-success-light', text: 'text-success', dot: 'bg-success', border: 'border-success' }, 
    'SIN COMPLETAR': { bg: 'bg-warning-light', text: 'text-warning', dot: 'bg-warning', border: 'border-warning' }, 
    'DADO DE BAJA': { bg: 'bg-danger-light', text: 'text-danger', dot: 'bg-danger', border: 'border-danger' }, 
    'SUSPENDIDO': { bg: 'bg-secondary-light', text: 'text-secondary', dot: 'bg-secondary', border: 'border-secondary' } 
  };
  const style = config[status] || config['ACTIVO'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${style.bg} ${style.text} ${style.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>{status}
    </span>
  );
};
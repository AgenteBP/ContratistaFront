import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// 1. Estilos de PrimeReact 
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

// 2. Estilos principales y Overrides (Cargado al final para prioridad)
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

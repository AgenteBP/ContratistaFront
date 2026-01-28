import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// 1. Estilos principales (Tailwind)
import './index.css'

// 2. Estilos de PrimeReact 
import "primereact/resources/themes/lara-light-indigo/theme.css";  // 
import "primereact/resources/primereact.min.css";                  // Estructura base
import "primeicons/primeicons.css";                                // Iconos

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

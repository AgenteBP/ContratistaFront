/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/dist/esm/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        // --- TU MARCA (LIMA INDUSTRIAL) ---
        primary: {
          DEFAULT: '#84cc16', // lime-500
          hover: '#65a30d',   // lime-600 (Más oscuro para hover)
          active: '#4d7c0f',  // lime-700 (Click presionado)
          light: '#ecfccb',   // lime-100 (Fondos suaves)
          text: '#0f172a',    // Texto negro/oscuro para contraste
        },
        
        // --- ESTRUCTURA (GRIS AZULADO) ---
        secondary: {
          DEFAULT: '#64748b', // slate-500
          hover: '#475569',   // slate-600
          dark: '#334155',    // slate-700 (Textos oscuros)
          light: '#f1f5f9',   // slate-100 (Fondo App)
        },

        // --- SEMÁNTICOS (CON ESTADOS) ---
        
        // ÉXITO (Emerald)
        success: {
          DEFAULT: '#10b981', // emerald-500
          hover: '#059669',   // emerald-600
          light: '#d1fae5',   // emerald-100 (Fondo de alertas)
        },

        // PELIGRO / ERROR (Red)
        danger: {
          DEFAULT: '#ef4444', // red-500
          hover: '#dc2626',   // red-600
          light: '#fee2e2',   // red-100 (Fondo de alertas)
        },

        // ADVERTENCIA (Amber)
        warning: {
          DEFAULT: '#f59e0b', // amber-500
          hover: '#d97706',   // amber-600
          light: '#fef3c7',   // amber-100 (Fondo de alertas)
        },

        // INFORMACIÓN (Sky)
        info: {
          DEFAULT: '#0ea5e9', // sky-500
          hover: '#0284c7',   // sky-600
          light: '#e0f2fe',   // sky-100 (Fondo de alertas)
        }
      }
    },
  },
  plugins: [],
}
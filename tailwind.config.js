// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//     "node_modules/flowbite-react/dist/esm/**/*.js",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         // --- TU MARCA (LIMA INDUSTRIAL) ---
//         primary: {
//           DEFAULT: '#84cc16', // lime-500
//           hover: '#65a30d',   // lime-600 (Más oscuro para hover)
//           active: '#4d7c0f',  // lime-700 (Click presionado)
//           light: '#ecfccb',   // lime-100 (Fondos suaves)
//           text: '#0f172a',    // Texto negro/oscuro para contraste
//         },
        
//         // --- ESTRUCTURA (GRIS AZULADO) ---
//         secondary: {
//           DEFAULT: '#64748b', // slate-500
//           hover: '#475569',   // slate-600
//           dark: '#334155',    // slate-700 (Textos oscuros)
//           light: '#f1f5f9',   // slate-100 (Fondo App)
//         },

//         // --- SEMÁNTICOS (CON ESTADOS) ---
        
//         // ÉXITO (Emerald)
//         success: {
//           DEFAULT: '#10b981', // emerald-500
//           hover: '#059669',   // emerald-600
//           light: '#d1fae5',   // emerald-100 (Fondo de alertas)
//         },

//         // PELIGRO / ERROR (Red)
//         danger: {
//           DEFAULT: '#ef4444', // red-500
//           hover: '#dc2626',   // red-600
//           light: '#fee2e2',   // red-100 (Fondo de alertas)
//         },

//         // ADVERTENCIA (Amber)
//         warning: {
//           DEFAULT: '#f59e0b', // amber-500
//           hover: '#d97706',   // amber-600
//           light: '#fef3c7',   // amber-100 (Fondo de alertas)
//         },

//         // INFORMACIÓN (Sky)
//         info: {
//           DEFAULT: '#0ea5e9', // sky-500
//           hover: '#0284c7',   // sky-600
//           light: '#e0f2fe',   // sky-100 (Fondo de alertas)
//         }
//       }
//     },
//   },
//   plugins: [],
// }

// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//     "node_modules/flowbite-react/dist/esm/**/*.js", // Si usas flowbite
//   ],
//   theme: {
//     extend: {
//       colors: {
//         /* --- 1. IDENTIDAD DE MARCA (INDIGO TECH) --- */
//         primary: {
//           DEFAULT: '#4f46e5', // indigo-600 (Botones, Acentos, Links)
//           hover: '#4338ca',   // indigo-700 (Hover botones)
//           active: '#3730a3',  // indigo-800 (Click / Texto fuerte)
//           light: '#e0e7ff',   // indigo-100 (Fondos de selección/Badges)
//           text: '#ffffff',    // Texto sobre fondo primary (Blanco para Indigo)
//         },
        
//         /* --- 2. ESTRUCTURA Y NEUTROS (SLATE) --- */
//         secondary: {
//           DEFAULT: '#64748b', // slate-500 (Iconos inactivos, bordes suaves)
//           hover: '#475569',   // slate-600 (Textos secundarios hover)
//           dark: '#1e293b',    // slate-800 (Títulos, Textos principales)
//           light: '#f8fafc',   // slate-50 (Fondo General de la App - Muy limpio)
//         },

//         /* --- 3. ESTADOS SEMÁNTICOS (Feedback) --- */
//         success: { DEFAULT: '#10b981', hover: '#059669', light: '#d1fae5' }, // Emerald
//         danger:  { DEFAULT: '#ef4444', hover: '#dc2626', light: '#fee2e2' }, // Red
//         warning: { DEFAULT: '#f59e0b', hover: '#d97706', light: '#fef3c7' }, // Amber
//         info:    { DEFAULT: '#0ea5e9', hover: '#0284c7', light: '#e0f2fe' }  // Sky
//       }
//     },
//   },
//   plugins: [],
// }

// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//     "node_modules/flowbite-react/dist/esm/**/*.js",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         // --- OPCIÓN A: VIBRANT INDIGO (INDIGO-500) ---
//         primary: {
//           DEFAULT: '#6366f1', // indigo-500 (Base más clara y vibrante)
//           hover: '#4f46e5',   // indigo-600 (Hover un poco más oscuro)
//           active: '#4338ca',  // indigo-700 (Click)
//           light: '#e0e7ff',   // indigo-100 (Fondos)
//           text: '#ffffff',    // Texto blanco
//         },
//         // --- ESTRUCTURA (SLATE) ---
//         secondary: {
//           DEFAULT: '#64748b', // slate-500
//           hover: '#475569',   // slate-600
//           dark: '#1e293b',    // slate-800
//           light: '#f8fafc',   // slate-50
//         },
//         // --- ESTADOS ---
//         success: { DEFAULT: '#10b981', hover: '#059669', light: '#d1fae5' },
//         danger:  { DEFAULT: '#ef4444', hover: '#dc2626', light: '#fee2e2' },
//         warning: { DEFAULT: '#f59e0b', hover: '#d97706', light: '#fef3c7' },
//         info:    { DEFAULT: '#0ea5e9', hover: '#0284c7', light: '#e0f2fe' }
//       }
//     },
//   },
//   plugins: [],
// }

// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//     "node_modules/flowbite-react/dist/esm/**/*.js",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         // --- OPCIÓN B: CLASSIC BLUE (BLUE-600) ---
//         primary: {
//           DEFAULT: '#2563eb', // blue-600 (El azul clásico de Tailwind)
//           hover: '#1d4ed8',   // blue-700
//           active: '#1e40af',  // blue-800
//           light: '#dbeafe',   // blue-100
//           text: '#ffffff',    
//         },
//         // --- ESTRUCTURA (SLATE) ---
//         secondary: {
//           DEFAULT: '#64748b', 
//           hover: '#475569',   
//           dark: '#1e293b',    
//           light: '#f8fafc',   
//         },
//         // --- ESTADOS ---
//         success: { DEFAULT: '#10b981', hover: '#059669', light: '#d1fae5' },
//         danger:  { DEFAULT: '#ef4444', hover: '#dc2626', light: '#fee2e2' },
//         warning: { DEFAULT: '#f59e0b', hover: '#d97706', light: '#fef3c7' },
//         info:    { DEFAULT: '#0ea5e9', hover: '#0284c7', light: '#e0f2fe' }
//       }
//     },
//   },
//   plugins: [],
// }

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
        // --- 1. PRIMARY: INDIGO VIBRANTE (Tu marca principal) ---
        primary: {
          DEFAULT: '#6366f1', // indigo-500 (Más brillante y juvenil que el 600)
          hover: '#4f46e5',   // indigo-600
          active: '#4338ca',  // indigo-700
          light: '#e0e7ff',   // indigo-100
          text: '#ffffff',    // Texto blanco sobre fondo indigo
        },

        // --- 2. SECONDARY: SLATE (Estructura limpia) ---
        secondary: {
          DEFAULT: '#64748b', // slate-500
          hover: '#475569',   // slate-600
          dark: '#1e293b',    // slate-800 (Textos oscuros)
          light: '#f8fafc',   // slate-50 (Fondo casi blanco)
        },

        // --- 3. SEMÁNTICOS (Aquí está tu LIME) ---
        
        // SUCCESS: LIME ELÉCTRICO 
        // Usamos lime-500 como default para que el texto se lea bien.
        // El fondo (light) usa lime-100 para ese brillo suave.
        success: { 
          DEFAULT: '#84cc16', // lime-500 (El mejor balance brillo/lectura)
          hover: '#65a30d',   // lime-600 
          light: '#ecfccb',   // lime-100 (Fondo del badge)
        },

        // DANGER: RED (Standard)
        danger: { 
          DEFAULT: '#ef4444', 
          hover: '#dc2626', 
          light: '#fee2e2' 
        },

        // WARNING: AMBER (Standard)
        warning: { 
          DEFAULT: '#f59e0b', 
          hover: '#d97706', 
          light: '#fef3c7' 
        },

        // INFO: SKY (Standard)
        info: { 
          DEFAULT: '#0ea5e9', 
          hover: '#0284c7', 
          light: '#e0f2fe' 
        }
      }
    },
  },
  plugins: [],
}
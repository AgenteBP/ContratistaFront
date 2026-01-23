import axios from 'axios';

const api = axios.create({
    // Asegúrate que este puerto sea el de tu Spring Boot
    baseURL: 'http://localhost:8080/api', 
    headers: {
        'Content-Type': 'application/json',
    }
});

// (Opcional) Aquí podrías agregar un interceptor para el token más adelante
// api.interceptors.request.use(...)

export default api;
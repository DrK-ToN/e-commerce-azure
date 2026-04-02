import axios from 'axios';

// Detecta se o site está rodando localmente
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const api = axios.create({
  baseURL: isLocalhost 
    ? 'http://localhost:3001/api' 
    : 'https://e-commerce-azure-production.up.railway.app/api' // ADICIONE O /api AQUI
});

export default api;
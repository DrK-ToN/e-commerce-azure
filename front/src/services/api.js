import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const api = axios.create({
  // ADICIONADO O /api NO FINAL DA URL DE PRODUÇÃO
  baseURL: isLocalhost 
    ? 'http://localhost:3001/api' 
    : 'https://e-commerce-azure-production.up.railway.app/api' 
});

export default api;
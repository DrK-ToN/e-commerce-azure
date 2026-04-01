import axios from 'axios';

// Detecta se o site está rodando localmente
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const api = axios.create({
  // PRIORIDADE: 
  // 1. Se for Localhost -> usa 3001
  // 2. Se tiver variável de ambiente na Vercel -> usa ela
  // 3. Fallback Final -> Link direto do seu Railway (para garantir que funcione agora)
  baseURL: isLocalhost 
    ? 'http://localhost:3001/api' 
    : (process.env.REACT_APP_API_URL || 'https://e-commerce-azure-production.up.railway.app/api')
});

export default api;
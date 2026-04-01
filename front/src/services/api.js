import axios from 'axios';

// Detecta se o site está rodando no seu computador
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const api = axios.create({
  // Se for local, usa HTTP (sem S). Se for Vercel, usa a URL da variável de ambiente.
  baseURL: isLocalhost 
    ? 'http://localhost:3001/api' 
    : (process.env.REACT_APP_API_URL || '/api')
});

export default api;
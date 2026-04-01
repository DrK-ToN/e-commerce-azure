import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from './utils/trpc';
import { CartProvider } from './context/CartContext'; // Importe o Provider
import BackButton from './components/BackButton';

// --- ESTILOS ---
import './index.css';

// --- COMPONENTES ---
import Navbar from './components/Navbar';

// --- PÁGINAS PÚBLICAS / CLIENTE ---
import Home from './pages/Home';
import Perfil from './pages/Perfil';
import Produtos from './pages/Produtos';
import Carrinho from './pages/Carrinho';
import Checkout from './pages/Checkout';
import Pedidos from './pages/Pedidos';

// --- PÁGINAS ADMIN (DASHBOARD) ---
import Admin from './pages/Admin';
import AdminProdutos from './pages/AdminProdutos';
import AdminClientes from './pages/AdminClientes';
import AdminPedidos from './pages/AdminPedidos';

// --- PÁGINAS DE EDIÇÃO (ADMIN) ---
import EditProduto from './pages/EditProduto';
import EditCliente from './pages/EditCliente';
import EditPedido from './pages/EditPedido';

function App() {
  // Inicializa o cliente do React Query com configurações otimizadas
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, // Evita recarregar dados ao trocar de aba
        retry: 1, // Tenta novamente apenas 1 vez em caso de falha
      },
    },
  }));

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
        <Router>          
          <Navbar />
          <BackButton />
          <Routes>
            {/* --- ROTAS PÚBLICAS E CLIENTE --- */}
            <Route path="/" element={<Home />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/carrinho" element={<Carrinho />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pedidos" element={<Pedidos />} />

            {/* --- ROTAS ADMIN PRINCIPAL --- */}
            <Route path="/admin" element={<Admin />} />

            {/* --- GERENCIAMENTO DE TABELAS --- */}
            <Route path="/admin/produtos" element={<AdminProdutos />} />
            <Route path="/admin/clientes" element={<AdminClientes />} />
            <Route path="/admin/pedidos" element={<AdminPedidos />} />
            
            {/* --- ROTAS DE EDIÇÃO (REST / AXIOS) --- */}
            {/* Padronizei os caminhos para ficarem fáceis de identificar no Admin */}
            <Route path="/admin/produtos/editar/:id" element={<EditProduto />} />
            <Route path="/admin/clientes/editar/:id" element={<EditCliente />} />
            <Route path="/admin/pedidos/editar/:id" element={<EditPedido />} />

            {/* Rota legada (caso algum botão ainda aponte para /admin/Edit/id) */}
            <Route path="/admin/editar/:id" element={<EditProduto />} />
          </Routes>
        </Router>
        </CartProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
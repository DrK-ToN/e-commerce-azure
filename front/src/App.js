import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from './utils/trpc';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import BackButton from './components/BackButton';

// --- ESTILOS ---
import './index.css';

// --- COMPONENTES ---
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// --- PÁGINAS PÚBLICAS / CLIENTE ---
import Home from './pages/Home';
import Login from './pages/Login'; 
import Perfil from './pages/Perfil';
import Cadastro from './pages/Cadastro';
import Produtos from './pages/Produtos';
import Carrinho from './pages/Carrinho';
import Checkout from './pages/Checkout';
import Pedidos from './pages/Pedidos';

// --- PÁGINAS ADMIN (DASHBOARD) ---
import Admin from './pages/Admin';
import PerfilHUD from './pages/PerfilHUD'; // Importado corretamente
import AdminProdutos from './pages/AdminProdutos';
import AdminClientes from './pages/AdminClientes';
import AdminPedidos from './pages/AdminPedidos';

// --- PÁGINAS DE EDIÇÃO (ADMIN) ---
import EditProduto from './pages/EditProduto';
import EditCliente from './pages/EditCliente';
import EditPedido from './pages/EditPedido';

function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1, 
      },
    },
  }));

  return (
    <AuthProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <CartProvider>
            <Router>          
              <Navbar />
              <BackButton />
              <Routes>
                {/* --- ROTAS PÚBLICAS --- */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />
                <Route path="/produtos" element={<Produtos />} />
                <Route path="/carrinho" element={<Carrinho />} />

                {/* --- ROTAS DO CLIENTE --- */}
                <Route path="/perfil" element={
                  <ProtectedRoute>
                    <Perfil />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/pedidos" element={
                  <ProtectedRoute>
                    <Pedidos />
                  </ProtectedRoute>
                } />

                {/* --- ROTAS DO ADMIN --- */}
                {/* CORREÇÃO AQUI: <PerfilHUD /> com P maiúsculo e rota minúscula para bater com a Navbar */}
                <Route path="/perfil-hud" element={
                  <ProtectedRoute requiredRole="admin">
                    <PerfilHUD /> 
                  </ProtectedRoute>
                } />
                
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <Admin />
                  </ProtectedRoute>
                } />
                
                {/* Tabelas do Admin */}
                <Route path="/admin/produtos" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminProdutos />
                  </ProtectedRoute>
                } />
                <Route path="/admin/clientes" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminClientes />
                  </ProtectedRoute>
                } />
                <Route path="/admin/pedidos" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPedidos />
                  </ProtectedRoute>
                } />
                
                {/* Edição do Admin */}
                <Route path="/admin/produtos/editar/:id" element={
                  <ProtectedRoute requiredRole="admin">
                    <EditProduto />
                  </ProtectedRoute>
                } />
                <Route path="/admin/clientes/editar/:id" element={
                  <ProtectedRoute requiredRole="admin">
                    <EditCliente />
                  </ProtectedRoute>
                } />
                <Route path="/admin/pedidos/editar/:id" element={
                  <ProtectedRoute requiredRole="admin">
                    <EditPedido />
                  </ProtectedRoute>
                } />

                {/* Rota legada/extra */}
                <Route path="/admin/editar/:id" element={
                  <ProtectedRoute requiredRole="admin">
                    <EditProduto />
                  </ProtectedRoute>
                } />
              </Routes>
            </Router>
          </CartProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </AuthProvider>
  );
}

export default App;
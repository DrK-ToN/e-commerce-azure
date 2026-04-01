import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/Admin.css'; // Importando o arquivo de estilos

const Admin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProdutos: 0,
    totalClientes: 0,
    totalPedidos: 0,
    faturamentoTotal: 0,
    pedidosRecentes: []
  });

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error("Falha ao carregar dashboard:", err));
  }, []);

  return (
    <div className="container">
      <header className="admin-header">
        <h1 className="footer-title admin-title">Painel Administrativo</h1>
        <button className="btn-secondary" onClick={() => navigate('/')}>← Voltar</button>
      </header>

      {/* Dashboard Cards */}
      <div className="stats-grid">
        <div className="section-highlight stat-card">
          <p className="stat-label">Total de Produtos</p>
          <h2 className="stat-value">{stats.totalProdutos}</h2>
        </div>
        <div className="section-highlight stat-card">
          <p className="stat-label">Total de Clientes</p>
          <h2 className="stat-value">{stats.totalClientes}</h2>
        </div>
        <div className="section-highlight stat-card">
          <p className="stat-label">Total de Pedidos</p>
          <h2 className="stat-value">{stats.totalPedidos}</h2>
        </div>
        <div className="section-highlight stat-card">
          <p className="stat-label">Faturamento Total</p>
          <h2 className="stat-value accent">R$ {stats.faturamentoTotal}</h2>
        </div>
      </div>

      {/* Seção de Gerenciamento */}
      <div className="management-grid">
        <div className="section-highlight management-card card-red">
          <h3>📦 Produtos</h3>
          <p>Gerencie o catálogo, controle o estoque e preços.</p>
          <button
            className="btn-secondary btn-outline-red"
            Click={() => navigate('/admin/produtos')}>Gerenciar Produtos</button>
        </div>

        <div className="section-highlight management-card card-green">
          <h3>👥 Clientes</h3>
          <p>Visualize a base de usuários e históricos de acesso.</p>
          <button 
            className="btn-secondary btn-outline-green" 
            onClick={() => navigate('/admin/clientes')}
          >
            Gerenciar Clientes
          </button>
        </div>

        <div className="section-highlight management-card card-purple">
          <h3>🛒 Pedidos</h3>
          <p>Acompanhe as vendas registradas no Azure Table Storage.</p>
          <button 
            className="btn-secondary btn-outline-purple" 
            onClick={() => navigate('/admin/pedidos')}
          >
            Gerenciar Pedidos ({stats.totalPedidos})
          </button>
        </div>
      </div>

      {/* Tabela de Pedidos Recentes */}
      <section className="section-highlight recent-orders-section">
        <h3>Pedidos Recentes</h3>
        <table className="orders-table">
          <thead>
            <tr className="table-header">
              <th style={{ textAlign: 'left' }}>Pedido</th>
              <th className="text-center">Cliente</th>
              <th className="text-center">Total</th>
              <th className="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.pedidosRecentes.map(pedido => (
              <tr key={pedido.rowKey} className="row-border">
                <td className="cell-padding">#{pedido.rowKey}</td>
                <td className="text-center">ID: {pedido.clienteId}</td>
                <td className="text-center">R$ {pedido.valorTotal}</td>
                <td className="text-center">
                  <span className="status-dot">● {pedido.metodo}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Admin;
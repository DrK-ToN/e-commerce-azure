import React from 'react';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../utils/trpc';
import '../styles/Admin.css';

const Admin = () => {
  const navigate = useNavigate();

  // Chamada do tRPC
  const { data: statsData, isLoading, error } = trpc['admin.stats'].useQuery();

  const stats = statsData || {
    totalProdutos: 0,
    totalClientes: 0,
    totalPedidos: 0,
    faturamentoTotal: 0,
    pedidosRecentes: []
  };

  if (isLoading) return <div className="container"><h2 className="admin-title">SCANNEANDO SISTEMA...</h2></div>;
  
  if (error) {
    return <div className="container"><h2 className="admin-title">ERRO NA REDE NEURAL DO AZURE.</h2></div>;
  }

  return (
    <div className="container admin-main">
      <header className="admin-header">
        <h1 className="footer-title admin-title">CORE_DASHBOARD</h1>
      </header>

      {/* Matriz 2x2 de Stats */}
      <div className="stats-matrix">
        <div className="section-highlight stat-card-mini">
          <p className="stat-label">PRODUTOS</p>
          <h2 className="stat-value-mini">{stats.totalProdutos}</h2>
        </div>
        <div className="section-highlight stat-card-mini">
          <p className="stat-label">CLIENTES</p>
          <h2 className="stat-value-mini">{stats.totalClientes}</h2>
        </div>
        <div className="section-highlight stat-card-mini">
          <p className="stat-label">PEDIDOS</p>
          <h2 className="stat-value-mini">{stats.totalPedidos}</h2>
        </div>
        <div className="section-highlight stat-card-mini">
          <p className="stat-label">RECEITA</p>
          <h2 className="stat-value-mini accent">R$ {stats.faturamentoTotal}</h2>
        </div>
      </div>

      {/* Seção de Gerenciamento */}
      <div className="management-grid">
        <div className="section-highlight management-card card-red">
          <h3>📦 PRODUTOS</h3>
          <p>Controle de estoque e catálogo.</p>
          <button className="btn-secondary" onClick={() => navigate('/admin/produtos')}>ACESSAR</button>
        </div>

        <div className="section-highlight management-card card-green">
          <h3>👥 CLIENTES</h3>
          <p>Base de usuários e acessos.</p>
          <button className="btn-secondary" onClick={() => navigate('/admin/clientes')}>ACESSAR</button>
        </div>

        <div className="section-highlight management-card card-purple">
          <h3>🛒 PEDIDOS</h3>
          <p>Vendas registradas no Azure.</p>
          <button className="btn-secondary" onClick={() => navigate('/admin/pedidos')}>ACESSAR</button>
        </div>
      </div>

      {/* Tabela de Pedidos Recentes */}
      <section className="section-highlight recent-orders-section">
        <h3>ÚLTIMOS LOGS_DE_VENDA</h3>
        <table className="orders-table">
          <thead>
            <tr className="table-header">
              <th>ID</th>
              <th className="text-center">CLIENTE</th>
              <th className="text-center">TOTAL</th>
              <th className="text-center">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {stats.pedidosRecentes?.length > 0 ? (
              stats.pedidosRecentes.map(pedido => (
                <tr key={pedido.id} className="row-border">
                  <td>#{pedido.id}</td>
                  <td className="text-center">{pedido.clienteNome}</td>
                  <td className="text-center">R$ {pedido.total}</td>
                  <td className="text-center">
                    <span className="status-dot">● {pedido.status}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="text-center">Nenhum log recente.</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Admin;
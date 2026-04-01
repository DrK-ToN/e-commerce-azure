import React from 'react';
import { trpc } from '../utils/trpc';
import '../styles/Admin.css';

const AdminPedidos = () => {
  const utils = trpc.useContext();
  const { data: pedidos, isLoading, error } = trpc['pedidos.list'].useQuery();

  // NOVA MUTAÇÃO PARA ATUALIZAR STATUS
  const statusMutation = trpc['pedidos.updateStatus'].useMutation({
    onSuccess: () => {
      utils['pedidos.list'].invalidate();
      alert("Status do pedido atualizado!");
    }
  });

  const handleUpdateStatus = (id, novoStatus) => {
    statusMutation.mutate({ id, status: novoStatus });
  };

  if (isLoading) return <div className="container neon-text">RECUPERANDO TRANSAÇÕES...</div>;
  if (error) return <div className="container">Erro ao carregar log de vendas.</div>;

  return (
    <div className="container">
      <header className="admin-header">
        <h2 className="footer-title">LOG DE VENDAS (SISTEMA AZURE)</h2>
      </header>
      
      <div className="orders-list">
        {pedidos?.map(o => (
          <div key={o.id} className="section-highlight order-item" style={{ marginBottom: '1rem', padding: '1.5rem' }}>
            <div className="order-main-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="order-number" style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>PEDIDO #00{o.id}</span>
                <p className="text-muted">Cliente: <span style={{ color: '#fff' }}>{o.cliente_nome || 'Não identificado'}</span></p>
                <p className="text-muted">Status: <span className={`status-${o.status?.toLowerCase()}`}>{o.status?.toUpperCase()}</span></p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 className="accent-blue">C$ {o.total}</h3>
                <p style={{ fontSize: '0.8rem' }}>{new Date(o.data_pedido).toLocaleString('pt-BR')}</p>
              </div>
            </div>

            <div className="order-footer" style={{ marginTop: '1rem', borderTop: '1px solid #333', paddingTop: '1rem', display: 'flex', gap: '10px' }}>
              {o.status === 'Pendente' && (
                <button onClick={() => handleUpdateStatus(o.id, 'Pago')} className="btn-primary small-btn">APROVAR PAGAMENTO</button>
              )}
              {o.status === 'Pago' && (
                <button onClick={() => handleUpdateStatus(o.id, 'Enviado')} className="btn-primary small-btn">DESPACHAR HARDWARE</button>
              )}
              <button className="btn-secondary small-btn">VER ITENS</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPedidos;
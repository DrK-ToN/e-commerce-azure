import React from 'react';
import { trpc } from '../utils/trpc';
import '../styles/Admin.css'; // Certifique-se de que o CSS do HUD está acessível ou use as classes abaixo

const AdminPedidos = () => {
  const utils = trpc.useUtils(); // Atualizado de useContext para useUtils
  const { data: pedidos, isLoading, error } = trpc['pedidos.list'].useQuery();

  // MUTAÇÃO PARA ATUALIZAR STATUS (Sincronizada com o Backend)
  const statusMutation = trpc['pedidos.updateStatus'].useMutation({
    onSuccess: () => {
      utils['pedidos.list'].invalidate();
      alert("SISTEMA: Status de transação atualizado no Banco Central.");
    },
    onError: (err) => {
      alert("ERRO_DE_SISTEMA: " + err.message);
    }
  });

  const handleUpdateStatus = (id, novoStatus) => {
    const confirmar = window.confirm(`Confirmar alteração de status para: ${novoStatus.toUpperCase()}?`);
    if (confirmar) {
      statusMutation.mutate({ id, status: novoStatus });
    }
  };

  if (isLoading) return <div className="container neon-text">SCANNEANDO PROTOCOLOS DE VENDA...</div>;
  if (error) return <div className="container" style={{color: 'red'}}>FALHA NO ACESSO AO LOG DE VENDAS.</div>;

  return (
    <div className="container admin-pedidos-page">
      <header className="admin-header" style={{ marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
        <h2 className="cyber-title" style={{ color: '#ff9d00', letterSpacing: '3px' }}>
            <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>[ADMIN_MODULE]</span> LOG DE TRANSAÇÕES AZURE
        </h2>
      </header>
      
      <div className="orders-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {pedidos?.map(o => (
          <div key={o.id} className="hud-card order-item" style={{ 
            background: 'rgba(15, 15, 18, 0.8)', 
            border: '1px solid #333', 
            borderLeft: `5px solid ${o.status === 'Pendente' ? '#ff9d00' : '#007bff'}`,
            padding: '20px',
            borderRadius: '4px',
            position: 'relative'
          }}>
            
            <div className="order-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#ff9d00', fontWeight: 'bold', fontSize: '1.1rem' }}>#ID_00{o.id}</span>
                    <span className={`badge-status status-${o.status?.toLowerCase()}`} style={{
                        fontSize: '0.6rem', padding: '2px 8px', borderRadius: '3px', background: '#222', border: '1px solid #444'
                    }}>
                        {o.status?.toUpperCase()}
                    </span>
                </div>
                <p style={{ margin: '10px 0 5px', color: '#fff', fontSize: '0.9rem' }}>
                    CLIENTE: <strong style={{ color: '#aaa' }}>{o.cliente_nome?.toUpperCase() || 'IDENTIDADE_NULA'}</strong>
                </p>
                <p style={{ fontSize: '0.75rem', color: '#666' }}>
                    ENDEREÇO_ENTREGA: {o.endereco || 'NÃO_INFORMADO'}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <h3 style={{ color: '#007bff', margin: 0 }}>C$ {o.total.toLocaleString()}</h3>
                <p style={{ fontSize: '0.7rem', color: '#444', marginTop: '5px' }}>
                    {new Date(o.data_pedido).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="order-actions" style={{ 
                marginTop: '15px', 
                paddingTop: '15px', 
                borderTop: '1px dashed #222', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
            }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                {o.status === 'Pendente' && (
                    <button 
                        onClick={() => handleUpdateStatus(o.id, 'Pago')} 
                        className="btn-save" 
                        style={{ padding: '8px 15px', fontSize: '0.7rem' }}
                    >
                        APROVAR CRÉDITOS
                    </button>
                )}
                {o.status === 'Pago' && (
                    <button 
                        onClick={() => handleUpdateStatus(o.id, 'Enviado')} 
                        className="btn-save" 
                        style={{ padding: '8px 15px', fontSize: '0.7rem', background: '#28a745' }}
                    >
                        DESPACHAR HARDWARE
                    </button>
                )}
                <button className="btn-secondary" style={{ padding: '8px 15px', fontSize: '0.7rem', border: '1px solid #333' }}>
                    VER ITENS
                </button>
              </div>
              
              <div style={{ fontSize: '0.7rem', color: '#333' }}>
                PAGAMENTO: <span style={{ color: '#888' }}>{o.pagamento?.toUpperCase() || 'N/A'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPedidos;
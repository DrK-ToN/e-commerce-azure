import React from 'react';
import { trpc } from '../utils/trpc';
import { useNavigate } from 'react-router-dom';
import '../styles/Admin.css';

const AdminClientes = () => {
  const navigate = useNavigate();
  const utils = trpc.useContext();
  const { data: clientes, isLoading, error } = trpc['clientes.list'].useQuery();

  // NOVA MUTAÇÃO DE EDIÇÃO DE CLIENTE
  const updateMutation = trpc['clientes.update'].useMutation({
    onSuccess: () => {
      utils['clientes.list'].invalidate();
      alert("Cliente atualizado!");
    }
  });

  const handleEdit = (c) => {
    const novoNome = window.prompt("Editar Nome:", c.nome);
    const novoEmail = window.prompt("Editar Email:", c.email);

    if (novoNome && novoEmail) {
      updateMutation.mutate({
        id: c.id,
        nome: novoNome,
        email: novoEmail,
        telefone: c.telefone,
        endereco: c.endereco
      });
    }
  };

  if (isLoading) return <div className="container neon-text">SCANNEANDO REDE...</div>;
  if (error) return <div className="container">Falha na conexão.</div>;

  return (
    <div className="container">
      <h2 className="footer-title">BANCO DE DADOS: CLIENTES</h2>
      
      <div className="grid-clients" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {clientes?.map(c => (
          <div key={c.id} className="section-highlight client-card" style={{ padding: '20px' }}>
            <div className="client-info" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <img src={c.foto_url || 'https://placehold.co/60'} alt={c.nome} style={{ width: '60px', borderRadius: '50%' }} />
              <div>
                <h3 style={{ margin: 0 }}>{c.nome}</h3>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>{c.email}</p>
              </div>
            </div>
            <div className="client-details" style={{ margin: '15px 0', fontSize: '0.8rem' }}>
              <p><strong>FONE:</strong> {c.telefone}</p>
            </div>
            <div className="client-actions" style={{ display: 'flex', gap: '10px' }}>
              <button 
    className="btn-primary" 
    onClick={() => navigate(`/admin/clientes/editar/${c.id}`)}
  >
    EDITAR PERFIL
  </button>
              <button className="btn-secondary" style={{ flex: 1 }}>HISTÓRICO</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminClientes;
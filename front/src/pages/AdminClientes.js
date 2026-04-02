import React from 'react';
import { trpc } from '../utils/trpc';
import { useNavigate } from 'react-router-dom';
import '../styles/Admin.css';

const AdminClientes = () => {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  
  const { data: clientes, isLoading, error } = trpc['clientes.list'].useQuery();

  const updateMutation = trpc['clientes.update'].useMutation({
    onSuccess: () => {
      utils['clientes.list'].invalidate();
      alert("REGISTRO ATUALIZADO NO BANCO CENTRAL.");
    },
    onError: (err) => {
      alert("ERRO NA SINCRONIZAÇÃO: " + err.message);
    }
  });

  const handleQuickEdit = (c) => {
    const novoNome = window.prompt("Editar Nome:", c.nome);
    if (novoNome !== null) { // Permite salvar mesmo se for vazio, mas cancela se apertar "Cancelar"
      updateMutation.mutate({
        id: c.id,
        nome: novoNome,
        email: c.email,
        telefone: c.telefone,
        endereco: c.endereco,
        // Enviando os novos campos do HUD para não perdê-los no update
        cep: c.cep,
        bairro: c.bairro,
        cidade: c.cidade,
        uf: c.uf,
        foto_url: c.foto_url
      });
    }
  };

  if (isLoading) return <div className="container neon-text">SCANNEANDO REDE...</div>;
  if (error) return <div className="container">Falha na conexão orbital.</div>;

  return (
    <div className="container">
      <h2 className="footer-title">BANCO DE DADOS: CLIENTES</h2>
      
      <div className="grid-clients" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {clientes?.map(c => (
          <div key={c.id} className="section-highlight client-card" style={{ padding: '20px', border: '1px solid #333', background: 'rgba(20, 20, 23, 0.8)' }}>
            
            {/* Cabeçalho do Card */}
            <div className="client-info" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <img 
                src={c.foto_url || 'https://placehold.co/60'} 
                alt={c.nome} 
                style={{ width: '65px', height: '65px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ff9d00', boxShadow: '0 0 10px rgba(255, 157, 0, 0.3)' }} 
              />
              <div style={{ overflow: 'hidden' }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {c.nome}
                </h3>
                <p className="text-muted" style={{ fontSize: '0.75rem', color: '#888' }}>{c.email}</p>
                <span className="role-badge" style={{ fontSize: '0.6rem', background: '#007BFF', padding: '2px 6px', borderRadius: '4px' }}>
                  {c.role?.toUpperCase()}
                </span>
              </div>
            </div>
            
            {/* Detalhes Técnicos (Campos Novos) */}
            <div className="client-details" style={{ fontSize: '0.8rem', color: '#aaa', borderTop: '1px solid #222', paddingTop: '10px' }}>
              <p style={{ margin: '5px 0' }}><strong>📞 FONE:</strong> {c.telefone || 'NÃO VINCULADO'}</p>
              <p style={{ margin: '5px 0' }}><strong>📍 LOCAL:</strong> {c.cidade ? `${c.cidade} - ${c.uf}` : 'COORDENADAS NÃO DEFINIDAS'}</p>
              <p style={{ margin: '5px 0' }}><strong>📮 CEP:</strong> {c.cep || '---'}</p>
              <p style={{ margin: '5px 0', fontSize: '0.7rem', color: '#666' }}><strong>🏠 END:</strong> {c.endereco || 'SEM REGISTRO'}</p>
            </div>

            {/* Ações */}
            <div className="client-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                className="btn-primary" 
                onClick={() => handleQuickEdit(c)} 
                style={{ flex: 1, padding: '10px', fontSize: '0.7rem' }}
              >
                NOME RÁPIDO
              </button>
              
              <button 
                className="btn-secondary" 
                onClick={() => navigate(`/admin/clientes/editar/${c.id}`)} 
                style={{ flex: 1, padding: '10px', fontSize: '0.7rem', border: '1px solid #444' }}
              >
                EDITAR COMPLETO
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminClientes;
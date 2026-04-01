import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/EditForm.css';

const EditPedido = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('');
  const [total, setTotal] = useState('');
  const [metodo, setMetodo] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Carrega os dados atuais do pedido
  useEffect(() => {
    api.get(`/pedidos/${id}`)
      .then(res => {
        const p = res.data;
        setStatus(p.status || 'Pendente');
        setTotal(p.total || 0);
        setMetodo(p.metodo_pagamento || '');
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar pedido:", err);
        alert("Falha ao recuperar log de transação.");
        navigate('/admin/pedidos');
      });
  }, [id, navigate]);

  // 2. Lógica de Atualização (PUT)
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/pedidos/${id}`, { 
        status, 
        total: parseFloat(total), 
        metodo_pagamento: metodo 
      });
      alert('Sincronização com o Azure concluída: Status Alterado!');
      navigate('/admin/pedidos');
    } catch (err) {
      console.error("Erro no update:", err);
      alert('Falha crítica ao comunicar com o banco de dados.');
    }
  };

  if (loading) return <div className="container neon-text"><h3>DESCRIPTOGRAFANDO LOGS...</h3></div>;

  return (
    <div className="edit-container">
      <h2 className="footer-title">GERENCIAR PEDIDO #{id}</h2>
      
      <form onSubmit={handleUpdate} className="section-highlight edit-form">
        
        {/* SELETOR DE STATUS */}
        <div className="input-group">
          <label>Protocolo de Entrega (Status)</label>
          <select 
            value={status} 
            onChange={e => setStatus(e.target.value)} 
            className="cyber-select"
            style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: '1px solid var(--accent-blue)' }}
          >
            <option value="Pendente">PENDENTE</option>
            <option value="Pago">PAGO</option>
            <option value="Enviado">ENVIADO</option>
            <option value="Entregue">ENTREGUE</option>
          </select>
        </div>

        {/* VALOR TOTAL */}
        <div className="input-group">
          <label>Créditos Totais (C$)</label>
          <input 
            type="number" 
            step="0.01"
            value={total} 
            onChange={e => setTotal(e.target.value)} 
            placeholder="0.00"
            required
          />
        </div>

        {/* MÉTODO DE PAGAMENTO */}
        <div className="input-group">
          <label>Método de Transferência</label>
          <input 
            type="text" 
            value={metodo} 
            onChange={e => setMetodo(e.target.value)} 
            placeholder="Ex: Cartão, Pix, Créditos"
            required
          />
        </div>

        {/* AÇÕES */}
        <div className="form-actions">
          <button type="submit" className="btn-primary btn-save">
            CONFIRMAR ALTERAÇÕES
          </button>
          
          <button 
            type="button" 
            className="btn-secondary btn-cancel" 
            onClick={() => navigate('/admin/pedidos')}
          >
            ABORTAR
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPedido;
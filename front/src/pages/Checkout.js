import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importação para navegação limpa
import { useCart } from '../hooks/useCart';
import api from '../services/api';

const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [endereco, setEndereco] = useState('');
  const [pagamento, setPagamento] = useState('Pix');
  const [loading, setLoading] = useState(false);

  const finalizarCompra = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) return alert("Seu inventário de compra está vazio!");
    
    setLoading(true);

    // Formatamos os dados para bater exatamente com a rota POST /checkout do backend
    const dadosPedido = {
      cliente_id: 1, // ID Simulado (Em produção viria do seu AuthContext)
      total: parseFloat(total),
      pagamento: pagamento,
      endereco: endereco,
      // Enviamos apenas o necessário para o loop do backend
      itens: cart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        preco: item.preco
      }))
    };

    try {
      // Chamada para a rota transacional que criamos no index.js
      const response = await api.post('/checkout', dadosPedido);
      
      if (response.data.pedidoId) {
        alert(`TRANSAÇÃO CONCLUÍDA! Pedido #${response.data.pedidoId} registrado no log.`);
        clearCart(); // Limpa o estado e o localStorage
        navigate('/'); // Navegação via React Router
      }
    } catch (err) {
      console.error("Erro no checkout:", err);
      alert('FALHA NA CONEXÃO: Não foi possível processar seus créditos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
      
      {/* Coluna da Esquerda: Formulário de Conclusão */}
      <div style={{ flex: 2 }}>
        <h2 className="footer-title">PROTOCOLOS DE ENTREGA</h2>
        <form onSubmit={finalizarCompra} className="section-highlight" style={{ padding: '30px', borderRadius: '8px' }}>
          
          <div className="form-group">
            <label style={{ color: 'var(--accent-blue)', display: 'block', marginBottom: '10px' }}>
              Coordenadas de Destino (Endereço)
            </label>
            <input 
              type="text" 
              placeholder="Ex: Setor 7, Nível 42, Bloco C" 
              onChange={e => setEndereco(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #333' }}
            />
          </div>
          
          <div className="form-group" style={{ marginTop: '20px' }}>
            <label style={{ color: 'var(--accent-blue)', display: 'block', marginBottom: '10px' }}>
              Método de Transferência de Créditos
            </label>
            <select 
              value={pagamento} 
              onChange={e => setPagamento(e.target.value)}
              className="cyber-select"
              style={{ width: '100%', padding: '12px', background: '#000', color: 'white', border: '1px solid #333' }}
            >
              <option value="Pix">PIX (INSTANTÂNEO)</option>
              <option value="Creditos">CRÉDITOS DE CORPORAÇÃO (C$)</option>
              <option value="Cartao">CARTÃO DE CRÉDITO QUANTUM</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '30px', padding: '20px', fontSize: '1.2rem', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'PROCESSANDO...' : 'CONFIRMAR TRANSAÇÃO'}
          </button>
        </form>
      </div>

      {/* Coluna da Direita: Resumo da Carga */}
      <div style={{ flex: 1 }}>
        <h2 className="footer-title">RESUMO DA CARGA</h2>
        <div style={{ background: 'rgba(26, 38, 47, 0.8)', padding: '25px', borderRadius: '8px', border: '1px solid var(--accent-blue)', backdropFilter: 'blur(10px)' }}>
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '5px' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>{item.nome}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Qtd: {item.quantity}</div>
                </div>
                <span style={{ color: 'var(--accent-blue)' }}>C$ {(item.preco * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '2px solid rgba(64, 162, 216, 0.3)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.3rem' }}>
              <span>TOTAL:</span>
              <span style={{ color: 'var(--accent-blue)', textShadow: '0 0 10px rgba(64, 162, 216, 0.5)' }}>
                C$ {total.toFixed(2)}
              </span>
            </div>
            <p style={{ fontSize: '0.7rem', marginTop: '10px', opacity: 0.5, textAlign: 'center' }}>
              Taxas de importação orbital inclusas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
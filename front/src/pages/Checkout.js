import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import api from '../services/api';

const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const [endereco, setEndereco] = useState('');
  const [pagamento, setPagamento] = useState('Pix');

  const finalizarCompra = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Carrinho vazio!");

    const dadosPedido = {
      cliente_id: 1, // Simulado
      total: total,
      itens: cart,
      endereco: endereco,
      pagamento: pagamento
    };

    try {
      await api.post('/checkout', dadosPedido);
      alert('PEDIDO CONFIRMADO! Verifique seu comlink.');
      clearCart(); // Limpa o localStorage
      window.location.href = '/'; // Volta pra Home
    } catch (err) {
      alert('Erro ao processar transação.');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', gap: '40px' }}>
      {/* Coluna da Esquerda: Formulário */}
      <div style={{ flex: 2 }}>
        <h2 className="footer-title">DADOS DE ENTREGA</h2>
        <form onSubmit={finalizarCompra} className="section-highlight" style={{ padding: '30px', borderRadius: '8px' }}>
          <div className="form-group">
            <label>Endereço de Destino (Setor/Nível)</label>
            <input type="text" placeholder="Ex: Setor 7, Nível 42, Apto 2077" onChange={e => setEndereco(e.target.value)} required />
          </div>
          
          <div className="form-group" style={{ marginTop: '20px' }}>
            <label>Protocolo de Pagamento</label>
            <select 
              value={pagamento} 
              onChange={e => setPagamento(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <option value="Pix">Pix (Instantâneo)</option>
              <option value="Creditos">Créditos (C$)</option>
              <option value="Cartao">Cartão de Crédito</option>
            </select>
          </div>
          
          <button type="submit" style={{ width: '100%', marginTop: '30px', padding: '20px', fontSize: '1.2rem' }}>
            CONFIRMAR TRANSAÇÃO
          </button>
        </form>
      </div>

      {/* Coluna da Direita: Resumo */}
      <div style={{ flex: 1 }}>
        <h2 className="footer-title">RESUMO</h2>
        <div style={{ background: '#1a262f', padding: '20px', borderRadius: '8px', border: '1px solid var(--accent-blue)' }}>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
              <span>{item.quantity}x {item.nome}</span>
              <span>C$ {(item.preco * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <hr style={{ opacity: 0.1, margin: '20px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
            <span>TOTAL:</span>
            <span style={{ color: 'var(--accent-blue)' }}>C$ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
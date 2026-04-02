import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { AuthContext } from '../context/AuthContext'; // Importando a "memória" de autenticação

const Carrinho = () => {
  const { cart, removeFromCart, updateQuantity, total } = useCart();
  const { user } = useContext(AuthContext); // Pegando o usuário logado
  const navigate = useNavigate();

  // Função para evitar que a quantidade seja menor que 1
  const handleUpdateQty = (id, delta, currentQty) => {
    if (currentQty + delta < 1) return;
    updateQuantity(id, delta);
  };

  // 🚦 GUARDA DE TRÂNSITO: Valida se o usuário pode ir para o checkout
  const handleCheckoutClick = () => {
    if (!user) {
      alert("Acesso restrito: Você precisa fazer login para transferir os créditos e concluir a transação.");
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2 className="footer-title" style={{ fontSize: '2.5rem' }}>CARRINHO VAZIO</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Nenhum implante ou hardware detectado no seu inventário.</p>
        <Link to="/produtos" className="btn-primary" style={{ padding: '15px 40px', textDecoration: 'none' }}>
          VER CATÁLOGO
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <header style={{ marginBottom: '30px' }}>
        <h2 className="footer-title">MEU INVENTÁRIO (CARRINHO)</h2>
        <p className="text-muted">Revise seus upgrades antes de confirmar a transferência de créditos.</p>
      </header>

      <div className="section-highlight" style={{ borderRadius: '8px', padding: '30px', border: '1px solid rgba(64, 162, 216, 0.2)' }}>
        {cart.map(item => (
          <div key={item.id} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '20px 0', 
            borderBottom: '1px solid rgba(255,255,255,0.05)' 
          }}>
            {/* Informações do Produto */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <img 
                src={item.imagem_url || 'https://via.placeholder.com/80'} 
                alt={item.nome} 
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #333' }} 
              />
              <div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#fff' }}>{item.nome}</h4>
                <p style={{ color: 'var(--accent-blue)', margin: 0, fontWeight: 'bold' }}>
                  C$ {parseFloat(item.preco).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Controles de Quantidade e Exclusão */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#000', borderRadius: '4px', border: '1px solid #444' }}>
                <button 
                  onClick={() => handleUpdateQty(item.id, -1, item.quantity)} 
                  className="btn-secondary" 
                  style={{ padding: '5px 15px', border: 'none', background: 'transparent' }}
                >
                  -
                </button>
                <span style={{ minWidth: '40px', textAlign: 'center', fontWeight: 'bold', color: 'var(--accent-blue)' }}>
                  {item.quantity}
                </span>
                <button 
                  onClick={() => updateQuantity(item.id, 1)} 
                  className="btn-secondary" 
                  style={{ padding: '5px 15px', border: 'none', background: 'transparent' }}
                >
                  +
                </button>
              </div>

              <button 
                onClick={() => removeFromCart(item.id)} 
                className="btn-danger-outline"
                style={{ 
                  backgroundColor: 'transparent', 
                  color: '#ff4d4d', 
                  border: '1px solid #ff4d4d', 
                  padding: '8px 15px',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  marginLeft: '10px'
                }}
              >
                REMOVER
              </button>
            </div>
          </div>
        ))}

        {/* Resumo e Ação Final */}
        <div style={{ marginTop: '40px', textAlign: 'right' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>Subtotal do Pedido:</p>
          <h3 style={{ fontSize: '2rem', margin: 0 }}>
            TOTAL: <span style={{ color: 'var(--accent-blue)', textShadow: '0 0 15px rgba(64, 162, 216, 0.4)' }}>
              C$ {total.toFixed(2)}
            </span>
          </h3>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px' }}>
            <button 
              onClick={() => navigate('/produtos')} 
              className="btn-secondary" 
              style={{ padding: '15px 30px' }}
            >
              CONTINUAR COMPRANDO
            </button>
            
            {/* Botão de transação atualizado com a trava de segurança */}
            <button 
              onClick={handleCheckoutClick} 
              className="btn-primary" 
              style={{ padding: '15px 40px', fontWeight: 'bold', fontSize: '1rem' }}
            >
              CONCLUIR TRANSAÇÃO →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrinho;
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

const Carrinho = () => {
  const { cart, removeFromCart, updateQuantity, total } = useCart();

  if (cart.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 className="footer-title">CARRINHO VAZIO</h2>
        <p style={{ color: 'var(--text-muted)' }}>Nenhum implante selecionado.</p>
        <Link to="/produtos" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block', textDecoration: 'none' }}>VER PRODUTOS</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="footer-title">MEU CARRINHO</h2>
      <div className="section-highlight" style={{ borderRadius: '8px', padding: '20px' }}>
        {cart.map(item => (
          <div key={item.id} style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <img src={item.imagem_url} alt={item.nome} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
              <div>
                <h4 style={{ margin: 0 }}>{item.nome}</h4>
                <p style={{ color: 'var(--accent-blue)', margin: 0 }}>C$ {item.preco}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => updateQuantity(item.id, -1)} className="btn-secondary" style={{ padding: '5px 12px' }}>-</button>
              <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, 1)} className="btn-secondary" style={{ padding: '5px 12px' }}>+</button>
              <button onClick={() => removeFromCart(item.id)} style={{ backgroundColor: '#ff4d4d', marginLeft: '20px', padding: '5px 10px' }}>Excluir</button>
            </div>
          </div>
        ))}

        <div style={{ marginTop: '30px', textAlign: 'right' }}>
          <h3>TOTAL: <span style={{ color: 'var(--accent-blue)' }}>C$ {total.toFixed(2)}</span></h3>
          <Link to="/checkout" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block', textDecoration: 'none', padding: '15px 30px' }}>
            CONCLUIR PEDIDO
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Carrinho;
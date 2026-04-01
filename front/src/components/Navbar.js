import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaClipboardList } from 'react-icons/fa'; // Importei FaClipboardList para o ícone de pedidos
import './Navbar.css';

const Navbar = () => {
  const { cart, cartCount } = useCart(); 

  const displayCount = cartCount !== undefined 
    ? cartCount 
    : cart?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 0;

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">⚙️ CASA DOS CROMOS</Link>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/produtos">Produtos</Link></li>
        
        {/* LINHA ADICIONADA: Pedidos */}
        <li>
          <Link to="/pedidos" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FaClipboardList size={18} /> Pedidos
          </Link>
        </li>

        <li><Link to="/admin">Admin</Link></li>
        <li><Link to="/perfil" className="login-btn">Perfil</Link></li>
        
        <li>
          <Link to="/carrinho" className="nav-cart">
            <FaShoppingCart size={20} />
            {displayCount > 0 && (
              <span className="cart-badge">{displayCount}</span>
            )}
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
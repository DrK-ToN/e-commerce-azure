import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { FaShoppingCart, FaClipboardList, FaSignOutAlt, FaTerminal } from 'react-icons/fa'; // Importei FaTerminal para o HUD
import '../styles/Navbar.css';

const Navbar = () => {
  const { cart, cartCount } = useCart(); 
  const { user, logout } = useContext(AuthContext); 
  const navigate = useNavigate();

  const displayCount = cartCount !== undefined 
    ? cartCount 
    : cart?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 0;

  const handleLogout = () => {
    logout(); 
    navigate('/login'); 
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">⚙️ CASA DOS CROMOS</Link>
      </div>
      
      {user && (
        <ul className="nav-links">
          <li><Link to="/produtos">📦 Produtos</Link></li>
          
          <li>
            <Link to="/pedidos" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaClipboardList size={18} /> Pedidos
            </Link>
          </li>

          {/* ÁREA EXCLUSIVA DO ADMIN */}
          {user.role === 'admin' && (
            <>
              <li><Link to="/admin">🔑 Admin</Link></li>
            </>
          )}
          
          <li>
            <Link to="/carrinho" className="nav-cart">
              <FaShoppingCart size={20} />
              {displayCount > 0 && (
                <span className="cart-badge">{displayCount}</span>
              )}
            </Link>
          </li>

          {/* CONTAINER DE PERFIL + SAIR */}
          <li className="profile-container">
            {/* Se for admin, o link de perfil pode ir direto para o HUD, se for cliente vai para o perfil normal */}
            <Link to={user.role === 'admin' ? "/perfil-hud" : "/perfil"} className="login-btn profile-link">
              👤 {user.role === 'admin' ? 'Root' : 'Perfil'}
            </Link>
            
            <button 
              className="logout-btn" 
              onClick={handleLogout} 
              title="Sair do Sistema"
            >
              <FaSignOutAlt size={16} />
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
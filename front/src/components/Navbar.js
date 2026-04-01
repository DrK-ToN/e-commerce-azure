import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">⚙️ CASA DOS CROMOS</Link>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/produtos">Produtos</Link></li>
        <li><Link to="/carrinho">Carrinho</Link></li>
        <li><Link to="/admin">Admin</Link></li>
        <li><Link to="/perfil" className="login-btn">Perfil</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
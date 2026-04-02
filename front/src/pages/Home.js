import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from '../context/AuthContext'; // Importando a "memória"
import maoCromo from '../assets/cromo.webp';

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Garante que fica na Home ou recarrega o estado
  };

  return (
    <div className="container">
      {/* 1. SEÇÃO HERO */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center', marginTop: '40px' }}>
        <div>
          <h1 style={{ fontSize: '3.5rem', lineHeight: '1' }}>
            MELHORE SUA <br/> 
            <span style={{ color: 'var(--accent-blue)' }}>HUMANIDADE.</span>
          </h1>
          <p style={{ marginTop: '20px', color: 'var(--text-muted)', fontSize: '1.2rem' }}>
            A maior distribuidora de implantes cibernéticos da Night City. 
            Segurança, potência e cromo de alta performance.
          </p>
          <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
            <Link to="/produtos" className="btn-primary" style={{ padding: '12px 30px', textDecoration: 'none' }}>
              VER CATÁLOGO
            </Link>
            
            {/* 🚦 CONTROLE DE ACESSO NA HOME 🚦 */}
            {user ? (
              // Usuário Logado: Vê Perfil e Sair(já tem na navbar)
              <>
                
              </>
            ) : (
              // Usuário Deslogado: Vê Entrar e Cadastrar
              <>
                <Link to="/login" className="btn-secondary" style={{ padding: '12px 30px', textDecoration: 'none' }}>
                  ENTRAR
                </Link>
                <Link to="/cadastro" className="btn-secondary" style={{ padding: '12px 30px', textDecoration: 'none', border: '1px solid #fff', color: '#fff' }}>
                  CADASTRAR
                </Link>
              </>
            )}
          </div>
        </div>

        {/* 2. IMAGEM DE DESTAQUE (A MÃO) */}
        <div className="hero-img" style={{ border: '2px solid var(--accent-blue)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 0 20px rgba(0, 243, 255, 0.2)' }}>
          <img 
            src={maoCromo} 
            alt="Implante de Mão Cromada" 
            style={{ width: '100%', height: 'auto', display: 'block' }} 
          />
        </div>
      </section>

      {/* 3. FOOTER */}
      <footer className="footer" style={{ marginTop: '80px' }}>
        <div className="footer-grid">
          <div>
            <div className="nav-logo" style={{ marginBottom: "20px" }}>
              CASA DOS CROMOS
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
              &copy; 2026 DrK ToN Tech. <br />
              Desenvolvido para o projeto Fatec Azure.
            </p>
          </div>
          <div>
            <h4 className="footer-title">Navegação</h4>
            <ul className="footer-links" style={{ listStyle: 'none', padding: 0 }}>
              <li><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link></li>
              <li><Link to="/produtos" style={{ color: 'inherit', textDecoration: 'none' }}>Produtos</Link></li>
              <li><Link to="/carrinho" style={{ color: 'inherit', textDecoration: 'none' }}>Carrinho</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-title">Suporte</h4>
            <ul className="footer-links" style={{ listStyle: 'none', padding: 0 }}>
              <li>FAQ</li>
              <li>Termos de Uso</li>
              <li>Contato</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
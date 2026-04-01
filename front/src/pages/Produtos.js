import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../hooks/useCart"; // Certifique-se que o useCart aponta para o Contexto
import { FaCheckCircle } from 'react-icons/fa'; 
import '../styles/Produtos.css';

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null); 
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/produtos")
      .then((res) => {
        setProdutos(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar catálogo:", err);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (produto) => {
    addToCart(produto);
    setFeedback(produto.id); 
    setTimeout(() => setFeedback(null), 2000); 
  };

  if (loading) return <div className="container loading-box"><h3>[ SISTEMA CARREGANDO... ]</h3></div>;

  return (
    <div className="container produtos-container">
      <header className="produtos-header">
        <h1 className="footer-title">CATÁLOGO DE UPGRADES</h1>
        <p>Explore a nossa seleção de implantes e hardware de última geração.</p>
      </header>

      <div className="produtos-grid">
        {produtos.map((p) => (
          <article key={p.id} className="cyber-product-card">
            {/* TAG DE NÍVEL/CATEGORIA */}
            <div className="status-badge">{p.categoria || 'NÍVEL 1'}</div>

            {/* CONTAINER DA IMAGEM (Restaurado) */}
            <div className="product-thumb-container">
              <img
                src={p.imagem_url || "https://via.placeholder.com/300x200?text=NO+DATA"}
                alt={p.nome}
                className="product-thumb"
              />
            </div>

            {/* CORPO DO CARD (Restaurado) */}
            <div className="product-body">
              <h3>{p.nome}</h3>
              <p className="product-description">{p.descricao}</p>

              <div className="product-price-tag">
                C$ {parseFloat(p.preco).toFixed(2)}
              </div>

              <div className="product-actions">
  <button 
    onClick={() => { addToCart(p); navigate('/checkout'); }} 
    className="btn-buy" // Classe específica
  >
    COMPRAR AGORA
  </button>

  <button 
    onClick={() => handleAddToCart(p)} 
    className="btn-add" // Classe específica
  >
    {feedback === p.id ? (
      <span className="feedback-content" style={{ color: '#00ff00', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <FaCheckCircle /> ADD!
      </span>
    ) : (
      "+ CARRINHO"
    )}
  </button>
</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Produtos;
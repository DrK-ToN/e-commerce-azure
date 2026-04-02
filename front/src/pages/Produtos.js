import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../hooks/useCart";
import { FaCheckCircle } from 'react-icons/fa'; 
import '../styles/Produtos.css';

const Produtos = () => {
  const [produtos, setProdutos] = useState([]); // Inicia como array vazio
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null); 
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/produtos")
      .then((res) => {
        // Verifica se res.data é um array antes de setar
        setProdutos(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro na API:", err);
        setProdutos([]); // Mantém array vazio se der erro
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (p) => {
    addToCart(p);
    setFeedback(p.id); 
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
        {/* Renderiza apenas se produtos for um array populado */}
        {Array.isArray(produtos) && produtos.length > 0 ? (
          produtos.map((p) => (
            <article key={p.id} className="cyber-product-card">
              <div className="status-badge">{p.categoria || 'NÍVEL 1'}</div>
              <div className="product-thumb-container">
                <img
                  src={p.imagem_url || "https://via.placeholder.com/300x200?text=SEM+IMAGEM"}
                  alt={p.nome}
                  className="product-thumb"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/300x200?text=IMAGE+ERROR"; }}
                />
              </div>
              <div className="product-body">
                <h3>{p.nome}</h3>
                <p className="product-description">{p.descricao}</p>
                <div className="product-price-tag">C$ {parseFloat(p.preco || 0).toFixed(2)}</div>
                <div className="product-actions">
                  <button onClick={() => { addToCart(p); navigate('/checkout'); }} className="btn-buy">COMPRAR AGORA</button>
                  <button onClick={() => handleAddToCart(p)} className="btn-add">
                    {feedback === p.id ? <span><FaCheckCircle /> ADD!</span> : "+ CARRINHO"}
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>
            <p>[ ERRO DE SINCRONIZAÇÃO: NENHUM HARDWARE DETECTADO ]</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Produtos;
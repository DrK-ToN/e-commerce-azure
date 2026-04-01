import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useCart } from "../hooks/useCart";
import '../styles/Produtos.css'; // Importando o arquivo de estilos

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    // Busca os produtos do MySQL via API
    api
      .get("/produtos")
      .then((res) => {
        setProdutos(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar catálogo:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container loading-box">
        <h3>[ SISTEMA CARREGANDO... ]</h3>
      </div>
    );
  }

  return (
    <div className="container produtos-container">
      <header className="produtos-header">
        <h1 className="footer-title">CATÁLOGO DE UPGRADES</h1>
        <p>Explore a nossa seleção de implantes e hardware de última geração.</p>
      </header>

      <div className="produtos-grid">
        {produtos.map((p) => (
          <article key={p.id} className="cyber-product-card">
            {/* Badge de novidade */}
            <div className="status-badge">NÍVEL 1</div>

            <div className="product-thumb-container">
              <img
                src={p.imagem_url || "https://via.placeholder.com/300x200?text=NO+DATA"}
                alt={p.nome}
                className="product-thumb"
              />
            </div>

            <div className="product-body">
              <h3>{p.nome}</h3>
              <p className="product-description">{p.descricao}</p>

              <div className="product-footer">
                <span className="product-price">C$ {p.preco}</span>
                <button
                  onClick={() => addToCart(p)}
                  className="btn-primary"
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {produtos.length === 0 && (
        <div className="empty-box">
          <p>O stock está vazio neste momento. Volte após o próximo hack.</p>
        </div>
      )}
    </div>
  );
};

export default Produtos;
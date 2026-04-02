import React, { useEffect, useState, useContext } from 'react'; // Adicionado useContext
import api from '../services/api';
import { AuthContext } from '../context/AuthContext'; // Importando o contexto
import { FaBox, FaCreditCard, FaCalendarAlt, FaMicrochip } from 'react-icons/fa';
import '../styles/Pedidos.css';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext); // Pegando o usuário logado

  useEffect(() => {
    // Só faz a requisição se o usuário estiver carregado e tiver um ID
    if (user && user.id) {
      api.get(`/pedidos/cliente/${user.id}`) // Usando o ID real do usuário logado
        .then((res) => {
          setPedidos(Array.isArray(res.data) ? res.data : []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Erro ao carregar registros:", err);
          setPedidos([]);
          setLoading(false);
        });
    } else if (!user) {
      // Se não houver usuário (ex: deslogou enquanto estava na página)
      setLoading(false);
    }
  }, [user]); // O efeito roda novamente se o usuário mudar

  if (loading) {
    return (
      <div className="container loading-box">
        <h3>[ ACESSANDO TERMINAL DE VENDAS... ]</h3>
      </div>
    );
  }

  // Se por algum motivo o usuário acessar sem estar logado
  if (!user) {
    return (
      <div className="container empty-box">
        <p>Acesso negado. Por favor, faça login para ver seus logs de transação.</p>
      </div>
    );
  }

  return (
    <div className="container pedidos-container">
      <header className="pedidos-header">
        <h1 className="footer-title">HISTÓRICO DE AQUISIÇÕES</h1>
        <p>Logs de transações autorizadas para o usuário: <strong>{user.nome}</strong></p>
      </header>

      <div className="pedidos-list">
        {Array.isArray(pedidos) && pedidos.length > 0 ? (
          pedidos.map((pedido) => (
            <div key={pedido.id} className="pedido-card">
              <div className="pedido-main-info">
                <div className="pedido-id">
                  <FaBox /> <span>TRANS_ID: #{pedido.id}</span>
                </div>
                <div className="pedido-data">
                  <FaCalendarAlt /> {new Date(pedido.data_pedido).toLocaleString()}
                </div>
                <div className={`pedido-status status-${pedido.status?.toLowerCase()}`}>
                  {pedido.status?.toUpperCase()}
                </div>
              </div>

              <div className="pedido-content">
                <div className="pedido-pagamento">
                  <FaCreditCard />
                  <small>MÉTODO:</small>
                  <strong>{pedido.metodo_pagamento || 'N/A'}</strong>
                </div>

                <div className="pedido-total-box">
                  <small>TOTAL DA CARGA:</small>
                  <span className="total-valor">
                    C$ {parseFloat(pedido.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pedido-footer">
                <span className="info-chip">
                  <FaMicrochip /> Hardware Verificado
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-box">
            <p>Nenhum registro de compra encontrado no sistema para {user.nome}.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pedidos;
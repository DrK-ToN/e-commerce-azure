import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FaBox, FaCreditCard, FaCalendarAlt, FaMicrochip } from 'react-icons/fa';
import '../styles/Pedidos.css';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca os pedidos do cliente (ID 1 simulado)
    api.get('/pedidos/cliente/1')
      .then((res) => {
        // Garante que o que vai para o estado é um array
        setPedidos(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar registros:", err);
        setPedidos([]); // Evita que pedidos fique como undefined
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container loading-box">
        <h3>[ ACESSANDO TERMINAL DE VENDAS... ]</h3>
      </div>
    );
  }

  return (
    <div className="container pedidos-container">
      <header className="pedidos-header">
        <h1 className="footer-title">HISTÓRICO DE AQUISIÇÕES</h1>
        <p>Logs de transações autorizadas para este usuário.</p>
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
            <p>Nenhum registro de compra encontrado no sistema.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pedidos;
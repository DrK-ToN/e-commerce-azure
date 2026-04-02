import React from "react";
import { trpc } from "../utils/trpc";
import { useNavigate } from "react-router-dom";
import { FaEye, FaTrash, FaSyncAlt } from "react-icons/fa";
import "../styles/Admin.css";

const AdminPedidos = () => {
  const navigate = useNavigate();
  const utils = trpc.useUtils(); // Versão atualizada do useContext no tRPC

  // Busca a lista de pedidos (certifique-se que 'pedidos.list' existe no seu server.js)
  const { data: pedidos, isLoading, error } = trpc["pedidos.list"].useQuery();

  // Função para mudar status rapidamente (Opcional, se você criar essa mutação no server)
  const updateStatusMutation = trpc["pedidos.updateStatus"]?.useMutation({
    onSuccess: () => {
      utils["pedidos.list"].invalidate();
      alert("STATUS SINCRONIZADO.");
    },
  });

  const handleStatusChange = (id, statusAtual) => {
    const novoStatus = window.prompt("ALTERAR STATUS (Pendente, Pago, Enviado, Cancelado):", statusAtual);
    if (novoStatus && novoStatus !== statusAtual && updateStatusMutation) {
      updateStatusMutation.mutate({ id, status: novoStatus });
    } else if (!updateStatusMutation) {
      alert("MUTAÇÃO 'pedidos.updateStatus' NÃO ENCONTRADA NO SERVIDOR.");
    }
  };

  if (isLoading)
    return <div className="container neon-text">SCANNEANDO REGISTROS DE VENDAS...</div>;
  if (error) return <div className="container">ERRO_DE_SISTEMA: {error.message}</div>;

  return (
    <div className="container">
      <header
        className="admin-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h2 className="footer-title">LOG DE TRANSAÇÕES (PEDIDOS)</h2>
        <div className="stats-mini" style={{ fontSize: '0.8rem', color: '#888' }}>
            TOTAL DE ENTRADAS: <span className="text-white">{pedidos?.length || 0}</span>
        </div>
      </header>

      <div className="section-highlight admin-table-container">
        <table className="admin-table" style={{ width: "100%" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #333" }}>
              <th>ID_LOG</th>
              <th>CLIENTE</th>
              <th>DATA / HORA</th>
              <th>PAGAMENTO</th>
              <th>TOTAL</th>
              <th>STATUS</th>
              <th style={{ textAlign: "right" }}>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {pedidos?.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #222" }}>
                <td style={{ padding: "12px", opacity: 0.6, fontSize: '0.8rem' }}>
                    #{p.id.toString().padStart(4, '0')}
                </td>
                <td>
                  <div className="text-white" style={{ fontWeight: "bold" }}>
                    {p.cliente_nome || `ID_CLI: ${p.cliente_id}`}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#666" }}>
                    REF_UUID: {p.id}
                  </div>
                </td>
                <td style={{ fontSize: '0.85rem' }}>
                    {new Date(p.data_pedido).toLocaleDateString('pt-BR')} 
                    <br/>
                    <span style={{opacity: 0.5}}>{new Date(p.data_pedido).toLocaleTimeString('pt-BR')}</span>
                </td>
                <td style={{ fontSize: '0.8rem' }}>{p.pagamento?.toUpperCase()}</td>
                <td className="accent-blue" style={{ fontWeight: 'bold' }}>
                    C$ {parseFloat(p.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td>
                  <span className={`status-badge status-${p.status?.toLowerCase()}`} 
                        style={{ 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            fontSize: '0.7rem', 
                            fontWeight: 'bold',
                            backgroundColor: p.status === 'Pendente' ? '#554400' : p.status === 'Pago' ? '#004411' : '#222',
                            color: p.status === 'Pendente' ? '#ffcc00' : p.status === 'Pago' ? '#00ff66' : '#fff'
                        }}>
                    {p.status?.toUpperCase()}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="btn-secondary small-btn"
                    title="Ver Detalhes"
                    onClick={() => navigate(`/admin/pedidos/editar/${p.id}`)}
                  >
                    <FaEye />
                  </button>
                  <button
                    className="btn-primary small-btn"
                    title="Alterar Status"
                    onClick={() => handleStatusChange(p.id, p.status)}
                    style={{ marginLeft: '5px' }}
                  >
                    <FaSyncAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPedidos;
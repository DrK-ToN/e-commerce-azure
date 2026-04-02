import React from "react";
import { trpc } from "../utils/trpc";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import "../styles/Admin.css";

const AdminProdutos = () => {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  // Busca a lista de produtos (usando a rota que já criamos no server.js)
  const { data: produtos, isLoading, error } = trpc["produtos.list"].useQuery();

  // Mutação para excluir produto (Certifique-se de criar 'produtos.delete' no seu server.js)
  const deleteMutation = trpc["produtos.delete"]?.useMutation({
    onSuccess: () => {
      utils["produtos.list"].invalidate();
      alert("PRODUTO REMOVIDO DO BANCO DE DADOS.");
    },
    onError: (err) => {
      alert("ERRO AO EXCLUIR: " + err.message);
    }
  });

  const handleDelete = (id, nome) => {
    if (window.confirm(`DESEJA REALMENTE APAGAR O PRODUTO: ${nome}?`)) {
      if (deleteMutation) {
        deleteMutation.mutate({ id });
      } else {
        alert("MUTAÇÃO 'produtos.delete' NÃO CONFIGURADA NO SERVIDOR.");
      }
    }
  };

  if (isLoading)
    return <div className="container neon-text">SCANNEANDO INVENTÁRIO...</div>;
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
        <h2 className="footer-title">GERENCIAMENTO DE PRODUTOS</h2>
        <button 
          className="btn-primary" 
          onClick={() => navigate("/admin/produtos/novo")}
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <FaPlus /> NOVO_ITEM
        </button>
      </header>

      <div className="section-highlight admin-table-container">
        <table className="admin-table" style={{ width: "100%" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #333" }}>
              <th>IMG</th>
              <th>PRODUTO</th>
              <th>PREÇO</th>
              <th>ESTOQUE</th>
              <th style={{ textAlign: "right" }}>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {produtos?.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #222" }}>
                <td style={{ padding: "10px" }}>
                  <img 
                    src={p.imagem_url || 'https://placehold.co/50'} 
                    alt={p.nome} 
                    style={{ width: "40px", height: "40px", borderRadius: "4px", objectFit: "cover", border: '1px solid #444' }}
                  />
                </td>
                <td>
                  <div className="text-white" style={{ fontWeight: "bold" }}>{p.nome}</div>
                  <div style={{ fontSize: "0.7rem", color: "#666" }}>REF: {p.id}</div>
                </td>
                <td className="accent-blue">
                  C$ {parseFloat(p.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td style={{ color: p.estoque < 10 ? '#ff4444' : '#fff' }}>
                  {p.estoque} un
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="btn-secondary small-btn"
                    title="Editar Produto"
                    onClick={() => navigate(`/admin/produtos/editar/${p.id}`)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn-danger small-btn" // Certifique-se de ter essa cor no CSS
                    title="Excluir"
                    onClick={() => handleDelete(p.id, p.nome)}
                    style={{ marginLeft: '5px', backgroundColor: '#440000', color: '#ff4444' }}
                  >
                    <FaTrash />
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

export default AdminProdutos;
import React from "react";
import { trpc } from "../utils/trpc";
import { useNavigate } from "react-router-dom";
import "../styles/Admin.css";

const AdminProdutos = () => {
  const navigate = useNavigate();
  const utils = trpc.useContext();
  const { data: produtos, isLoading, error } = trpc["produtos.list"].useQuery();

  const deleteMutation = trpc["produtos.delete"].useMutation({
    onSuccess: () => {
      utils["produtos.list"].invalidate();
      alert("Produto removido!");
    },
  });

  // NOVA MUTAÇÃO DE EDIÇÃO
  const updateMutation = trpc["produtos.update"].useMutation({
    onSuccess: () => {
      utils["produtos.list"].invalidate();
      alert("Produto atualizado com sucesso!");
    },
  });

  const handleEdit = (p) => {
    const novoNome = window.prompt("Novo Nome:", p.nome);
    const novoPreco = window.prompt("Novo Preço (apenas números):", p.preco);
    const novoEstoque = window.prompt("Novo Estoque:", p.estoque);

    if (novoNome && novoPreco && novoEstoque) {
      updateMutation.mutate({
        id: p.id,
        nome: novoNome,
        marca: p.marca,
        descricao: p.descricao,
        preco: parseFloat(novoPreco),
        estoque: parseInt(novoEstoque),
        categoria: p.categoria,
      });
    }
  };

  if (isLoading)
    return <div className="container neon-text">CARREGANDO ESTOQUE...</div>;
  if (error) return <div className="container">Erro: {error.message}</div>;

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
        <h2 className="footer-title">ESTOQUE DE IMPLANTES</h2>
        <button className="btn-primary">+ NOVO PRODUTO</button>
      </header>

      <div className="section-highlight admin-table-container">
        <table className="admin-table" style={{ width: "100%" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #333" }}>
              <th>ID</th>
              <th>NOME / CATEGORIA</th>
              <th>MARCA</th>
              <th>PREÇO</th>
              <th>ESTOQUE</th>
              <th style={{ textAlign: "right" }}>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {produtos?.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #222" }}>
                <td style={{ padding: "12px", opacity: 0.6 }}>#{p.id}</td>
                <td>
                  <div className="text-white" style={{ fontWeight: "bold" }}>
                    {p.nome}
                  </div>
                  <div
                    style={{ fontSize: "0.7rem", color: "var(--accent-color)" }}
                  >
                    {p.categoria?.toUpperCase()}
                  </div>
                </td>
                <td>{p.marca}</td>
                <td className="accent-blue">C$ {p.preco}</td>
                <td>{p.estoque} un</td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="btn-secondary small-btn"
                    onClick={() => navigate(`/admin/produtos/editar/${p.id}`)}
                  >
                    EDITAR
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Excluir ${p.nome}?`))
                        deleteMutation.mutate(p.id);
                    }}
                    className="btn-danger small-btn"
                  >
                    DELETAR
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

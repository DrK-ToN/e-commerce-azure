// 1. CORREÇÃO: Importando explicitamente todos os hooks necessários do React
import React, { useState, useEffect, useContext, useRef } from "react";
import api from "../services/api";
// 2. CORREÇÃO: Verifique se o caminho do AuthContext está correto (../context/AuthContext)
import { AuthContext } from "../context/AuthContext";
import "../styles/PerfilHUD.css";

function PerfilHUD() {
  const { user } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  // 3. Estado do Tema
  const [tema, setTema] = useState("blue");

  const [perfil, setPerfil] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    foto_url: "",
    cep: "",
    bairro: "",
    cidade: "",
    uf: "",
  });

  const [stats, setStats] = useState({ pedidos: 0, favoritos: 0, total: 0 });
  const [clima] = useState("24°C - NIGHT CITY");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      api
        .get(`/clientes/${user.id}`)
        .then((res) => {
          const d = res.data;
          setPerfil({
            nome: d.nome || "",
            email: d.email || "",
            telefone: d.telefone || "",
            endereco: d.endereco || "",
            foto_url: d.foto_url || "",
            cep: d.cep || "",
            bairro: d.bairro || "",
            cidade: d.cidade || "",
            uf: d.uf || "",
          });
          setStats({ pedidos: 21, favoritos: 6, total: 68000 });
        })
        .catch((err) => console.error("Erro ao carregar HUD:", err));
    }
  }, [user]);

  // 4. CORREÇÃO: Definindo explicitamente a função handleSave para evitar 'no-undef'
  const handleSave = async () => {
    try {
      await api.put(`/clientes/${user.id}`, perfil);
      alert("SINCRO_CONCLUÍDA: Registros atualizados.");
    } catch (err) {
      console.error(err);
      alert("ERRO_DE_SISTEMA: Falha na gravação.");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.id) return;

    const formData = new FormData();
    formData.append("foto", file);

    setLoading(true);
    try {
      const response = await api.post(
        `/clientes/${user.id}/upload-foto`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data.foto_url) {
        setPerfil((prev) => ({ ...prev, foto_url: response.data.foto_url }));
        alert("SISTEMA: Bio-assinatura visual sincronizada.");
      }
    } catch (err) {
      console.error("Erro no upload:", err);
      alert("FALHA_DE_CONEXÃO: Azure Storage não responde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hud-page-wrapper">
      {/* Seletor de Tema (Dropdown) */}
      <div className="theme-selector">
        <select className="cyber-select-btn"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
        >
          <option value="blue">Neural</option>
          <option value="gold">Midas</option>
          <option value="red">Vamp</option>
          <option value="green">Toxic</option>
          <option value="purple">Ghost</option>
          <option value="pink">Cyber</option>
        </select>
      </div>

      <div className="hud-main-container" data-theme={tema}>
        <button className="hud-overlay-btn-save" onClick={handleSave}>
          SALVAR
        </button>

        <div
          className={`hud-overlay-avatar ${loading ? "scanning" : ""}`}
          onClick={() => fileInputRef.current.click()}
        >
          <img
            src={perfil.foto_url || "https://placeholder.pics/svg/300"}
            alt="User"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept="image/*"
          />
          <div className="avatar-overlay">UPLOAD</div>
        </div>

        <div className="hud-overlay-name">
          {perfil.nome || "IDENTIDADE_DESCONHECIDA"}
        </div>
        <div className="hud-overlay-weather">{clima}</div>

        <div className="hud-overlay-box box-geo">
          <div className="hud-input-row">
            <span>CEP:</span>{" "}
            <input
              value={perfil.cep || ""}
              onChange={(e) => setPerfil({ ...perfil, cep: e.target.value })}
            />
          </div>
          <div className="hud-input-row">
            <span>ENDEREÇO:</span>{" "}
            <input
              value={perfil.endereco || ""}
              onChange={(e) =>
                setPerfil({ ...perfil, endereco: e.target.value })
              }
            />
          </div>
          <div className="hud-input-row">
            <span>BAIRRO:</span>{" "}
            <input
              value={perfil.bairro || ""}
              onChange={(e) => setPerfil({ ...perfil, bairro: e.target.value })}
            />
          </div>
          <div className="hud-input-row">
            <span>CIDADE:</span>{" "}
            <input
              value={perfil.cidade || ""}
              onChange={(e) => setPerfil({ ...perfil, cidade: e.target.value })}
            />
          </div>
        </div>

        <div className="hud-overlay-box box-comms">
          <label>EMAIL:</label>
          <div
            className="hud-val"
            style={{ fontSize: "0.7rem", color: "#fff" }}
          >
            {perfil.email}
          </div>
          <label style={{ marginTop: "15px" }}>TELEFONE:</label>
          <input
            className="hud-input-clean"
            value={perfil.telefone || ""}
            onChange={(e) => setPerfil({ ...perfil, telefone: e.target.value })}
          />
        </div>

        <div className="hud-overlay-box box-stats">
          <div className="hud-stat">
            <span>PEDIDOS:</span> <strong>{stats.pedidos}</strong>
          </div>
          <div className="hud-stat">
            <span>FAVORITOS:</span> <strong>{stats.favoritos}</strong>
          </div>
          <div className="hud-stat">
            <span>INVESTIMENTO:</span>{" "}
            <strong>R$ {stats.total.toLocaleString()}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerfilHUD;

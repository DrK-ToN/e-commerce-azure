import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const EditarProduto = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados para os campos
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [estoque, setEstoque] = useState(''); // Estado do estoque
  const [imagemUrlAtual, setImagemUrlAtual] = useState('');
  const [novaImagem, setNovaImagem] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Carrega os dados atuais do produto ao abrir a página
  useEffect(() => {
    api.get(`/produtos/${id}`)
      .then(res => {
        const p = res.data;
        setNome(p.nome || '');
        setPreco(p.preco || '');
        setDescricao(p.descricao || '');
        setCategoria(p.categoria || '');
        setEstoque(p.estoque || 0); // Carrega o estoque do banco
        setImagemUrlAtual(p.imagem_url || '');
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar produto:", err);
        alert("Erro ao carregar dados do implante.");
        navigate('/admin');
      });
  }, [id, navigate]);

  const handleUpdate = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  
  formData.append('nome', nome || '');
  formData.append('preco', preco || 0);
  formData.append('descricao', descricao || '');
  formData.append('categoria', categoria || 'Geral');
  formData.append('estoque', estoque || 0); // AGORA ENVIA O ESTADO CORRETO
  
  if (novaImagem) {
    formData.append('imagem', novaImagem);
  } else {
    // Importante: o backend espera 'imagemUrl' (veja seu index.js linha 103)
    formData.append('imagemUrl', imagemUrlAtual); 
  }

    try {
      await api.put(`/produtos/${id}`, formData);
      alert('Sistemas atualizados com sucesso!');
      navigate('/admin'); 
    } catch (err) {
      console.error("Erro na atualização:", err);
      alert('Falha crítica na atualização do banco de dados.');
    }
  };

  if (loading) return <div className="container"><h3>A aceder ao terminal...</h3></div>;

  return (
    <div className="container" style={{ maxWidth: '700px' }}>
      <h2 className="footer-title">CONFIGURAR IMPLANTE #{id}</h2>
      
      <form onSubmit={handleUpdate} className="section-highlight" style={{ padding: '30px', borderRadius: '8px' }}>
        <div style={{ display: 'grid', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--accent-blue)' }}>Designação do Item</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--accent-blue)' }}>Preço (C$)</label>
              <input type="number" value={preco} onChange={e => setPreco(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--accent-blue)' }}>Estoque</label>
              <input type="number" value={estoque} onChange={e => setEstoque(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--accent-blue)' }}>Classe</label>
              <input type="text" value={categoria} onChange={e => setCategoria(e.target.value)} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--accent-blue)' }}>Especificações Técnicas</label>
            <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows="4" />
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '15px', borderRadius: '4px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>Visual do Implante (Azure Blob)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <img src={imagemUrlAtual} alt="Atual" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Substituir ficheiro?
                </p>
                <input type="file" onChange={e => setNovaImagem(e.target.files[0])} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button type="submit" style={{ flex: 2 }}>GRAVAR ALTERAÇÕES</button>
            <button 
              type="button" 
              className="btn-secondary" 
              style={{ flex: 1, color: '#ff4d4d' }}
              onClick={() => navigate('/admin')}
            >
              CANCELAR
            </button>
          </div>

        </div>
      </form>
    </div>
  );
};

export default EditarProduto;
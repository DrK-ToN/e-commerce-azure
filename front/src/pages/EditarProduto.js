import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const EditarProduto = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados para os campos
  const [nome, setNome] = useState('');
  const [marca, setMarca] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [estoque, setEstoque] = useState('');
  const [imagemUrlAtual, setImagemUrlAtual] = useState('');
  const [novaImagem, setNovaImagem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);

  // 1. Carrega os dados se for edição
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    api.get(`/produtos/${id}`)
      .then(res => {
        const p = res.data;
        setNome(p.nome || '');
        setMarca(p.marca || '');
        setPreco(p.preco || '');
        setDescricao(p.descricao || '');
        setCategoria(p.categoria || '');
        setEstoque(p.estoque || 0);
        setImagemUrlAtual(p.imagem_url || '');
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar produto:", err);
        alert("Erro ao carregar dados do implante ou ID inexistente.");
        navigate('/admin/produtos');
      });
  }, [id, navigate]);

  // 2. Lógica de Salvar (Create ou Update)
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
formData.append('nome', nome || '');
formData.append('marca', marca || ''); // ESSENCIAL: Campo NOT NULL no banco
formData.append('preco', preco || 0);
formData.append('descricao', descricao || '');
formData.append('categoria', categoria || 'Geral');
formData.append('estoque', estoque || 0);

if (novaImagem) {
    // 'imagem' é o nome que o Multer vai procurar no backend
    formData.append('imagem', novaImagem);
} else {
    // 'imagem_url' para bater com o nome da coluna no banco
    formData.append('imagem_url', imagemUrlAtual || ''); 
}

    try {
      if (id) {
        // Modo Edição
        await api.put(`/produtos/${id}`, formData);
      } else {
        // Modo Criação
        await api.post(`/produtos`, formData);
      }
      
      alert('Sistemas sincronizados com sucesso!');
      navigate('/admin/produtos'); 
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert('Falha crítica na comunicação com o banco.');
    }
  };

  if (loading) return <div className="container"><h3>A aceder ao terminal...</h3></div>;

  return (
    <div className="container" style={{ maxWidth: '700px', marginTop: '50px' }}>
      <h2 className="footer-title">
        {id ? `CONFIGURAR IMPLANTE #${id}` : 'CADASTRAR NOVO IMPLANTE'}
      </h2>
      
      <form onSubmit={handleUpdate} className="section-highlight" style={{ padding: '30px', borderRadius: '8px' }}>
        <div style={{ display: 'grid', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--accent-blue)' }}>Designação do Item</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
          </div>

          <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--accent-blue)' }}>Classe</label>
              <input type="text" value={marca} onChange={e => setMarca(e.target.value)} />
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
              <img 
                src={preview || imagemUrlAtual || 'https://placehold.co/100'} 
                alt="Preview" 
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--accent-blue)' }} 
              />
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Substituir ficheiro?
                </p>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      setNovaImagem(file);
                      setPreview(URL.createObjectURL(file));
                    }
                  }} 
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button type="submit" style={{ flex: 2 }}>
              {id ? 'GRAVAR ALTERAÇÕES' : 'CADASTRAR ITEM'}
            </button>
            <button 
              type="button" 
              className="btn-secondary" 
              style={{ flex: 1, color: '#ff4d4d' }}
              onClick={() => navigate('/admin/produtos')}
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
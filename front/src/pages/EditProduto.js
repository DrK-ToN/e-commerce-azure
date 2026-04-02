import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/EditForm.css';

const EditProduto = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    // Se não houver ID na URL, é um cadastro novo. Não busca dados.
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nome', nome || '');
    formData.append('marca', marca || ''); // <--- ESSENCIAL: Campo NOT NULL no seu SQL
    formData.append('preco', preco || 0);
    formData.append('descricao', descricao || '');
    formData.append('categoria', categoria || 'Geral');
    formData.append('estoque', estoque || 0);
    
    if (novaImagem) {
      formData.append('imagem', novaImagem);
    } else {
      formData.append('imagemUrl', imagemUrlAtual);
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
    <div className="edit-container">
      <h2 className="footer-title">
        {id ? `CONFIGURAR IMPLANTE #${id}` : 'CADASTRAR NOVO IMPLANTE'}
      </h2>
      <form onSubmit={handleUpdate} className="section-highlight edit-form">
        <div className="input-group">
          <label>Designação do Item</label>
          <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
        </div>
        <div className="input-group">
            <label>Classe</label>
            <input type="text" value={marca} onChange={e => setMarca(e.target.value)} />
          </div>
        <div className="grid-3-col">
          <div className="input-group">
            <label>Preço (C$)</label>
            <input type="number" value={preco} onChange={e => setPreco(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Estoque</label>
            <input type="number" value={estoque} onChange={e => setEstoque(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Classe</label>
            <input type="text" value={categoria} onChange={e => setCategoria(e.target.value)} />
          </div>
        </div>

        <div className="input-group">
          <label>Especificações Técnicas</label>
          <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows="4" />
        </div>

        <div className="image-preview-container">
          <img src={preview || imagemUrlAtual || 'https://placehold.co/150'} alt="Preview" className="preview-img" />
          <div className="input-group">
            <label>Substituir Visual?</label>
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

        <div className="form-actions">
          <button type="submit" className="btn-save">
            {id ? 'GRAVAR ALTERAÇÕES' : 'CADASTRAR ITEM'}
          </button>
          <button type="button" className="btn-secondary btn-cancel" onClick={() => navigate('/admin/produtos')}>CANCELAR</button>
        </div>
      </form>
    </div>
  );
};

export default EditProduto;
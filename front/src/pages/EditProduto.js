import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/EditForm.css';

const EditProduto = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [estoque, setEstoque] = useState('');
  const [imagemUrlAtual, setImagemUrlAtual] = useState('');
  const [novaImagem, setNovaImagem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/produtos/${id}`)
      .then(res => {
        const p = res.data;
        setNome(p.nome || '');
        setPreco(p.preco || '');
        setDescricao(p.descricao || '');
        setCategoria(p.categoria || '');
        setEstoque(p.estoque || 0);
        setImagemUrlAtual(p.imagem_url || '');
        setLoading(false);
      })
      .catch(() => navigate('/admin'));
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('preco', preco);
    formData.append('descricao', descricao);
    formData.append('categoria', categoria);
    formData.append('estoque', estoque);
    
    if (novaImagem) formData.append('imagem', novaImagem);
    else formData.append('imagemUrl', imagemUrlAtual);

    try {
      await api.put(`/produtos/${id}`, formData);
      alert('Sistemas atualizados!');
      navigate('/admin');
    } catch (err) {
      alert('Erro na atualização.');
    }
  };

  if (loading) return <div className="container"><h3>A aceder ao terminal...</h3></div>;

  return (
    <div className="edit-container">
      <h2 className="footer-title">CONFIGURAR IMPLANTE #{id}</h2>
      <form onSubmit={handleUpdate} className="section-highlight edit-form">
        <div className="input-group">
          <label>Designação do Item</label>
          <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
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
          <img src={imagemUrlAtual} alt="Atual" className="preview-img" />
          <div className="input-group">
            <label>Substituir Visual?</label>
            <input type="file" onChange={e => setNovaImagem(e.target.files[0])} />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save">GRAVAR ALTERAÇÕES</button>
          <button type="button" className="btn-secondary btn-cancel" onClick={() => navigate('/admin')}>CANCELAR</button>
        </div>
      </form>
    </div>
  );
};

export default EditProduto;
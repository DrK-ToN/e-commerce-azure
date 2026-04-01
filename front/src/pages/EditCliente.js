import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/EditForm.css';

const EditCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [fotoUrlAtual, setFotoUrlAtual] = useState('');
  const [novaFoto, setNovaFoto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/clientes/${id}`)
      .then(res => {
        const c = res.data;
        setNome(c.nome || '');
        setEmail(c.email || '');
        setTelefone(c.telefone || '');
        setEndereco(c.endereco || '');
        setFotoUrlAtual(c.foto_url || '');
        setLoading(false);
      });
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('email', email);
    formData.append('telefone', telefone);
    formData.append('endereco', endereco);
    
    if (novaFoto) formData.append('foto', novaFoto);
    else formData.append('fotoUrl', fotoUrlAtual);

    try {
      await api.put(`/clientes/${id}`, formData);
      alert('Perfil do cidadão atualizado!');
      navigate('/admin/clientes');
    } catch (err) {
      alert('Erro ao atualizar banco de dados.');
    }
  };

  if (loading) return <div className="container"><h3>Scanner de rede ativo...</h3></div>;

  return (
    <div className="edit-container">
      <h2 className="footer-title">EDITAR PERFIL: {nome}</h2>
      <form onSubmit={handleUpdate} className="section-highlight edit-form">
        <div className="input-group">
          <label>Nome Completo</label>
          <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
        </div>
        
        <div className="input-group">
          <label>Email de Contacto</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>

        <div className="input-group">
          <label>Telefone</label>
          <input type="text" value={telefone} onChange={e => setTelefone(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Endereço / Localização</label>
          <textarea value={endereco} onChange={e => setEndereco(e.target.value)} rows="2" />
        </div>

        <div className="image-preview-container">
          <img src={fotoUrlAtual} alt="Avatar" className="preview-img" />
          <div className="input-group">
            <label>Alterar Foto de Perfil</label>
            <input type="file" onChange={e => setNovaFoto(e.target.files[0])} />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save">ATUALIZAR REGISTRO</button>
          <button type="button" className="btn-secondary btn-cancel" onClick={() => navigate('/admin/clientes')}>VOLTAR</button>
        </div>
      </form>
    </div>
  );
};

export default EditCliente;
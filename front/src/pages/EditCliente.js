import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/EditForm.css';

const EditCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados dos campos
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cep, setCep] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [fotoUrlAtual, setFotoUrlAtual] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get(`/clientes/${id}`)
      .then(res => {
        const c = res.data;
        setNome(c.nome || '');
        setEmail(c.email || '');
        setTelefone(c.telefone || '');
        setEndereco(c.endereco || '');
        setCep(c.cep || '');
        setBairro(c.bairro || '');
        setCidade(c.cidade || '');
        setUf(c.uf || '');
        setFotoUrlAtual(c.foto_url || '');
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar cliente:", err);
        setLoading(false);
      });
  }, [id]);

  // Função para upload de foto separado (seguindo a lógica do HUD)
  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('foto', file);

    setUploading(true);
    try {
      const res = await api.post(`/clientes/${id}/upload-foto`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFotoUrlAtual(res.data.foto_url);
      alert("Foto atualizada no Azure!");
    } catch (err) {
      alert("Erro ao subir imagem.");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Criamos o objeto JSON puro para enviar ao backend
    const dadosAtualizados = {
      nome,
      email,
      telefone,
      endereco,
      cep,
      bairro,
      cidade,
      uf,
      foto_url: fotoUrlAtual
    };

    try {
      // Enviando como JSON (o Axios faz isso automaticamente ao passar o objeto)
      await api.put(`/clientes/${id}`, dadosAtualizados);
      alert('SINCRO: Perfil do cidadão atualizado no banco central!');
      navigate('/admin/clientes');
    } catch (err) {
      console.error(err);
      alert('ERRO: Verifique se o servidor está online ou se as colunas existem no MySQL.');
    }
  };

  if (loading) return <div className="container"><h3>Scanner de rede ativo...</h3></div>;

  return (
    <div className="edit-container">
      <h2 className="footer-title">EDITAR PERFIL: {nome}</h2>
      
      <form onSubmit={handleUpdate} className="section-highlight edit-form">
        
        {/* Seção de Foto */}
        <div className="image-preview-container" style={{ marginBottom: '20px', textAlign: 'center' }}>
          <img 
            src={fotoUrlAtual || 'https://placehold.co/150'} 
            alt="Avatar" 
            className="preview-img" 
            style={{ width: '120px', height: '120px', borderRadius: '50%', border: '2px solid #ff9d00', objectFit: 'cover' }}
          />
          <div className="input-group">
            <label>{uploading ? 'ENVIANDO AO AZURE...' : 'Alterar Foto de Perfil'}</label>
            <input type="file" onChange={handleFotoChange} disabled={uploading} />
          </div>
        </div>

        <div className="input-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
            <label>CEP</label>
            <input type="text" value={cep} onChange={e => setCep(e.target.value)} />
          </div>

          <div className="input-group">
            <label>Bairro</label>
            <input type="text" value={bairro} onChange={e => setBairro(e.target.value)} />
          </div>

          <div className="input-group">
            <label>Cidade</label>
            <input type="text" value={cidade} onChange={e => setCidade(e.target.value)} />
          </div>

          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label>UF</label>
            <input type="text" value={uf} onChange={e => setUf(e.target.value)} maxLength="2" style={{ width: '60px' }} />
          </div>

          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label>Endereço / Localização</label>
            <textarea value={endereco} onChange={e => setEndereco(e.target.value)} rows="2" />
          </div>
        </div>

        <div className="form-actions" style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn-save" style={{ flex: 2 }}>GRAVAR ALTERAÇÕES</button>
          <button type="button" className="btn-secondary btn-cancel" onClick={() => navigate('/admin/clientes')} style={{ flex: 1 }}>VOLTAR</button>
        </div>
      </form>
    </div>
  );
};

export default EditCliente;
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Perfil = () => {
  const clienteId = 1; // Simulação de usuário logado
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [fotoUrl, setFotoUrl] = useState(''); // Estado para a URL da foto atual
  const [novaFoto, setNovaFoto] = useState(null);

  // 1. Carrega os dados atuais do banco ao montar o componente
  useEffect(() => {
    api.get(`/clientes/${clienteId}`)
      .then(res => {
        if (res.data) {
          setNome(res.data.nome || '');
          setEmail(res.data.email || '');
          setTelefone(res.data.telefone || '');
          setEndereco(res.data.endereco || '');
          setFotoUrl(res.data.foto_url || ''); // Note o padrão snake_case do seu banco
        }
      })
      .catch(err => console.error("Erro ao carregar perfil:", err));
  }, [clienteId]);

  // 2. Função unificada para atualizar os dados
  const handleAtualizar = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('email', email);
    formData.append('telefone', telefone);
    formData.append('endereco', endereco);

    // Lógica da Foto:
    if (novaFoto) {
      // Se selecionou um arquivo novo, envia como 'foto' (para o multer no backend)
      formData.append('foto', novaFoto);
    } else {
      // Se não mudou a foto, envia a URL atual como string para não perder o dado
      formData.append('foto_url', fotoUrl); 
    }

    try {
      const res = await api.put(`/clientes/${clienteId}`, formData);
      
      // CORREÇÃO AQUI: res.data contém a resposta do seu backend
      if (res.data && res.data.fotoUrl) {
        setFotoUrl(res.data.fotoUrl); // Atualiza a imagem na tela com a nova URL da Azure
      }
      
      alert('Upgrade de perfil concluído com sucesso!');
      setNovaFoto(null); // Limpa o campo de seleção de arquivo
    } catch (err) {
      console.error("Erro detalhado:", err);
      alert('Falha na sincronização do perfil. Verifique o console.');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h2 className="footer-title">Identidade Cibernética</h2>
      
      <div className="section-highlight" style={{ textAlign: 'center', borderRadius: '15px', padding: '30px' }}>
        
        {/* Visualização da Foto */}
        <div style={{ marginBottom: '20px' }}>
          <img 
            src={fotoUrl || 'https://via.placeholder.com/150'} 
            alt="Perfil" 
            style={{ 
              width: '150px', 
              height: '150px', 
              borderRadius: '50%', 
              border: '3px solid var(--accent-blue)', 
              objectFit: 'cover' 
            }} 
          />
        </div>

        <form onSubmit={handleAtualizar} style={{ display: 'grid', gap: '15px', textAlign: 'left' }}>
          <div className="form-group">
            <label>Nome Completo</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
          </div>
          
          <div className="form-group">
            <label>E-mail de Contato</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Telefone</label>
            <input type="text" value={telefone} onChange={e => setTelefone(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Endereço</label>
            <input type="text" value={endereco} onChange={e => setEndereco(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Nova Foto de Perfil (Opcional)</label>
            <input 
              type="file" 
              onChange={e => setNovaFoto(e.target.files[0])} 
              accept="image/*"
            />
          </div>

          <button type="submit" style={{ marginTop: '10px' }}>
            SALVAR ALTERAÇÕES
          </button>
        </form>
      </div>
    </div>
  );
};

export default Perfil;
import React, { useState, useEffect, useContext, useRef } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import '../styles/Perfil.css';

function Perfil() {
    const { user } = useContext(AuthContext);
    const fileInputRef = useRef(null);
    
    // 1. Iniciamos sempre com strings vazias para evitar o erro de "controlled/uncontrolled"
    const [perfil, setPerfil] = useState({ 
        nome: '', email: '', telefone: '', endereco: '', foto_url: '',
        cep: '', bairro: '', cidade: '', uf: ''
    });
    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (user && user.id) {
            api.get(`/clientes/${user.id}`)
                .then(response => {
                    const d = response.data;
                    // 2. Fallback para cada campo vindo do banco (evita null nos inputs)
                    setPerfil({
                        nome: d.nome || '',
                        email: d.email || '',
                        telefone: d.telefone || '',
                        endereco: d.endereco || '',
                        foto_url: d.foto_url || '',
                        cep: d.cep || '',
                        bairro: d.bairro || '',
                        cidade: d.cidade || '',
                        uf: d.uf || ''
                    });
                })
                .catch(error => console.error("Erro ao carregar perfil:", error));
        }
    }, [user]);

    const handleAvatarClick = () => {
        const confirmar = window.confirm("Deseja alterar sua foto de perfil?");
        if (confirmar) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('foto', file);
        
        setUploading(true);
        try {
            const response = await api.post(`/clientes/${user.id}/upload-foto`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setPerfil(prev => ({ ...prev, foto_url: response.data.foto_url }));
            setMensagem({ texto: 'Bio-assinatura visual atualizada!', tipo: 'sucesso' });
        } catch (error) {
            setMensagem({ texto: 'Erro no upload para o container Azure.', tipo: 'erro' });
        } finally {
            setUploading(false);
        }
    };

    const handleAtualizar = async (e) => {
        e.preventDefault();
        try {
            // 3. Enviamos o objeto perfil completo para bater com a rota PUT do server
            await api.put(`/clientes/${user.id}`, perfil);
            setMensagem({ texto: 'Registros sincronizados com sucesso!', tipo: 'sucesso' });
        } catch (error) {
            console.error(error);
            setMensagem({ texto: 'Falha na gravação dos dados (Erro 500).', tipo: 'erro' });
        }
    };

    return (
        <div className="perfil-container">
            <div className="perfil-card">
                <div className="perfil-header">
                    <div className="avatar-section" onClick={handleAvatarClick}>
                        <div className={`avatar-wrapper ${uploading ? 'scanning' : ''}`}>
                            <img 
                                src={perfil.foto_url || 'https://via.placeholder.com/150'} 
                                alt="Avatar" 
                            />
                            <div className="avatar-overlay">ALTERAR</div>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            style={{ display: 'none' }} 
                            accept="image/*"
                        />
                    </div>
                    <h2 className="cyber-id">USER_ID: {user?.nome?.toUpperCase()}</h2>
                </div>

                {mensagem.texto && <div className={`alert ${mensagem.tipo}`}>{mensagem.texto}</div>}

                <form onSubmit={handleAtualizar} className="perfil-form-stacked">
                    <div className="form-item">
                        <label>NOME COMPLETO</label>
                        <input 
                            type="text" 
                            value={perfil.nome || ''} 
                            onChange={e => setPerfil({...perfil, nome: e.target.value})} 
                        />
                    </div>

                    <div className="form-item">
                        <label>E-MAIL</label>
                        <input type="email" value={perfil.email || ''} disabled />
                    </div>

                    <div className="form-item">
                        <label>TELEFONE</label>
                        <input 
                            type="text" 
                            value={perfil.telefone || ''} 
                            onChange={e => setPerfil({...perfil, telefone: e.target.value})} 
                        />
                    </div>

                    {/* Campos de endereço unificados com o HUD */}
                    <div className="form-item">
                        <label>CEP</label>
                        <input 
                            type="text" 
                            value={perfil.cep || ''} 
                            onChange={e => setPerfil({...perfil, cep: e.target.value})} 
                        />
                    </div>

                    <div className="form-item">
                        <label>LOGRADOURO</label>
                        <textarea 
                            value={perfil.endereco || ''} 
                            onChange={e => setPerfil({...perfil, endereco: e.target.value})} 
                            rows="2" 
                        />
                    </div>

                    <button type="submit" className="btn-save">SALVAR ALTERAÇÕES</button>
                </form>
            </div>
        </div>
    );
}

export default Perfil;
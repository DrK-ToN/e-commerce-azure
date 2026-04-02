import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api'; // Ajuste o caminho do seu axios

function Cadastro() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    
    const navigate = useNavigate();

    const handleCadastro = async (e) => {
        e.preventDefault();
        setErro('');

        try {
            await api.post('/cadastro', { nome, email, senha });
            alert('Conta criada com sucesso! Faça seu login.');
            navigate('/login'); // Manda o usuário para a tela de entrar
        } catch (err) {
            // Pega a mensagem de erro que o nosso backend mandou (ex: "E-mail já em uso")
            setErro(err.response?.data?.message || 'Erro ao criar conta. Tente novamente.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h2>Criar Conta</h2>
            
            {erro && <p style={{ color: 'red', fontWeight: 'bold' }}>{erro}</p>}
            
            <form onSubmit={handleCadastro} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Seu Nome" 
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    style={{ padding: '10px', fontSize: '16px' }}
                />
                <input 
                    type="email" 
                    placeholder="Seu E-mail" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '10px', fontSize: '16px' }}
                />
                <input 
                    type="password" 
                    placeholder="Sua Senha" 
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    style={{ padding: '10px', fontSize: '16px' }}
                />
                <button type="submit" style={{ padding: '12px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#28a745', color: '#FFF', border: 'none', borderRadius: '4px' }}>
                    Cadastrar
                </button>
            </form>
            
            <p style={{ marginTop: '20px' }}>
                Já tem uma conta? <Link to="/login">Entre aqui</Link>
            </p>
        </div>
    );
}

export default Cadastro;
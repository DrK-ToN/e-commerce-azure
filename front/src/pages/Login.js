import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Ajuste o caminho se necessário

function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    
    // Puxamos a função de login lá do nosso Cérebro (Contexto)
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); // Evita que a página recarregue ao enviar o form
        setErro('');

        try {
            // Chama a função e espera a resposta do backend
            const user = await login(email, senha);
            
            // 🚦 O GUARDA DE TRÂNSITO EM AÇÃO 🚦
            if (user.role === 'admin') {
                navigate('/admin'); // Se for admin, joga pro painel
            } else {
                navigate('/'); // Se for cliente, joga pra loja (Home)
            }
            
        } catch (err) {
            setErro('E-mail ou senha incorretos.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h2>Entrar no Sistema</h2>
            
            {/* Se der erro, mostra a mensagem em vermelho */}
            {erro && <p style={{ color: 'red', fontWeight: 'bold' }}>{erro}</p>}
            
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
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
                <button type="submit" style={{ padding: '12px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#007BFF', color: '#FFF', border: 'none', borderRadius: '4px' }}>
                    Entrar
                </button>
            </form>
            
            <p style={{ marginTop: '20px' }}>
                Ainda não tem conta? <a href="/cadastro">Cadastre-se</a>
            </p>
        </div>
    );
}

export default Login;
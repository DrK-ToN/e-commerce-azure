import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api'; // Seu arquivo de conexão do Axios

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Esse useEffect roda toda vez que o usuário abre o site
    useEffect(() => {
        // Ele vai no "cache" do navegador ver se o usuário já tinha logado antes
        const loggedUser = localStorage.getItem('@Ecom:user');
        
        if (loggedUser) {
            setUser(JSON.parse(loggedUser)); // Devolve a memória pro site
        }
        setLoading(false);
    }, []);

    // Função que a Tela de Login vai chamar
    const login = async (email, senha) => {
        try {
            const response = await api.post('/login', { email, senha });
            const userData = response.data.user;

            setUser(userData); // Salva na memória do React
            localStorage.setItem('@Ecom:user', JSON.stringify(userData)); // Salva no cache do navegador

            return userData; // Retorna os dados para a tela saber pra onde redirecionar
        } catch (error) {
            console.error("Erro no login", error);
            throw error; // Joga o erro pra frente pra tela exibir "Senha incorreta"
        }
    };

    // Função para o botão "Sair"
    const logout = () => {
        setUser(null);
        localStorage.removeItem('@Ecom:user');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
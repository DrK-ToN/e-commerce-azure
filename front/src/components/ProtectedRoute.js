import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useContext(AuthContext);

    // Espera o React carregar a memória antes de tomar uma decisão
    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Carregando sistema...</div>;
    }

    // Se não estiver logado, chuta pra tela de login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Se a rota exige um cargo específico (ex: admin) e o usuário não tem, chuta pra Home
    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    // Se passou por todas as barreiras, libera a página!
    return children;
};

export default ProtectedRoute;
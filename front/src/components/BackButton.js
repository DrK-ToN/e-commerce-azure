import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Não aparece na Home
  if (location.pathname === '/') {
    return null;
  }

  return (
    <div className="back-button-wrapper">
      <button 
        onClick={() => navigate(-1)} 
        className="btn-back-cyber"
      >
        <span className="arrow"></span> VOLTAR
      </button>
    </div>
  );
};

export default BackButton;
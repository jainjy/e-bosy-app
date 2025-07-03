import React from 'react';
import { FaCircle } from 'react-icons/fa';

const ConnectionStatus = ({ status }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return { color: 'green', text: 'Connecté' };
      case 'connecting':
        return { color: 'orange', text: 'Connexion...' };
      case 'disconnected':
        return { color: 'red', text: 'Déconnecté' };
      default:
        return { color: 'gray', text: 'Inconnu' };
    }
  };

  const { color, text } = getStatusInfo();

  return (
    <div className="connection-status">
      <FaCircle color={color} className="status-icon" />
      <span className="status-text">{text}</span>
    </div>
  );
};

export default ConnectionStatus;
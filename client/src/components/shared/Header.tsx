import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="header-title" onClick={() => navigate('/')}>
            Soul Winning
          </h1>
        </div>
        <div className="header-right">
          <span className="user-info">Hello, {user?.username}</span>
          <button
            className="logout-btn"
            onClick={handleLogout}
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
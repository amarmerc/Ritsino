import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

export default function Navbar({ currentPage, onPageChange }) {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const pages = [
    { id: 'game', label: '🎰 Jugar' },
    { id: 'rankings', label: '🏆 Rankings' },
    { id: 'profile', label: '👤 Perfil' },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand" onClick={() => onPageChange('game')}>
            🎰 RITSINO
          </div>

          <div className="navbar-center">
            {pages.map(page => (
              <button
                key={page.id}
                className={`nav-tab ${currentPage === page.id ? 'active' : ''}`}
                onClick={() => onPageChange(page.id)}
              >
                {page.label}
              </button>
            ))}
          </div>

          <div className="navbar-right">
            <div className="navbar-points">
              💰 {user?.points?.toLocaleString('es-ES') || 0}
            </div>
            <div className="navbar-user">
              <span>{user?.username}</span>
              <span className="navbar-university">
                {user?.university?.acronym}
              </span>
            </div>
            <button className="theme-toggle" onClick={toggleTheme} style={{ background: 'transparent', fontSize: '1.2rem', marginRight: '8px', cursor: 'pointer' }} title="Cambiar tema">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className="navbar-logout" onClick={logout}>
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile navigation */}
      <div className="mobile-nav">
        {pages.map(page => (
          <button
            key={page.id}
            className={`nav-tab ${currentPage === page.id ? 'active' : ''}`}
            onClick={() => onPageChange(page.id)}
          >
            {page.label}
          </button>
        ))}
      </div>
    </>
  );
}

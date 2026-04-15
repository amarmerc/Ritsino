import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Navbar from './components/Layout/Navbar';
import SlotMachine from './components/SlotMachine/SlotMachine';
import Rankings from './components/Rankings/Rankings';
import Profile from './components/Profile/Profile';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [currentPage, setCurrentPage] = useState('game');

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">🎰</div>
        <h1 className="neon-text">RITSINO</h1>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    if (authMode === 'login') {
      return <Login onSwitch={() => setAuthMode('register')} />;
    }
    return <Register onSwitch={() => setAuthMode('login')} />;
  }

  return (
    <>
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="page-content">
        <div className="page-content-inner">
          {currentPage === 'game' && <SlotMachine />}
          {currentPage === 'rankings' && <Rankings />}
          {currentPage === 'profile' && <Profile />}
        </div>
      </main>
      <footer style={{ textAlign: 'center', padding: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        © <a href="https://amarmer.es/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 'bold' }}>amarmer</a>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

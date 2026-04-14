import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import './Profile.css';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="rankings-loading">Cargando perfil...</div>;
  if (!profile) return <div className="rankings-empty">Error cargando perfil</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">👤</div>
        <h2>{profile.username}</h2>
        <span className="badge badge-purple">{profile.university.acronym}</span>
      </div>

      <div className="profile-card">
        <h3>📊 Estadísticas</h3>
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat-value">
              {profile.points.toLocaleString('es-ES')}
            </span>
            <span className="profile-stat-label">Puntos</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value" style={{ color: 'var(--accent-purple)' }}>
              #{profile.universityRank}
            </span>
            <span className="profile-stat-label">Rank en {profile.university.acronym}</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value" style={{ color: 'var(--accent-cyan)' }}>
              {profile.totalSpins.toLocaleString('es-ES')}
            </span>
            <span className="profile-stat-label">Tiradas</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value" style={{ color: 'var(--accent-green)' }}>
              {profile.totalWon.toLocaleString('es-ES')}
            </span>
            <span className="profile-stat-label">Total Ganado</span>
          </div>
        </div>
      </div>

      <div className="profile-card">
        <h3>🕐 Últimas Partidas</h3>
        {profile.recentHistory.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
            Aún no has jugado ninguna partida
          </p>
        ) : (
          profile.recentHistory.map((game, i) => (
            <div key={i} className="profile-history-item">
              <div>
                <span className="history-bet">Apuesta: {game.bet_amount}</span>
                <span className="history-date" style={{ marginLeft: '8px' }}>
                  {new Date(game.created_at).toLocaleString('es-ES')}
                </span>
              </div>
              <span className={`history-win ${game.win_amount > 0 ? 'positive' : 'negative'}`}>
                {game.win_amount > 0 ? `+${game.win_amount}` : `-${game.bet_amount}`}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="profile-card">
        <h3>ℹ️ Información</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <div><strong>Email:</strong> {profile.email}</div>
          <div><strong>Universidad:</strong> {profile.university.fullName}</div>
          <div><strong>Registrado:</strong> {new Date(profile.createdAt).toLocaleDateString('es-ES')}</div>
        </div>
      </div>
    </div>
  );
}

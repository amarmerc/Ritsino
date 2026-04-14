import { useState, useEffect } from 'react';
import { rankingsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function UniversityRanking() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rankingsAPI.myUniversity()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="rankings-loading">Cargando rankings...</div>;
  if (!data || !data.rankings.length) return <div className="rankings-empty">No hay jugadores en tu universidad aún</div>;

  return (
    <div>
      {data.university && (
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span className="my-rank-badge">
            📍 Tu posición en {data.university.acronym}: #{data.myRank}
          </span>
        </div>
      )}
      <div className="rankings-table-container">
        <table className="rankings-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Jugador</th>
              <th>Puntos</th>
              <th>Tiradas</th>
              <th>Ganado</th>
            </tr>
          </thead>
          <tbody>
            {data.rankings.map(row => (
              <tr key={row.user_id} className={row.user_id === user?.id ? 'is-me' : ''}>
                <td className={`rank-cell rank-${row.rank}`}>
                  {MEDALS[row.rank] ? <span className="rank-medal">{MEDALS[row.rank]}</span> : row.rank}
                </td>
                <td>{row.username}</td>
                <td className="points-cell">{Number(row.points).toLocaleString('es-ES')}</td>
                <td className="members-cell">{Number(row.total_spins).toLocaleString('es-ES')}</td>
                <td className="members-cell">{Number(row.total_won).toLocaleString('es-ES')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

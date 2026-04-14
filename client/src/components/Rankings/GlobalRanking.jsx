import { useState, useEffect } from 'react';
import { rankingsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function GlobalRanking() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rankingsAPI.global()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="rankings-loading">Cargando rankings...</div>;
  if (!data || !data.rankings.length) return <div className="rankings-empty">No hay jugadores aún</div>;

  return (
    <div className="rankings-table-container">
      <table className="rankings-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Jugador</th>
            <th>Universidad</th>
            <th>Puntos</th>
            <th>Tiradas</th>
          </tr>
        </thead>
        <tbody>
          {data.rankings.map(row => (
            <tr key={row.user_id} className={row.user_id === user?.id ? 'is-me' : ''}>
              <td className={`rank-cell rank-${row.rank}`}>
                {MEDALS[row.rank] ? <span className="rank-medal">{MEDALS[row.rank]}</span> : row.rank}
              </td>
              <td>{row.username}</td>
              <td><span className="university-cell">{row.university_acronym}</span></td>
              <td className="points-cell">{Number(row.points).toLocaleString('es-ES')}</td>
              <td className="members-cell">{Number(row.total_spins).toLocaleString('es-ES')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

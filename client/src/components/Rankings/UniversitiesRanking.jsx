import { useState, useEffect } from 'react';
import { rankingsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function UniversitiesRanking() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rankingsAPI.universities()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="rankings-loading">Cargando rankings...</div>;
  if (!data || !data.rankings.length) return <div className="rankings-empty">No hay universidades con jugadores aún</div>;

  return (
    <div className="rankings-table-container">
      <table className="rankings-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Universidad</th>
            <th>Puntos Totales</th>
            <th>Miembros</th>
          </tr>
        </thead>
        <tbody>
          {data.rankings.map(row => {
            const isMyUniv = row.university_id === user?.university?.id;
            return (
              <tr key={row.university_id} className={isMyUniv ? 'is-me' : ''}>
                <td className={`rank-cell rank-${row.rank}`}>
                  {MEDALS[row.rank] ? <span className="rank-medal">{MEDALS[row.rank]}</span> : row.rank}
                </td>
                <td>
                  <span className="university-cell">{row.acronym}</span>
                  <span style={{ marginLeft: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {row.full_name}
                  </span>
                </td>
                <td className="points-cell">{Number(row.total_points).toLocaleString('es-ES')}</td>
                <td className="members-cell">{Number(row.member_count).toLocaleString('es-ES')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import './Auth.css';

export default function Register({ onSwitch }) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [universities, setUniversities] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authAPI.getUniversities()
      .then(setUniversities)
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!universityId) {
      setError('Selecciona tu universidad');
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password, parseInt(universityId));
    } catch (err) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <h1>🎰 RITSINO</h1>
          <p>Scatter de Casino Universitario</p>
        </div>
        <div className="auth-card">
          <h2 className="auth-title">Crear Cuenta</h2>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-username">Nombre de usuario</label>
              <input
                id="reg-username"
                className="input-field"
                type="text"
                placeholder="Tu nombre"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={2}
                maxLength={50}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                className="input-field"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Contraseña</label>
              <input
                id="reg-password"
                className="input-field"
                type="password"
                placeholder="Mínimo 4 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-university">Universidad</label>
              <select
                id="reg-university"
                className="select-field"
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                required
              >
                <option value="">Selecciona tu universidad</option>
                {universities.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.acronym} — {u.full_name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta (10.000 puntos 🎉)'}
            </button>
          </form>
          <div className="auth-switch">
            ¿Ya tienes cuenta?{' '}
            <button onClick={onSwitch}>Inicia sesión</button>
          </div>
        </div>
      </div>
    </div>
  );
}

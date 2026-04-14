// API base URL — in production, nginx proxies /api to the backend
const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('ritsino_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// Auth
export const authAPI = {
  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  me: () => request('/auth/me'),
  getUniversities: () => request('/auth/universities'),
};

// Game
export const gameAPI = {
  spin: (betAmount) => request('/game/spin', {
    method: 'POST',
    body: JSON.stringify({ betAmount }),
  }),
  getConfig: () => request('/game/config'),
};

// Rankings
export const rankingsAPI = {
  myUniversity: (limit) => request(`/rankings/my-university?limit=${limit || 50}`),
  university: (id, limit) => request(`/rankings/university/${id}?limit=${limit || 50}`),
  global: (limit) => request(`/rankings/global?limit=${limit || 50}`),
  universities: () => request('/rankings/universities'),
};

// User
export const userAPI = {
  getProfile: () => request('/user/profile'),
};

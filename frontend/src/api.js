// One shared base URL for every request (override with VITE_API_URL in .env)
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TOKEN_KEY = 'token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// Small wrapper: attaches the JWT, parses JSON and turns non-2xx responses into
// thrown errors, so callers can rely on .catch() for network and server failures.
async function request(path, options = {}) {
  const token = getToken();
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running on port 5000?');
  }

  const data = await res.json().catch(() => ({}));

  // Expired / invalid token on a protected route: drop it and let the app redirect to /login
  if (res.status === 401 && token) {
    clearToken();
    window.dispatchEvent(new Event('auth:logout'));
  }

  if (!res.ok) {
    const details = data.details ? ` (${Object.values(data.details).join(', ')})` : '';
    throw new Error((data.error || `Request failed with ${res.status}`) + details);
  }
  return data;
}

const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) });

// Auth
export const register = (credentials) => post('/auth/register', credentials);
export const login = (credentials) => post('/auth/login', credentials);
export const getMe = () => request('/auth/me');

// Tasks
export const getTasks = () => request('/tasks');
export const createTask = (task) => post('/tasks', task);
export const updateTask = (id, changes) =>
  request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(changes) });
export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' });

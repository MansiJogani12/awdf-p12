import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import * as api from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(api.getToken);
  const [user, setUser] = useState(null);

  // Load the current user from /auth/me whenever we have a token
  useEffect(() => {
    if (token) api.getMe().then(setUser).catch(() => {});
  }, [token]);

  // api.js fires this when any request comes back 401 (expired or tampered token)
  useEffect(() => {
    const onLogout = () => setTokenState(null);
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  const login = async (credentials) => {
    const { token, user } = await api.login(credentials);
    api.setToken(token);
    setUser(user);
    setTokenState(token);
  };

  const register = async (credentials) => {
    await api.register(credentials);
    await login(credentials);
  };

  // Logout is purely client-side: forgetting the token is enough for a stateless JWT
  const logout = () => {
    api.clearToken();
    setTokenState(null);
  };

  return (
    // Without a token there is no user, so derive it instead of resetting state in an effect
    <AuthContext.Provider value={{ token, user: token ? user : null, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// Wrap any route element that needs a logged-in user
export function ProtectedRoute({ children }) {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { token, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from || '/tasks';
  if (token) return <Navigate to={redirectTo} replace />;

  const isLogin = mode === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await (isLogin ? login : register)({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <section className="auth">
      <h1>{isLogin ? 'Welcome back' : 'Create account'}</h1>
      <p className="tagline">{isLogin ? 'Log in to see your tasks.' : 'Passwords are hashed with bcrypt.'}</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="field">
          Password
          <input
            type="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
          />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="solid" type="submit" disabled={submitting}>
          {submitting ? 'Please wait...' : isLogin ? 'Log in' : 'Create account'}
        </button>
      </form>

      <button
        className="link"
        onClick={() => {
          setMode(isLogin ? 'register' : 'login');
          setError(null);
        }}
      >
        {isLogin ? 'Need an account? Register' : 'Have an account? Log in'}
      </button>
    </section>
  );
}

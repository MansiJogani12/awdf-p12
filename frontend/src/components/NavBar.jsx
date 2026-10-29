import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

const links = [
  { to: '/', label: 'Home' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/contact', label: 'Contact' },
];

export default function NavBar({ theme, onToggleTheme }) {
  const { token, user, logout } = useAuth();

  return (
    <nav className="nav">
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            {/* NavLink (not <a>) navigates without a full page reload */}
            <NavLink to={link.to} end className={({ isActive }) => (isActive ? 'active' : '')}>
              {link.label}
            </NavLink>
          </li>
        ))}
        <li className="push">
          {token && user && <span className="muted user-email">{user.email}</span>}
        </li>
        <li>
          {token ? (
            <button className="ghost" onClick={logout}>
              Log out
            </button>
          ) : (
            <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')}>
              Log in
            </NavLink>
          )}
        </li>
        <li>
          <button className="ghost" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </li>
      </ul>
    </nav>
  );
}

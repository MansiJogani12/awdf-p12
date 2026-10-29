import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import Footer from './components/Footer.jsx';
import DelayedFallback from './components/DelayedFallback.jsx';
import Home from './pages/Home.jsx';
import { ProtectedRoute } from './auth.jsx';
import { profile } from './data.js';

// Route-based code splitting: each of these becomes its own chunk that is only
// downloaded when its route is first visited. Home stays in the main bundle
// because it is the landing page. (lazy() requires a default export.)
const Tasks = lazy(() => import('./pages/Tasks.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export default function App() {
  const [theme, setTheme] = useState('light');

  // Apply the theme as a class on the root <html> element.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <>
      <NavBar theme={theme} onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
      <main className="container">
        {/* Suspense wraps only the Routes block, so the NavBar and Footer stay on screen */}
        <Suspense fallback={<DelayedFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              }
            />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer name={profile.name} email={profile.email} />
    </>
  );
}

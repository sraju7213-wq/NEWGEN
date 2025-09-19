import { Outlet, useLocation, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { FiLogOut, FiPlus } from 'react-icons/fi';
import useAuthStore from './store/authStore';
import { useAuthInitializer } from './hooks/useAuthGuard';
import AnalyticsLoader from './components/AnalyticsLoader';

const AppLayout = () => {
  useAuthInitializer();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore((state) => ({
    user: state.user,
    clearAuth: state.clearAuth
  }));

  const isAuthRoute = useMemo(() => ['/login', '/register'].includes(location.pathname), [location.pathname]);

  return (
    <div className="app-container" style={{ minHeight: '100vh', padding: '1.5rem' }}>
      <AnalyticsLoader />
      <div className="glass-panel" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
        {!isAuthRoute && (
          <header className="flex-between" style={{ marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h1 className="hero-title">NewGen Prompt Intelligence</h1>
              <p className="hero-subtitle">
                Create, collaborate, and personalize AI prompts powered by Gemini. Manage your creative workflow with
                analytics, batch generation, and voice-driven ideation.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {user && (
                <>
                  <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span className="badge-small">Logged in</span>
                    <strong>{user.name || user.email}</strong>
                    <span className="muted" style={{ fontSize: '0.85rem' }}>{user.email}</span>
                  </div>
                  <button className="btn btn-secondary" onClick={clearAuth} type="button">
                    <FiLogOut />
                    <span style={{ marginLeft: '0.45rem' }}>Logout</span>
                  </button>
                </>
              )}
            </div>
          </header>
        )}
        {!isAuthRoute && (
          <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiPlus />
              Dashboard
            </Link>
          </nav>
        )}
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;

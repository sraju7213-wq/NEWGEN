import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { fetchProfile } from '../api/auth';

export const useAuthInitializer = () => {
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const initialized = useAuthStore((state) => state.initialized);
  const markInitialized = useAuthStore((state) => state.markInitialized);

  useEffect(() => {
    let active = true;
    async function init() {
      if (!token) {
        markInitialized();
        return;
      }
      try {
        const user = await fetchProfile();
        if (active) {
          setAuth(user, token);
        }
      } catch (error) {
        console.error('Auth init failed', error);
        clearAuth();
      } finally {
        if (active) {
          markInitialized();
        }
      }
    }
    if (!initialized) {
      init();
    }
    return () => {
      active = false;
    };
  }, [token, setAuth, clearAuth, initialized, markInitialized]);
};

export const useAuthGuard = () => {
  const navigate = useNavigate();
  const { user, token, initialized } = useAuthStore((state) => ({
    user: state.user,
    token: state.token,
    initialized: state.initialized
  }));

  useEffect(() => {
    if (!initialized) return;
    if (!token || !user) {
      navigate('/login');
    }
  }, [token, user, initialized, navigate]);

  return { user, token, initialized };
};

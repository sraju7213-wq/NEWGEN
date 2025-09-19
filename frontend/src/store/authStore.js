import { create } from 'zustand';

const storageKey = 'newgen-auth';

const loadState = () => {
  if (typeof window === 'undefined') return { token: null, user: null };
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return { token: null, user: null };
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to parse auth state', error);
    return { token: null, user: null };
  }
};

const saveState = (state) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey, JSON.stringify(state));
};

const useAuthStore = create((set, get) => ({
  user: loadState().user,
  token: loadState().token,
  initialized: false,
  setAuth: (user, token) => {
    saveState({ user, token });
    set({ user, token, initialized: true });
  },
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey);
    }
    set({ user: null, token: null, initialized: true });
  },
  markInitialized: () => set({ initialized: true }),
  getAuthHeader: () => {
    const { token } = get();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}));

export default useAuthStore;

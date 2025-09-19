import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { login } from '../api/auth';
import useAuthStore from '../store/authStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      navigate('/');
    },
    onError: (err) => {
      setError(err.response?.data?.message || err.message);
    }
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setError(null);
    mutation.mutate(form);
  };

  return (
    <div className="card" style={{ maxWidth: '420px', margin: '4rem auto' }}>
      <h2 className="section-title">Welcome back</h2>
      <p className="section-subtitle">Log in to manage your AI prompt workspace.</p>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label className="muted" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="muted" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        {error && <div className="alert">{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={mutation.isLoading}>
          {mutation.isLoading ? 'Signing in...' : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
        No account yet?{' '}
        <Link to="/register" style={{ color: 'var(--color-primary)' }}>
          Create one now
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;

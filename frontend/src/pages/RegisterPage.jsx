import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { register } from '../api/auth';
import useAuthStore from '../store/authStore';

const RegisterPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      navigate('/');
    },
    onError: (err) => setError(err.response?.data?.message || err.message)
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setError(null);
    mutation.mutate(form);
  };

  return (
    <div className="card" style={{ maxWidth: '460px', margin: '4rem auto' }}>
      <h2 className="section-title">Create your AI prompt studio</h2>
      <p className="section-subtitle">Set up your account to begin collaborating with Gemini.</p>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label className="muted" htmlFor="name">Name</label>
          <input
            id="name"
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="How should we call you?"
          />
        </div>
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
          {mutation.isLoading ? 'Creating...' : 'Create account'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
        Already registered?{' '}
        <Link to="/login" style={{ color: 'var(--color-primary)' }}>
          Log in here
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;

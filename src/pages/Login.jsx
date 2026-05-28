import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          <h1 className="auth-title">TaskFlow</h1>
          <p className="auth-subtitle">Sign in to your workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-7">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest px-1">Email Address</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest px-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-4 text-base mt-2 shadow-lg shadow-[var(--accent)]/30"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider">
          or
        </div>

        <p className="text-center text-[var(--text-secondary)] font-medium mt-6">
          Don't have an account? <Link to="/signup" className="auth-link ml-1">Create one</Link>
        </p>
      </div>
    </div>
  );
}

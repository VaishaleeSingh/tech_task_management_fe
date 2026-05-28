import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.role);
      toast.success('Account created! Welcome aboard.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join TaskFlow and start collaborating</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest px-1">Full Name</label>
            <input 
              type="text"
              placeholder="John Doe" 
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
              required minLength={2}
            />
          </div>
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
              placeholder="Min. 6 characters" 
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} 
              required minLength={6}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary w-full py-4 text-base mt-2 shadow-lg shadow-[var(--accent)]/30"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider">
          or
        </div>

        <p className="text-center text-[var(--text-secondary)] font-medium mt-6">
          Already have an account? <Link to="/login" className="auth-link ml-1">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

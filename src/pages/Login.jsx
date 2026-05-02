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
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#6366f1]/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#4f46e5]/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="auth-box">
        <div className="flex flex-col items-center mb-6 sm:mb-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-[#6366f1] to-[#4f46e5] rounded-2xl sm:rounded-3xl flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-indigo-500/30 mb-4 sm:mb-6 transform -rotate-6">
            ⚡
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2 text-center">TaskFlow</h1>
          <p className="text-sm sm:text-base text-slate-400 font-medium text-center">Sign in to your workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-7">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-widest px-1">Email Address</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
              className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-[#0f172a] border border-white/10 rounded-xl sm:rounded-2xl focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] text-white placeholder-slate-500 transition-all text-sm sm:text-base"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-widest px-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
              className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-[#0f172a] border border-white/10 rounded-xl sm:rounded-2xl focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] text-white placeholder-slate-500 transition-all text-sm sm:text-base"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 sm:py-4 bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:from-[#4f46e5] hover:to-[#4338ca] text-white font-extrabold text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-500/30 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-10 relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative bg-[#1e293b] px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
            or
          </div>
        </div>

        <p className="text-center text-base text-slate-400 mt-8 font-medium">
          Don't have an account? <Link to="/signup" className="text-[#6366f1] font-bold hover:text-indigo-400 transition-colors ml-1">Create one</Link>
        </p>
      </div>
    </div>
  );
}

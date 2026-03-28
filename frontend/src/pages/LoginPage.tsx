import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: 'Admin', email: 'admin@university.edu', password: 'admin123', color: 'purple' },
    { label: 'Teacher', email: 'teacher@university.edu', password: 'teacher123', color: 'blue' },
    { label: 'Student', email: 'priya.sharma@student.edu', password: 'student123', color: 'green' },
    { label: 'Counsellor', email: 'counsellor@university.edu', password: 'counsellor123', color: 'amber' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--chassis)]">
      
      <div className="w-full max-w-md animate-slide-up bg-[var(--chassis)]">
        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent)] flex items-center justify-center mb-4 shadow-[var(--shadow-float)]">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-sans font-bold text-[var(--surface-dark)] tracking-tight">Student Performance</h1>
          <h2 className="font-mono text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--accent)] mt-2">Prediction System</h2>
          <div className="flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-md border border-[var(--muted)]">
            <div className="led led-green shrink-0"></div>
            <span className="font-mono text-[9px] text-[var(--text-secondary)] tracking-[0.1em] uppercase">Auth Terminal Ready</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/20 text-red-500 text-xs font-mono tracking-wide animate-slide-up">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em]">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-60" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em]">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-60" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field pl-10 font-mono tracking-widest text-[#2d3436]"
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
              ) : (
                <>AUTHENTICATE <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 pt-6 border-t border-[var(--muted)]/50 text-center">
            <p className="font-mono text-[10px] text-[var(--text-secondary)] tracking-wider">
              No clearance?{' '}
              <button 
                onClick={() => navigate('/register')} 
                className="text-[var(--accent)] font-semibold hover:underline uppercase transition-all"
               >
                Request Access
              </button>
            </p>
          </div>

          {/* Demo Accounts */}
          <div className="mt-5 pt-5 border-t border-[var(--muted)]/50">
            <p className="text-[9px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-semibold mb-3 flex items-center gap-2 before:content-[''] before:flex-1 before:h-px before:bg-[var(--muted)] after:content-[''] after:flex-1 after:h-px after:bg-[var(--muted)]">Demo Override</p>
            <div className="grid grid-cols-2 gap-2.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.label}
                  onClick={(e) => { e.preventDefault(); setEmail(acc.email); setPassword(acc.password); }}
                  className="btn-ghost"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

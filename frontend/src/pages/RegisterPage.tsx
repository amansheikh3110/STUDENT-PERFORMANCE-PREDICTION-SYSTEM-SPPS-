import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, ArrowRight, AlertCircle, User, Briefcase } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, name, role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'student', label: 'Student', color: 'green' },
    { id: 'teacher', label: 'Teacher', color: 'blue' },
    { id: 'counsellor', label: 'Counsellor', color: 'amber' },
    { id: 'admin', label: 'Admin', color: 'purple' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--chassis)]">
      
      <div className="w-full max-w-md animate-slide-up bg-[var(--chassis)]">
        {/* Logo */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent)] flex items-center justify-center mb-3 shadow-[var(--shadow-float)]">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-sans font-bold text-[var(--surface-dark)] tracking-tight">Provision Access</h1>
          <h2 className="font-mono text-[10px] font-semibold tracking-[0.15em] uppercase text-[var(--accent)] mt-1.5">New User Registration</h2>
        </div>

        {/* Register Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/20 text-red-500 text-xs font-mono tracking-wide animate-slide-up">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em]">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-60" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em]">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-60" />
                <input
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="input-field pl-10 font-mono tracking-widest text-[#2d3436]"
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-[10px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] block mb-2">Clearance Level</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`btn-ghost flex items-center justify-center gap-2 transition-all ${
                      role === r.id 
                        ? 'text-[var(--accent)] shadow-[var(--shadow-recess)] bg-[var(--chassis)]' 
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    <Briefcase size={14} />
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-4 flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
              ) : (
                <>INITIALIZE PROFILE <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center pt-6 border-t border-[var(--muted)]/50">
            <p className="font-mono text-[10px] text-[var(--text-secondary)] tracking-wider">
              Existing credentials?{' '}
              <button 
                onClick={() => navigate('/login')} 
                className="text-[var(--accent)] font-semibold hover:underline uppercase transition-all"
               >
                Authenticate
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

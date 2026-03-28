import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentsAPI } from '../api/client';
import RiskBadge from '../components/RiskBadge';
import { Search, ArrowUpRight } from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
  }, [riskFilter]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (riskFilter) params.risk_level = riskFilter;
      if (search) params.search = search;
      const res = await studentsAPI.list(params);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadStudents();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1 className="text-2xl font-sans font-bold text-[var(--surface-dark)] tracking-tight">Active Roster Telemetry</h1>
          <p className="font-mono text-[10px] font-semibold tracking-[0.15em] uppercase text-[var(--text-secondary)] mt-1.5 flex items-center gap-2">
            <span className="led led-blue shrink-0"></span> {students.length} Subjects Acquired
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 card animate-slide-up">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-70" />
          <input
            id="student-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Query UID or Alias..."
            className="input-field pl-9 h-9 text-[11px]"
          />
        </form>
        <div className="flex flex-wrap gap-2">
          {['', 'high', 'medium', 'low'].map((level) => (
            <button
              key={level}
              onClick={() => setRiskFilter(level)}
              className={`btn-ghost h-9 px-4 flex items-center justify-center text-[10px] transition-all ${
                riskFilter === level
                  ? 'text-[var(--accent)] shadow-[var(--shadow-recess)] bg-[var(--chassis)]'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              {level ? level.charAt(0).toUpperCase() + level.slice(1) + ' Risk' : 'All Systems'}
            </button>
          ))}
        </div>
      </div>

      {/* Students Table */}
      <div className="card p-0 overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-10 w-full rounded bg-[var(--muted)]/20 animate-pulse" />)}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-[var(--shadow-recess)] m-4 mt-4">
            <table className="w-full text-left bg-[var(--chassis)] border-collapse">
              <thead className="bg-[#d5dce6] shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
                <tr>
                  <th className="px-4 py-2.5 text-[9px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] border-b border-[var(--muted)]">Target Alias</th>
                  <th className="px-4 py-2.5 text-[9px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] border-b border-[var(--muted)]">UID</th>
                  <th className="px-4 py-2.5 text-[9px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] border-b border-[var(--muted)]">Sector</th>
                  <th className="px-4 py-2.5 text-[9px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] border-b border-[var(--muted)]">Status Code</th>
                  <th className="px-4 py-2.5 text-[9px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] border-b border-[var(--muted)]">Primary Signal Drift</th>
                  <th className="px-4 py-2.5 text-[9px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] border-b border-[var(--muted)] hidden sm:table-cell">ATND</th>
                  <th className="px-4 py-2.5 text-[9px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] border-b border-[var(--muted)] text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => (
                  <tr
                    key={s.student_id}
                    onClick={() => navigate(`/students/${s.student_id}`)}
                    className={`border-b border-[var(--muted)]/50 transition-colors hover:bg-black/5 cursor-pointer ${s.risk_level === 'high' ? 'bg-[var(--glow-high)]/5' : ''}`}
                    style={{ animationDelay: `${idx * 20}ms` }}
                  >
                    <td className="px-4 py-3 border-l-[3px]" style={{ borderLeftColor: s.risk_level === 'high' ? 'var(--status-high)' : s.risk_level === 'medium' ? 'var(--status-medium)' : 'var(--status-low)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-sm bg-[var(--status-info)]/10 flex items-center justify-center font-mono text-[10px] font-bold text-[var(--status-info)] shadow-[var(--shadow-sharp)]">
                          {s.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="font-mono text-[11px] font-bold text-[var(--surface-dark)] tracking-tight">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-widest">{s.student_id?.slice(-6) || 'N/A'}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">{s.department} · S{s.semester}</td>
                    <td className="px-4 py-3">
                      {s.risk_level ? (
                        <RiskBadge level={s.risk_level} score={Math.round(s.risk_score)} size="sm" />
                      ) : (
                        <span className="font-mono text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">NO DATA</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-[var(--text-secondary)] max-w-[150px] truncate uppercase">{s.top_signal || '-'}</td>
                    <td className="px-4 py-3 font-mono text-[11px] font-bold text-[var(--surface-dark)] hidden sm:table-cell">{s.metrics?.attendance_pct?.toFixed(0)}%</td>
                    <td className="px-4 py-3 text-right">
                      <button className="btn-ghost inline-flex items-center justify-center gap-1.5 text-[9px]">
                         <ArrowUpRight size={10} /> ACCESS
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

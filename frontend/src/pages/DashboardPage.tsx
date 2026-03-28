import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, predictionsAPI } from '../api/client';
import MetricCard from '../components/MetricCard';
import RiskBadge from '../components/RiskBadge';
import ProgressBar from '../components/ProgressBar';
import { useNavigate } from 'react-router-dom';
import {
  Users, AlertTriangle, ShieldCheck, TrendingUp, Activity, Zap,
  BarChart3, ArrowUpRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [runningPredictions, setRunningPredictions] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const api = {
        admin: dashboardAPI.admin,
        teacher: dashboardAPI.teacher,
        student: dashboardAPI.student,
        counsellor: dashboardAPI.counsellor,
      }[user.role];
      const res = await api!();
      setData(res.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunPredictions = async () => {
    setRunningPredictions(true);
    try {
      await predictionsAPI.runAll();
      await loadDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setRunningPredictions(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-8 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
        <div className="skeleton h-80 rounded-xl" />
      </div>
    );
  }

  if (!data) return <p className="text-gray-500">Failed to load dashboard.</p>;

  // ======== ADMIN DASHBOARD ========
  if (user?.role === 'admin') {
    const pieData = [
      { name: 'High Risk', value: data.high_risk, color: 'var(--status-high)' },
      { name: 'Medium Risk', value: data.medium_risk, color: 'var(--status-medium)' },
      { name: 'On Track', value: data.on_track, color: 'var(--status-low)' },
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-sans font-bold text-[var(--surface-dark)] tracking-tight">System Status Readout</h1>
            <p className="font-mono text-[10px] font-semibold tracking-[0.15em] uppercase text-[var(--text-secondary)] mt-1.5 flex items-center gap-2">
              <span className="led led-green shrink-0"></span> Global Overview
            </p>
          </div>
          <button
            onClick={handleRunPredictions}
            disabled={runningPredictions}
            className="btn-primary"
          >
            {runningPredictions ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white/80 border-t-transparent animate-spin" /> RUNNING...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2"><Zap size={14} /> ENGAGE ML INFERENCE</span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Students" value={data.total_students} icon={<Users size={22} />} color="blue" delay="delay-100" />
          <MetricCard title="High Risk" value={data.high_risk} icon={<AlertTriangle size={22} />} color="red" delay="delay-200" />
          <MetricCard title="Medium Risk" value={data.medium_risk} icon={<TrendingUp size={22} />} color="yellow" delay="delay-300" />
          <MetricCard title="On Track" value={data.on_track} icon={<ShieldCheck size={22} />} color="green" delay="delay-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 mb-4 border-b border-[var(--muted)]/50 pb-3">
              <BarChart3 size={16} className="text-[var(--text-secondary)]" />
              <h3 className="font-mono text-[10px] font-semibold text-[var(--text-secondary)] tracking-[0.1em] uppercase">Risk Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.risk_distribution} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" />
                <XAxis dataKey="range" stroke="var(--text-secondary)" fontSize={10} fontFamily="var(--font-mono)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={10} fontFamily="var(--font-mono)" tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                  contentStyle={{ background: 'var(--surface-dark)', border: 'none', borderRadius: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#fff' }}
                />
                <Bar dataKey="count" fill="var(--status-info)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2 mb-4 border-b border-[var(--muted)]/50 pb-3">
              <Activity size={16} className="text-[var(--text-secondary)]" />
              <h3 className="font-mono text-[10px] font-semibold text-[var(--text-secondary)] tracking-[0.1em] uppercase">Student Vitals</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={2} strokeWidth={0}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  wrapperStyle={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}
                  formatter={(value) => <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{value}</span>}
                />
                <Tooltip
                  contentStyle={{ background: 'var(--surface-dark)', border: 'none', borderRadius: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {data.department_stats && data.department_stats.length > 0 && (
          <div className="card p-5 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-2 mb-4 border-b border-[var(--muted)]/50 pb-3">
              <h3 className="font-mono text-[10px] font-semibold text-[var(--text-secondary)] tracking-[0.1em] uppercase">Department Telemetry</h3>
            </div>
            <div className="overflow-x-auto rounded-lg shadow-[var(--shadow-recess)]">
              <table className="w-full text-left bg-[var(--chassis)] border-collapse">
                <thead className="bg-[#d5dce6] shadow-[0_2px_4px_rgba(0,0,0,0.05)] relative z-10">
                  <tr>
                    <th className="py-2.5 px-4 text-[9px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] border-b border-[var(--muted)]">Dept</th>
                    <th className="py-2.5 px-4 text-[9px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] border-b border-[var(--muted)]">Students</th>
                    <th className="py-2.5 px-4 text-[9px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] border-b border-[var(--muted)]">Avg Risk</th>
                    <th className="py-2.5 px-4 text-[9px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] border-b border-[var(--muted)] text-right">High Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {data.department_stats.map((dept: any) => (
                    <tr key={dept.department} className={`border-b border-[var(--muted)]/50 text-[11px] font-mono transition-colors hover:bg-black/5 ${dept.avg_risk > 60 ? 'bg-[var(--glow-high)]/5' : ''}`}>
                      <td className="py-3 px-4 font-bold text-[var(--surface-dark)] border-l-[3px]" style={{ borderLeftColor: dept.avg_risk > 60 ? 'var(--status-high)' : dept.avg_risk > 35 ? 'var(--status-medium)' : 'var(--status-low)' }}>
                        {dept.department}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">{dept.count}</td>
                      <td className="py-3 px-4"><RiskBadge level={dept.avg_risk > 60 ? 'high' : dept.avg_risk > 35 ? 'medium' : 'low'} score={dept.avg_risk} size="sm" /></td>
                      <td className="py-3 px-4 font-bold text-right text-[var(--status-high)]">{dept.high_risk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ======== TEACHER DASHBOARD ========
  if (user?.role === 'teacher') {
    return (
      <div className="space-y-6">
        <div className="mb-2">
          <h1 className="text-2xl font-sans font-bold text-[var(--surface-dark)] tracking-tight">Class Monitor</h1>
          <p className="font-mono text-[10px] font-semibold tracking-[0.15em] uppercase text-[var(--text-secondary)] mt-1.5 flex items-center gap-2">
            <span className="led led-blue shrink-0"></span> Active Telemetry
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Students" value={data.total_students} icon={<Users size={22} />} color="blue" delay="delay-100" />
          <MetricCard title="High Risk" value={data.high_risk} icon={<AlertTriangle size={22} />} color="red" delay="delay-200" />
          <MetricCard title="Medium Risk" value={data.medium_risk} icon={<TrendingUp size={22} />} color="yellow" delay="delay-300" />
          <MetricCard title="On Track" value={data.on_track} icon={<ShieldCheck size={22} />} color="green" delay="delay-400" />
        </div>

        {data.avg_stats && (
          <div className="card p-5 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 mb-4 border-b border-[var(--muted)]/50 pb-3">
              <h3 className="font-mono text-[10px] font-semibold text-[var(--text-secondary)] tracking-[0.1em] uppercase flex items-center gap-2">
                <Activity size={14} /> Class Meta-Averages
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <ProgressBar label="Avg Attendance" value={data.avg_stats.avg_attendance} />
              <ProgressBar label="Assignment Completion" value={data.avg_stats.avg_assignment_completion} />
              <ProgressBar label="Quiz Mean" value={data.avg_stats.avg_quiz_score} color="blue" />
              <ProgressBar label="System Risk Index" value={data.avg_stats.avg_risk_score} color="red" />
            </div>
          </div>
        )}

        {/* At-Risk Students Table */}
        <div className="card p-0 animate-slide-up overflow-hidden" style={{ animationDelay: '300ms' }}>
          <div className="p-4 border-b border-[var(--muted)]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-mono text-[10px] font-semibold text-[var(--text-secondary)] tracking-[0.1em] uppercase flex items-center gap-2">
              <AlertTriangle size={14} className="text-[var(--status-medium)]" /> Critical Attention Required
            </h3>
            <span className="font-mono text-[8px] tracking-[0.1em] bg-[var(--surface-dark)] text-[#e8eaed] px-2 py-0.5 rounded shadow-[var(--shadow-sharp)] uppercase">Priority Sort Array</span>
          </div>
          <div className="overflow-x-auto p-4 pt-0 mt-4 rounded-lg">
            <div className="rounded-lg shadow-[var(--shadow-recess)]">
              <table className="w-full text-left bg-[var(--chassis)] border-collapse relative">
                <thead className="bg-[#d5dce6] shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
                  <tr>
                    <th className="py-2.5 px-4 text-[9px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] border-b border-[var(--muted)]">Target</th>
                    <th className="py-2.5 px-4 text-[9px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] border-b border-[var(--muted)]">Code</th>
                    <th className="py-2.5 px-4 text-[9px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] border-b border-[var(--muted)]">Primary Signal</th>
                    <th className="py-2.5 px-4 text-[9px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] border-b border-[var(--muted)]">ATND</th>
                    <th className="py-2.5 px-4 text-[9px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] border-b border-[var(--muted)]">Score</th>
                    <th className="py-2.5 px-4 text-[9px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] border-b border-[var(--muted)] text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.at_risk_students?.map((s: any) => (
                    <tr key={s.student_id} className={`border-b border-[var(--muted)]/50 text-[11px] font-mono transition-colors hover:bg-black/5 ${s.risk_level === 'high' ? 'bg-[var(--status-high)]/5' : ''}`}>
                      <td className="py-3 px-4 font-bold text-[var(--surface-dark)] border-l-[3px]" style={{ borderLeftColor: s.risk_level === 'high' ? 'var(--status-high)' : s.risk_level === 'medium' ? 'var(--status-medium)' : 'var(--status-low)' }}>
                        {s.name}
                      </td>
                      <td className="py-3 px-4"><RiskBadge level={s.risk_level || 'high'} score={Math.round(s.risk_score)} size="sm" /></td>
                      <td className="py-3 px-4 text-[var(--text-secondary)] max-w-[150px] truncate">{s.top_signal || '-'}</td>
                      <td className="py-3 px-4 font-bold">{s.attendance?.toFixed(0)}%</td>
                      <td className="py-3 px-4 font-bold text-[var(--text-muted)]">{s.avg_grade?.toFixed(0)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/students/${s.student_id}`)}
                          className="btn-ghost flex items-center justify-center gap-1.5 text-[9px] ml-auto"
                        >
                          <ArrowUpRight size={10} /> ACCESS
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======== STUDENT DASHBOARD ========
  if (user?.role === 'student') {
    if (!data.metrics) {
      return (
        <div className="flex h-[80vh] items-center justify-center">
          <div className="card p-8 text-center animate-slide-up">
            <h2 className="font-sans text-xl font-bold text-[var(--surface-dark)] mb-2">No Telemetry Found</h2>
            <p className="font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Please consult administration to link your record.</p>
          </div>
        </div>
      );
    }

    const interventionColors: Record<string, string> = {
      counselling: 'border-l-[var(--status-high)] bg-[var(--glow-high)]/5',
      extra_tutoring: 'border-l-[var(--status-info)] bg-[var(--status-info)]/10',
      parent_contact: 'border-l-[var(--status-medium)] bg-[var(--status-medium)]/10',
      deadline_extension: 'border-l-[var(--status-low)] bg-[var(--status-low)]/10',
      mentorship: 'border-l-purple-500 bg-purple-500/10',
      other: 'border-l-[var(--text-muted)] bg-[var(--muted)]/20',
    };

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Student Header */}
        <div className="card p-6 flex items-center gap-5 animate-slide-up">
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl text-white shrink-0 bg-[#0984e3] shadow-[var(--shadow-float)]">
            {data.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-sans font-bold text-[var(--surface-dark)] tracking-tight">{data.name}</h1>
            <p className="font-mono text-[10px] text-[var(--text-secondary)] font-semibold tracking-wider uppercase mt-1">
              {data.department} · Semester {data.semester}
            </p>
          </div>
          {data.risk_level && <RiskBadge level={data.risk_level} score={Math.round(data.risk_score)} size="lg" />}
        </div>

        {/* Performance Signals */}
        <div className="card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 border-b border-[var(--muted)]/50 pb-3 mb-5">
            <Activity size={16} className="text-[var(--text-secondary)]" />
            <h3 className="font-mono text-[10px] font-semibold text-[var(--text-secondary)] tracking-[0.1em] uppercase">Vitals Monitor</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <ProgressBar label="Attendance Record" value={data.metrics.attendance_pct} />
            <ProgressBar label="Assignment Completion" value={data.metrics.assignment_completion_pct} />
            <ProgressBar label="Quiz Metaphor" value={data.metrics.quiz_avg_score} color="blue" />
            <ProgressBar label="LMS Interaction Hours" value={data.metrics.lms_engagement_hours} max={20} color="green" />
          </div>
        </div>

        {/* SHAP Explanation */}
        {data.shap_factors && data.shap_factors.length > 0 && (
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 border-b border-[var(--muted)]/50 pb-3 mb-4">
              <BarChart3 size={16} className="text-[var(--text-secondary)]" />
              <h3 className="font-mono text-[10px] font-semibold text-[var(--text-secondary)] tracking-[0.1em] uppercase">Predictive Driver Analysis</h3>
            </div>
            <div className="space-y-3">
              {data.shap_factors.slice(0, 5).map((f: any) => (
                <div key={f.feature} className="flex items-center justify-between p-3 rounded-lg bg-[var(--chassis)] shadow-[var(--shadow-recess)]">
                  <span className="font-mono text-[10px] font-medium text-[var(--text-secondary)] uppercase">{f.display_name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] font-bold text-[var(--surface-dark)]">{typeof f.value === 'number' ? f.value.toFixed(1) : f.value}</span>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-[var(--shadow-sharp)] ${f.impact > 0 ? 'bg-[var(--status-high)] text-white' : 'bg-[var(--status-low)] text-[var(--surface-dark)]'}`}>
                      {f.impact > 0 ? '↑ Drives Risk' : '↓ Lowers Risk'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interventions / Recommended Actions */}
        {data.interventions && data.interventions.length > 0 && (
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2 border-b border-[var(--muted)]/50 pb-3 mb-4">
              <Zap size={16} className="text-[var(--status-medium)]" />
              <h3 className="font-mono text-[10px] font-semibold text-[var(--text-secondary)] tracking-[0.1em] uppercase">Recommended Action Protocol</h3>
            </div>
            <div className="space-y-3">
              {data.interventions.map((iv: any) => (
                <div key={iv.id} className={`p-4 rounded-xl border-l-[3px] shadow-[var(--shadow-recess)] ${interventionColors[iv.intervention_type] || interventionColors.other}`}>
                  <p className="font-mono text-[11px] font-bold text-[var(--surface-dark)] capitalize tracking-wide">{iv.intervention_type.replace('_', ' ')}</p>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">{iv.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ======== COUNSELLOR DASHBOARD ========
  if (user?.role === 'counsellor') {
    return (
      <div className="space-y-6">
        <div className="mb-2">
          <h1 className="text-2xl font-sans font-bold text-[var(--surface-dark)] tracking-tight">Counsellor Terminal</h1>
          <p className="font-mono text-[10px] font-semibold tracking-[0.15em] uppercase text-[var(--text-secondary)] mt-1.5 flex items-center gap-2">
            <span className="led led-amber shrink-0"></span> Intervention Tracking Matrix
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="High Risk Students" value={data.high_risk_count} icon={<AlertTriangle size={22} />} color="red" delay="delay-100" />
          <MetricCard title="Total Interventions" value={data.total_interventions} icon={<Activity size={22} />} color="blue" delay="delay-200" />
          <MetricCard title="Pending" value={data.pending} icon={<TrendingUp size={22} />} color="yellow" delay="delay-300" />
          <MetricCard title="Completed" value={data.completed} icon={<ShieldCheck size={22} />} color="green" delay="delay-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
          {/* At Risk Students */}
          <div className="card p-5 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 border-b border-[var(--muted)]/50 pb-3 mb-4">
              <AlertTriangle size={14} className="text-[var(--status-high)]" />
              <h3 className="font-mono text-[10px] font-semibold text-[var(--text-secondary)] tracking-[0.1em] uppercase">Targets Needing Attention</h3>
            </div>
            <div className="space-y-2">
              {data.at_risk_students?.map((s: any) => (
                <div
                  key={s.student_id}
                  onClick={() => navigate(`/students/${s.student_id}`)}
                  className="flex items-center justify-between p-3 px-4 rounded-xl shadow-[var(--shadow-recess)] transition-all cursor-pointer hover:shadow-[var(--shadow-press)] bg-[var(--chassis)] group"
                >
                  <div className="flex-1">
                    <p className="font-mono text-[11px] font-bold text-[var(--surface-dark)]">{s.name}</p>
                    <p className="font-mono text-[9px] text-[var(--text-secondary)] mt-1 uppercase tracking-wider">{s.department} <span className="mx-1 opacity-50">|</span> {s.top_signal || 'Multiple factors'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <RiskBadge level="high" score={Math.round(s.risk_score)} size="sm" />
                    <ArrowUpRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Interventions */}
          <div className="card p-5 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2 border-b border-[var(--muted)]/50 pb-3 mb-4">
              <Activity size={14} className="text-[var(--status-info)]" />
              <h3 className="font-mono text-[10px] font-semibold text-[var(--text-secondary)] tracking-[0.1em] uppercase">Intervention Telemetry Logs</h3>
            </div>
            <div className="space-y-2">
              {data.recent_interventions?.slice(0, 8).map((iv: any) => (
                <div key={iv.id} className="flex items-center justify-between p-3 px-4 rounded-xl shadow-[var(--shadow-recess)] bg-[var(--chassis)]">
                  <div>
                    <p className="font-mono text-[11px] font-bold text-[var(--surface-dark)]">{iv.student_name}</p>
                    <p className="font-mono text-[9px] text-[var(--text-secondary)] uppercase tracking-wider mt-1">{iv.intervention_type.replace('_', ' ')} <span className="mx-1 opacity-50">|</span> Auth: {iv.created_by_name}</p>
                  </div>
                  <span className={`font-mono text-[8px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded shadow-[var(--shadow-sharp)] ${
                    iv.status === 'completed' ? 'bg-[var(--status-low)] text-[var(--surface-dark)]' :
                    iv.status === 'in_progress' ? 'bg-[var(--status-info)] text-white' :
                    'bg-[var(--status-medium)] text-[var(--surface-dark)]'
                  }`}>
                    {iv.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentsAPI, interventionsAPI, predictionsAPI } from '../api/client';
import RiskBadge from '../components/RiskBadge';
import ProgressBar from '../components/ProgressBar';
import { ArrowLeft, Zap, Plus, Target, Brain, Clock, Activity, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function StudentProfilePage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showIntervene, setShowIntervene] = useState(false);
  const [iType, setIType] = useState('counselling');
  const [iNotes, setINotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadStudent(); }, [studentId]);

  const loadStudent = async () => {
    if (!studentId) return;
    setLoading(true);
    try { setStudent((await studentsAPI.get(studentId)).data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const repredict = async () => {
    if (!studentId) return;
    await predictionsAPI.runSingle(studentId);
    await loadStudent();
  };

  const submitIntervention = async () => {
    if (!studentId) return;
    setSubmitting(true);
    try {
      await interventionsAPI.create({ student_id: studentId, intervention_type: iType, notes: iNotes });
      setShowIntervene(false); setINotes(''); await loadStudent();
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
      <div className="skeleton h-8 w-48 bg-[var(--muted)]/20" />
      <div className="skeleton h-40 rounded-lg bg-[var(--muted)]/20" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="skeleton h-64 rounded-lg bg-[var(--muted)]/20" />
        <div className="skeleton h-64 rounded-lg bg-[var(--muted)]/20" />
      </div>
    </div>
  );
  if (!student) return <p className="font-mono text-[10px] text-[var(--status-medium)] text-center py-20 uppercase tracking-widest">Target Entity Not Found</p>;

  const m = student.metrics || {};
  const shapData = (student.shap_factors || []).slice(0, 7).map((f: any) => ({ 
    name: f.display_name, 
    impact: Math.abs(f.impact), 
    direction: f.impact > 0 ? 'risk' : 'safe' 
  }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="btn-ghost inline-flex items-center justify-center gap-1.5 text-[10px] mb-2">
        <ArrowLeft size={12} /> ABORT TO ROSTER
      </button>

      {/* Header */}
      <div className="card p-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-sm bg-[var(--accent)] flex items-center justify-center text-white text-xl font-bold shadow-[var(--shadow-float)] border-l-[3px] border-[var(--status-info)]">
              {student.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-sans font-bold text-[var(--surface-dark)] tracking-tight">{student.name}</h1>
              <p className="font-mono text-[10px] text-[var(--text-secondary)] font-semibold tracking-wider uppercase mt-1 flex items-center gap-2">
                <span className="led led-blue shrink-0"></span>
                {student.department} <span className="text-[var(--muted)]">|</span> SEM {student.semester} {student.section ? `· SEC ${student.section}` : ''}
              </p>
              <p className="font-mono text-[9px] text-[var(--text-muted)] mt-1.5 uppercase tracking-widest">UID: {student.student_id}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {student.risk_level && <RiskBadge level={student.risk_level} score={Math.round(student.risk_score)} size="lg" />}
            <button onClick={repredict} className="btn-ghost flex items-center justify-center gap-1.5 text-[10px] h-[32px] px-3">
              <Zap size={12} className="text-[var(--status-medium)]" /> EXEC AI PASS
            </button>
            <button onClick={() => setShowIntervene(!showIntervene)} className="btn-primary flex items-center justify-center gap-1.5 text-[10px] h-[32px] px-3">
              <Plus size={12} /> INITIATE PROTOCOL
            </button>
          </div>
        </div>
        {student.predicted_grade && (
          <div className="mt-5 p-3 rounded-sm bg-[var(--surface-dark)] flex flex-wrap items-center gap-3 text-[11px] font-mono shadow-[var(--shadow-recess)]">
            <Brain size={14} className="text-[var(--status-info)]" />
            <span className="text-[var(--text-muted)] uppercase tracking-wider">Predictive Baseline:</span>
            <span className="font-bold text-white">{student.predicted_grade}</span>
            <span className="text-[var(--text-muted)]">|</span>
            <span className="font-bold text-[var(--status-medium)] uppercase">Signal Drift: {student.top_signal}</span>
          </div>
        )}
      </div>

      {/* Intervention Form */}
      {showIntervene && (
        <div className="card p-6 animate-slide-up border-t-[3px] border-t-[var(--status-info)]">
          <div className="flex items-center gap-2 mb-4 border-b border-[var(--muted)]/50 pb-3">
            <AlertTriangle size={14} className="text-[var(--status-medium)]" />
            <h3 className="font-mono text-[10px] font-semibold text-[var(--text-secondary)] tracking-[0.1em] uppercase">Deploy Intervention Protocol</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em]">Protocol Designation</label>
              <select value={iType} onChange={e => setIType(e.target.value)} className="input-field py-2">
                <option value="counselling">COUNSELLING OVERRIDE</option>
                <option value="extra_tutoring">ACADEMIC BOOSTER</option>
                <option value="parent_contact">GUARDIAN ESCALATION</option>
                <option value="deadline_extension">TEMPORAL EXTENSION</option>
                <option value="mentorship">MENTOR ASSIGNMENT</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em]">Execution Parameters (Notes)</label>
              <textarea value={iNotes} onChange={e => setINotes(e.target.value)} placeholder="Specify action plan directives..." rows={3} className="input-field py-2 resize-none" />
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={submitIntervention} disabled={submitting || !iNotes} className="btn-primary flex items-center justify-center gap-1.5">
                {submitting ? 'TRANSMITTING...' : 'AUTHORIZE PROTOCOL'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metrics */}
        <div className="card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 border-b border-[var(--muted)]/50 pb-3 mb-5">
            <Activity size={14} className="text-[var(--text-secondary)]" />
            <h3 className="font-mono text-[10px] font-semibold text-[var(--text-secondary)] tracking-[0.1em] uppercase">Vitals Telemetry</h3>
          </div>
          <div className="space-y-4">
            <ProgressBar label="Attendance Record" value={m.attendance_pct || 0} />
            <ProgressBar label="Assignments Logged" value={m.assignment_completion_pct || 0} />
            <ProgressBar label="Quiz Metaphor" value={m.quiz_avg_score || 0} color="blue" />
            {m.midterm_score != null && <ProgressBar label="Midterm Index" value={m.midterm_score} color="yellow" />}
            <ProgressBar label="System Interaction Time" value={m.lms_engagement_hours || 0} max={20} color="green" />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="p-3 rounded bg-[var(--chassis)] shadow-[var(--shadow-recess)] text-center border-t-2 border-t-[var(--status-high)]">
              <p className="font-mono text-lg font-bold text-[var(--status-high)]">{m.classes_missed_last_2_weeks}</p>
              <p className="font-mono text-[9px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mt-1">Absences</p>
            </div>
            <div className="p-3 rounded bg-[var(--chassis)] shadow-[var(--shadow-recess)] text-center border-t-2 border-t-[var(--status-medium)]">
              <p className="font-mono text-lg font-bold text-[var(--status-medium)]">{m.assignments_missed}</p>
              <p className="font-mono text-[9px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mt-1">Missed</p>
            </div>
            <div className="p-3 rounded bg-[var(--chassis)] shadow-[var(--shadow-recess)] text-center border-t-2 border-t-[var(--status-info)]">
              <p className="font-mono text-lg font-bold text-[var(--status-info)]">{m.previous_gpa?.toFixed(2)}</p>
              <p className="font-mono text-[9px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mt-1">Prev GPA</p>
            </div>
          </div>
        </div>

        {/* SHAP Chart */}
        <div className="card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 border-b border-[var(--muted)]/50 pb-3 mb-5">
            <Target size={14} className="text-[var(--text-secondary)]" />
            <h3 className="font-mono text-[10px] font-semibold text-[var(--text-secondary)] tracking-[0.1em] uppercase">Predictive Weight Analysis</h3>
          </div>
          {shapData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={260} className="mt-2">
                <BarChart data={shapData} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="var(--muted)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-secondary)" fontSize={10} fontFamily="var(--font-mono)" tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" fontSize={9} fontFamily="var(--font-mono)" tickLine={false} axisLine={false} width={100} />
                  <Tooltip 
                    cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
                    contentStyle={{ background: 'var(--surface-dark)', border: 'none', borderRadius: '4px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#fff', textTransform: 'uppercase' }} 
                  />
                  <Bar dataKey="impact" radius={[0, 4, 4, 0]} barSize={16}>
                    {shapData.map((e: any, i: number) => (
                      <Cell key={i} fill={e.direction === 'risk' ? 'var(--status-high)' : 'var(--status-low)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[var(--muted)]/50 justify-center font-mono text-[9px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[var(--status-high)] shadow-[0_0_8px_rgba(255,71,87,0.4)]" /> Drives Risk
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[var(--status-low)] shadow-[0_0_8px_rgba(46,213,115,0.4)]" /> Lowers Risk
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] opacity-60">
              <Brain size={32} className="text-[var(--text-muted)] mb-3" />
              <p className="font-mono text-[10px] font-semibold text-[var(--text-secondary)] tracking-[0.1em] uppercase">Execute AI Pass to calculate</p>
            </div>
          )}
        </div>
      </div>

      {/* Intervention History */}
      {student.interventions?.length > 0 && (
        <div className="card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2 border-b border-[var(--muted)]/50 pb-3 mb-4">
            <Clock size={14} className="text-[var(--text-secondary)]" />
            <h3 className="font-mono text-[10px] font-semibold text-[var(--text-secondary)] tracking-[0.1em] uppercase">Intervention Chronology</h3>
          </div>
          <div className="space-y-3">
            {student.interventions.map((iv: any) => (
              <div key={iv.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-sm bg-[var(--chassis)] shadow-[var(--shadow-recess)] gap-3">
                <div className="flex-1">
                  <div className="flex justify-between sm:justify-start items-center gap-4 mb-1.5">
                    <p className="font-mono text-[11px] font-bold text-[var(--surface-dark)] uppercase tracking-wide">[{iv.intervention_type?.replace('_', ' ')}]</p>
                    <span className={`font-mono text-[8px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded shadow-[var(--shadow-sharp)] ${
                      iv.status === 'completed' ? 'bg-[var(--status-low)] text-[var(--surface-dark)]' :
                      iv.status === 'in_progress' ? 'bg-[var(--status-info)] text-white' :
                      'bg-[var(--status-medium)] text-[var(--surface-dark)]'
                    }`}>
                      {iv.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{iv.notes}</p>
                  <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-wider mt-2 border-t border-[var(--muted)]/50 pt-2">
                    AUTH BY: {iv.created_by_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

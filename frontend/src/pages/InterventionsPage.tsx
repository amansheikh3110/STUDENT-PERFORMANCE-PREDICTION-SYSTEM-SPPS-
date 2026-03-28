import { useEffect, useState } from 'react';
import { interventionsAPI } from '../api/client';
import { CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { setInterventions((await interventionsAPI.list()).data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    await interventionsAPI.update(id, { status });
    await load();
  };

  const statusIcon = (s: string) => {
    if (s === 'completed') return <CheckCircle size={14} className="text-[var(--status-low)]" />;
    if (s === 'in_progress') return <Clock size={14} className="text-[var(--status-info)]" />;
    return <AlertTriangle size={14} className="text-[var(--status-medium)]" />;
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
      {[1,2,3].map(i=><div key={i} className="card h-64 bg-[var(--muted)]/20" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1 className="text-2xl font-sans font-bold text-[var(--surface-dark)] tracking-tight">Active Intervention Matrix</h1>
          <p className="font-mono text-[10px] font-semibold tracking-[0.15em] uppercase text-[var(--text-secondary)] mt-1.5 flex items-center gap-2">
            <span className="led led-amber shrink-0"></span> {interventions.length} Tasks Scheduled
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        {['pending', 'in_progress', 'completed'].map((status) => {
          const items = interventions.filter(i => i.status === status);
          const cols: Record<string, { bg: string, border: string, accent: string, title: string }> = {
            pending: { bg: 'bg-[var(--status-medium)]/10', border: 'border-[var(--status-medium)]/30', accent: 'var(--status-medium)', title: 'PENDING TRIAGE' },
            in_progress: { bg: 'bg-[var(--status-info)]/10', border: 'border-[var(--status-info)]/30', accent: 'var(--status-info)', title: 'IN PROGRESS' },
            completed: { bg: 'bg-[var(--status-low)]/10', border: 'border-[var(--status-low)]/30', accent: 'var(--status-low)', title: 'COMPLETED' },
          };
          const c = cols[status];

          return (
            <div key={status} className={`p-5 rounded-sm border-t-[3px] shadow-[var(--shadow-recess)] bg-[var(--chassis)] ${c.border}`} style={{ borderTopColor: c.accent }}>
              <h3 className="font-mono text-[11px] font-bold text-[var(--surface-dark)] tracking-[0.1em] mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">{statusIcon(status)} {c.title}</span>
                <span className="px-2 py-0.5 rounded shadow-[var(--shadow-sharp)] bg-[var(--surface-dark)] text-white text-[9px]">{items.length}</span>
              </h3>
              
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map(iv => (
                  <div key={iv.id} className="p-4 rounded-sm bg-white/5 border border-[var(--muted)] shadow-[var(--shadow-sharp)] hover:shadow-[var(--shadow-float)] transition-all">
                    <p className="font-mono text-[12px] font-bold text-[var(--surface-dark)]">{iv.student_name}</p>
                    <p className="font-mono text-[9px] text-[var(--text-secondary)] uppercase tracking-[0.1em] mt-1 mb-2 pb-2 border-b border-[var(--muted)]/50">
                      [{iv.intervention_type?.replace('_', ' ')}]
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)] line-clamp-3 leading-relaxed mb-3">"{iv.notes}"</p>
                    
                    {status !== 'completed' && (
                      <div className="flex gap-2">
                        {status === 'pending' && (
                          <button 
                            onClick={() => updateStatus(iv.id, 'in_progress')} 
                            className="flex-1 btn-ghost h-8 flex items-center justify-center text-[9px] text-[var(--status-info)]"
                          >
                            ENGAGE ACT
                          </button>
                        )}
                        <button 
                          onClick={() => updateStatus(iv.id, 'completed')} 
                          className="flex-1 btn-primary h-8 flex items-center justify-center gap-1.5 text-[9px] !bg-[var(--status-low)] !text-[var(--surface-dark)] hover:brightness-110"
                        >
                          MARK RESOLVED <ArrowRight size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 opacity-50">
                    <div className="w-8 h-8 border border-dashed border-[var(--text-secondary)] rounded-full mb-2" />
                    <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">AWAITING LOGS</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

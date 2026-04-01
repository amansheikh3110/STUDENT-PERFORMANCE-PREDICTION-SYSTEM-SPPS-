import { useState } from 'react';
import { predictionsAPI } from '../api/client';
import { Zap, CheckCircle, Activity } from 'lucide-react';

export default function PredictionsPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runAll = async () => {
    setLoading(true); setResult(null);
    try { setResult((await predictionsAPI.runAll()).data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl animate-slide-up">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-mono font-bold tracking-widest text-[var(--text-primary)] uppercase">
              Prediction Engine
            </h1>
            <div className={`led ${loading ? 'led-amber' : 'led-blue'}`} />
          </div>
          <p className="text-xs font-mono text-[var(--text-muted)] mt-2 tracking-wide uppercase">
            XGBoost Modeling // SHAP Explainability Subsystem
          </p>
        </div>
        <div className="vent-slots">
          {[1,2,3,4].map(i => <div key={i} className="vent-slot" />)}
        </div>
      </div>

      <div className="card p-6">
        <div className="panel-dark p-8 flex flex-col items-center justify-center text-center">
          <Activity size={48} strokeWidth={1} className={loading ? "text-accent animate-pulse" : "text-white/20"} />
          
          <h2 className="mt-4 text-sm font-mono tracking-[0.15em] text-[var(--text-light)] uppercase">
            Batch Processing
          </h2>
          
          <p className="text-[11px] font-mono text-white/50 mt-2 max-w-md mx-auto leading-relaxed">
            SYSTEM WILL ITERATE THROUGH ALL STUDENT RECORDS TO RECALCULATE ATTRITION PROBABILITIES AND REGENERATE SHAPLEY EXPLANATION VALUES.
          </p>

          <div className="mt-8">
            <button 
              onClick={runAll} 
              disabled={loading} 
              className="btn-primary flex items-center justify-center gap-3 min-w-[240px]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-sm border border-white/40 border-t-white animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap size={14} className="opacity-80" />
                  Initialize Engine
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="card p-6 mt-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle size={16} className="text-[#2ed573]" />
            <h3 className="text-[11px] font-mono tracking-widest text-[var(--text-secondary)] uppercase">
              Telemetry Readout
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="stat-card">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono tracking-[0.12em] text-[#a3b1c6] uppercase">
                  Records Analyzed
                </span>
                <div className="led led-blue" />
              </div>
              <div className="text-3xl font-mono font-bold text-[#1e90ff] drop-shadow-[0_0_8px_rgba(30,144,255,0.4)]">
                {result.total_predicted}
              </div>
            </div>

            <div className="stat-card">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono tracking-[0.12em] text-[#a3b1c6] uppercase">
                  Critical Hazards
                </span>
                <div className="led led-red" />
              </div>
              <div className="text-3xl font-mono font-bold text-accent drop-shadow-[0_0_8px_rgba(255,71,87,0.4)]">
                {result.high_risk_found}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-black/5">
            <p className="text-[10px] font-mono tracking-wide text-[#2ed573] text-center uppercase">
              [{result.message}]
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

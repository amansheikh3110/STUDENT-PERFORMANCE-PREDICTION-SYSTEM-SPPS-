import { useState } from 'react';
import { predictionsAPI } from '../api/client';
import { Zap, CheckCircle, AlertTriangle } from 'lucide-react';

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
    <div className="space-y-8 max-w-2xl">
      <div><h1 className="text-2xl font-bold text-white">ML Predictions</h1><p className="text-sm text-gray-500 mt-1">Run batch predictions using the XGBoost model with SHAP explainability</p></div>

      <div className="glass rounded-2xl p-8 text-center animate-fade-in-up">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center mb-5">
          <Zap size={36} className="text-blue-400"/>
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Batch Prediction Engine</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Run XGBoost predictions for all students, generating risk scores and SHAP explanations for every record.</p>
        <button onClick={runAll} disabled={loading} className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-50 transition-all" style={{background:'linear-gradient(135deg,#4c8bf5,#a78bfa)',boxShadow:'0 4px 20px -5px rgba(76,139,245,0.4)'}}>
          {loading ? <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"/> Running...</> : <><Zap size={16}/> Run All Predictions</>}
        </button>
      </div>

      {result && (
        <div className="glass rounded-2xl p-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4"><CheckCircle size={20} className="text-green-400"/><h3 className="text-sm font-semibold text-white">Prediction Results</h3></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/3 text-center"><p className="text-2xl font-bold text-blue-400">{result.total_predicted}</p><p className="text-xs text-gray-500 mt-1">Students Predicted</p></div>
            <div className="p-4 rounded-xl bg-white/3 text-center"><p className="text-2xl font-bold text-red-400">{result.high_risk_found}</p><p className="text-xs text-gray-500 mt-1">High Risk Found</p></div>
          </div>
          <p className="text-sm text-green-400 mt-4 text-center">{result.message}</p>
        </div>
      )}
    </div>
  );
}
